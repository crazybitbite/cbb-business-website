import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { buildShadowedSlugs } from "@/lib/categoryPages"
import { slugify } from "@/lib/slugify"

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

        const allSubs = await prisma.subCategory.findMany({
            where: { categoryId: category.id },
            orderBy: { order: "asc" },
            select: { id: true, name: true, description: true, parentSubCategoryId: true },
        })
        let subCategories = allSubs.map(({ id, name, parentSubCategoryId }) => ({ id, name, parentSubCategoryId }))

        // "collapse": a sub-tree (e.g. "Courses") whose deep pages are hidden and
        // replaced by ONE card per direct child (each linking to its overview),
        // while the sub-tree's root stays selectable in the dropdown.
        const collapseNames = (req.nextUrl.searchParams.get("collapse") || "")
            .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

        const collapsedCards: any[] = []
        const hiddenIds = new Set<number>()

        for (const rootName of collapseNames) {
            const root = allSubs.find((s) => s.parentSubCategoryId === null && s.name.toLowerCase() === rootName)
            if (!root) continue

            // Every descendant of the collapse root is hidden from the normal grid
            const descendants = new Set<number>([root.id])
            let grew = true
            while (grew) {
                grew = false
                for (const s of allSubs) {
                    if (s.parentSubCategoryId != null && descendants.has(s.parentSubCategoryId) && !descendants.has(s.id)) {
                        descendants.add(s.id); grew = true
                    }
                }
            }
            descendants.forEach((id) => id !== root.id && hiddenIds.add(id))

            // One synthetic card per direct child (the "course main page")
            const children = allSubs.filter((s) => s.parentSubCategoryId === root.id)
            const basePath = category.name.toLowerCase() === "digital products" ? "digital-products" : slugify(category.name)
            for (const child of children) {
                const levelIds = allSubs.filter((s) => s.parentSubCategoryId === child.id).map((s) => `sub-${s.id}`)
                const firstLesson = levelIds.length
                    ? await prisma.page.findFirst({
                        where: { category: { in: levelIds }, isPublished: true },
                        orderBy: [{ showcaseOrder: { sort: "asc", nulls: "last" } }, { name: "asc" }],
                        select: { featuredImages: true },
                    })
                    : null
                collapsedCards.push({
                    id: -child.id, // negative to avoid clashing with real page ids
                    name: child.name,
                    slug: `${basePath}/${slugify(root.name)}/${slugify(child.name)}`,
                    shortDescription: child.description,
                    featuredImages: firstLesson?.featuredImages || [],
                    price: null, currency: "USD", discountAmount: null, discountPercent: null,
                    downloadable: false, downloadPlatforms: [],
                    category: `sub-${root.id}`,
                })
            }
        }

        // Drop hidden (collapsed) sub-categories from the dropdown, keep the roots
        subCategories = subCategories.filter((s) => !hiddenIds.has(s.id))

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
                discountAmount: true,
                discountPercent: true,
                downloadable: true,
                downloadPlatforms: true,
                category: true,
            },
        })

        // Drop category placeholder pages (slug matches a sub-category listing URL)
        const shadowedSlugs = buildShadowedSlugs(category.name, subCategories)
        const visiblePages = pages.filter((p) => !shadowedSlugs.has(p.slug))

        // Prepend the synthetic "course main page" cards for any collapsed sub-tree
        return NextResponse.json({ pages: [...collapsedCards, ...visiblePages], subCategories })
    } catch (error) {
        console.error("Error fetching pages by category:", error)
        return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }
}
