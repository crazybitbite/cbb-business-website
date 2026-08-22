import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { buildShadowedSlugs } from "@/lib/categoryPages"

export const dynamic = "force-dynamic"

/**
 * All published pages under a category name (including every sub-category),
 * for listing pages like /digital-products and /blog. Unlike the showcase
 * endpoint, this does NOT require the showcase toggle. Each page keeps its
 * raw category value so the client can filter by sub-category selection.
 */
export async function GET(req: NextRequest) {
    try {
        const categoryName = req.nextUrl.searchParams.get("category")
        if (!categoryName) {
            return NextResponse.json({ error: "Missing category parameter" }, { status: 400 })
        }

        const category = await prisma.category.findFirst({
            where: { name: { equals: categoryName, mode: "insensitive" } },
        })
        if (!category) {
            return NextResponse.json({ pages: [], subCategories: [] })
        }

        const subCategories = await prisma.subCategory.findMany({
            where: { categoryId: category.id },
            orderBy: { order: "asc" },
            select: { id: true, name: true, parentSubCategoryId: true },
        })

        const categoryValues = [
            `cat-${category.id}`,
            String(category.id),
            ...subCategories.map((s) => `sub-${s.id}`),
        ]

        const pages = await prisma.page.findMany({
            where: {
                isPublished: true,
                category: { in: categoryValues },
            },
            orderBy: [
                { showcaseOrder: { sort: "asc", nulls: "last" } },
                { createdAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                featuredImages: true,
                price: true,
                currency: true,
                downloadable: true,
                downloadPlatforms: true,
                category: true,
            },
        })

        // Drop category placeholder pages (slug matches a sub-category listing URL)
        const shadowedSlugs = buildShadowedSlugs(category.name, subCategories)
        const visiblePages = pages.filter((p) => !shadowedSlugs.has(p.slug))

        return NextResponse.json({ pages: visiblePages, subCategories })
    } catch (error) {
        console.error("Error fetching pages by category:", error)
        return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }
}
