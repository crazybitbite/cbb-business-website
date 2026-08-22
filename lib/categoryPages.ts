import { slugify } from "@/lib/slugify"

export interface SubCategoryNode {
    id: number
    name: string
    parentSubCategoryId: number | null
}

/**
 * Slugs like "digital-products/mobile-apps" belong to the sub-category listing
 * routes (slugified category name + slugified sub-category chain), so a Page
 * carrying such a slug is a category placeholder, not a real product page —
 * listings must not include it.
 */
export function buildShadowedSlugs(categoryName: string, subCategories: SubCategoryNode[]): Set<string> {
    const catSlug = slugify(categoryName)
    const byId = new Map(subCategories.map((s) => [s.id, s]))
    const pathOf = (s: SubCategoryNode): string => {
        const parent = s.parentSubCategoryId ? byId.get(s.parentSubCategoryId) : null
        return parent ? `${pathOf(parent)}/${slugify(s.name)}` : slugify(s.name)
    }
    return new Set(subCategories.map((s) => `${catSlug}/${pathOf(s)}`))
}
