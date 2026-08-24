// Discount math shared by display components and checkout pricing.
// If both a discount amount and percent are set, the amount wins.

export interface EffectivePrice {
    original: number
    final: number
    hasDiscount: boolean
    percentOff: number
}

export function effectivePrice(
    price: number | null | undefined,
    discountAmount?: number | null,
    discountPercent?: number | null
): EffectivePrice | null {
    if (price == null) return null

    let final = price
    if (discountAmount != null && discountAmount > 0) {
        final = price - discountAmount
    } else if (discountPercent != null && discountPercent > 0) {
        final = price * (1 - Math.min(discountPercent, 100) / 100)
    }

    final = Math.max(0, Math.round(final * 100) / 100)
    const hasDiscount = final < price
    const percentOff = hasDiscount && price > 0 ? Math.round((1 - final / price) * 100) : 0

    return { original: price, final, hasDiscount, percentOff }
}
