import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/PageRenderer"
import { getPublishedPageBySlug, getDefaultSeo } from "@/lib/pageData"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
    const page = await getPublishedPageBySlug(params.slug.join("/"))

    if (!page) {
        return { title: "Page Not Found" }
    }

    // Page-specific SEO wins; the site-wide defaults from Settings fill gaps
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
        openGraph: {
            title,
            description,
            type: "article",
            images,
        },
        twitter: {
            card: images.length ? "summary_large_image" : "summary",
            title,
            description,
            images,
        },
    }
}

export default async function DynamicPage({ params }: { params: { slug: string[] } }) {
    const page = await getPublishedPageBySlug(params.slug.join("/"))

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page as any} />
}
