import { useState } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ChevronDown, GripVertical, Edit2, Trash2, Plus } from "lucide-react"

interface TreeItem {
    id: string
    name: string
    parentId: string | null
    children?: TreeItem[]
    type: "CATEGORY" | "SUBCATEGORY"
    data: any // Full object
}

interface SortableCategoryTreeProps {
    items: TreeItem[]
    onReorder: (activeId: string, overId: string) => void
    onEdit: (item: any, type: "CATEGORY" | "SUBCATEGORY") => void
    onDelete: (id: string, type: "CATEGORY" | "SUBCATEGORY") => void
    onAddSub: (parentId: string, type: "CATEGORY" | "SUBCATEGORY") => void
}

function SortableItem({ item, onEdit, onDelete, onAddSub, depth = 0 }: any) {
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

    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors group">
                {/* Drag Handle - Only for subcategories to be reorderable inside parents? Actually categories too */}
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Expand/Collapse */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`p-1 rounded hover:bg-white/10 ${hasChildren ? "opacity-100" : "opacity-0"}`}
                    disabled={!hasChildren}
                >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex-1 flex items-center justify-between mr-4">
                    <span className="font-medium text-white">{item.name} <span className="text-xs text-gray-500 ml-2">({item.type === "CATEGORY" ? "CAT" : "SUB"})</span></span>

                    <div className="flex gap-4 text-xs text-gray-500 hidden sm:flex">
                        {item.data.createdAt && <span>Created: {new Date(Number(item.data.createdAt) * 1000).toLocaleString()}</span>}
                        {item.data.updatedAt && <span>Updated: {new Date(Number(item.data.updatedAt) * 1000).toLocaleString()}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {item.type === "CATEGORY" && (
                        <button onClick={() => onAddSub(item.id, "CATEGORY")} className="p-2 text-gray-400 hover:text-green-400" title="Add Subcategory">
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                    {item.type === "SUBCATEGORY" && (
                        <button onClick={() => onAddSub(item.id, "SUBCATEGORY")} className="p-2 text-gray-400 hover:text-green-400" title="Add Nested Subcategory">
                            <Plus className="h-4 w-4" />
                        </button>
                    )}

                    <button onClick={() => onEdit(item.data, item.type)} className="p-2 text-gray-400 hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(item.id, item.type)} className="p-2 text-gray-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="ml-0">
                    <SortableContext
                        items={item.children.map((c: any) => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {item.children.map((child: any) => (
                            <SortableItem
                                key={child.id}
                                item={child}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddSub={onAddSub}
                                depth={depth + 1}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    )
}


export function SortableCategoryTree({ items, onReorder, onEdit, onDelete, onAddSub }: SortableCategoryTreeProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

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
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {items.map(item => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
