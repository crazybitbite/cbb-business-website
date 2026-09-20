"use client"

// Server response describing a Razorpay order to open in the checkout widget.
export interface RazorpayInit {
    keyId: string
    amount: number // in subunits (paise for INR)
    currency: string
    orderId: string // Razorpay order id
    name?: string
    description?: string
    prefill?: { name?: string; email?: string; contact?: string }
}

export interface RazorpaySuccess {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

let scriptPromise: Promise<boolean> | null = null

function loadScript(): Promise<boolean> {
    if (typeof window === "undefined") return Promise.resolve(false)
    if ((window as any).Razorpay) return Promise.resolve(true)
    if (scriptPromise) return scriptPromise
    scriptPromise = new Promise((resolve) => {
        const s = document.createElement("script")
        s.src = "https://checkout.razorpay.com/v1/checkout.js"
        s.onload = () => resolve(true)
        s.onerror = () => resolve(false)
        document.body.appendChild(s)
    })
    return scriptPromise
}

/**
 * Open the Razorpay Checkout widget. Resolves with the success payload when the
 * payment completes, or rejects with an Error if the user dismisses it or the
 * script fails to load.
 */
export async function openRazorpay(init: RazorpayInit): Promise<RazorpaySuccess> {
    const ok = await loadScript()
    if (!ok) throw new Error("Could not load the payment widget. Please check your connection.")

    return new Promise<RazorpaySuccess>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
            key: init.keyId,
            amount: init.amount,
            currency: init.currency,
            order_id: init.orderId,
            name: init.name || "CrazyBitBite",
            description: init.description,
            prefill: init.prefill,
            theme: { color: "#864797" },
            handler: (response: RazorpaySuccess) => resolve(response),
            modal: {
                ondismiss: () => reject(new Error("Payment cancelled.")),
            },
        })
        rzp.on("payment.failed", (resp: any) => {
            reject(new Error(resp?.error?.description || "Payment failed. Please try again."))
        })
        rzp.open()
    })
}
