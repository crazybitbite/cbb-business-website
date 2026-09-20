export type PaymentMethod = "stripe" | "razorpay" | "qr"

// The two online gateways are mutually exclusive — a context may offer at most
// one of them (plus optionally QR).
export const ONLINE_METHODS: PaymentMethod[] = ["stripe", "razorpay"]
export const ALL_PAYMENT_METHODS: PaymentMethod[] = ["stripe", "razorpay", "qr"]

export const PAYMENT_METHOD_CHOICES = [
    { value: "stripe", label: "Stripe" },
    { value: "razorpay", label: "Razorpay" },
    { value: "qr", label: "QR Code" },
] as const

const VALID = new Set<string>(ALL_PAYMENT_METHODS)

/**
 * Clean a list of methods: drop invalid/duplicate values and enforce that only
 * one online gateway (Stripe OR Razorpay) can be present. Order is preserved,
 * so the first online method wins when both are supplied.
 */
export function sanitizeMethods(methods: string[]): PaymentMethod[] {
    const out: PaymentMethod[] = []
    const seen = new Set<string>()
    let hasOnline = false
    for (const raw of methods) {
        const m = raw as PaymentMethod
        if (!VALID.has(m) || seen.has(m)) continue
        if (ONLINE_METHODS.includes(m)) {
            if (hasOnline) continue
            hasOnline = true
        }
        seen.add(m)
        out.push(m)
    }
    return out
}

/**
 * Normalize a stored value to a method list. Accepts a JSON array (new format),
 * a comma-joined string, or the legacy single values "stripe" | "qr" | "both".
 * Returns null when nothing is set (caller falls back to the default).
 */
export function normalizeMethods(value: unknown): PaymentMethod[] | null {
    if (Array.isArray(value)) {
        const s = sanitizeMethods(value.map(String))
        return s.length ? s : null
    }
    if (typeof value === "string") {
        const v = value.trim()
        if (!v) return null
        if (v === "both") return ["stripe", "qr"] // legacy
        const parts = v.includes(",") ? v.split(",").map((x) => x.trim()) : [v]
        const s = sanitizeMethods(parts)
        return s.length ? s : null
    }
    return null
}

/** Back-compat alias. */
export const methodsFromValue = normalizeMethods

/** Which online gateway (if any) a method set uses. */
export function onlineGateway(methods: PaymentMethod[]): "stripe" | "razorpay" | null {
    if (methods.includes("stripe")) return "stripe"
    if (methods.includes("razorpay")) return "razorpay"
    return null
}

/**
 * Methods usable for a whole cart: the intersection of each item's methods
 * (page override, else the settings default). An empty intersection means the
 * items must be bought separately — callers surface that as a conflict.
 */
export function cartPaymentMethods(
    itemMethodValues: (string | null | undefined)[],
    defaultValue: unknown
): { methods: PaymentMethod[]; conflict: boolean } {
    const fallback = normalizeMethods(defaultValue) ?? (["stripe"] as PaymentMethod[])
    let methods: PaymentMethod[] = [...ALL_PAYMENT_METHODS]

    for (const value of itemMethodValues) {
        const itemMethods = normalizeMethods(value) ?? fallback
        methods = methods.filter((m) => itemMethods.includes(m))
    }

    return { methods, conflict: methods.length === 0 }
}

/** UPI transaction reference (UTR): exactly 12 digits */
export function isValidTransactionId(id: string): boolean {
    return /^\d{12}$/.test(id.trim())
}

/** Human label for an order's stored payment method / gateway. */
export function paymentMethodLabel(method: string | null | undefined): string {
    switch (method) {
        case "qr": return "QR Code"
        case "razorpay": return "Razorpay"
        case "stripe": return "Stripe"
        default: return "Card"
    }
}
