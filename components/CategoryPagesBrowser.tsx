"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { ShowcaseCard, type ShowcasePage } from "@/components/home/PageShowcase"

interface SubCategory {
    id: number
    name: string
    parentSubCategoryId: number | null
}

interface BrowserPage extends ShowcasePage {
    category: string
}

interface CategoryPagesBrowserProps {
    /** Root category name, e.g. "Digital Products" or "Blog" */
    category: string
    variant?: "readmore" | "product"
    columns?: number
    /**
     * Lock the browser to one sub-category (and its descendants), e.g. on
     * /digital-products/mobile-apps. Dropdowns then only offer its children.
     */
    baseSubCategoryId?: number
}

const GRID_COLS: Record<number, string> = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
}

export function CategoryPagesBrowser({ category, variant = "readmore", columns = 3, baseSubCategoryId }: CategoryPagesBrowserProps) {
    const [pages, setPages] = useState<BrowserPage[]>([])
    const [subCategories, setSubCategories] = useState<SubCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    // Chain of selected sub-category ids, one entry per dropdown level
    const [selections, setSelections] = useState<number[]>([])

    useEffect(() => {
        fetch(`/api/pages/by-category?category=${encodeURIComponent(category)}`)
            .then((res) => (res.ok ? res.json() : { pages: [], subCategories: [] }))
            .then((data) => {
                setPages(Array.isArray(data.pages) ? data.pages : [])
                setSubCategories(Array.isArray(data.subCategories) ? data.subCategories : [])
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [category])

    const childrenOf = useMemo(() => {
        const map = new Map<number | null, SubCategory[]>()
        for (const sub of subCategories) {
            const key = sub.parentSubCategoryId
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(sub)
        }
        return map
    }, [subCategories])

    // Dropdown levels: top level always (if it has options); one more level per
    // selection that has children — a leaf selection ends the chain. When locked
    // to a base sub-category, the chain starts at its children instead.
    const levels: SubCategory[][] = useMemo(() => {
        const result: SubCategory[][] = []
        const topLevel = childrenOf.get(baseSubCategoryId ?? null) || []
        if (topLevel.length) result.push(topLevel)
        for (let i = 0; i < selections.length; i++) {
            const kids = childrenOf.get(selections[i]) || []
            if (kids.length) result.push(kids)
            else break
        }
        return result
    }, [childrenOf, selections, baseSubCategoryId])

    const handleSelect = (levelIndex: number, value: string) => {
        const next = selections.slice(0, levelIndex)
        if (value !== "") next.push(parseInt(value))
        setSelections(next)
    }

    // Filter: last selection (or the locked base sub-category) + all its descendants
    const filteredPages = useMemo(() => {
        const rootId = selections.length ? selections[selections.length - 1] : baseSubCategoryId
        if (rootId == null) return pages
        const allowed = new Set<number>([rootId])
        const queue = [rootId]
        while (queue.length) {
            for (const kid of childrenOf.get(queue.shift()!) || []) {
                if (!allowed.has(kid.id)) {
                    allowed.add(kid.id)
                    queue.push(kid.id)
                }
            }
        }
        return pages.filter((p) => {
            const m = p.category?.match(/^sub-(\d+)$/)
            return m ? allowed.has(parseInt(m[1])) : false
        })
    }, [pages, selections, childrenOf, baseSubCategoryId])

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {levels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                    {levels.map((options, levelIndex) => (
                        <select
                            key={levelIndex}
                            value={selections[levelIndex] ?? ""}
                            onChange={(e) => handleSelect(levelIndex, e.target.value)}
                            className="rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none [&>option]:bg-white dark:[&>option]:bg-gray-900"
                        >
                            <option value="">{levelIndex === 0 ? "All categories" : "All"}</option>
                            {options.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    ))}
                </div>
            )}

            {filteredPages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Nothing found in this category yet.
                </p>
            ) : (
                <div className={`grid gap-8 ${GRID_COLS[columns] || GRID_COLS[3]}`}>
                    {filteredPages.map((page, i) => (
                        <ShowcaseCard key={page.id} page={page} index={i} variant={variant} />
                    ))}
                </div>
            )}
        </div>
    )
}
