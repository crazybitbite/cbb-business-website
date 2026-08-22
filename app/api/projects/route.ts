import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(projects)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const project = await prisma.project.create({
            data: {
                name: json.name,
                description: json.description,
                link: json.link,
                category: json.category || "General",
                featured: json.featured || false,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(project)
    } catch (error) {
        console.error("Error creating project:", error)
        return NextResponse.json({ error: "Failed to create project", details: (error as Error).message }, { status: 500 })
    }
}
