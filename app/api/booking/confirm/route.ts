import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { createCalendarInvite } from "@/lib/googleCalendar"
import { formatLocalRfc3339 } from "@/lib/booking"
import { sendBookingEmail } from "@/lib/bookingEmail"

// Reads session_id from the query string — must never be statically prerendered
export const dynamic = "force-dynamic"

/**
 * Stripe success_url callback for consultation bookings: verify payment,
 * mark the order + booking confirmed, create the real Google Calendar invite
 * (with a Meet link), email the customer, then land them on a confirmation page.
 */
export async function GET(req: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin

    try {
        const sessionId = req.nextUrl.searchParams.get("session_id")
        if (!sessionId) {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
        }

        const stripe = await getStripe()
        if (!stripe) {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
        const bookingId = parseInt(checkoutSession.metadata?.bookingId || "")
        const orderId = parseInt(checkoutSession.metadata?.orderId || "")

        if (!bookingId || Number.isNaN(bookingId)) {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
        }

        if (checkoutSession.payment_status !== "paid") {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=failed`)
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
        if (!booking) {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
        }

        // Mark the order paid.
        if (orderId && !Number.isNaN(orderId)) {
            await prisma.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } }).catch(() => {})
        }

        // Only create the invite once (guards against a refreshed success page).
        if (booking.status !== "CONFIRMED") {
            const start = formatLocalRfc3339(booking.startsAt, booking.timeZone)
            const end = formatLocalRfc3339(
                new Date(booking.startsAt.getTime() + booking.durationMin * 60_000),
                booking.timeZone
            )

            const invite = await createCalendarInvite({
                summary: `Consultation with ${booking.firstName} ${booking.lastName}`,
                description:
                    `Consultation session (${booking.durationMin} min).\n` +
                    `Client: ${booking.firstName} ${booking.lastName}\n` +
                    `Email: ${booking.email}\nPhone: ${booking.phone}`,
                startIsoLocal: start,
                endIsoLocal: end,
                timeZone: booking.timeZone,
                attendeeEmail: booking.email,
                attendeeName: `${booking.firstName} ${booking.lastName}`,
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CONFIRMED",
                    googleEventId: invite?.eventId || null,
                    meetingLink: invite?.meetingLink || null,
                },
            })

            // Confirmation email (best-effort; never blocks the redirect).
            sendBookingEmail({
                to: booking.email,
                name: `${booking.firstName} ${booking.lastName}`,
                startsAt: booking.startsAt,
                timeZone: booking.timeZone,
                durationMin: booking.durationMin,
                price: booking.price,
                currency: booking.currency,
                meetingLink: invite?.meetingLink || null,
            }).catch((e) => console.error("Booking email failed:", e))
        }

        return NextResponse.redirect(`${baseUrl}/booking/${booking.id}?success=1`)
    } catch (error) {
        console.error("Booking confirmation error:", error)
        return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
    }
}
