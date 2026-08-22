"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { useCartStore } from "@/lib/store"

/**
 * Shown on the order page after Stripe redirects back with a successful payment.
 * Clears the cart, since its items have now been purchased.
 */
export function OrderSuccessBanner() {
    const clearCart = useCartStore((state) => state.clearCart)

    useEffect(() => {
        clearCart()
    }, [clearCart])

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
