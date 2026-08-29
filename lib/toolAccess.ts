import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { effectivePrice } from "@/lib/pricing"
import type { Page } from "@prisma/client"

export type ToolAccess =
    | { allowed: true }
    | { allowed: false; reason: "login" }
    | { allowed: false; reason: "purchase"; price: number; currency: string }
    | { allowed: false; reason: "subscription"; missing: string[] }

/**
 * Server-side gate for tool pages, mirroring the download entitlement rules:
 * - effective price > 0 → signed in + a COMPLETED order containing this page
 * - downloadPlatforms   → signed in + all required subscriptions verified
 * - neither             → free to use
 */
export async function checkToolAccess(page: Pick<Page, "id" | "price" | "discountAmount" | "discountPercent" | "currency" | "downloadPlatforms">): Promise<ToolAccess> {
    const requiredPlatforms = page.downloadPlatforms || []
    const pricing = effectivePrice(page.price, page.discountAmount, page.discountPercent)
    const requiresPurchase = pricing != null && pricing.final > 0

    if (!requiresPurchase && requiredPlatforms.length === 0) {
        return { allowed: true }
    }

    const session = await auth()
    if (!session?.user?.id) {
        return { allowed: false, reason: "login" }
    }
    const userId = parseInt(session.user.id)

    if (requiresPurchase) {
        const purchase = await prisma.order.findFirst({
            where: { userId, status: "COMPLETED", items: { some: { pageId: page.id } } },
            select: { id: true },
        })
        if (!purchase) {
            return { allowed: false, reason: "purchase", price: pricing!.final, currency: page.currency || "USD" }
        }
    }

    if (requiredPlatforms.length > 0) {
        const userSub = await prisma.userSubscription.findUnique({ where: { userId } })
        const subs = (userSub?.subscription as Record<string, boolean> | null) || {}
        const missing = requiredPlatforms.filter((p) => subs[p] !== true)
        if (missing.length > 0) {
            return { allowed: false, reason: "subscription", missing }
        }
    }

    return { allowed: true }
}
