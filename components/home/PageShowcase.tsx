"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingCart, Loader2, Check } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { DownloadButton } from "@/components/DownloadButton"
import { effectivePrice } from "@/lib/pricing"

export interface ShowcasePage {
    id: number
    name: string
    slug: string
    shortDescription: string | null
    featuredImages: string[]
    price: number | null
    currency: string
    discountAmount?: number | null
    discountPercent?: number | null
    downloadable: boolean
    downloadPlatforms: string[]
}

interface PageShowcaseProps {
    /** Category name, e.g. "Services", "Digital Products", "Blog" */
    category: string
    /** "readmore": title/description/read-more. "product": adds buy/download/cart actions */
    variant?: "readmore" | "product"
    columns?: number
}

const GRID_COLS: Record<number, string> = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
}

export function PageShowcase({ category, variant = "readmore", columns = 3 }: PageShowcaseProps) {
    const [pages, setPages] = useState<ShowcasePage[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/pages/showcase?category=${encodeURIComponent(category)}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setPages(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [category])

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!pages.length) {
        return (
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 py-8">
                Nothing to show here yet.
            </p>
        )
    }

    return (
        <div className={`grid gap-8 ${GRID_COLS[columns] || GRID_COLS[3]}`}>
            {pages.map((page, i) => (
                <ShowcaseCard key={page.id} page={page} index={i} variant={variant} />
            ))}
        </div>
    )
}

export function ShowcaseCard({ page, index, variant }: { page: ShowcasePage; index: number; variant: "readmore" | "product" }) {
    const router = useRouter()
    const addItem = useCartStore((state) => state.addItem)
    const { displayPrice } = useSiteSettings()
    const [justAdded, setJustAdded] = useState(false)

    const href = `/${page.slug}`
    const pricing = effectivePrice(page.price, page.discountAmount, page.discountPercent)
    const hasPaidPrice = pricing != null && pricing.final > 0

    const handleAddToCart = () => {
        if (!hasPaidPrice) return
        addItem({ id: page.id, name: page.name, price: pricing!.final, currency: page.currency || "USD", image: page.featuredImages[0] })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
    }

    const handleBuyNow = () => {
        handleAddToCart()
        router.push("/cart")
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden hover:border-orange-500/40 transition-colors shadow-sm dark:shadow-none"
        >
            <Link href={href} className="block aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {page.featuredImages[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={page.featuredImages[0]}
                        alt={page.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                        {page.name}
                    </div>
                )}
            </Link>

            <div className="flex flex-col flex-1 p-5 space-y-3">
                <Link href={href}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                        {page.name}
                    </h3>
                </Link>

                {page.shortDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                        {page.shortDescription}{" "}
                        <Link href={href} className="text-orange-500 dark:text-orange-400 font-medium hover:underline whitespace-nowrap">
                            Read more
                        </Link>
                    </p>
                )}
                {!page.shortDescription && variant === "readmore" && (
                    <p className="text-sm flex-1">
                        <Link href={href} className="text-orange-500 dark:text-orange-400 font-medium hover:underline">
                            Read more
                        </Link>
                    </p>
                )}

                {variant === "product" && (
                    <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-3">
                        {hasPaidPrice ? (
                            <>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="flex items-center gap-2 flex-wrap">
                                        {pricing!.hasDiscount && (
                                            <>
                                                <span className="text-xs text-gray-500 line-through">
                                                    {displayPrice(pricing!.original, page.currency || "USD")}
                                                </span>
                                                <span className="animate-pulse rounded-full bg-gradient-to-r from-orange-600 to-pink-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-orange-500/30">
                                                    {pricing!.percentOff}% OFF
                                                </span>
                                            </>
                                        )}
                                        <span className="text-lg font-bold text-orange-500 dark:text-orange-400">
                                            {displayPrice(pricing!.final, page.currency || "USD")}
                                        </span>
                                    </span>
                                    <button
                                        onClick={handleBuyNow}
                                        className="rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-1.5 transition-colors"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${justAdded
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white"}`}
                                >
                                    {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                    <span>{justAdded ? "Added to Cart" : "Add to Cart"}</span>
                                </button>
                            </>
                        ) : page.downloadable ? (
                            <DownloadButton pageId={page.id} />
                        ) : null}
                    </div>
                )}
            </div>
        </motion.article>
    )
}
