"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Loader2, Save } from "lucide-react"
import { SortableNavigationTree } from "@/components/admin/SortableNavigationTree"
import { NavigationModal } from "@/components/admin/NavigationModal"

export default function NavigationEditorPage({ params }: { params: { id: string } }) {
    const [nav, setNav] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [parentId, setParentId] = useState<string | null>(null)

    useEffect(() => {
        fetchNav()
    }, [params.id])

    const fetchNav = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/navigation/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setNav(data)
                setItems(data.items || [])
            } else {
                setNav(null)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const saveChanges = async (newItems: any[]) => {
        setIsSaving(true)
        setItems(newItems) // Optimistic update
        try {
            await fetch(`/api/navigation/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: newItems }) // Update items only? Or full object? API handled partials?
                // API implementation merge: navigations[index] = { ...navigations[index], ...json }
                // So yes, passing { items: newItems } works.
            })
        } catch (e) {
            console.error("Save failed", e)
            alert("Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    const handleModalSave = (itemData: any) => {
        let newItems = [...items]

        // Helper to update/add in tree
        const updateTree = (list: any[]): any[] => {
            return list.map(item => {
                if (item.id === itemData.id) {
                    return { ...item, ...itemData }
                }
                if (item.children) {
                    return { ...item, children: updateTree(item.children) }
                }
                return item
            })
        }

        const addToTree = (list: any[], pId: string): any[] => {
            return list.map(item => {
                if (item.id === pId) {
                    return { ...item, children: [...(item.children || []), itemData] }
                }
                if (item.children) {
                    return { ...item, children: addToTree(item.children, pId) }
                }
                return item
            })
        }

        if (editingItem) {
            // Edit existing
            newItems = updateTree(newItems)
        } else {
            // Add new
            if (itemData.parentId) {
                newItems = addToTree(newItems, itemData.parentId)
            } else {
                newItems.push(itemData)
            }
        }

        saveChanges(newItems)
    }

    const deleteItem = (id: string) => {
        const removeFromTree = (list: any[]): any[] => {
            return list.filter(item => item.id !== id).map(item => ({
                ...item,
                children: item.children ? removeFromTree(item.children) : []
            }))
        }
        const newItems = removeFromTree(items)
        saveChanges(newItems)
    }

    const handleDelete = (id: string) => {
        if (!confirm("Delete this item?")) return
        deleteItem(id)
    }

    const handleReorder = (activeId: string, overId: string) => {
        // We need to reorder LOCAL tree.
        // Simplified Logic: 
        // 1. Flatten logic or find parent of both. 
        // 2. Perform arrayMove.

        // Note: SortableNavigationTree usually handles "onReorder" by passing active/over IDs. 
        // Dnd-kit's `arrayMove` helper works on flat arrays. 
        // For trees, we need custom logic if moving between parents.
        // Assuming user only reorders siblings for now or library supports it?
        // SortableNavigationTree.tsx used `dnd-kit/sortable` which assumes a list context.
        // Since we have nested contexts, `active` and `over` might be in different contexts.

        // Recursive search for the parent array containing both or either.

        const findParentArray = (list: any[]): any[] | null => {
            if (list.some(x => x.id === activeId) && list.some(x => x.id === overId)) return list
            for (const item of list) {
                if (item.children) {
                    const found = findParentArray(item.children)
                    if (found) return found
                }
            }
            return null
        }

        // Deep clone items
        const newItems = JSON.parse(JSON.stringify(items))

        // Helper to find and mutate array
        const mutateReorder = (list: any[]) => {
            const activeIndex = list.findIndex(x => x.id === activeId)
            const overIndex = list.findIndex(x => x.id === overId)

            if (activeIndex !== -1 && overIndex !== -1) {
                // Swap / Move
                const [moved] = list.splice(activeIndex, 1)
                list.splice(overIndex, 0, moved)
                return true
            }

            for (const item of list) {
                if (item.children) {
                    if (mutateReorder(item.children)) return true
                }
            }
            return false
        }

        if (mutateReorder(newItems)) {
            saveChanges(newItems)
        }
    }

    const handleOpenAdd = (pId: string | null = null) => {
        setEditingItem(null)
        setParentId(pId)
        setIsModalOpen(true)
    }

    const handleEdit = (item: any) => {
        setEditingItem(item)
        setParentId(item.parentId)
        setIsModalOpen(true)
    }

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
    if (!nav) return <div className="p-12">Navigation not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href="/controlpanel/navigation"
                        className="text-sm text-gray-400 hover:text-white flex items-center mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Menus
                    </Link>
                    <h1 className="text-3xl font-bold text-white">{nav.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving && <span className="text-sm text-gray-500 animate-pulse">Saving...</span>}
                    <button
                        onClick={() => handleOpenAdd(null)}
                        className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add Root Item</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[400px]">
                {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No items in this menu.</div>
                ) : (
                    <SortableNavigationTree
                        items={items}
                        onReorder={handleReorder}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleOpenAdd}
                    />
                )}
            </div>

            <NavigationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                itemToEdit={editingItem}
                parentId={parentId}
                type="ITEM"
            />
        </div>
    )
}
