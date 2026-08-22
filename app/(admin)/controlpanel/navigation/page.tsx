"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { SortableNavigationTree } from "@/components/admin/SortableNavigationTree"
import { NavigationModal } from "@/components/admin/NavigationModal"

// Interface for Tree Items
interface TreeItem {
    id: string
    title: string // Display name
    path?: string // For items
    isEnabled?: boolean
    parentId: string | null
    children: TreeItem[]
    type: "MENU" | "ITEM"
    data: any // Original Data
}

export default function NavigationPage() {
    const [treeItems, setTreeItems] = useState<TreeItem[]>([])
    const [navigations, setNavigations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<"MENU" | "ITEM">("MENU")
    const [editingItem, setEditingItem] = useState<any>(null)
    const [parentMenuId, setParentMenuId] = useState<string | null>(null) // For adding Root Items to a Menu
    const [parentItemId, setParentItemId] = useState<string | null>(null) // For adding nested Items

    useEffect(() => {
        fetchNavigations()
    }, [])

    const fetchNavigations = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/navigation")
            if (res.ok) {
                const navs = await res.json()
                setNavigations(navs) // Store raw navigations
                // Transform to Tree
                // Roots are Menus.
                const newTree: TreeItem[] = navs.map((nav: any) => ({
                    id: `MENU_${nav.id}`, // Unique ID for Menu
                    title: nav.name, // Menu name
                    path: nav.slug, // Menu slug
                    isEnabled: true,
                    parentId: null,
                    type: "MENU",
                    data: nav,
                    children: transformItems(nav.items || [], `MENU_${nav.id}`)
                }))
                setTreeItems(newTree)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const transformItems = (items: any[], parentId: string): TreeItem[] => {
        return items.map((item: any) => ({
            id: item.id,
            title: item.title,
            path: item.path,
            isEnabled: item.isEnabled,
            parentId: parentId,
            children: transformItems(item.children || [], item.id),
            type: "ITEM",
            data: item
        }))
    }

    // Handlers
    // Handlers
    const handleOpenAddMenu = () => {
        setModalType("MENU")
        // @ts-ignore
        setEditingItem(null)
        setParentItemId(null)
        setIsModalOpen(true)
    }

    const createMenu = async (name: string, slug: string) => {
        try {
            const res = await fetch("/api/navigation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug })
            })
            if (res.ok) fetchNavigations()
            else alert("Failed to create menu")
        } catch (e) { alert("Error creating menu") }
    }

    const handleOpenAddItem = (parentId: string) => {
        setEditingItem(null)

        // If parentId starts with MENU_, it's a root item of that menu
        if (parentId.startsWith("MENU_")) {
            setParentMenuId(parentId.replace("MENU_", ""))
            setParentItemId(null)
        } else {
            // It's a nested item - Find which MENU it belongs to.
            const findRootMenu = (items: TreeItem[]): string | null => {
                for (const item of items) {
                    if (findItemInTree(item.children, parentId)) return item.data.id
                }
                return null
            }
            // Logic to find item recursively
            const findItemInTree = (list: TreeItem[], id: string): boolean => {
                for (const item of list) {
                    if (item.id === id) return true
                    if (item.children && findItemInTree(item.children, id)) return true
                }
                return false
            }

            const menuId = findRootMenu(treeItems)
            setParentMenuId(menuId ? menuId.toString() : null)
            setParentItemId(parentId)
        }

        setModalType("ITEM")
        setIsModalOpen(true)
    }

    const handleEdit = (item: any) => {
        if (item.type === "MENU") {
            setEditingItem(item.data)
            setModalType("MENU")
            setIsModalOpen(true)
        } else {
            // Edit Item
            setEditingItem(item.data) // Use .data to get raw item fields like isEnabled
            setModalType("ITEM")
            // Find Menu ID
            const menuId = findRootMenuId(item.id)
            setParentMenuId(menuId)
            setParentItemId(item.parentId?.startsWith("MENU_") ? null : item.parentId)
            setIsModalOpen(true)
        }
    }

    const findRootMenuId = (itemId: string): string | null => {
        for (const root of treeItems) {
            if (root.type !== "MENU") continue
            if (containsItem(root.children, itemId)) return root.data.id.toString()
        }
        return null
    }

    const containsItem = (list: TreeItem[], id: string): boolean => {
        return list.some(i => i.id === id || containsItem(i.children, id))
    }

    const updateMenu = async (id: number, data: any) => {
        // We rely on PUT /api/navigation/[id] which updates existing menu with JSON merge
        // If we rename, we pass name.
        await fetch(`/api/navigation/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        fetchNavigations()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this?")) return

        // If Menu
        if (id.startsWith("MENU_")) {
            const menuId = id.replace("MENU_", "")
            await fetch(`/api/navigation/${menuId}`, { method: "DELETE" })
            fetchNavigations()
            return
        }

        // If Item
        // We need to delete it from the JSON.
        // We can do this by removing it from the Tree and saving the new Tree for that Menu.
        const menuId = findRootMenuId(id)
        if (!menuId) return

        const menuNode = treeItems.find(t => t.data.id.toString() === menuId)
        if (!menuNode) return

        // Remove item from menuNode.children
        const removeFromList = (list: any[]): any[] => {
            return list.filter(x => x.id !== id).map(x => ({
                ...x,
                children: removeFromList(x.children || [])
            }))
        }

        const newItems = removeFromList(menuNode.children.map(x => x.data)) // Map back to raw data?
        // Wait, menuNode.children are TreeItems. We need to save Raw Items.
        // Let's create a helper to convert Tree back to Raw.

        const treeToRaw = (nodes: TreeItem[]): any[] => {
            return nodes.map(n => ({
                ...n.data,
                id: n.id,
                title: n.title,
                path: n.path,
                isEnabled: n.isEnabled,
                children: treeToRaw(n.children)
            }))
        }

        // Remove locally from tree for calculation
        const newTreeChildren = removeFromList(menuNode.children) // This works on TreeItem structure if we use ID match
        // Actually removeFromList above was generic.

        // Let's just filter items from the API data?
        // Easier: Modify the `menuNode` items and PUT.

        // Recalculate items for this menu
        const rawItems = treeToRaw(menuNode.children)

        // Helper to remove recursively
        const removeRecursive = (list: any[]): any[] => {
            return list.filter(i => i.id !== id).map(i => ({ ...i, children: removeRecursive(i.children || []) }))
        }

        const finalizedItems = removeRecursive(rawItems)

        await fetch(`/api/navigation/${menuId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: finalizedItems })
        })
        fetchNavigations()
    }

    const handleReorder = async (activeId: string, overId: string) => {
        console.log('handleReorder called', { activeId, overId })

        // Find items in tree
        const findItem = (items: TreeItem[], id: string): TreeItem | undefined => {
            for (const item of items) {
                if (item.id === id) return item
                if (item.children) {
                    const found = findItem(item.children, id)
                    if (found) return found
                }
            }
            return undefined
        }

        const activeItem = findItem(treeItems, activeId)
        const overItem = findItem(treeItems, overId)

        if (!activeItem || !overItem) {
            console.log('handleReorder: item not found', { activeId, overId, activeItem, overItem })
            return
        }

        // Special case: if both are MENUs, reorder the menus themselves
        if (activeItem.type === "MENU" && overItem.type === "MENU") {
            console.log('handleReorder: reordering menus', { activeId, overId })

            // Get current navigation order
            const currentNavs = [...navigations]
            const activeIndex = currentNavs.findIndex(n => `MENU_${n.id}` === activeId)
            const overIndex = currentNavs.findIndex(n => `MENU_${n.id}` === overId)

            if (activeIndex === -1 || overIndex === -1) {
                console.log('handleReorder: menu index not found')
                return
            }

            // Reorder the array
            const [movedMenu] = currentNavs.splice(activeIndex, 1)
            currentNavs.splice(overIndex, 0, movedMenu)

            // Update the entire navigation array in the database
            try {
                const res = await fetch('/api/settings/navigation', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ navigations: currentNavs })
                })

                if (res.ok) {
                    console.log('handleReorder: menus reordered successfully')
                    fetchNavigations()
                } else {
                    alert('Failed to reorder menus')
                }
            } catch (e) {
                console.error('Error reordering menus:', e)
                alert('Error reordering menus')
            }
            return
        }

        // Handle ITEM dropped onto MENU (add item to that menu's children)
        if (activeItem.type === "ITEM" && overItem.type === "MENU") {
            console.log('handleReorder: item dropped onto menu', { activeId, overId })

            // Get the source menu ID (where the item is coming from)
            const sourceMenuId = findRootMenuId(activeId)
            // Get the target menu ID (extract from MENU_ prefix)
            const targetMenuId = overId.replace('MENU_', '')

            if (!sourceMenuId) {
                console.log('handleReorder: source menu not found for item')
                return
            }

            // Get both menu nodes
            const sourceMenuNode = treeItems.find(t => t.data.id.toString() === sourceMenuId)
            const targetMenuNode = treeItems.find(t => t.id === overId)

            if (!sourceMenuNode || !targetMenuNode) {
                console.log('handleReorder: menu nodes not found')
                return
            }

            const treeToRaw = (nodes: TreeItem[]): any[] => {
                return nodes.map(n => ({
                    ...n.data,
                    id: n.id,
                    title: n.title,
                    path: n.path,
                    isEnabled: n.isEnabled,
                    children: treeToRaw(n.children)
                }))
            }

            // Helper to remove item recursively
            const removeItem = (list: any[], id: string): any | null => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === id) {
                        return list.splice(i, 1)[0]
                    }
                    if (list[i].children) {
                        const removed = removeItem(list[i].children, id)
                        if (removed) return removed
                    }
                }
                return null
            }

            // Get items from both menus
            let sourceItems = treeToRaw(sourceMenuNode.children)
            let targetItems = treeToRaw(targetMenuNode.children)

            // Remove from source menu
            const movedItem = removeItem(sourceItems, activeId)

            if (!movedItem) {
                console.log('handleReorder: item not found in source menu')
                return
            }

            // Add to target menu's root level
            targetItems.push(movedItem)

            // Update both menus
            try {
                console.log('handleReorder: updating source menu', sourceMenuId, sourceItems)
                const sourceRes = await fetch(`/api/navigation/${sourceMenuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: sourceItems })
                })

                console.log('handleReorder: updating target menu', targetMenuId, targetItems)
                const targetRes = await fetch(`/api/navigation/${targetMenuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: targetItems })
                })

                if (sourceRes.ok && targetRes.ok) {
                    console.log('handleReorder: item added to menu successfully')
                    fetchNavigations()
                } else {
                    alert('Failed to move item to menu')
                }
            } catch (e) {
                console.error('Error moving item to menu:', e)
                alert('Error moving item to menu')
            }
            return
        }

        // Prevent dragging MENUs onto ITEMs (only allow MENU-to-MENU or ITEM-to-ITEM/MENU)
        if (activeItem.type === "MENU" && overItem.type === "ITEM") {
            console.log('handleReorder: cannot drag menu onto item')
            return
        }

        // Check if same parent (siblings)
        const isSibling = (items: TreeItem[], id1: string, id2: string): boolean => {
            for (const item of items) {
                if (item.children) {
                    const has1 = item.children.find(c => c.id === id1)
                    const has2 = item.children.find(c => c.id === id2)
                    if (has1 && has2) return true
                    if (isSibling(item.children, id1, id2)) return true
                }
            }
            return false
        }

        // Get the menu ID for active item
        const activeMenuId = findRootMenuId(activeId)
        const overMenuId = findRootMenuId(overId)

        if (!activeMenuId || !overMenuId) {
            console.log('handleReorder: menu not found', { activeMenuId, overMenuId })
            return
        }

        // Handle cross-menu moves (moving item from one menu to another)
        if (activeMenuId !== overMenuId) {
            console.log('handleReorder: cross-menu move', { activeMenuId, overMenuId })

            // Get both menu nodes
            const sourceMenuNode = treeItems.find(t => t.data.id.toString() === activeMenuId)
            const targetMenuNode = treeItems.find(t => t.data.id.toString() === overMenuId)

            if (!sourceMenuNode || !targetMenuNode) {
                console.log('handleReorder: menu nodes not found')
                return
            }

            const treeToRaw = (nodes: TreeItem[]): any[] => {
                return nodes.map(n => ({
                    ...n.data,
                    id: n.id,
                    title: n.title,
                    path: n.path,
                    isEnabled: n.isEnabled,
                    children: treeToRaw(n.children)
                }))
            }

            // Helper to remove item recursively
            const removeItem = (list: any[], id: string): any | null => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === id) {
                        return list.splice(i, 1)[0]
                    }
                    if (list[i].children) {
                        const removed = removeItem(list[i].children, id)
                        if (removed) return removed
                    }
                }
                return null
            }

            // Helper to add item as sibling
            const addItemNextTo = (list: any[], targetId: string, item: any): boolean => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === targetId) {
                        list.splice(i + 1, 0, item)
                        return true
                    }
                    if (list[i].children) {
                        if (addItemNextTo(list[i].children, targetId, item)) return true
                    }
                }
                return false
            }

            // Helper to find parent
            const findParent = (list: any[], childId: string, parent: any = null): any => {
                for (const item of list) {
                    if (item.id === childId) return parent
                    if (item.children) {
                        const found = findParent(item.children, childId, item)
                        if (found !== null) return found
                    }
                }
                return null
            }

            // Get items from both menus
            let sourceItems = treeToRaw(sourceMenuNode.children)
            let targetItems = treeToRaw(targetMenuNode.children)

            // Remove from source menu
            const movedItem = removeItem(sourceItems, activeId)

            if (!movedItem) {
                console.log('handleReorder: item not found in source menu')
                return
            }

            // Add to target menu (as sibling of overItem)
            const overParent = findParent(targetItems, overId)
            if (overParent) {
                // Add to same parent as overItem
                addItemNextTo(overParent.children || [], overId, movedItem)
            } else {
                // overItem is at root level of target menu
                addItemNextTo(targetItems, overId, movedItem)
            }

            // Update both menus
            try {
                console.log('handleReorder: updating source menu', activeMenuId, sourceItems)
                const sourceRes = await fetch(`/api/navigation/${activeMenuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: sourceItems })
                })

                console.log('handleReorder: updating target menu', overMenuId, targetItems)
                const targetRes = await fetch(`/api/navigation/${overMenuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: targetItems })
                })

                if (sourceRes.ok && targetRes.ok) {
                    console.log('handleReorder: cross-menu move successful')
                    fetchNavigations()
                } else {
                    alert('Failed to move item between menus')
                }
            } catch (e) {
                console.error('Error moving item between menus:', e)
                alert('Error moving item between menus')
            }
            return
        }

        // Same-menu operations (existing logic)
        const menuId = activeMenuId
        const menuNode = treeItems.find(t => t.data.id.toString() === menuId)
        if (!menuNode) {
            console.log('handleReorder: menuNode not found', menuId)
            return
        }

        const treeToRaw = (nodes: TreeItem[]): any[] => {
            return nodes.map(n => ({
                ...n.data,
                id: n.id,
                title: n.title,
                path: n.path,
                isEnabled: n.isEnabled,
                children: treeToRaw(n.children)
            }))
        }

        let items = treeToRaw(menuNode.children)

        if (isSibling(menuNode.children, activeId, overId)) {
            // Simple reorder within same parent
            console.log('handleReorder: reordering siblings', { activeId, overId })
            const mutateReorder = (list: any[]): boolean => {
                const activeIndex = list.findIndex(x => x.id === activeId)
                const overIndex = list.findIndex(x => x.id === overId)

                if (activeIndex !== -1 && overIndex !== -1) {
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

            items = JSON.parse(JSON.stringify(items))
            if (mutateReorder(items)) {
                console.log('handleReorder: saving reordered items', items)
                const res = await fetch(`/api/navigation/${menuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items })
                })
                console.log('handleReorder: API response', res.status)
                fetchNavigations()
            }
        } else {
            // Reparenting - determine if adding as sibling or child
            console.log('handleReorder: reparenting', { activeId, overId })

            // Check for cycles
            const isDescendant = (parent: TreeItem, childId: string): boolean => {
                if (parent.id === childId) return true
                if (parent.children) {
                    return parent.children.some(c => isDescendant(c, childId))
                }
                return false
            }

            if (isDescendant(activeItem, overItem.id)) {
                alert("Cannot move into child")
                return
            }

            // Remove from old location
            const removeItem = (list: any[], id: string): any | null => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === id) {
                        return list.splice(i, 1)[0]
                    }
                    if (list[i].children) {
                        const removed = removeItem(list[i].children, id)
                        if (removed) return removed
                    }
                }
                return null
            }

            // Find parent of an item
            const findParent = (list: any[], childId: string, parent: any = null): any => {
                for (const item of list) {
                    if (item.id === childId) return parent
                    if (item.children) {
                        const found = findParent(item.children, childId, item)
                        if (found !== null) return found
                    }
                }
                return null
            }

            // Add item next to sibling (same parent)
            const addItemNextTo = (list: any[], targetId: string, item: any): boolean => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === targetId) {
                        list.splice(i + 1, 0, item)
                        return true
                    }
                    if (list[i].children) {
                        if (addItemNextTo(list[i].children, targetId, item)) return true
                    }
                }
                return false
            }

            // Add item as child
            const addItemAsChild = (list: any[], parentId: string, item: any): boolean => {
                for (const listItem of list) {
                    if (listItem.id === parentId) {
                        if (!listItem.children) listItem.children = []
                        listItem.children.push(item)
                        return true
                    }
                    if (listItem.children) {
                        if (addItemAsChild(listItem.children, parentId, item)) return true
                    }
                }
                return false
            }

            items = JSON.parse(JSON.stringify(items))
            const movedItem = removeItem(items, activeId)

            if (movedItem) {
                // Find the overItem in the RAW items structure (not tree)
                const findItemInRaw = (list: any[], id: string): any => {
                    for (const item of list) {
                        if (item.id === id) return item
                        if (item.children) {
                            const found = findItemInRaw(item.children, id)
                            if (found) return found
                        }
                    }
                    return null
                }

                const overItemInRaw = findItemInRaw(items, overId)

                // Determine if we should add as sibling or child
                // If overItem has children, add as child
                // Otherwise, add as sibling (next to overItem)
                if (overItemInRaw && overItemInRaw.children && overItemInRaw.children.length > 0) {
                    // Add as child
                    console.log('handleReorder: adding as child of', overId, 'because it has children')
                    addItemAsChild(items, overId, movedItem)
                } else {
                    // Add as sibling (next to overItem)
                    console.log('handleReorder: adding as sibling of', overId)
                    const overParent = findParent(items, overId)
                    if (overParent) {
                        // Add to same parent as overItem
                        console.log('handleReorder: parent found, adding to parent.children')
                        addItemNextTo(overParent.children || [], overId, movedItem)
                    } else {
                        // overItem is at root level
                        console.log('handleReorder: no parent found, adding to root level')
                        addItemNextTo(items, overId, movedItem)
                    }
                }

                console.log('handleReorder: saving reparented items', items)
                const res = await fetch(`/api/navigation/${menuId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items })
                })
                console.log('handleReorder: API response', res.status)
                fetchNavigations()
            } else {
                console.log('handleReorder: movedItem not found after removeItem')
            }
        }
    }

    const handleModalSave = async (itemData: any) => {
        if (modalType === "MENU") {
            if (itemData.id) {
                // Update
                updateMenu(itemData.id, { name: itemData.name, slug: itemData.slug })
            } else {
                // Create
                createMenu(itemData.name, itemData.slug)
            }
            return
        }

        if (!parentMenuId) return

        // Fetch current Items for this menu
        const menuNode = treeItems.find(t => t.data.id.toString() === parentMenuId)
        if (!menuNode) return

        const treeToRaw = (nodes: TreeItem[]): any[] => {
            return nodes.map(n => ({ ...n.data, id: n.id, title: n.title, path: n.path, isEnabled: n.isEnabled, children: treeToRaw(n.children) }))
        }

        let items = treeToRaw(menuNode.children)

        // Helper to add
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

        if (editingItem) {
            items = updateTree(items)
        } else {
            if (parentItemId) {
                items = addToTree(items, parentItemId)
            } else {
                items.push(itemData)
            }
        }

        await fetch(`/api/navigation/${parentMenuId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        })
        fetchNavigations()
    }

    return (
        <div className="space-y-8 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Navigation</h1>
                    <p className="text-gray-400">Manage all website menus</p>
                </div>
                <button
                    onClick={handleOpenAddMenu}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Create Menu</span>
                </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500" /></div>
                ) : treeItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No menus found. Create 'Header' and 'Footer' to get started.</div>
                ) : (
                    <SortableNavigationTree
                        items={treeItems}
                        onReorder={handleReorder}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={(parentId: string) => handleOpenAddItem(parentId)}
                    />
                )}
            </div>

            <NavigationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                itemToEdit={editingItem}
                parentId={parentItemId}
                type={modalType}
            />
        </div>
    )
}
