"use client"

import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, List, Code } from "lucide-react"
import type { SideBlock, SideContent } from "@/lib/sideContent"

interface SideContentEditorProps {
    value: SideContent
    onChange: (value: SideContent) => void
}

const inputClass = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"

function newBlock(type: SideBlock["type"]): SideBlock {
    if (type === "ad") return { type: "ad", image: "", link: "" }
    if (type === "menu") return { type: "menu", title: "", items: [{ label: "", url: "" }] }
    return { type: "html", html: "" }
}

export function SideContentEditor({ value, onChange }: SideContentEditorProps) {
    const updateSide = (side: "left" | "right", blocks: SideBlock[]) => {
        onChange({ ...value, [side]: blocks })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(["left", "right"] as const).map((side) => (
                <SideColumn
                    key={side}
                    label={side === "left" ? "Left Side" : "Right Side"}
                    blocks={value[side]}
                    onChange={(blocks) => updateSide(side, blocks)}
                />
            ))}
        </div>
    )
}

function SideColumn({ label, blocks, onChange }: { label: string; blocks: SideBlock[]; onChange: (b: SideBlock[]) => void }) {
    const updateBlock = (idx: number, block: SideBlock) => {
        onChange(blocks.map((b, i) => (i === idx ? block : b)))
    }

    const removeBlock = (idx: number) => onChange(blocks.filter((_, i) => i !== idx))

    const moveBlock = (idx: number, dir: -1 | 1) => {
        const target = idx + dir
        if (target < 0 || target >= blocks.length) return
        const next = [...blocks]
            ;[next[idx], next[target]] = [next[target], next[idx]]
        onChange(next)
    }

    return (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">{label}</h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => onChange([...blocks, newBlock("ad")])} title="Add ad / banner"
                        className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs text-white transition-colors">
                        <Plus className="h-3 w-3" /><ImageIcon className="h-3 w-3" /> Ad
                    </button>
                    <button type="button" onClick={() => onChange([...blocks, newBlock("menu")])} title="Add menu"
                        className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs text-white transition-colors">
                        <Plus className="h-3 w-3" /><List className="h-3 w-3" /> Menu
                    </button>
                    <button type="button" onClick={() => onChange([...blocks, newBlock("html")])} title="Add custom HTML"
                        className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs text-white transition-colors">
                        <Plus className="h-3 w-3" /><Code className="h-3 w-3" /> HTML
                    </button>
                </div>
            </div>

            {blocks.length === 0 && (
                <p className="text-xs text-gray-500">No blocks. This side will not be shown.</p>
            )}

            {blocks.map((block, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-orange-400">
                            {block.type === "ad" ? "Ad / Banner" : block.type === "menu" ? "Menu" : "Custom HTML"}
                        </span>
                        <div className="flex gap-1">
                            <button type="button" onClick={() => moveBlock(idx, -1)} className="p-1 text-gray-400 hover:text-white disabled:opacity-30" disabled={idx === 0}>
                                <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => moveBlock(idx, 1)} className="p-1 text-gray-400 hover:text-white disabled:opacity-30" disabled={idx === blocks.length - 1}>
                                <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-300">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {block.type === "ad" && (
                        <div className="space-y-2">
                            {block.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={block.image} alt="Ad preview" className="w-full max-h-32 object-contain rounded bg-black/30" />
                            ) : null}
                            <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2 text-xs text-gray-400 cursor-pointer hover:bg-white/5">
                                <ImageIcon className="h-4 w-4" /> {block.image ? "Replace image" : "Upload image"}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const reader = new FileReader()
                                    reader.onload = (ev) => updateBlock(idx, { ...block, image: ev.target?.result as string })
                                    reader.readAsDataURL(file)
                                }} />
                            </label>
                            <input type="text" placeholder="Or paste image URL" value={block.image.startsWith("data:") ? "" : block.image}
                                onChange={(e) => updateBlock(idx, { ...block, image: e.target.value })} className={inputClass} />
                            <input type="text" placeholder="Click-through link (optional)" value={block.link || ""}
                                onChange={(e) => updateBlock(idx, { ...block, link: e.target.value })} className={inputClass} />
                        </div>
                    )}

                    {block.type === "menu" && (
                        <div className="space-y-2">
                            <input type="text" placeholder="Menu title (optional)" value={block.title || ""}
                                onChange={(e) => updateBlock(idx, { ...block, title: e.target.value })} className={inputClass} />
                            {block.items.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input type="text" placeholder="Label" value={item.label}
                                        onChange={(e) => updateBlock(idx, { ...block, items: block.items.map((it, j) => j === i ? { ...it, label: e.target.value } : it) })}
                                        className={inputClass} />
                                    <input type="text" placeholder="URL" value={item.url}
                                        onChange={(e) => updateBlock(idx, { ...block, items: block.items.map((it, j) => j === i ? { ...it, url: e.target.value } : it) })}
                                        className={inputClass} />
                                    <button type="button" onClick={() => updateBlock(idx, { ...block, items: block.items.filter((_, j) => j !== i) })}
                                        className="p-1 text-red-400 hover:text-red-300 flex-shrink-0">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => updateBlock(idx, { ...block, items: [...block.items, { label: "", url: "" }] })}
                                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Add menu item
                            </button>
                        </div>
                    )}

                    {block.type === "html" && (
                        <textarea rows={4} placeholder="<div>Custom HTML…</div>" value={block.html}
                            onChange={(e) => updateBlock(idx, { ...block, html: e.target.value })}
                            className={`${inputClass} font-mono`} />
                    )}
                </div>
            ))}
        </div>
    )
}
