"use client"

import { useState, useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { SideContentEditor } from "@/components/admin/SideContentEditor"
import { EMPTY_SIDE_CONTENT, normalizeSideContent, type SideContent } from "@/lib/sideContent"

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    type: "CATEGORY" | "SUBCATEGORY"
    categoryToEdit?: any
    parentCategoryId?: string | null
    parentSubCategoryId?: string | null
}

export function CategoryModal({
    isOpen,
    onClose,
    onSuccess,
    type,
    categoryToEdit,
    parentCategoryId,
    parentSubCategoryId
}: CategoryModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        categoryId: "",
        parentSubCategoryId: "none"
    })
    const [sideContent, setSideContent] = useState<SideContent>(EMPTY_SIDE_CONTENT)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])
    const [loadingConfig, setLoadingConfig] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: categoryToEdit?.name || "",
                description: categoryToEdit?.description || "",
                categoryId: categoryToEdit?.categoryId?.toString() || parentCategoryId?.toString() || "",
                parentSubCategoryId: categoryToEdit?.parentSubCategoryId || parentSubCategoryId || "none"
            })
            setSideContent(normalizeSideContent(categoryToEdit?.sideContent))
            fetchConfig()
        }
    }, [isOpen, categoryToEdit, parentCategoryId, parentSubCategoryId])

    const fetchConfig = async () => {
        setLoadingConfig(true)
        try {
            const [catsRes, subCatsRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/subcategories"),
            ])
            if (catsRes.ok && subCatsRes.ok) {
                setCategories(await catsRes.json())
                setSubCategories(await subCatsRes.json())
            }
        } catch (error) {
            console.error("Error loading config:", error)
        } finally {
            setLoadingConfig(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url =
                type === "CATEGORY"
                    ? categoryToEdit
                        ? `/api/categories/${categoryToEdit.id}`
                        : "/api/categories"
                    : categoryToEdit
                        ? `/api/subcategories/${categoryToEdit.id}`
                        : "/api/subcategories"

            const method = categoryToEdit ? "PUT" : "POST"

            const body: any = {
                name: formData.name,
                description: formData.description,
            }

            if (type === "SUBCATEGORY") {
                body.categoryId = formData.categoryId
                body.parentSubCategoryId =
                    formData.parentSubCategoryId === "none" ? null : formData.parentSubCategoryId
            } else {
                body.sideContent = sideContent
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                onSuccess()
                onClose()
            } else {
                alert("Failed to save")
            }
        } catch (error) {
            console.error("Error saving:", error)
            alert("Error saving")
        } finally {
            setLoading(false)
        }
    }

    // Filter subcategories to show only valid parents
    const validParentSubCategories = subCategories.filter((s) => {
        if (!categoryToEdit) return true
        if (s.id === categoryToEdit.id) return false
        return true
    }).filter(s => s.categoryId == formData.categoryId);

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className={`w-full ${type === "CATEGORY" ? "max-w-3xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6 text-white relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-6">
                    {categoryToEdit ? "Edit" : "Add"}{" "}
                    {type === "CATEGORY" ? "Category" : "Sub-Category"}
                </h2>

                {loadingConfig ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-500" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Name</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                        </div>

                        {type === "SUBCATEGORY" && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Parent Category</label>
                                    <select
                                        value={formData.categoryId.toString()}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, parentSubCategoryId: "none" })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Parent Sub-Category (Optional)</label>
                                    <select
                                        value={formData.parentSubCategoryId}
                                        onChange={(e) => setFormData({ ...formData, parentSubCategoryId: e.target.value })}
                                        disabled={!formData.categoryId}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                                    >
                                        <option value="none">None (Top Level)</option>
                                        {validParentSubCategories.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {type === "CATEGORY" && (
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-gray-300">Left / Right Side Content</label>
                                <p className="text-xs text-gray-500">Shown beside every page under this category, unless a page defines its own side content (page-level takes precedence).</p>
                                <SideContentEditor value={sideContent} onChange={setSideContent} />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
