import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: parseInt(params.id) },
        })
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }
        return NextResponse.json(project)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const project = await prisma.project.update({
            where: { id: parseInt(params.id) },
            data: {
                name: json.name,
                description: json.description,
                link: json.link,
                category: json.category,
                featured: !!json.featured,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(project)
    } catch (error) {
        console.error("Error updating project:", error)
        return NextResponse.json({ error: "Failed to update project", details: (error as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.project.delete({
            where: { id: parseInt(params.id) },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }
}
