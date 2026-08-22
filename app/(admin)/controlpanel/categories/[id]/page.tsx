"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import { SideContentEditor } from "@/components/admin/SideContentEditor"
import { EMPTY_SIDE_CONTENT, normalizeSideContent, type SideContent } from "@/lib/sideContent"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        order: 0,
        sideContent: EMPTY_SIDE_CONTENT as SideContent,
    })

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await fetch(`/api/categories/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.name,
                        description: data.description || "",
                        order: data.order || 0,
                        sideContent: normalizeSideContent(data.sideContent),
                    })
                } else {
                    router.push("/controlpanel/categories")
                }
            } catch (error) {
                console.error("Failed to fetch category")
            } finally {
                setIsLoading(false)
            }
        }
        fetchCategory()
    }, [params.id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch(`/api/categories/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/controlpanel/categories")
                router.refresh()
            } else {
                alert("Failed to update category")
            }
        } catch (error) {
            alert("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href="/controlpanel/categories"
                        className="text-sm text-gray-400 hover:text-white flex items-center mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Categories
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Edit Category</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Display Order</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Left / Right Side Content</label>
                    <p className="text-xs text-gray-500">Shown beside every page under this category, unless a page defines its own side content (page-level takes precedence).</p>
                    <SideContentEditor
                        value={formData.sideContent}
                        onChange={(sideContent) => setFormData({ ...formData, sideContent })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
