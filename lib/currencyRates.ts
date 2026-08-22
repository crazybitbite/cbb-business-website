import { prisma } from "@/lib/prisma"
import { CURRENCY_CODES, type CurrencyRates } from "@/lib/currency"

const RATES_SETTINGS_KEY = "currencyRates"

/**
 * Fetch latest USD-based exchange rates and store them in Settings.
 * Uses the free, keyless open.er-api.com endpoint.
 */
export async function fetchAndStoreCurrencyRates(): Promise<CurrencyRates | null> {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" })
        if (!res.ok) {
            console.error("[CurrencyRates] Fetch failed:", res.status, await res.text())
            return null
        }

        const data = await res.json()
        if (data.result !== "success" || !data.rates) {
            console.error("[CurrencyRates] Unexpected response:", data.result)
            return null
        }

        // Keep only the currencies we actually support to keep the row small
        const rates: Record<string, number> = {}
        for (const code of CURRENCY_CODES) {
            if (typeof data.rates[code] === "number") {
                rates[code] = data.rates[code]
            }
        }

        const payload: CurrencyRates = {
            base: "USD",
            rates,
            fetchedAt: Math.floor(Date.now() / 1000),
        }

        await prisma.settings.upsert({
            where: { key: RATES_SETTINGS_KEY },
            update: { value: payload as any, updatedAt: BigInt(payload.fetchedAt) },
            create: { key: RATES_SETTINGS_KEY, value: payload as any },
        })

        console.log(`[CurrencyRates] Stored rates for ${Object.keys(rates).length} currencies`)
        return payload
    } catch (error) {
        console.error("[CurrencyRates] Error fetching rates:", error)
        return null
    }
}

/** Read stored rates; fetches fresh ones if none exist yet. */
export async function getCurrencyRates(): Promise<CurrencyRates | null> {
    try {
        const row = await prisma.settings.findUnique({ where: { key: RATES_SETTINGS_KEY } })
        const value = row?.value as CurrencyRates | undefined
        if (value?.rates) return value
        return await fetchAndStoreCurrencyRates()
    } catch (error) {
        console.error("[CurrencyRates] Error reading rates:", error)
        return null
    }
}
