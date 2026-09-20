import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { BOOKING_CURRENCY, priceForDuration, zonedToUtc } from "@/lib/booking"
import { isSlotAvailable } from "@/lib/bookingAvailability"
import { getCalendarConfig } from "@/lib/serverConfig"

export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Create a consultation booking and start a Stripe Checkout session.
 * Price is always resolved server-side from the duration map. If the visitor
 * is signed in the booking is linked to their account; otherwise a user is
 * found-or-created by email so the order (and later the invite) has an owner.
 */
export async function POST(req: Request) {
    try {
        const stripe = await getStripe()
        if (!stripe) {
            return NextResponse.json(
                { error: "Payments are not configured yet. Please add Stripe keys in admin settings." },
                { status: 400 }
            )
        }

        const body = await req.json()
        const firstName = String(body.firstName || "").trim()
        const lastName = String(body.lastName || "").trim()
        const email = String(body.email || "").trim().toLowerCase()
        const phone = String(body.phone || "").trim()
        const date = String(body.date || "").trim() // YYYY-MM-DD
        const time = String(body.time || "").trim() // HH:MM
        const durationMin = Number(body.durationMin)

        if (!firstName || !lastName || !phone) {
            return NextResponse.json({ error: "Please fill in your name and phone number." }, { status: 400 })
        }
        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
            return NextResponse.json({ error: "Please pick a valid date and time." }, { status: 400 })
        }

        const price = priceForDuration(durationMin)
        if (price === null) {
            return NextResponse.json({ error: "Please select a valid session duration." }, { status: 400 })
        }

        const timeZone = (await getCalendarConfig()).timeZone
        const startsAt = zonedToUtc(date, time, timeZone)
        if (startsAt.getTime() < Date.now() + 15 * 60_000) {
            return NextResponse.json({ error: "Please choose a time at least 15 minutes from now." }, { status: 400 })
        }

        // Guard against a slot being taken between availability load and checkout.
        if (!(await isSlotAvailable(date, time, durationMin, timeZone))) {
            return NextResponse.json(
                { error: "That time slot is no longer available. Please pick another." },
                { status: 409 }
            )
        }

        // Resolve the owning user: current session, or find-or-create by email.
        const session = await auth()
        let userId: number
        if (session?.user?.id) {
            userId = parseInt(session.user.id)
        } else {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) {
                userId = existing.id
            } else {
                const created = await prisma.user.create({
                    data: { email, name: `${firstName} ${lastName}`.trim() },
                })
                userId = created.id
            }
        }

        const label = `Consultation — ${durationMin} min`

        // Order (PENDING until Stripe confirms) with a single labelled line item.
        const order = await prisma.order.create({
            data: {
                userId,
                status: "PENDING",
                total: price,
                currency: BOOKING_CURRENCY,
                items: { create: [{ title: label, quantity: 1, price }] },
            },
        })

        const booking = await prisma.booking.create({
            data: {
                userId,
                orderId: order.id,
                firstName,
                lastName,
                email,
                phone,
                startsAt,
                timeZone,
                durationMin,
                price,
                currency: BOOKING_CURRENCY,
                status: "PENDING",
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin

        const stripeSession = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: BOOKING_CURRENCY.toLowerCase(),
                        product_data: {
                            name: label,
                            description: `${date} at ${time} (${timeZone})`,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: { bookingId: booking.id.toString(), orderId: order.id.toString() },
            success_url: `${baseUrl}/api/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/service/consulting-services?booking=cancelled`,
        })

        await prisma.$transaction([
            prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: stripeSession.id } }),
            prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: stripeSession.id } }),
        ])

        return NextResponse.json({ url: stripeSession.url })
    } catch (error) {
        console.error("Booking checkout error:", error)
        return NextResponse.json({ error: "Could not start booking. Please try again." }, { status: 500 })
    }
}
