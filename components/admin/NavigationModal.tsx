"use client"

import { useState, useEffect } from "react"
import { Loader2, X } from "lucide-react"

interface NavigationModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (item: any) => void
    itemToEdit?: any
    parentId?: string | null
    type: "MENU" | "ITEM"
}

export function NavigationModal({
    isOpen,
    onClose,
    onSave,
    itemToEdit,
    parentId,
    type
}: NavigationModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        path: "/",
        isEnabled: true,
        name: "", // For Menu
        slug: ""  // For Menu
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: itemToEdit?.title || "",
                path: itemToEdit?.path || "/",
                isEnabled: itemToEdit ? itemToEdit.isEnabled : true,
                name: itemToEdit?.name || "",
                slug: itemToEdit?.slug || ""
            })
        }
    }, [isOpen, itemToEdit])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (type === "MENU") {
            onSave({
                id: itemToEdit?.id,
                name: formData.name,
                slug: formData.slug
            })
        } else {
            onSave({
                id: itemToEdit?.id || crypto.randomUUID(),
                ...formData,
                parentId: itemToEdit?.parentId || parentId || null,
                children: itemToEdit?.children || []
            })
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6 text-white relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-6">
                    {itemToEdit ? "Edit" : "Add"} {type === "MENU" ? "Menu" : "Item"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === "MENU" ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Menu Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. Header"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                                    placeholder="e.g. header"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Menu Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Menu Slug / Path</label>
                                <input
                                    value={formData.path}
                                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm"
                                    placeholder="/about"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isEnabled}
                                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                                    id="enabled-toggle"
                                    className="rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="enabled-toggle" className="text-sm font-medium text-gray-300">Enable Navigation Item</label>
                            </div>
                        </>
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
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
