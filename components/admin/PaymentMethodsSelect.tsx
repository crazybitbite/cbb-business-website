"use client"

import { PAYMENT_METHOD_CHOICES, ONLINE_METHODS, type PaymentMethod } from "@/lib/paymentMethods"

interface Props {
    value: PaymentMethod[]
    onChange: (v: PaymentMethod[]) => void
}

/**
 * Multi-select for payment methods (Stripe, Razorpay, QR). Stripe and Razorpay
 * are mutually exclusive — selecting one online gateway deselects the other.
 */
export function PaymentMethodsSelect({ value, onChange }: Props) {
    const toggle = (m: PaymentMethod, checked: boolean) => {
        let next = value.filter((v) => v !== m)
        if (checked) {
            // Only one online gateway at a time.
            if (ONLINE_METHODS.includes(m)) next = next.filter((v) => !ONLINE_METHODS.includes(v))
            next = [...next, m]
        }
        onChange(next)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {PAYMENT_METHOD_CHOICES.map((choice) => {
                const m = choice.value as PaymentMethod
                const active = value.includes(m)
                return (
                    <label
                        key={m}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${active ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/10 text-gray-400 hover:bg-white/5"}`}
                    >
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => toggle(m, e.target.checked)}
                            className="h-4 w-4 accent-orange-500"
                        />
                        {choice.label}
                    </label>
                )
            })}
        </div>
    )
}
