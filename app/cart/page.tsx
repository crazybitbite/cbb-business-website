"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { convertPrice, formatPrice } from "@/lib/currency"

export default function CartPage() {
    const { items, removeItem, clearCart } = useCartStore()
    const { settings, displayCurrency, displayPrice } = useSiteSettings()
    const { data: session } = useSession()
    const router = useRouter()
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    // Total in the visitor's display currency; falls back to summing raw amounts
    // when rates are unavailable (mixed currencies are then summed as-is).
    const total = items.reduce((sum, item) => {
        const converted = convertPrice(
            item.price,
            item.currency || "USD",
            displayCurrency,
            settings.currencyRates
        )
        return sum + (converted ?? item.price) * item.quantity
    }, 0)

    const handleCheckout = async () => {
        if (!session) {
            router.push("/login?callbackUrl=/cart")
            return
        }

        setIsCheckingOut(true)
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
                    currency: displayCurrency,
                }),
            })

            const data = await res.json()
            if (res.ok && data.url) {
                // Cart is cleared on the order success page, so it survives a cancelled payment
                window.location.href = data.url
            } else {
                alert(data.error || "Checkout failed. Please try again.")
            }
        } catch (error) {
            console.error("Checkout error:", error)
            alert("Checkout failed. Please check your connection.")
        } finally {
            setIsCheckingOut(false)
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
                                        <p className="text-gray-400">{displayPrice(item.price, item.currency || "USD")}</p>
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
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <h3 className="font-bold text-white text-lg">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatPrice(total, displayCurrency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tax</span>
                                    <span className="text-white">{formatPrice(0, displayCurrency)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                                    <span className="text-white">Total</span>
                                    <span className="text-orange-400">{formatPrice(total, displayCurrency)}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Redirecting...</span>
                                    </>
                                ) : (
                                    <span>Checkout</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
