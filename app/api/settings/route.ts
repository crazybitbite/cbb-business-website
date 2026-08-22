import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function isAdmin(session: any): boolean {
    return session?.user?.role === "ADMIN"
}

export async function GET(req: Request) {
    try {
        const session = await auth()
        // Admin-only: full settings include secrets (e.g. Stripe keys).
        // Public-safe values are served by /api/settings/public.
        if (!isAdmin(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const settings = await prisma.settings.findMany()
        // Convert array to object for easier consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json(settingsMap)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!isAdmin(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()

        // Upsert each setting (currencyRates is machine-managed by the scheduler).
        // Objects (e.g. sideContent) are stored as JSON; primitives as strings.
        const updates = Object.entries(json).filter(([key]) => key !== "currencyRates").map(([key, value]) => {
            const stored = typeof value === "object" && value !== null ? (value as any) : String(value)
            return prisma.settings.upsert({
                where: { key },
                update: { value: stored },
                create: { key, value: stored },
            })
        })

        await Promise.all(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving settings:", error)
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }
}
