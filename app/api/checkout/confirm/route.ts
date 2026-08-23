import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

// Reads session_id from the query string — must never be statically prerendered
export const dynamic = "force-dynamic"

/**
 * Stripe success_url callback: verify the checkout session was actually paid,
 * mark the order completed, and send the user to their order page.
 */
export async function GET(req: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin

    try {
        const sessionId = req.nextUrl.searchParams.get("session_id")
        if (!sessionId) {
            return NextResponse.redirect(`${baseUrl}/cart`)
        }

        const stripe = await getStripe()
        if (!stripe) {
            return NextResponse.redirect(`${baseUrl}/cart`)
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
        const orderId = parseInt(checkoutSession.metadata?.orderId || "")

        if (!orderId || Number.isNaN(orderId)) {
            return NextResponse.redirect(`${baseUrl}/orders`)
        }

        if (checkoutSession.payment_status === "paid") {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" },
            })
            return NextResponse.redirect(`${baseUrl}/orders/${orderId}?success=1`)
        }

        return NextResponse.redirect(`${baseUrl}/orders/${orderId}`)
    } catch (error) {
        console.error("Checkout confirmation error:", error)
        return NextResponse.redirect(`${baseUrl}/orders`)
    }
}
