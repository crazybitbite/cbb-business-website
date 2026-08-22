import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { navigations } = await req.json()

        // Update the navigation setting with the new order
        await prisma.settings.upsert({
            where: { key: "navigation" },
            update: { value: JSON.stringify(navigations) },
            create: { key: "navigation", value: JSON.stringify(navigations) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating navigation order:", error)
        return NextResponse.json({ error: "Failed to update navigation order" }, { status: 500 })
    }
}
