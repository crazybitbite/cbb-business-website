"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { PageList, Page } from "@/components/PageList"

export default function PagesPage() {
    const [pages, setPages] = useState<Page[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const res = await fetch("/api/pages")
                if (res.ok) {
                    const data = await res.json()
                    setPages(data)
                }
            } catch (error) {
                console.error("Failed to fetch pages")
            } finally {
                setIsLoading(false)
            }
        }
        fetchPages()
    }, [])

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="space-y-12">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">Pages</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Explore our collection of pages.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <PageList pages={pages} />
                )}
            </div>
        </div>
    )
}
// PageCard is now in PageList component
