import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkDownloadAccess } from "@/lib/downloadAccess"

export const dynamic = "force-dynamic"

/**
 * Streams an uploaded download file — ONLY after re-validating entitlement.
 * The URL is stable, but bookmarking it gains nothing: every request re-runs
 * the purchase/subscription gates.
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const result = await checkDownloadAccess(parseInt(params.id))

        if (!result.allowed) {
            const { status, ...body } = result
            return NextResponse.json(body, { status })
        }

        const { page } = result
        if (!page.downloadFileId) {
            return NextResponse.json({ error: "No file attached" }, { status: 404 })
        }

        const file = await prisma.downloadFile.findUnique({ where: { id: page.downloadFileId } })
        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        return new NextResponse(Buffer.from(file.data), {
            headers: {
                "Content-Type": file.mimeType || "application/octet-stream",
                "Content-Length": String(file.size),
                "Content-Disposition": `attachment; filename="${file.fileName.replace(/"/g, "")}"`,
                "Cache-Control": "private, no-store",
            },
        })
    } catch (error) {
        console.error("File download failed:", error)
        return NextResponse.json({ error: "Download failed" }, { status: 500 })
    }
}
