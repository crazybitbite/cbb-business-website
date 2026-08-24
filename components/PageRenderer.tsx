"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Check, ChevronRight, Mail } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { DownloadButton } from "@/components/DownloadButton"
import { CurrencySelector } from "@/components/CurrencySelector"
import { SideRail } from "@/components/SideRail"
import { RelatedArticles } from "@/components/RelatedArticles"
import type { SideContent } from "@/lib/sideContent"
import { effectivePrice } from "@/lib/pricing"

export interface PageCta {
    enabled?: boolean
    title?: string
    description?: string
    buttonLabel?: string
    buttonUrl?: string
}

interface PageData {
    id: number
    name: string
    slug: string
    description: string
    shortDescription?: string
    price: number | null
    currency?: string
    discountAmount?: number | null
    discountPercent?: number | null
    featuredImages: string[]
    bannerImages: string[]
    category: string
    categoryBreadcrumb?: string[]
    rootCategoryName?: string | null
    featured: boolean
    isPublished: boolean
    downloadable?: boolean
    downloadPlatforms?: string[]
    sideContent?: SideContent
    cta?: PageCta | null
}

interface PageRendererProps {
    page: PageData
}

function Breadcrumb({ crumbs }: { crumbs: string[] }) {
    if (!crumbs.length) return null
    return (
        <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
            {crumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                    <span className={idx === crumbs.length - 1 ? "text-orange-400 font-medium" : ""}>
                        {crumb}
                    </span>
                </span>
            ))}
        </nav>
    )
}

export function PageRenderer({ page }: PageRendererProps) {
    const { displayPrice, setSuppressGlobalRails } = useSiteSettings()
    const addItem = useCartStore((state) => state.addItem)
    const [justAdded, setJustAdded] = useState(false)

    // This page renders its own resolved rails (page → category → settings),
    // so the layout-level global rails must stay out of the way while mounted.
    useEffect(() => {
        setSuppressGlobalRails(true)
        return () => setSuppressGlobalRails(false)
    }, [setSuppressGlobalRails])

    // Price of 0 (or none) means open to use — show nothing price-related at all
    const pricing = effectivePrice(page.price, page.discountAmount, page.discountPercent)
    const hasPaidPrice = pricing != null && pricing.final > 0
    const pageCurrency = page.currency || "USD"
    const crumbs = page.categoryBreadcrumb || []

    const leftBlocks = page.sideContent?.left || []
    const rightBlocks = page.sideContent?.right || []
    const hasActions = hasPaidPrice || !!page.downloadable
    const hasLeftRail = leftBlocks.length > 0
    const hasRightRail = rightBlocks.length > 0

    const cta = page.cta
    const showCta = !!cta?.enabled

    const handleAddToCart = () => {
        if (!hasPaidPrice) return
        addItem({
            id: page.id,
            name: page.name,
            price: (pricing as NonNullable<typeof pricing>).final,
            currency: pageCurrency,
            image: page.featuredImages[0],
        })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Rails sit in the outer side space; the middle keeps the standard
                container spacing (same as /contact). */}
            <div className="flex w-full">
                {/* Left Rail */}
                {hasLeftRail && (
                    <aside className="hidden xl:block w-52 shrink-0 px-3 py-24">
                        <div className="sticky top-24">
                            <SideRail blocks={leftBlocks} />
                        </div>
                    </aside>
                )}

                {/* Middle: banner + content at standard container width */}
                <div className="flex-1 min-w-0">
                    {/* Banner: image only — heading lives below it */}
                    {page.bannerImages.length > 0 && (
                        <div className="relative h-96 w-full">
                            <Image
                                src={page.bannerImages[0]}
                                alt={page.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    )}

                    <div className="container mx-auto px-4">
                        {/* Sticky header: breadcrumb + title on the left, actions on the right */}
                        <div className="sticky top-16 z-30 -mx-4 px-4 py-4 bg-black/85 backdrop-blur-md border-b border-white/10">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <Breadcrumb crumbs={crumbs} />
                                    <h1 className="text-2xl sm:text-3xl font-bold truncate">{page.name}</h1>
                                </div>

                                {hasActions && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        {hasPaidPrice && (
                                            <>
                                                {pricing!.hasDiscount && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {displayPrice(pricing!.original, pageCurrency)}
                                                        </span>
                                                        <span className="animate-pulse rounded-full bg-gradient-to-r from-orange-600 to-pink-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                                                            {pricing!.percentOff}% OFF
                                                        </span>
                                                    </span>
                                                )}
                                                <span className="text-xl font-bold text-orange-500">
                                                    {displayPrice(pricing!.final, pageCurrency)}
                                                </span>
                                                <CurrencySelector />
                                                <button
                                                    onClick={handleAddToCart}
                                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${justAdded ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"}`}
                                                >
                                                    {justAdded ? (
                                                        <>
                                                            <Check className="h-4 w-4" />
                                                            <span>Added</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="h-4 w-4" />
                                                            <span>Add to Cart</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}

                                        {page.downloadable && (
                                            <DownloadButton
                                                pageId={page.id}
                                                className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-10">
                            {/* Blog articles: the uploaded featured image is the hero */}
                            {page.rootCategoryName?.toLowerCase() === "blog" && !page.bannerImages.length && page.featuredImages[0] && (
                                <figure className="mb-8 rounded-2xl overflow-hidden border border-white/10 max-w-[780px] mx-auto">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={page.featuredImages[0]}
                                        alt={page.name}
                                        className="w-full aspect-[16/9] object-cover"
                                    />
                                </figure>
                            )}
                            <div
                                className="prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: page.description }}
                            />

                            {/* On smaller screens the side blocks stack below the content */}
                            {(hasLeftRail || hasRightRail) && (
                                <div className="xl:hidden mt-10 grid gap-6 sm:grid-cols-2">
                                    <SideRail blocks={leftBlocks} />
                                    <SideRail blocks={rightBlocks} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Rail: configured blocks */}
                {hasRightRail && (
                    <aside className="hidden xl:block w-52 shrink-0 px-3 py-24">
                        <div className="sticky top-24">
                            <SideRail blocks={rightBlocks} />
                        </div>
                    </aside>
                )}
            </div>

            {/* Related articles carousel (blog posts only) */}
            {page.rootCategoryName?.toLowerCase() === "blog" && (
                <RelatedArticles
                    rootCategory={page.rootCategoryName}
                    categoryValue={page.category}
                    currentPageId={page.id}
                />
            )}

            {/* Call to Action */}
            {showCta && (
                <div className="max-w-4xl mx-auto px-4 pb-16">
                    <div className="rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 border border-black/10 dark:border-white/10 p-8 md:p-12 text-center">
                        <Mail className="h-12 w-12 text-white mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {cta?.title || "Ready to start your project?"}
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                            {cta?.description || "Let's create something amazing together. Reach out to us and we'll get back to you within 24 hours."}
                        </p>
                        <Link
                            href={cta?.buttonUrl || "/contact"}
                            className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-black transition-transform hover:scale-105"
                        >
                            {cta?.buttonLabel || "Contact Us"}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
