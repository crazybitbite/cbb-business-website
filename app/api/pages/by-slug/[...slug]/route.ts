import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hasSideContent, normalizeSideContent } from "@/lib/sideContent"

/**
 * Resolve a stored category value ("cat-3", "sub-12", legacy plain id or text)
 * into a breadcrumb of names (walking sub-category parents up to the root
 * category) plus the root category id, used for category-level side content.
 */
async function resolveCategoryInfo(categoryValue: string | null): Promise<{ crumbs: string[]; rootCategoryId: number | null }> {
    if (!categoryValue) return { crumbs: [], rootCategoryId: null }

    // Legacy plain numbers (e.g. "2") are CATEGORY ids; "sub-N" are sub-category ids
    const catMatch = categoryValue.match(/^cat-(\d+)$/) || categoryValue.match(/^(\d+)$/)
    const subMatch = categoryValue.match(/^sub-(\d+)$/)

    try {
        if (catMatch) {
            const category = await prisma.category.findUnique({ where: { id: parseInt(catMatch[1]) } })
            return category
                ? { crumbs: [category.name], rootCategoryId: category.id }
                : { crumbs: [], rootCategoryId: null }
        }

        if (subMatch) {
            const crumbs: string[] = []
            let current = await prisma.subCategory.findUnique({ where: { id: parseInt(subMatch[1]) } })
            if (!current) return { crumbs: [], rootCategoryId: null }

            const categoryId = current.categoryId
            // Walk up the sub-category chain (bounded to avoid cycles)
            for (let depth = 0; current && depth < 10; depth++) {
                crumbs.unshift(current.name)
                current = current.parentSubCategoryId
                    ? await prisma.subCategory.findUnique({ where: { id: current.parentSubCategoryId } })
                    : null
            }

            const category = await prisma.category.findUnique({ where: { id: categoryId } })
            if (category) crumbs.unshift(category.name)
            return { crumbs, rootCategoryId: categoryId }
        }

        // Legacy free-text category (e.g. "General")
        return { crumbs: [categoryValue], rootCategoryId: null }
    } catch (error) {
        console.error("Error resolving category info:", error)
        return { crumbs: [], rootCategoryId: null }
    }
}

export async function GET(
    req: Request,
    { params }: { params: { slug: string[] } }
) {
    try {
        // Join slug array to handle nested paths (e.g., ['services', 'ai-development'])
        const slug = params.slug.join('/')

        const page = await prisma.page.findUnique({
            where: { slug },
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        // Only return published pages
        if (!page.isPublished) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        const { crumbs: categoryBreadcrumb, rootCategoryId } = await resolveCategoryInfo(page.category)

        // Side content precedence: page → category → site-wide settings
        let sideContent = normalizeSideContent(page.sideContent)
        if (!hasSideContent(sideContent)) {
            if (rootCategoryId) {
                const category = await prisma.category.findUnique({ where: { id: rootCategoryId } })
                sideContent = normalizeSideContent(category?.sideContent)
            }
            if (!hasSideContent(sideContent)) {
                const globalRow = await prisma.settings.findUnique({ where: { key: "sideContent" } })
                sideContent = normalizeSideContent(globalRow?.value)
            }
        }

        return NextResponse.json({ ...page, categoryBreadcrumb, sideContent })
    } catch (error) {
        console.error("Error fetching page by slug:", error)
        return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
    }
}
