export type PaymentMethod = "stripe" | "qr"

export const PAYMENT_METHOD_OPTIONS = [
    { value: "stripe", label: "Stripe (Card)" },
    { value: "qr", label: "QR Code" },
    { value: "both", label: "Both (QR + Stripe)" },
] as const

/** Expand a stored value ("stripe" | "qr" | "both") to concrete methods; null = not set */
export function methodsFromValue(value: string | null | undefined): PaymentMethod[] | null {
    switch (value) {
        case "stripe": return ["stripe"]
        case "qr": return ["qr"]
        case "both": return ["stripe", "qr"]
        default: return null
    }
}

/**
 * Methods usable for a whole cart: the intersection of each item's methods
 * (page override, else the settings default). An empty intersection means the
 * items must be bought separately — callers surface that as a conflict.
 */
export function cartPaymentMethods(
    itemMethodValues: (string | null | undefined)[],
    defaultValue: string | null | undefined
): { methods: PaymentMethod[]; conflict: boolean } {
    const fallback = methodsFromValue(defaultValue) ?? (["stripe"] as PaymentMethod[])
    let methods: PaymentMethod[] = ["stripe", "qr"]

    for (const value of itemMethodValues) {
        const itemMethods = methodsFromValue(value) ?? fallback
        methods = methods.filter((m) => itemMethods.includes(m))
    }

    return { methods, conflict: methods.length === 0 }
}

/** UPI transaction reference (UTR): exactly 12 digits */
export function isValidTransactionId(id: string): boolean {
    return /^\d{12}$/.test(id.trim())
}
