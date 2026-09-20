import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import { finalizeBooking } from "@/lib/bookingFinalize"

export const dynamic = "force-dynamic"

/**
 * Called by the client after the Razorpay widget reports a successful booking
 * payment. Verifies the signature, then finalizes the booking (calendar invite
 * + confirmation email). Bookings can be made by guests, so this is not gated
 * behind a session — the signature is the proof of payment.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
        const bookingId = parseInt(body.bookingId)
        const localOrderId = parseInt(body.localOrderId)

        if (!bookingId || Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking reference" }, { status: 400 })
        }

        const valid = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        if (!valid) {
            return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }
        // The Razorpay order id we created must match the one being verified.
        if (booking.stripeSessionId && booking.stripeSessionId !== razorpay_order_id) {
            return NextResponse.json({ error: "Booking mismatch" }, { status: 400 })
        }

        await finalizeBooking(
            bookingId,
            !Number.isNaN(localOrderId) ? localOrderId : booking.orderId ?? undefined,
            razorpay_payment_id
        )

        return NextResponse.json({ ok: true, bookingId })
    } catch (error) {
        console.error("Booking Razorpay verify error:", error)
        return NextResponse.json({ error: "Verification failed. Please contact support." }, { status: 500 })
    }
}
