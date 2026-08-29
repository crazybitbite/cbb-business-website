import { ChevronRight } from "lucide-react"
import { ToolRunner } from "@/components/tools/ToolRunner"
import { checkToolAccess } from "@/lib/toolAccess"

interface ToolPageData {
    id: number
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    toolKey: string
    featuredImages: string[]
    categoryBreadcrumb?: string[]
    price: number | null
    discountAmount?: number | null
    discountPercent?: number | null
    currency: string
    downloadPlatforms: string[]
}

/**
 * Server-rendered tool page: breadcrumb + title + access-gated tool + about
 * section. Shared by every route that can serve a tool page.
 */
export async function ToolPageView({ page }: { page: ToolPageData }) {
    const access = await checkToolAccess(page as any)
    const crumbs = page.categoryBreadcrumb || []

    return (
        <div className="container mx-auto px-4 py-24 max-w-5xl">
            <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
                {crumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                        {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                        <span className={idx === crumbs.length - 1 ? "text-orange-400 font-medium" : ""}>{crumb}</span>
                    </span>
                ))}
            </nav>

            <h1 className="text-4xl font-bold text-white mb-3">{page.name}</h1>
            {page.shortDescription && (
                <p className="text-lg text-gray-400 mb-8">{page.shortDescription}</p>
            )}

            <ToolRunner
                pageId={page.id}
                pageName={page.name}
                pageSlug={page.slug}
                toolKey={page.toolKey}
                image={page.featuredImages[0]}
                access={access as any}
            />

            {page.description && page.description.trim() && (
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-4">About this tool</h2>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.description }} />
                </div>
            )}
        </div>
    )
}
