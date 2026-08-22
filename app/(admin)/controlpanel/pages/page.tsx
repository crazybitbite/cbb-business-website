"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Page {
    id: number
    name: string
    category: string
    slug: string
    price: number | null
    currency?: string
    isPublished: boolean
}

interface Category {
    id: number
    name: string
}

interface SubCategory {
    id: number
    name: string
    categoryId: number
    parentSubCategoryId: number | null
}

export default function AdminPages() {
    const router = useRouter()
    const [pages, setPages] = useState<Page[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [categories, setCategories] = useState<Category[]>([])
    const [subCategories, setSubCategories] = useState<SubCategory[]>([])

    useEffect(() => {
        fetchPages()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const [catRes, subRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/subcategories")
            ])
            if (catRes.ok && subRes.ok) {
                setCategories(await catRes.json())
                setSubCategories(await subRes.json())
            }
        } catch (error) {
            console.error("Failed to fetch categories")
        }
    }

    const fetchPages = async () => {
        try {
            const res = await fetch("/api/pages")
            if (res.ok) {
                const data = await res.json()
                setPages(data)
            }
        } catch (error) {
            console.error("Failed to fetch pages", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this page?")) return

        try {
            const res = await fetch(`/api/pages/${id}`, { method: "DELETE" })
            if (res.ok) {
                setPages(pages.filter(p => p.id !== id))
            }
        } catch (error) {
            alert("Failed to delete page")
        }
    }

    const getCategoryName = (id: string) => {
        const catId = parseInt(id)
        if (isNaN(catId)) return id

        const category = categories.find(c => c.id === catId)
        if (category) return category.name

        const subCategory = subCategories.find(s => s.id === catId)
        if (subCategory) return subCategory.name

        return id
    }

    const getCategoryBreadcrumb = (id: string): string => {
        const catId = parseInt(id)
        if (isNaN(catId)) return id

        const category = categories.find(c => c.id === catId)
        if (category) return category.name

        const sub = subCategories.find(s => s.id === catId)
        if (sub) {
            const parts: string[] = [sub.name]
            let current = sub
            while (current.parentSubCategoryId) {
                const parent = subCategories.find(s => s.id === current.parentSubCategoryId)
                if (parent) {
                    parts.unshift(parent.name)
                    current = parent
                } else {
                    break
                }
            }
            const rootCat = categories.find(c => c.id === current.categoryId)
            if (rootCat) {
                parts.unshift(rootCat.name)
            }
            return parts.join(" > ")
        }

        return id
    }

    const filteredPages = pages.filter(p => {
        const categoryName = getCategoryName(p.category).toLowerCase()
        const searchTerm = search.toLowerCase()
        return (
            p.name.toLowerCase().includes(searchTerm) ||
            categoryName.includes(searchTerm) ||
            p.slug.toLowerCase().includes(searchTerm)
        )
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Pages</h1>
                <button
                    onClick={() => router.push("/controlpanel/pages/new")}
                    className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Page</span>
                </button>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-white/5 p-4 border border-white/10">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search pages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
                />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-xs uppercase text-gray-300">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                                </td>
                            </tr>
                        ) : filteredPages.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No pages found.
                                </td>
                            </tr>
                        ) : (
                            filteredPages.map((page) => (
                                <tr key={page.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{page.name}</td>
                                    <td className="px-6 py-4" title={getCategoryBreadcrumb(page.category)}>
                                        <span className="cursor-help border-b border-dotted border-gray-600 pb-0.5">
                                            {getCategoryName(page.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {page.price != null
                                            ? `${page.currency || "USD"} ${page.price.toFixed(2)}`
                                            : <span className="text-gray-500 italic">Free / Open</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${page.isPublished
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-yellow-500/10 text-yellow-500"
                                            }`}>
                                            {page.isPublished ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => router.push(`/controlpanel/pages/${page.id}`)}
                                                className="p-2 hover:text-white transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="p-2 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
