"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, ShoppingBag, ArrowRight, Loader2, CreditCard, QrCode, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { convertPrice, formatPrice } from "@/lib/currency"
import { openRazorpay } from "@/lib/razorpayClient"

interface CheckoutNote {
    pageId: number
    name: string
    note: string
}

interface LivePricing {
    pageId: number
    original: number
    final: number
    percentOff: number
    currency: string
}

type CartMethod = "stripe" | "razorpay" | "qr"

interface CheckoutInfo {
    methods: CartMethod[]
    conflict: boolean
    notes: CheckoutNote[]
    pricing: LivePricing[]
    qrCode: string | null
    contactEmail: string | null
}

interface QrPayment {
    total: number
    currency: string
    qrCode: string
}

export default function CartPage() {
    const { items, removeItem, clearCart } = useCartStore()
    const { settings, displayCurrency, displayPrice } = useSiteSettings()
    const { data: session } = useSession()
    const router = useRouter()
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [info, setInfo] = useState<CheckoutInfo | null>(null)
    const [method, setMethod] = useState<CartMethod>("stripe")
    const [acceptedNotes, setAcceptedNotes] = useState<Record<number, boolean>>({})
    const [qrPayment, setQrPayment] = useState<QrPayment | null>(null)
    const [transactionId, setTransactionId] = useState("")
    const [qrError, setQrError] = useState("")
    const [isConfirming, setIsConfirming] = useState(false)

    // Load payment methods / terms whenever the cart contents change
    useEffect(() => {
        if (!items.length) {
            setInfo(null)
            return
        }
        fetch("/api/checkout/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: items.map((i) => ({ id: i.id })) }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) {
                    setInfo(data)
                    if (data.methods?.length) setMethod(data.methods[0])
                }
            })
            .catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(items.map((i) => i.id))])

    // Live server pricing wins over what was stored when the item was added
    // to the cart, so admin price/discount changes reflect immediately.
    const liveFor = (item: { id: number | string; price: number; currency?: string }) => {
        const live = info?.pricing?.find((p) => p.pageId === Number(item.id))
        return {
            original: live?.original ?? item.price,
            final: live?.final ?? item.price,
            percentOff: live?.percentOff ?? 0,
            currency: live?.currency ?? item.currency ?? "USD",
        }
    }

    const toDisplay = (amount: number, from: string) => {
        const converted = convertPrice(amount, from, displayCurrency, settings.currencyRates)
        return converted ?? amount
    }

    const total = items.reduce((sum, item) => {
        const live = liveFor(item)
        return sum + toDisplay(live.final, live.currency) * item.quantity
    }, 0)

    const totalDiscount = items.reduce((sum, item) => {
        const live = liveFor(item)
        if (live.final >= live.original) return sum
        return sum + (toDisplay(live.original, live.currency) - toDisplay(live.final, live.currency)) * item.quantity
    }, 0)

    const allNotesAccepted = !info?.notes.length || info.notes.every((n) => acceptedNotes[n.pageId])
    const checkoutBlocked = !!info?.conflict || !allNotesAccepted

    const handleCheckout = async () => {
        if (!session) {
            router.push("/login?callbackUrl=/cart")
            return
        }
        if (checkoutBlocked) return

        setIsCheckingOut(true)
        try {
            if (method === "qr") {
                // No order is created yet — it's written to the database only
                // when the buyer submits a valid transaction id.
                if (!info?.qrCode) {
                    alert("QR payment is not available right now.")
                } else {
                    setQrError("")
                    setTransactionId("")
                    setQrPayment({ total, currency: displayCurrency, qrCode: info.qrCode })
                }
            } else {
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
                        currency: displayCurrency,
                        acceptedTerms: true,
                    }),
                })
                const data = await res.json()
                if (res.ok && data.url) {
                    // Stripe: hosted checkout. Cart is cleared on the order success
                    // page, so it survives a cancelled payment.
                    window.location.href = data.url
                } else if (res.ok && data.razorpay) {
                    // Razorpay: open the checkout widget, then verify server-side.
                    const rp = data.razorpay
                    try {
                        const result = await openRazorpay({
                            keyId: rp.keyId,
                            amount: rp.amount,
                            currency: rp.currency,
                            orderId: rp.orderId,
                            name: rp.name,
                            description: rp.description,
                            prefill: rp.prefill,
                        })
                        const verify = await fetch("/api/checkout/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...result, localOrderId: rp.localOrderId }),
                        })
                        const vData = await verify.json()
                        if (verify.ok && vData.ok) {
                            router.push(`/orders/${vData.orderId}?success=1`)
                        } else {
                            alert(vData.error || "Payment could not be verified. Please contact support.")
                        }
                    } catch (e: any) {
                        // User dismissed or payment failed — nothing to confirm.
                        if (e?.message && e.message !== "Payment cancelled.") alert(e.message)
                    }
                } else {
                    alert(data.error || "Checkout failed. Please try again.")
                }
            }
        } catch (error) {
            console.error("Checkout error:", error)
            alert("Checkout failed. Please check your connection.")
        } finally {
            setIsCheckingOut(false)
        }
    }

    const handleConfirmQrPayment = async () => {
        if (!qrPayment) return
        setIsConfirming(true)
        setQrError("")
        try {
            const res = await fetch("/api/checkout/qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
                    currency: displayCurrency,
                    acceptedTerms: true,
                    transactionId,
                }),
            })
            const data = await res.json()
            if (res.ok && data.ok) {
                router.push(`/orders/${data.orderId}?submitted=1`)
            } else {
                setQrError(data.error || "Could not confirm the payment. Please try again.")
            }
        } catch {
            setQrError("Could not confirm the payment. Please check your connection.")
        } finally {
            setIsConfirming(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
                <p className="text-gray-400">Looks like you haven't added anything yet.</p>
                <Link
                    href="/digital-products"
                    className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                >
                    <span>Browse Digital Products</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center space-x-4">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                                            Img
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-white">{item.name}</h3>
                                        {(() => {
                                            const live = liveFor(item)
                                            return live.final < live.original ? (
                                                <p className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {displayPrice(live.original, live.currency)}
                                                    </span>
                                                    <span className="animate-pulse rounded-full bg-gradient-to-r from-orange-600 to-pink-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-orange-500/30">
                                                        {live.percentOff}% OFF
                                                    </span>
                                                    <span className="font-medium text-orange-400">
                                                        {displayPrice(live.final, live.currency)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-gray-400">{displayPrice(live.final, live.currency)}</p>
                                            )
                                        })()}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <span className="text-white font-medium">x{item.quantity}</span>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-sm text-gray-400 hover:text-white transition-colors underline"
                        >
                            Clear Cart
                        </button>

                        {/* Payment method conflict */}
                        {info?.conflict && (
                            <div className="flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-400">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">
                                    These items support different payment methods and can&apos;t be paid together.
                                    Please remove one and buy them separately.
                                </p>
                            </div>
                        )}

                        {/* Checkout terms (mandatory) */}
                        {!!info?.notes.length && (
                            <div className="space-y-4">
                                {info.notes.map((n) => (
                                    <div key={n.pageId} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-white">{n.name} — please read before paying</h4>
                                        <div
                                            className="prose prose-invert prose-sm max-w-none text-gray-400"
                                            dangerouslySetInnerHTML={{ __html: n.note }}
                                        />
                                        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!acceptedNotes[n.pageId]}
                                                onChange={(e) => setAcceptedNotes((prev) => ({ ...prev, [n.pageId]: e.target.checked }))}
                                                className="h-4 w-4 rounded accent-orange-600"
                                            />
                                            I have read and accept it
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <h3 className="font-bold text-white text-lg">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatPrice(total + totalDiscount, displayCurrency)}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Discount</span>
                                        <span className="font-medium text-green-400">−{formatPrice(totalDiscount, displayCurrency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between hidden">
                                    <span className="text-gray-400">Tax</span>
                                    <span className="text-white">{formatPrice(0, displayCurrency)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                                    <span className="text-white">Total</span>
                                    <span className="text-orange-400">{formatPrice(total, displayCurrency)}</span>
                                </div>
                            </div>

                            {/* Payment method choice */}
                            {!info?.conflict && (info?.methods.length ?? 0) > 1 && (
                                <div className="space-y-2 pt-1">
                                    <p className="text-sm font-medium text-gray-300">Pay with</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setMethod((info?.methods.find((m) => m !== "qr") ?? "stripe") as CartMethod)}
                                            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${method !== "qr" ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/10 text-gray-400 hover:bg-white/5"}`}
                                        >
                                            <CreditCard className="h-4 w-4" /> Card
                                        </button>
                                        <button
                                            onClick={() => setMethod("qr")}
                                            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${method === "qr" ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/10 text-gray-400 hover:bg-white/5"}`}
                                        >
                                            <QrCode className="h-4 w-4" /> QR Code
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!info?.conflict && info?.methods.length === 1 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {info.methods[0] === "qr" ? <QrCode className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                                    Payment via {info.methods[0] === "qr" ? "QR code" : "card"}
                                </p>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut || checkoutBlocked}
                                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Please wait...</span>
                                    </>
                                ) : (
                                    <span>Checkout</span>
                                )}
                            </button>
                            {!allNotesAccepted && (
                                <p className="text-xs text-yellow-400">Please accept the terms above to continue.</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* QR payment modal */}
            {qrPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQrPayment(null)} />
                    <div className="relative w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setQrPayment(null)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-gray-400"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-bold text-white">Scan &amp; Pay</h3>
                        <p className="text-sm text-gray-400">
                            Scan the QR code and pay <span className="font-bold text-orange-400">{formatPrice(qrPayment.total, qrPayment.currency)}</span>.
                            Then enter the <strong className="text-white">12-digit transaction id (UTR)</strong> shown in your payment app.
                            Your payment is verified against our bank records before the order is confirmed.
                        </p>

                        <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrPayment.qrCode} alt="Payment QR code" className="w-56 h-56 object-contain rounded-xl bg-white p-2" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Transaction ID</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={12}
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ""))}
                                placeholder="12-digit UTR, e.g. 415023987654"
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {qrError && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                {qrError}
                            </div>
                        )}

                        <button
                            onClick={handleConfirmQrPayment}
                            disabled={isConfirming || transactionId.trim().length !== 12}
                            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>I have paid — Confirm</span>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 text-center">
                            Your order is recorded once you submit the transaction id, and confirmed after we verify the payment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
