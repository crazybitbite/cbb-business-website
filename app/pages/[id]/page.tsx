"use client"

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Loader2, Mail } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

interface Page {
    id: string
    name: string
    price: number | null
    currency?: string
    description: string
    category: string
}

export default function PageDetailPage() {
    const params = useParams()
    const id = params.id as string
    const addItem = useCartStore((state) => state.addItem)
    const { displayPrice } = useSiteSettings()
    const [page, setPage] = useState<Page | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch(`/api/pages/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setPage(data)
                }
            } catch (error) {
                console.error("Failed to fetch page")
            } finally {
                setIsLoading(false)
            }
        }
        fetchPage()
    }, [id])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!page) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white">Page not found</h1>
                <Link href="/pages" className="text-orange-400 hover:text-orange-300 mt-4 inline-block">
                    Back to Pages
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12"
            >
                <div className="space-y-8">
                    <Link href="/pages" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Pages</span>
                    </Link>

                    <div className="aspect-square rounded-3xl bg-gray-800 border border-white/10 overflow-hidden">
                        {/* Placeholder for page image */}
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {page.name} Image
                        </div>
                    </div>
                </div>

                <div className="space-y-8 pt-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{page.name}</h1>
                        {page.price != null && (
                            <p className="text-2xl text-orange-400 font-bold">{displayPrice(page.price, page.currency || "USD")}</p>
                        )}
                    </div>

                    <p className="text-gray-400">
                        {page.description || "No description available."}
                    </p>

                    {page.price != null && (
                        <button
                            onClick={() => addItem({ id: page.id, name: page.name, price: page.price as number, currency: page.currency || "USD" })}
                            className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Add to Cart</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
