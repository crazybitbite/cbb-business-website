import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Settings safe to expose without authentication. Secrets (e.g. Stripe keys)
// must never be added here.
const PUBLIC_KEYS = [
    "siteName",
    "contactEmail",
    "supportPhone",
    "address",
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "defaultCurrency",
    "logo",
    "currencyRates",
    "sideContent",
]

export async function GET() {
    try {
        const settings = await prisma.settings.findMany({
            where: { key: { in: PUBLIC_KEYS } },
        })

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json(settingsMap)
    } catch (error) {
        console.error("Error fetching public settings:", error)
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}
