import { NextRequest, NextResponse } from "next/server"
import { fetchAndStoreCurrencyRates } from "@/lib/currencyRates"

export const dynamic = "force-dynamic"

/**
 * Vercel Cron target (see vercel.json): refreshes exchange rates every 8 hours.
 * When CRON_SECRET is set, Vercel sends it as a Bearer token — reject others.
 */
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rates = await fetchAndStoreCurrencyRates()
    if (!rates) {
        return NextResponse.json({ ok: false, error: "Rate fetch failed" }, { status: 500 })
    }
    return NextResponse.json({ ok: true, currencies: Object.keys(rates.rates).length, fetchedAt: rates.fetchedAt })
}
