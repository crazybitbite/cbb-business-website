"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"

/**
 * Approve/Reject controls for QR orders in VERIFYING state. Approve only
 * after matching the shown transaction id (UTR) with the bank statement.
 * Each action opens a popup with an optional comment shown to the purchaser
 * on their order page.
 */
export function VerifyOrderActions({ orderId, transactionId }: { orderId: number; transactionId: string | null }) {
    const router = useRouter()
    const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null)
    const [comment, setComment] = useState("")
    const [isBusy, setIsBusy] = useState(false)

    const submit = async () => {
        if (!pendingAction) return
        setIsBusy(true)
        try {
            const res = await fetch(`/api/orders/${orderId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: pendingAction, comment }),
            })
            if (res.ok) {
                setPendingAction(null)
                setComment("")
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || "Action failed")
            }
        } catch {
            alert("Action failed")
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <>
            <div className="space-y-1">
                <p className="text-xs text-gray-500 font-mono">UTR: {transactionId || "—"}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setComment(""); setPendingAction("approve") }}
                        className="flex items-center gap-1 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 px-2.5 py-1 text-xs font-medium hover:bg-green-600/30 transition-colors"
                    >
                        <Check className="h-3 w-3" /> Approve
                    </button>
                    <button
                        onClick={() => { setComment(""); setPendingAction("reject") }}
                        className="flex items-center gap-1 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 px-2.5 py-1 text-xs font-medium hover:bg-red-600/30 transition-colors"
                    >
                        <X className="h-3 w-3" /> Reject
                    </button>
                </div>
            </div>

            {pendingAction && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isBusy && setPendingAction(null)} />
                    <div className="relative w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            {pendingAction === "approve" ? "Approve payment" : "Reject payment"} — Order #{orderId}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {pendingAction === "approve"
                                ? "The order will be marked paid and the buyer's access unlocked."
                                : "The buyer will see the order as rejected."}
                            {" "}UTR: <span className="font-mono text-white">{transactionId || "—"}</span>
                        </p>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Comment for the purchaser <span className="text-gray-500 text-xs">(optional)</span></label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder={pendingAction === "approve"
                                    ? "e.g. Payment received, thank you!"
                                    : "e.g. This UTR doesn't match any payment we received — please email your payment screenshot."}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500">Shown to the buyer on their order page.</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPendingAction(null)}
                                disabled={isBusy}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submit}
                                disabled={isBusy}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50 ${pendingAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                            >
                                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                                {pendingAction === "approve" ? "Approve Order" : "Reject Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
