import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Helper for BigInt serialization
declare global {
    interface BigInt {
        toJSON(): string;
    }
}
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

export async function GET() {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: "navigation" }
        })

        let navigations = []
        if (setting?.value) {
            try {
                // @ts-ignore
                navigations = JSON.parse(setting.value)
                if (!Array.isArray(navigations)) navigations = []
            } catch (e) {
                // Return empty if parse fails
            }
        }

        return NextResponse.json(navigations)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch navigations" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        if (!json.name || !json.slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
        }

        const setting = await prisma.settings.findUnique({
            where: { key: "navigation" }
        })

        let navigations: any[] = []
        if (setting?.value) {
            try {
                // @ts-ignore
                navigations = JSON.parse(setting.value)
                if (!Array.isArray(navigations)) navigations = []
            } catch (e) { }
        }

        const newNav = {
            id: Date.now(),
            name: json.name,
            slug: json.slug,
            items: [],
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000)
        }

        navigations.push(newNav)

        await prisma.settings.upsert({
            where: { key: "navigation" },
            update: { value: JSON.stringify(navigations) },
            create: { key: "navigation", value: JSON.stringify(navigations) }
        })

        return NextResponse.json(newNav, { status: 201 })
    } catch (error) {
        console.error("Create navigation error:", error)
        return NextResponse.json({
            error: "Failed to create navigation",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
