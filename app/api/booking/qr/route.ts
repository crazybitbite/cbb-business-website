import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCalendarConfig, getConsultationPaymentMethods } from "@/lib/serverConfig"
import { isValidTransactionId } from "@/lib/paymentMethods"
import { BOOKING_CURRENCY, priceForDuration, zonedToUtc } from "@/lib/booking"
import { isSlotAvailable } from "@/lib/bookingAvailability"
import { sendBookingQrNotification } from "@/lib/bookingEmail"

export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * QR consultation booking: the visitor has scanned the QR, paid, and submitted
 * the transaction id (UTR). We record the booking + order in VERIFYING state
 * (holding the slot) and email the admin (SMTP From address) to verify. The
 * calendar invite is created only when the admin approves the order.
 */
export async function POST(req: Request) {
    try {
        const methods = await getConsultationPaymentMethods()
        if (!methods.includes("qr")) {
            return NextResponse.json({ error: "QR payment isn't available for consultations." }, { status: 400 })
        }

        const qrRow = await prisma.settings.findUnique({ where: { key: "paymentQrCode" } })
        if (!(typeof qrRow?.value === "string" && qrRow.value)) {
            return NextResponse.json({ error: "QR payment is not configured." }, { status: 400 })
        }

        const body = await req.json()
        const firstName = String(body.firstName || "").trim()
        const lastName = String(body.lastName || "").trim()
        const email = String(body.email || "").trim().toLowerCase()
        const phone = String(body.phone || "").trim()
        const date = String(body.date || "").trim()
        const time = String(body.time || "").trim()
        const durationMin = Number(body.durationMin)
        const transactionId = String(body.transactionId || "").trim()

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

        const contactRow = await prisma.settings.findUnique({ where: { key: "contactEmail" } })
        const contactEmail =
            typeof contactRow?.value === "string" && contactRow.value ? contactRow.value : "our support email"
        const helpMessage = `We could not validate this transaction id — a UPI transaction id (UTR) is a 12-digit number shown in your payment app. If your reference looks different, please share your payment screenshot along with the transaction id at ${contactEmail} and we will confirm your booking manually.`

        if (!isValidTransactionId(transactionId)) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }
        const reused = await prisma.order.findFirst({ where: { transactionId }, select: { id: true } })
        if (reused) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }

        const timeZone = (await getCalendarConfig()).timeZone
        const startsAt = zonedToUtc(date, time, timeZone)
        if (startsAt.getTime() < Date.now() + 15 * 60_000) {
            return NextResponse.json({ error: "Please choose a time at least 15 minutes from now." }, { status: 400 })
        }
        if (!(await isSlotAvailable(date, time, durationMin, timeZone))) {
            return NextResponse.json(
                { error: "That time slot is no longer available. Please pick another." },
                { status: 409 }
            )
        }

        // Owning user: current session, or find-or-create by email.
        const session = await auth()
        let userId: number
        if (session?.user?.id) {
            userId = parseInt(session.user.id)
        } else {
            const existing = await prisma.user.findUnique({ where: { email } })
            userId = existing
                ? existing.id
                : (await prisma.user.create({ data: { email, name: `${firstName} ${lastName}`.trim() } })).id
        }

        const label = `Consultation — ${durationMin} min`

        // Order + Booking in VERIFYING state (holds the slot until the admin
        // approves the payment, which then finalizes the booking).
        const order = await prisma.order.create({
            data: {
                userId,
                status: "VERIFYING",
                total: price,
                currency: BOOKING_CURRENCY,
                paymentMethod: "qr",
                transactionId,
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
                status: "VERIFYING",
            },
        })

        // Notify the admin (SMTP From address) to verify the payment.
        sendBookingQrNotification({
            firstName,
            lastName,
            email,
            phone,
            startsAt,
            timeZone,
            durationMin,
            price,
            currency: BOOKING_CURRENCY,
            transactionId,
            bookingId: booking.id,
            orderId: order.id,
        }).catch((e) => console.error("Booking QR notification email failed:", e))

        return NextResponse.json({ ok: true, verifying: true, bookingId: booking.id, orderId: order.id })
    } catch (error) {
        console.error("Booking QR error:", error)
        return NextResponse.json({ error: "Could not submit your booking. Please try again." }, { status: 500 })
    }
}
