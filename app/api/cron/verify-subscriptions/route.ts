import { NextRequest, NextResponse } from "next/server"
import { verifyAllUserSubscriptions } from "@/lib/subscriptionVerification"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * Vercel Cron target (see vercel.json): daily re-check of all users' social
 * subscriptions. When CRON_SECRET is set, Vercel sends it as a Bearer token.
 */
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const result = await verifyAllUserSubscriptions()
        return NextResponse.json({ ok: true, ...result })
    } catch (error) {
        console.error("Subscription cron failed:", error)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
