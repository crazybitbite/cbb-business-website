import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/** Admin-only: add a note to an order. */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const orderId = parseInt(params.id)
        const { content, visible } = await req.json()
        const text = typeof content === "string" ? content.trim().slice(0, 2000) : ""
        if (!text) {
            return NextResponse.json({ error: "Note content is required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } })
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const note = await prisma.orderNote.create({
            data: { orderId, content: text, visible: !!visible },
        })

        return NextResponse.json({
            id: note.id,
            content: note.content,
            visible: note.visible,
            createdAt: Number(note.createdAt),
        })
    } catch (error) {
        console.error("Failed to add note:", error)
        return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
    }
}
