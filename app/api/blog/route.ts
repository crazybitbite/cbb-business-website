import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { slugify } from "@/lib/slugify"

export async function GET(req: Request) {
    try {
        const posts = await prisma.blogPost.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { name: true, email: true }
                }
            }
        })
        return NextResponse.json(posts)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const json = await req.json()

        let slug = json.slug
        if (!slug && json.title) {
            slug = slugify(json.title)
        }

        // Simple uniqueness check
        if (slug) {
            const existing = await prisma.blogPost.findUnique({ where: { slug } })
            if (existing) {
                slug = `${slug}-${Date.now()}`
            }
        }

        const post = await prisma.blogPost.create({
            data: {
                title: json.title,
                content: json.content,
                shortDescription: json.shortDescription || null,
                category: json.category || "General",
                featured: !!json.featured,
                published: !!json.published,
                slug: slug || `post-${Date.now()}`,
                authorId: user.id,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(post)
    } catch (error) {
        console.error("Error creating blog post:", error)
        return NextResponse.json({ error: "Failed to create blog post", details: (error as Error).message }, { status: 500 })
    }
}
