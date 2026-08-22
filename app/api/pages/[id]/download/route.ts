import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Gate a page download behind its required social subscriptions.
 *
 * - 404: page missing / unpublished / not downloadable
 * - 401: sign-in required (page requires subscriptions)
 * - 403: signed in but required platforms not yet subscribed → { missing: [...] }
 * - 200: { allowed: true, url } — url may be null if no file was attached
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const page = await prisma.page.findUnique({
            where: { id: parseInt(params.id) },
        })

        if (!page || !page.isPublished || !page.downloadable) {
            return NextResponse.json({ error: "Not downloadable" }, { status: 404 })
        }

        const required = page.downloadPlatforms || []

        if (required.length > 0) {
            const session = await auth()
            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: "Please sign in to download", required },
                    { status: 401 }
                )
            }

            const userSub = await prisma.userSubscription.findUnique({
                where: { userId: parseInt(session.user.id) },
            })
            const subs = (userSub?.subscription as Record<string, boolean> | null) || {}
            const missing = required.filter((platform) => subs[platform] !== true)

            if (missing.length > 0) {
                return NextResponse.json(
                    { error: "Subscription required", missing },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json({ allowed: true, url: page.modelUrl || null })
    } catch (error) {
        console.error("Download check failed:", error)
        return NextResponse.json({ error: "Download check failed" }, { status: 500 })
    }
}
