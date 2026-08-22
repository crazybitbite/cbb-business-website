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

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: "navigation" }
        })

        let navigations: any[] = []
        if (setting?.value) {
            try {
                // @ts-ignore
                navigations = JSON.parse(setting.value)
            } catch (e) { }
        }

        const id = parseInt(params.id)
        const nav = navigations.find((n: any) => n.id === id)

        if (!nav) {
            return NextResponse.json({ error: "Navigation not found" }, { status: 404 })
        }

        return NextResponse.json(nav)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch navigation" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const id = parseInt(params.id)

        const setting = await prisma.settings.findUnique({
            where: { key: "navigation" }
        })

        let navigations: any[] = []
        if (setting?.value) {
            try {
                // @ts-ignore
                navigations = JSON.parse(setting.value)
            } catch (e) { }
        }

        const index = navigations.findIndex((n: any) => n.id === id)
        if (index === -1) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        // Update the navigation object
        // We merge existing with new, but be careful with items array
        navigations[index] = {
            ...navigations[index],
            ...json,
            updatedAt: Math.floor(Date.now() / 1000)
        }

        await prisma.settings.update({
            where: { key: "navigation" },
            data: { value: JSON.stringify(navigations) }
        })

        return NextResponse.json(navigations[index])
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const id = parseInt(params.id)
        const setting = await prisma.settings.findUnique({
            where: { key: "navigation" }
        })

        let navigations: any[] = []
        if (setting?.value) {
            try {
                // @ts-ignore
                navigations = JSON.parse(setting.value)
            } catch (e) { }
        }

        const newNavigations = navigations.filter((n: any) => n.id !== id)

        await prisma.settings.update({
            where: { key: "navigation" },
            data: { value: JSON.stringify(newNavigations) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
