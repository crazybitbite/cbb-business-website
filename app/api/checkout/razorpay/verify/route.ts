import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

/**
 * Called by the client after the Razorpay Checkout widget reports success.
 * Verifies the payment signature server-side before marking the order paid.
 */
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Please sign in" }, { status: 401 })
        }
        const userId = parseInt(session.user.id)

        const body = await req.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
        const localOrderId = parseInt(body.localOrderId)

        if (!localOrderId || Number.isNaN(localOrderId)) {
            return NextResponse.json({ error: "Invalid order reference" }, { status: 400 })
        }

        const valid = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        if (!valid) {
            return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 })
        }

        const order = await prisma.order.findUnique({ where: { id: localOrderId } })
        if (!order || order.userId !== userId) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }
        // Confirm the Razorpay order id matches what we created for this order.
        if (order.stripeSessionId && order.stripeSessionId !== razorpay_order_id) {
            return NextResponse.json({ error: "Order mismatch" }, { status: 400 })
        }

        if (order.status !== "COMPLETED") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "COMPLETED", paymentMethod: "razorpay", transactionId: razorpay_payment_id },
            })
        }

        return NextResponse.json({ ok: true, orderId: order.id })
    } catch (error) {
        console.error("Razorpay verify error:", error)
        return NextResponse.json({ error: "Verification failed. Please contact support." }, { status: 500 })
    }
}
