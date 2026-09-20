import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { finalizeBooking } from "@/lib/bookingFinalize"

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

        const booking = await finalizeBooking(bookingId, orderId)
        if (!booking) {
            return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
        }

        return NextResponse.redirect(`${baseUrl}/booking/${booking.id}?success=1`)
    } catch (error) {
        console.error("Booking confirmation error:", error)
        return NextResponse.redirect(`${baseUrl}/service/consulting-services?booking=error`)
    }
}
