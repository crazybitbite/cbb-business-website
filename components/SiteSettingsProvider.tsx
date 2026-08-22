"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
    COUNTRY_TO_CURRENCY,
    CURRENCY_CODES,
    convertPrice,
    formatPrice,
    type CurrencyRates,
} from "@/lib/currency"
import type { SideContent } from "@/lib/sideContent"

interface PublicSettings {
    siteName?: string
    contactEmail?: string
    supportPhone?: string
    address?: string
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    defaultCurrency?: string
    logo?: string
    currencyRates?: CurrencyRates
    sideContent?: SideContent
}

interface SiteSettingsContextValue {
    settings: PublicSettings
    isLoaded: boolean
    /** Currency prices are displayed in, resolved from browser locale → IP → site default */
    displayCurrency: string
    /** Format a stored (amount, currency) pair in the visitor's display currency when rates allow */
    displayPrice: (amount: number, fromCurrency: string) => string
    /** True while a dynamic page renders its own (already resolved) side rails */
    suppressGlobalRails: boolean
    setSuppressGlobalRails: (value: boolean) => void
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
    settings: {},
    isLoaded: false,
    displayCurrency: "USD",
    displayPrice: (amount, from) => formatPrice(amount, from),
    suppressGlobalRails: false,
    setSuppressGlobalRails: () => { },
})

function currencyFromBrowserLocale(): string | null {
    try {
        const locales = [...(navigator.languages || []), navigator.language]
        for (const locale of locales) {
            if (!locale) continue
            const region = new Intl.Locale(locale).region
            if (region && COUNTRY_TO_CURRENCY[region]) {
                return COUNTRY_TO_CURRENCY[region]
            }
        }
    } catch {
        // Intl.Locale unsupported — fall through to IP lookup
    }
    return null
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<PublicSettings>({})
    const [isLoaded, setIsLoaded] = useState(false)
    const [geoCurrency, setGeoCurrency] = useState<string | null>(null)
    const [suppressGlobalRails, setSuppressGlobalRails] = useState(false)

    useEffect(() => {
        fetch("/api/settings/public")
            .then((res) => (res.ok ? res.json() : {}))
            .then((data) => setSettings(data))
            .catch(() => { })
            .finally(() => setIsLoaded(true))

        const fromLocale = currencyFromBrowserLocale()
        if (fromLocale) {
            setGeoCurrency(fromLocale)
        } else {
            fetch("/api/geo")
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.currency) setGeoCurrency(data.currency)
                })
                .catch(() => { })
        }
    }, [])

    const defaultCurrency =
        settings.defaultCurrency && CURRENCY_CODES.includes(settings.defaultCurrency)
            ? settings.defaultCurrency
            : "USD"
    const displayCurrency = geoCurrency || defaultCurrency

    const displayPrice = useCallback(
        (amount: number, fromCurrency: string) => {
            const converted = convertPrice(amount, fromCurrency, displayCurrency, settings.currencyRates)
            if (converted !== null) return formatPrice(converted, displayCurrency)
            // No rates available for this pair — show the original price untouched
            return formatPrice(amount, fromCurrency)
        },
        [displayCurrency, settings.currencyRates]
    )

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoaded, displayCurrency, displayPrice, suppressGlobalRails, setSuppressGlobalRails }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext)
}
