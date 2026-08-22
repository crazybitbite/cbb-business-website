"use client"

import { useState } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ChevronDown, GripVertical, Edit2, Trash2, Plus } from "lucide-react"

interface NavigationItemProps {
    id: string
    title: string
    path?: string
    isEnabled?: boolean
    parentId: string | null
    children?: NavigationItemProps[]
    data: any
}

interface SortableNavigationTreeProps {
    items: NavigationItemProps[]
    onReorder: (activeId: string, overId: string) => void
    onEdit: (item: any) => void
    onDelete: (id: string) => void
    onAddChild: (parentId: string) => void
}

function SortableItem({ item, onEdit, onDelete, onAddChild, depth = 0 }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id, data: { ...item, depth } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginLeft: `${depth * 24}px`
    };

    const [expanded, setExpanded] = useState(true); // Default expanded for nav usually better
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors group">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                    <GripVertical className="h-4 w-4" />
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`p-1 rounded hover:bg-white/10 ${hasChildren ? "opacity-100" : "opacity-0"}`}
                    disabled={!hasChildren}
                >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex-1 flex items-center justify-between mr-4">
                    <div className="flex flex-col">
                        <span className={`font-medium ${item.isEnabled !== false ? "text-white" : "text-gray-500 line-through"}`}>
                            {item.title} <span className="text-xs text-gray-500 ml-2">({item.type === "MENU" ? "MENU" : "ITEM"})</span>
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{item.path}</span>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500 hidden sm:flex mr-4">
                        {item.data.createdAt && <span>Created: {new Date(Number(item.data.createdAt) * 1000).toLocaleString()}</span>}
                        {item.data.updatedAt && <span>Updated: {new Date(Number(item.data.updatedAt) * 1000).toLocaleString()}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddChild(item.id)} className="p-2 text-gray-400 hover:text-green-400" title="Add Child Item">
                        <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="ml-0">
                    <SortableContext
                        items={item.children.flatMap((c: any) => {
                            const getAllIds = (item: any): string[] => {
                                const ids = [item.id]
                                if (item.children) {
                                    item.children.forEach((child: any) => {
                                        ids.push(...getAllIds(child))
                                    })
                                }
                                return ids
                            }
                            return getAllIds(c)
                        })}
                        strategy={verticalListSortingStrategy}
                    >
                        {item.children.map((child: any) => (
                            <SortableItem
                                key={child.id}
                                item={child}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddChild={onAddChild}
                                depth={depth + 1}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    )
}


export function SortableNavigationTree({ items, onReorder, onEdit, onDelete, onAddChild }: SortableNavigationTreeProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    // Flatten all IDs recursively for SortableContext
    const getAllIds = (items: NavigationItemProps[]): string[] => {
        const ids: string[] = []
        for (const item of items) {
            ids.push(item.id)
            if (item.children) {
                ids.push(...getAllIds(item.children))
            }
        }
        return ids
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            onReorder(active.id as string, over.id as string);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={getAllIds(items)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {items.map(item => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
