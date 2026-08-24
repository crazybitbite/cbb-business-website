"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ShowcaseCard, type ShowcasePage } from "@/components/home/PageShowcase"

interface ShowcaseSectionProps {
    id?: string
    category: string
    variant?: "readmore" | "product"
    columns?: number
    title: string
    subtitle?: string
    headerStyle?: "centered" | "split"
    viewAllHref?: string
    className?: string
}

const GRID_COLS: Record<number, string> = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
}

/**
 * A full home-page section driven by showcase pages. Renders NOTHING at all
 * (no heading, no background band) when the category has no showcased pages.
 */
export function ShowcaseSection({
    id,
    category,
    variant = "readmore",
    columns = 3,
    title,
    subtitle,
    headerStyle = "centered",
    viewAllHref,
    className = "py-24 bg-gray-50/50 dark:bg-black/50 backdrop-blur-sm",
}: ShowcaseSectionProps) {
    const [pages, setPages] = useState<ShowcasePage[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        fetch(`/api/pages/showcase?category=${encodeURIComponent(category)}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setPages(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setIsLoaded(true))
    }, [category])

    // Nothing to show — the whole section stays hidden (also while loading,
    // so an empty section never flashes in)
    if (!isLoaded || pages.length === 0) return null

    return (
        <section id={id} className={className}>
            <div className="container mx-auto px-4">
                {headerStyle === "split" ? (
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">{title}</h2>
                            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
                        </div>
                        {viewAllHref && (
                            <Link href={viewAllHref} className="hidden md:flex items-center text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">{title}</h2>
                        {subtitle && <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
                    </div>
                )}

                <div className={`grid gap-8 ${GRID_COLS[columns] || GRID_COLS[3]}`}>
                    {pages.map((page, i) => (
                        <ShowcaseCard key={page.id} page={page} index={i} variant={variant} />
                    ))}
                </div>

                {viewAllHref && headerStyle === "split" && (
                    <div className="mt-8 text-center md:hidden">
                        <Link href={viewAllHref} className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 inline-flex items-center">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
