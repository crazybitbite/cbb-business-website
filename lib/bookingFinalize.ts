import { prisma } from "@/lib/prisma"
import { createCalendarInvite } from "@/lib/googleCalendar"
import { formatLocalRfc3339 } from "@/lib/booking"
import { sendBookingEmail } from "@/lib/bookingEmail"

/**
 * Finalize a paid consultation booking: mark the order paid, and — only once —
 * create the Google Calendar invite (with a Meet link), store it, and email the
 * customer. Idempotent: safe to call again on a refresh or retry.
 *
 * Shared by the Stripe success callback and the Razorpay verify endpoint.
 * Returns the (updated) booking, or null if it doesn't exist.
 */
export async function finalizeBooking(bookingId: number, orderId?: number, paymentRef?: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return null

    if (orderId && !Number.isNaN(orderId)) {
        await prisma.order
            .update({
                where: { id: orderId },
                data: { status: "COMPLETED", ...(paymentRef ? { transactionId: paymentRef } : {}) },
            })
            .catch(() => {})
    }

    if (booking.status === "CONFIRMED") return booking

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

    const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
            status: "CONFIRMED",
            googleEventId: invite?.eventId || null,
            meetingLink: invite?.meetingLink || null,
        },
    })

    // Confirmation email (best-effort; never blocks the caller).
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

    return updated
}
