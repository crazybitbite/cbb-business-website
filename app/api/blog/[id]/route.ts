import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                author: {
                    select: { name: true, email: true }
                }
            }
        })
        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
        }
        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const post = await prisma.blogPost.update({
            where: { id: parseInt(params.id) },
            data: {
                title: json.title,
                content: json.content,
                shortDescription: json.shortDescription || null,
                category: json.category,
                featured: !!json.featured,
                published: !!json.published,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(post)
    } catch (error) {
        console.error("Error updating blog post:", error)
        return NextResponse.json({ error: "Failed to update blog post", details: (error as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.blogPost.delete({
            where: { id: parseInt(params.id) },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
    }
}
