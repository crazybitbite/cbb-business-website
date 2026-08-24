import { NextResponse } from "next/server"
import { getPublishedPageBySlug } from "@/lib/pageData"

export const dynamic = "force-dynamic"

export async function GET(
    req: Request,
    { params }: { params: { slug: string[] } }
) {
    try {
        const page = await getPublishedPageBySlug(params.slug.join("/"))
        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }
        return NextResponse.json(page)
    } catch (error) {
        console.error("Error fetching page by slug:", error)
        return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
    }
}
