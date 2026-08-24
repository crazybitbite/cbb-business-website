import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { CategoryPagesBrowser } from "@/components/CategoryPagesBrowser"
import { PageRenderer } from "@/components/PageRenderer"
import { getPublishedPageBySlug } from "@/lib/pageData"

export const dynamic = "force-dynamic"

/**
 * Resolve URL segments (e.g. ["mobile-apps"] or ["mobile-apps", "games"]) to a
 * sub-category chain under the "Digital Products" category by slugified name.
 * Works for any sub-category created in the future — no hardcoding.
 */
async function resolveSubCategory(pathSegments: string[]) {
    const category = await prisma.category.findFirst({
        where: { name: { equals: "Digital Products", mode: "insensitive" } },
    })
    if (!category) return null

    const subCategories = await prisma.subCategory.findMany({
        where: { categoryId: category.id },
        select: { id: true, name: true, description: true, parentSubCategoryId: true },
    })

    let parentId: number | null = null
    let current = null
    for (const segment of pathSegments) {
        const match: (typeof subCategories)[number] | undefined = subCategories.find(
            (s) => s.parentSubCategoryId === parentId && slugify(s.name) === segment
        )
        if (!match) return null
        current = match
        parentId = match.id
    }
    return current
}


export async function generateMetadata({ params }: { params: { path: string[] } }) {
    const sub = await resolveSubCategory(params.path)
    if (sub) {
        return {
            title: `${sub.name} | Digital Products | Crazyfactors`,
            description: sub.description || `Browse our ${sub.name} digital products.`,
        }
    }
    const page = await getPublishedPageBySlug(`digital-products/${params.path.join("/")}`)
    return page
        ? { title: page.name, description: page.shortDescription || undefined }
        : { title: "Digital Products | Crazyfactors" }
}

export default async function DigitalProductsSubCategoryPage({ params }: { params: { path: string[] } }) {
    // Sub-category listing takes precedence over an individual page slug
    const sub = await resolveSubCategory(params.path)

    if (sub) {
        return (
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                        {sub.name}
                    </h1>
                    {sub.description && (
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{sub.description}</p>
                    )}
                </div>
                <CategoryPagesBrowser
                    category="Digital Products"
                    variant="product"
                    columns={3}
                    baseSubCategoryId={sub.id}
                />
            </div>
        )
    }

    // Fall back to rendering a regular page with this slug
    const page = await getPublishedPageBySlug(`digital-products/${params.path.join("/")}`)
    if (!page) notFound()

    return <PageRenderer page={page as any} />
}
