import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/PageRenderer"
import { getPublishedPageBySlug, getDefaultSeo } from "@/lib/pageData"

// This route shadows the root catch-all for /blog/<slug> URLs, so it must
// render the CMS-managed article the same way the catch-all does.
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { id: string } }) {
    const page = await getPublishedPageBySlug(`blog/${params.id}`)
    if (!page) {
        return { title: "Article Not Found" }
    }

    const defaults = await getDefaultSeo()
    const title = page.seoTitle || defaults.title || page.name
    const description =
        page.seoDescription ||
        defaults.description ||
        page.shortDescription ||
        page.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 160)
    const images = page.featuredImages.length > 0 ? [page.featuredImages[0]] : []

    return {
        title,
        description,
        keywords: page.seoKeywords || defaults.keywords || undefined,
        openGraph: { title, description, type: "article", images },
        twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images },
    }
}

export default async function BlogArticlePage({ params }: { params: { id: string } }) {
    const page = await getPublishedPageBySlug(`blog/${params.id}`)

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page as any} />
}
