import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * Build a Stripe client from the secret key stored in admin Settings,
 * falling back to the STRIPE_SECRET_KEY env var. Returns null when
 * Stripe hasn't been configured yet.
 */
export async function getStripe(): Promise<Stripe | null> {
    let secretKey: string | null = null

    try {
        const row = await prisma.settings.findUnique({ where: { key: "stripeSecretKey" } })
        if (typeof row?.value === "string" && row.value.trim()) {
            secretKey = row.value.trim()
        }
    } catch (error) {
        console.error("Failed to read Stripe key from settings:", error)
    }

    if (!secretKey && process.env.STRIPE_SECRET_KEY) {
        secretKey = process.env.STRIPE_SECRET_KEY
    }

    if (!secretKey) return null
    return new Stripe(secretKey)
}
