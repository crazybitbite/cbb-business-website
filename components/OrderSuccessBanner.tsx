"use client"

import { useEffect } from "react"
import { CheckCircle, Clock } from "lucide-react"
import { useCartStore } from "@/lib/store"

/**
 * Shown on the order page after checkout. Clears the cart (its items are now
 * ordered). "paid" = payment confirmed; "verifying" = QR transaction id
 * submitted, awaiting manual verification.
 */
export function OrderSuccessBanner({ variant = "paid" }: { variant?: "paid" | "verifying" }) {
    const clearCart = useCartStore((state) => state.clearCart)

    useEffect(() => {
        clearCart()
    }, [clearCart])

    if (variant === "verifying") {
        return (
            <div className="mb-8 flex items-center space-x-3 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-blue-400">
                <Clock className="h-6 w-6 flex-shrink-0" />
                <div>
                    <p className="font-medium">Transaction ID received — payment under verification</p>
                    <p className="text-sm text-blue-400/80">We&apos;re matching it with our bank records. Your order will be confirmed shortly, usually within a few hours.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-8 flex items-center space-x-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-400">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <div>
                <p className="font-medium">Payment successful!</p>
                <p className="text-sm text-green-400/80">Thank you for your purchase.</p>
            </div>
        </div>
    )
}
