import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(params.id) },
        })
        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 })
        }
        return NextResponse.json(service)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const service = await prisma.service.update({
            where: { id: parseInt(params.id) },
            data: {
                name: json.name,
                description: json.description,
                shortDescription: json.shortDescription || null,
                price: parseFloat(json.price),
                category: json.category,
                featured: !!json.featured,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(service)
    } catch (error) {
        console.error("Error updating service:", error)
        return NextResponse.json({ error: "Failed to update service", details: (error as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.service.delete({
            where: { id: parseInt(params.id) },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }
}
