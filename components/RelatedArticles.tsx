"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface RelatedPage {
    id: number
    name: string
    slug: string
    shortDescription: string | null
    featuredImages: string[]
    category: string
}

interface RelatedArticlesProps {
    /** Root category name, e.g. "Blog" */
    rootCategory: string
    /** The current page's raw category value (e.g. "sub-4") — used to match siblings */
    categoryValue: string
    currentPageId: number
}

/**
 * Horizontal carousel of other articles from the same (sub-)category,
 * shown at the bottom of an article.
 */
export function RelatedArticles({ rootCategory, categoryValue, currentPageId }: RelatedArticlesProps) {
    const [pages, setPages] = useState<RelatedPage[]>([])
    const trackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch(`/api/pages/by-category?category=${encodeURIComponent(rootCategory)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.pages) return
                setPages(
                    data.pages.filter(
                        (p: RelatedPage) => p.category === categoryValue && p.id !== currentPageId
                    )
                )
            })
            .catch(() => { })
    }, [rootCategory, categoryValue, currentPageId])

    if (!pages.length) return null

    const scrollBy = (dir: -1 | 1) => {
        trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
    }

    return (
        <div className="border-t border-white/10 mt-4 py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">More like this</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scrollBy(-1)}
                            aria-label="Scroll left"
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scrollBy(1)}
                            aria-label="Scroll right"
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={trackRef}
                    className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]"
                >
                    {pages.map((page) => (
                        <Link
                            key={page.id}
                            href={`/${page.slug}`}
                            className="snap-start flex-shrink-0 w-72 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-orange-500/40 hover:-translate-y-1 transition-all"
                        >
                            <div className="aspect-[16/9] bg-gray-800 overflow-hidden">
                                {page.featuredImages[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={page.featuredImages[0]} alt={page.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm px-4 text-center">
                                        {page.name}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{page.name}</h3>
                                {page.shortDescription && (
                                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{page.shortDescription}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
