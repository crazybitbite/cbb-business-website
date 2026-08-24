import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/PageRenderer"
import { getPublishedPageBySlug } from "@/lib/pageData"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
    const page = await getPublishedPageBySlug(params.slug.join("/"))

    if (!page) {
        return { title: "Page Not Found" }
    }

    return {
        title: page.name,
        description: page.shortDescription || page.description.substring(0, 160),
        openGraph: {
            title: page.name,
            description: page.shortDescription || page.description.substring(0, 160),
            images: page.featuredImages.length > 0 ? [page.featuredImages[0]] : [],
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
