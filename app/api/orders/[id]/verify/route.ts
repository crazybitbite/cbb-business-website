import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Admin-only: approve or reject a QR payment awaiting verification.
 * Approve after cross-checking the transaction id (UTR) against the bank
 * statement — approval (COMPLETED) is what unlocks purchases/downloads.
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { action, comment } = await req.json()
        if (action !== "approve" && action !== "reject") {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }
        const verificationNote =
            typeof comment === "string" && comment.trim() ? comment.trim().slice(0, 1000) : null

        const orderId = parseInt(params.id)
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order || order.status !== "VERIFYING") {
            return NextResponse.json({ error: "Order is not awaiting verification" }, { status: 400 })
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status: action === "approve" ? "COMPLETED" : "REJECTED" },
        })

        // The approve/reject comment becomes an order note (latest note is
        // shown to the purchaser by default)
        if (verificationNote) {
            await prisma.orderNote.create({
                data: { orderId, content: verificationNote },
            })
        }

        return NextResponse.json({ ok: true, status: updated.status })
    } catch (error) {
        console.error("Order verification failed:", error)
        return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }
}
