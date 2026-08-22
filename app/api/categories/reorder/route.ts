import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { updates } = await req.json()

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid updates format" }, { status: 400 })
        }

        // Use transaction for batch update
        await prisma.$transaction(
            updates.map((update: { id: string, order: number }) =>
                prisma.category.update({
                    where: { id: parseInt(update.id) },
                    data: { order: update.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reorder error:", error)
        return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 })
    }
}
