import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(services)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const service = await prisma.service.create({
            data: {
                name: json.name,
                description: json.description,
                shortDescription: json.shortDescription || null,
                price: parseFloat(json.price),
                category: json.category || "General",
                featured: json.featured || false,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(service)
    } catch (error) {
        console.error("Error creating service:", error)
        return NextResponse.json({ error: "Failed to create service", details: (error as Error).message }, { status: 500 })
    }
}
