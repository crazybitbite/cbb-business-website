// Shared currency helpers — safe to import from both client and server code.

export interface CurrencyInfo {
    code: string
    name: string
    symbol: string
}

// Most popular currencies offered in admin dropdowns.
export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
]

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code)

// Currencies whose minor unit is the whole unit (no cents) — needed for Stripe amounts.
export const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "UGX"])

// Country (ISO 3166-1 alpha-2) → currency, for the currencies we support.
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
    US: "USD", IN: "INR", GB: "GBP", JP: "JPY", CN: "CNY", AU: "AUD",
    CA: "CAD", CH: "CHF", SG: "SGD", AE: "AED", HK: "HKD", NZ: "NZD",
    SE: "SEK", NO: "NOK", KR: "KRW", BR: "BRL", MX: "MXN", ZA: "ZAR",
    TH: "THB",
    // Eurozone
    AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR",
    FI: "EUR", FR: "EUR", GR: "EUR", HR: "EUR", IE: "EUR", IT: "EUR",
    LT: "EUR", LU: "EUR", LV: "EUR", MT: "EUR", NL: "EUR", PT: "EUR",
    SI: "EUR", SK: "EUR",
}

// IANA timezone → country, for the countries whose currencies we support.
// The browser's timezone reflects the machine's actual location far better
// than its language setting does.
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
    "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
    "Europe/London": "GB",
    "Asia/Tokyo": "JP",
    "Asia/Shanghai": "CN", "Asia/Chongqing": "CN", "Asia/Urumqi": "CN",
    "Asia/Singapore": "SG",
    "Asia/Dubai": "AE",
    "Asia/Hong_Kong": "HK",
    "Asia/Seoul": "KR",
    "Asia/Bangkok": "TH",
    "Europe/Zurich": "CH",
    "Europe/Stockholm": "SE",
    "Europe/Oslo": "NO",
    "Pacific/Auckland": "NZ",
    "Africa/Johannesburg": "ZA",
    "America/Sao_Paulo": "BR", "America/Bahia": "BR", "America/Fortaleza": "BR", "America/Manaus": "BR",
    "America/Mexico_City": "MX", "America/Tijuana": "MX", "America/Monterrey": "MX", "America/Cancun": "MX",
    "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
    "America/Phoenix": "US", "America/Detroit": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US",
    "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA", "America/Montreal": "CA",
    "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Australia/Hobart": "AU", "Australia/Darwin": "AU",
    // Eurozone
    "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Madrid": "ES", "Europe/Rome": "IT",
    "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT",
    "Europe/Dublin": "IE", "Europe/Helsinki": "FI", "Europe/Athens": "GR", "Europe/Luxembourg": "LU",
    "Europe/Bratislava": "SK", "Europe/Ljubljana": "SI", "Europe/Tallinn": "EE", "Europe/Riga": "LV",
    "Europe/Vilnius": "LT", "Europe/Zagreb": "HR", "Europe/Malta": "MT", "Europe/Nicosia": "CY",
}

export interface CurrencyRates {
    base: string // always "USD"
    rates: Record<string, number> // 1 USD = rates[code] of that currency
    fetchedAt: number // epoch seconds
}

/**
 * Convert an amount between currencies using USD-based rates.
 * Returns null when a needed rate is missing (caller should fall back
 * to showing the amount in its original currency).
 */
export function convertPrice(
    amount: number,
    from: string,
    to: string,
    rates: CurrencyRates | null | undefined
): number | null {
    if (from === to) return amount
    const fromRate = rates?.rates?.[from]
    const toRate = rates?.rates?.[to]
    if (!fromRate || !toRate) return null
    return (amount / fromRate) * toRate
}

export function formatPrice(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2,
        }).format(amount)
    } catch {
        return `${currency} ${amount.toFixed(2)}`
    }
}
