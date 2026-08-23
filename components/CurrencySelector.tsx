"use client"

import { CURRENCIES } from "@/lib/currency"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

/** Dropdown letting the visitor switch the currency prices are shown in. */
export function CurrencySelector({ className }: { className?: string }) {
    const { displayCurrency, setDisplayCurrency } = useSiteSettings()

    return (
        <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            aria-label="Display currency"
            className={className || "rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none [&>option]:bg-gray-900"}
        >
            {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                </option>
            ))}
        </select>
    )
}
