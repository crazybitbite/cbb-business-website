"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, X, Loader2, Package, CreditCard, User as UserIcon, StickyNote, Plus, Pencil, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/currency"
import { VerifyOrderActions } from "@/components/admin/VerifyOrderActions"

interface OrderNote {
    id: number
    content: string
    visible: boolean
    createdAt: number
}

interface OrderDetail {
    id: number
    status: string
    total: number
    currency: string
    paymentMethod: string
    transactionId: string | null
    stripeSessionId: string | null
    verificationNote: string | null
    createdAt: number
    user: { id: number; name: string | null; email: string }
    items: { id: number; quantity: number; price: number; name: string; slug: string | null }[]
    notes: OrderNote[]
}

const STATUS_STYLES: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-400",
    PENDING: "bg-yellow-500/10 text-yellow-400",
    VERIFYING: "bg-blue-500/10 text-blue-400",
}

/** Eye button that opens the order's full details in a modal. */
export function OrderDetailModal({ orderId }: { orderId: number }) {
    const [isOpen, setIsOpen] = useState(false)
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [newNote, setNewNote] = useState("")
    const [isAddingNote, setIsAddingNote] = useState(false)
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState("")

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`)
            if (res.ok) setOrder(await res.json())
        } catch { }
    }

    const open = async () => {
        setIsOpen(true)
        setIsLoading(true)
        await fetchOrder()
        setIsLoading(false)
    }

    const addNote = async () => {
        if (!newNote.trim()) return
        setIsAddingNote(true)
        try {
            const res = await fetch(`/api/orders/${orderId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote }),
            })
            if (res.ok) {
                setNewNote("")
                await fetchOrder()
            } else {
                alert((await res.json()).error || "Failed to add note")
            }
        } finally {
            setIsAddingNote(false)
        }
    }

    const updateNote = async (noteId: number, data: { content?: string; visible?: boolean }) => {
        const res = await fetch(`/api/orders/${orderId}/notes/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            setEditingNoteId(null)
            await fetchOrder()
        } else {
            alert((await res.json()).error || "Failed to update note")
        }
    }

    const deleteNote = async (noteId: number) => {
        if (!confirm("Delete this note?")) return
        const res = await fetch(`/api/orders/${orderId}/notes/${noteId}`, { method: "DELETE" })
        if (res.ok) await fetchOrder()
        else alert("Failed to delete note")
    }

    const formatWhen = (epoch: number) => new Date(epoch * 1000).toLocaleString()

    return (
        <>
            <button
                onClick={open}
                title="View order details"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                <Eye className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-gray-400"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            </div>
                        ) : !order ? (
                            <p className="py-16 text-center text-gray-400">Failed to load order details.</p>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-400">{formatWhen(order.createdAt)}</p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || "bg-red-500/10 text-red-400"}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Customer */}
                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2 text-orange-500" /> Customer
                                    </h4>
                                    <p className="text-white text-sm font-medium">{order.user.name || "Guest"}</p>
                                    <p className="text-xs text-gray-400 break-all">{order.user.email} · User ID {order.user.id}</p>
                                </div>

                                {/* Items */}
                                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                    <h4 className="text-sm font-semibold text-white p-4 pb-2 flex items-center">
                                        <Package className="h-4 w-4 mr-2 text-orange-500" /> Items
                                    </h4>
                                    <div className="divide-y divide-white/10">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                                    {item.slug && (
                                                        <Link href={`/${item.slug}`} target="_blank" className="text-xs text-orange-400 hover:text-orange-300">
                                                            /{item.slug}
                                                        </Link>
                                                    )}
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-medium text-white">{formatPrice(item.price, order.currency)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 bg-black/20 flex justify-between text-white font-bold">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total, order.currency)}</span>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-white flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2 text-orange-500" /> Payment
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Method: <span className="text-white">{order.paymentMethod === "qr" ? "QR Code" : "Stripe (Card)"}</span>
                                    </p>
                                    {order.paymentMethod === "qr" ? (
                                        <p className="text-sm text-gray-400">
                                            Transaction ID (UTR): <span className="text-white font-mono">{order.transactionId || "Not submitted yet"}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 break-all">
                                            Stripe Session: <span className="text-white font-mono text-xs">{order.stripeSessionId || "N/A"}</span>
                                        </p>
                                    )}

                                    {order.status === "VERIFYING" && order.paymentMethod === "qr" && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs text-gray-500 mb-2">Match the UTR with your bank records, then:</p>
                                            <VerifyOrderActions orderId={order.id} transactionId={order.transactionId} />
                                        </div>
                                    )}
                                </div>

                                {/* Notes to purchaser */}
                                <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-white flex items-center">
                                        <StickyNote className="h-4 w-4 mr-2 text-orange-500" /> Notes to Purchaser
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Checked notes are shown to the purchaser with their date &amp; time.
                                        If none are checked, only the latest note is shown.
                                    </p>

                                    {order.notes.length === 0 && (
                                        <p className="text-sm text-gray-500">No notes yet.</p>
                                    )}

                                    {order.notes.map((note) => (
                                        <div key={note.id} className="rounded-lg bg-black/20 border border-white/10 p-3 space-y-2">
                                            {editingNoteId === note.id ? (
                                                <>
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        rows={3}
                                                        maxLength={2000}
                                                        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingNoteId(null)} className="px-3 py-1 text-xs text-gray-400 hover:text-white">Cancel</button>
                                                        <button
                                                            onClick={() => updateNote(note.id, { content: editContent })}
                                                            className="rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-1 text-xs font-bold text-white"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-white whitespace-pre-line">{note.content}</p>
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="text-xs text-gray-500">{formatWhen(note.createdAt)}</span>
                                                        <div className="flex items-center gap-3">
                                                            <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={note.visible}
                                                                    onChange={(e) => updateNote(note.id, { visible: e.target.checked })}
                                                                    className="h-3.5 w-3.5 rounded accent-orange-600"
                                                                />
                                                                Show to purchaser
                                                            </label>
                                                            <button
                                                                onClick={() => { setEditingNoteId(note.id); setEditContent(note.content) }}
                                                                className="p-1 text-gray-400 hover:text-white"
                                                                title="Edit note"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteNote(note.id)}
                                                                className="p-1 text-red-400 hover:text-red-300"
                                                                title="Delete note"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex gap-2 pt-1">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            rows={2}
                                            maxLength={2000}
                                            placeholder="Add a new note for the purchaser..."
                                            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={addNote}
                                            disabled={isAddingNote || !newNote.trim()}
                                            className="self-end flex items-center gap-1 rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50"
                                        >
                                            {isAddingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
