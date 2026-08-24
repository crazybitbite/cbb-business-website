import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { buildShadowedSlugs } from "@/lib/categoryPages"

export const dynamic = "force-dynamic"

/**
 * Pages to showcase on the home page for a given category name
 * (e.g. "Services", "Digital Products", "Blog").
 *
 * Matches pages whose category value points at the category itself
 * ("cat-N" or legacy plain "N") or at any of its sub-categories ("sub-N").
 * Only published pages with the showcase toggle on are returned, ordered by
 * the admin-defined order first (blanks last), then newest first.
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
            return NextResponse.json([])
        }

        const subCategories = await prisma.subCategory.findMany({
            where: { categoryId: category.id },
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
                showcase: true,
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
                discountAmount: true,
                discountPercent: true,
                downloadable: true,
                downloadPlatforms: true,
            },
        })

        // Drop category placeholder pages (slug matches a sub-category listing URL)
        const shadowedSlugs = buildShadowedSlugs(category.name, subCategories)
        return NextResponse.json(pages.filter((p) => !shadowedSlugs.has(p.slug)))
    } catch (error) {
        console.error("Error fetching showcase pages:", error)
        return NextResponse.json({ error: "Failed to fetch showcase pages" }, { status: 500 })
    }
}
