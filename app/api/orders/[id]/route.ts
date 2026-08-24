import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/** Admin-only: full details of one order, for the admin orders modal. */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const order = await prisma.order.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { page: { select: { name: true, slug: true } } } },
                notes: { orderBy: { createdAt: "desc" } },
            },
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Explicit shape (BigInt createdAt is not JSON-serializable)
        return NextResponse.json({
            id: order.id,
            status: order.status,
            total: order.total,
            currency: order.currency,
            paymentMethod: order.paymentMethod,
            transactionId: order.transactionId,
            stripeSessionId: order.stripeSessionId,
            verificationNote: order.verificationNote,
            notes: order.notes.map((n) => ({
                id: n.id,
                content: n.content,
                visible: n.visible,
                createdAt: Number(n.createdAt),
            })),
            createdAt: Number(order.createdAt),
            user: order.user,
            items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.page?.name || "Unknown Item",
                slug: item.page?.slug || null,
            })),
        })
    } catch (error) {
        console.error("Failed to fetch order:", error)
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }
}
