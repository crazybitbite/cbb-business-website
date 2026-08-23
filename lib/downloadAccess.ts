import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Page } from "@prisma/client"

export type DownloadAccessResult =
    | { allowed: true; page: Page }
    | { allowed: false; status: 404 | 401 | 403; error: string; missing?: string[]; requiresPurchase?: boolean }

/**
 * Single source of truth for download entitlement. Run on BOTH the check
 * endpoint and the file-serving endpoint, so a bookmarked file URL can never
 * bypass the gates.
 *
 * Gates, when present on the page:
 * - price > 0            → signed in + a COMPLETED order containing this page
 * - downloadPlatforms    → signed in + all required subscriptions verified
 * - neither              → free to download for anyone
 */
export async function checkDownloadAccess(pageId: number): Promise<DownloadAccessResult> {
    const page = await prisma.page.findUnique({ where: { id: pageId } })

    if (!page || !page.isPublished || !page.downloadable) {
        return { allowed: false, status: 404, error: "Not downloadable" }
    }

    const requiredPlatforms = page.downloadPlatforms || []
    const requiresPurchase = page.price != null && page.price > 0

    if (requiredPlatforms.length > 0 || requiresPurchase) {
        const session = await auth()
        if (!session?.user?.id) {
            return { allowed: false, status: 401, error: "Please sign in to download" }
        }
        const userId = parseInt(session.user.id)

        if (requiresPurchase) {
            const purchase = await prisma.order.findFirst({
                where: {
                    userId,
                    status: "COMPLETED",
                    items: { some: { pageId: page.id } },
                },
                select: { id: true },
            })
            if (!purchase) {
                return {
                    allowed: false,
                    status: 403,
                    error: "This is a paid item — purchase it to unlock the download.",
                    requiresPurchase: true,
                }
            }
        }

        if (requiredPlatforms.length > 0) {
            const userSub = await prisma.userSubscription.findUnique({ where: { userId } })
            const subs = (userSub?.subscription as Record<string, boolean> | null) || {}
            const missing = requiredPlatforms.filter((platform) => subs[platform] !== true)
            if (missing.length > 0) {
                return { allowed: false, status: 403, error: "Subscription required", missing }
            }
        }
    }

    return { allowed: true, page }
}
