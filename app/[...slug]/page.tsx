import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/PageRenderer"

interface PageData {
    id: number
    name: string
    slug: string
    description: string
    shortDescription?: string
    price: number | null
    currency?: string
    featuredImages: string[]
    bannerImages: string[]
    category: string
    categoryBreadcrumb?: string[]
    featured: boolean
    isPublished: boolean
    downloadable?: boolean
    downloadPlatforms?: string[]
    sideContent?: any
    cta?: any
}

async function getPageBySlug(slug: string[]): Promise<PageData | null> {
    try {
        const slugPath = slug.join('/')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pages/by-slug/${slugPath}`, {
            cache: 'no-store'
        })

        if (!res.ok) {
            return null
        }

        return await res.json()
    } catch (error) {
        console.error("Error fetching page:", error)
        return null
    }
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
    const page = await getPageBySlug(params.slug)

    if (!page) {
        return {
            title: 'Page Not Found',
        }
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
    const page = await getPageBySlug(params.slug)

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page} />
}
