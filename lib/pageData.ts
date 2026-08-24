import { prisma } from "@/lib/prisma"
import { hasSideContent, normalizeSideContent } from "@/lib/sideContent"

/**
 * Resolve a stored category value ("cat-3", "sub-12", legacy plain id or text)
 * into a breadcrumb of names plus the root category id.
 */
export async function resolveCategoryInfo(categoryValue: string | null): Promise<{ crumbs: string[]; rootCategoryId: number | null }> {
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

        return { crumbs: [categoryValue], rootCategoryId: null }
    } catch (error) {
        console.error("Error resolving category info:", error)
        return { crumbs: [], rootCategoryId: null }
    }
}

/**
 * Load a published page by slug with its breadcrumb and resolved side content
 * (page → category → site-wide settings). Direct DB access — pages must NOT
 * fetch their own HTTP API during SSR (self-fetches are flaky and caused
 * intermittent 404s on client navigation).
 */
export async function getPublishedPageBySlug(slugPath: string) {
    const page = await prisma.page.findUnique({ where: { slug: slugPath } })
    if (!page || !page.isPublished) return null

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

    // JSON-safe shape (BigInt createdAt/updatedAt stripped)
    const { createdAt, updatedAt, ...rest } = page
    return { ...rest, categoryBreadcrumb, sideContent }
}
