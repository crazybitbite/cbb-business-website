import { NextResponse } from "next/server"
import { checkDownloadAccess } from "@/lib/downloadAccess"

/**
 * Download entitlement check.
 *
 * - 404: page missing / unpublished / not downloadable
 * - 401: sign-in required
 * - 403: { missing: [...] } for unmet subscriptions, or { requiresPurchase: true }
 * - 200: { allowed: true, url } — the gated file endpoint for uploaded files,
 *        the manual URL otherwise; null when nothing is attached yet
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
        const url = page.downloadFileId
            ? `/api/pages/${page.id}/download/file`
            : page.modelUrl || null

        return NextResponse.json({ allowed: true, url })
    } catch (error) {
        console.error("Download check failed:", error)
        return NextResponse.json({ error: "Download check failed" }, { status: 500 })
    }
}
