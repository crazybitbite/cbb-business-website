"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Check, ChevronRight, Mail } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { DownloadButton } from "@/components/DownloadButton"
import { SideRail } from "@/components/SideRail"
import type { SideContent } from "@/lib/sideContent"

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
    featuredImages: string[]
    bannerImages: string[]
    category: string
    categoryBreadcrumb?: string[]
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
        <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
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
    const hasPaidPrice = page.price != null && page.price > 0
    const pageCurrency = page.currency || "USD"
    const crumbs = page.categoryBreadcrumb || []

    const leftBlocks = page.sideContent?.left || []
    const rightBlocks = page.sideContent?.right || []
    const showActionBox = hasPaidPrice || !!page.downloadable
    const hasLeftRail = leftBlocks.length > 0
    const hasRightRail = rightBlocks.length > 0 || showActionBox

    const cta = page.cta
    const showCta = !!cta?.enabled

    const handleAddToCart = () => {
        if (!hasPaidPrice) return
        addItem({
            id: page.id,
            name: page.name,
            price: page.price as number,
            currency: pageCurrency,
            image: page.featuredImages[0],
        })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
    }

    const actionBox = showActionBox ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm space-y-4">
            {hasPaidPrice && (
                <>
                    <div>
                        <span className="text-sm text-gray-400">Price</span>
                        <p className="text-2xl font-bold text-orange-500">
                            {displayPrice(page.price as number, pageCurrency)}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-bold text-white transition-colors ${justAdded ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"}`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="h-5 w-5" />
                                <span>Added to Cart</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-5 w-5" />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </>
            )}

            {page.downloadable && (
                <DownloadButton
                    pageId={page.id}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 font-bold transition-colors disabled:opacity-50"
                />
            )}
        </div>
    ) : null

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
                    {/* Banner Section */}
                    {page.bannerImages.length > 0 && (
                        <div className="relative h-96 w-full">
                            <Image
                                src={page.bannerImages[0]}
                                alt={page.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="container mx-auto">
                                    <Breadcrumb crumbs={crumbs} />
                                    <h1 className="text-5xl font-bold mb-4">{page.name}</h1>
                                    {page.shortDescription && (
                                        <p className="text-xl text-gray-300">{page.shortDescription}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="container mx-auto px-4 py-12">
                        {!page.bannerImages.length && (
                            <>
                                <Breadcrumb crumbs={crumbs} />
                                <h1 className="text-4xl font-bold mb-6">{page.name}</h1>
                            </>
                        )}

                        {/* Featured Images Gallery */}
                        {page.featuredImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {page.featuredImages.map((img, idx) => (
                                    <div key={idx} className="relative h-64 rounded-lg overflow-hidden">
                                        <Image
                                            src={img}
                                            alt={`${page.name} - Image ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.description }}
                        />

                        {/* On smaller screens the action box and rails stack below the content */}
                        {(showActionBox || hasLeftRail || rightBlocks.length > 0) && (
                            <div className="xl:hidden mt-10 grid gap-6 sm:grid-cols-2">
                                {actionBox}
                                <SideRail blocks={leftBlocks} />
                                <SideRail blocks={rightBlocks} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Rail: compact action box + configured blocks */}
                {hasRightRail && (
                    <aside className="hidden xl:block w-52 shrink-0 px-3 py-24">
                        <div className="sticky top-24 space-y-6">
                            {actionBox}
                            <SideRail blocks={rightBlocks} />
                        </div>
                    </aside>
                )}
            </div>

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
