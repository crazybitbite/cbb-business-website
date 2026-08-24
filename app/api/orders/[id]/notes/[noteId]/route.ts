import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireAdminNote(params: { id: string; noteId: string }) {
    const session = await auth()
    if ((session?.user as any)?.role !== "ADMIN") {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    }
    const noteId = parseInt(params.noteId)
    const note = await prisma.orderNote.findUnique({ where: { id: noteId } })
    if (!note || note.orderId !== parseInt(params.id)) {
        return { error: NextResponse.json({ error: "Note not found" }, { status: 404 }) }
    }
    return { note }
}

/** Admin-only: edit a note's content and/or its shown-to-purchaser flag. */
export async function PUT(
    req: Request,
    { params }: { params: { id: string; noteId: string } }
) {
    try {
        const { note, error } = await requireAdminNote(params)
        if (error) return error

        const json = await req.json()
        const data: { content?: string; visible?: boolean; updatedAt: bigint } = {
            updatedAt: BigInt(Math.floor(Date.now() / 1000)),
        }
        if (typeof json.content === "string") {
            const text = json.content.trim().slice(0, 2000)
            if (!text) return NextResponse.json({ error: "Note content is required" }, { status: 400 })
            data.content = text
        }
        if (typeof json.visible === "boolean") data.visible = json.visible

        const updated = await prisma.orderNote.update({ where: { id: note!.id }, data })
        return NextResponse.json({
            id: updated.id,
            content: updated.content,
            visible: updated.visible,
            createdAt: Number(updated.createdAt),
        })
    } catch (error) {
        console.error("Failed to update note:", error)
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
    }
}

/** Admin-only: delete a note. */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string; noteId: string } }
) {
    try {
        const { note, error } = await requireAdminNote(params)
        if (error) return error

        await prisma.orderNote.delete({ where: { id: note!.id } })
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("Failed to delete note:", error)
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
    }
}
