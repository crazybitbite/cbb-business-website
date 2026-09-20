"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { X, Loader2, CalendarClock, Check, ArrowRight, CreditCard, QrCode } from "lucide-react"
import { useSession } from "next-auth/react"
import { BOOKING_DURATIONS, BOOKING_PRICES, BOOKING_CURRENCY } from "@/lib/booking"
import { openRazorpay } from "@/lib/razorpayClient"

interface Slot {
    time: string
    available: boolean
}

// Brand palette (org guidance: navy surface, purple accent, white text + a touch of parrot blue)
const PURPLE = "#864797"
const PARROT = "#0CC0DF"

function todayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// "09:00" + 30 → "09:30"
function addMinutes(hhmm: string, minutes: number): string {
    const [h, m] = hhmm.split(":").map(Number)
    const total = h * 60 + m + minutes
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/**
 * Global consultation-booking modal. Mounted once in the layout; it opens when
 * the visitor clicks any element marked for booking — the CMS-embedded
 * "Book a Consultation" button uses href="#book-consultation", so a plain
 * document-level click listener drives it (the button lives inside
 * dangerouslySetInnerHTML and can't carry a React handler).
 */
export function BookConsultationModal() {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [durationMin, setDurationMin] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [slots, setSlots] = useState<Slot[]>([])
    const [slotsTz, setSlotsTz] = useState<string>("")
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Payment: which methods are enabled + the QR image + chosen method.
    const [methods, setMethods] = useState<string[]>(["stripe"])
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [payMethod, setPayMethod] = useState<"online" | "qr">("online")
    const [transactionId, setTransactionId] = useState("")
    const [verifyingDone, setVerifyingDone] = useState(false)

    const hasOnline = methods.some((m) => m === "stripe" || m === "razorpay")
    const hasQr = methods.includes("qr")

    const loggedIn = Boolean(session?.user)

    // Prefill from the session when signed in.
    useEffect(() => {
        if (session?.user) {
            const full = (session.user.name || "").trim()
            const parts = full.split(/\s+/)
            setFirstName((prev) => prev || parts[0] || "")
            setLastName((prev) => prev || parts.slice(1).join(" ") || "")
            setEmail((prev) => prev || session.user?.email || "")
        }
    }, [session])

    // Open on booking triggers anywhere in the document.
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const el = (e.target as HTMLElement)?.closest(
                'a[href="#book-consultation"], a[href$="#book-consultation"], [data-action="book-consultation"]'
            )
            if (el) {
                e.preventDefault()
                setError(null)
                setOpen(true)
            }
        }
        document.addEventListener("click", handler)
        return () => document.removeEventListener("click", handler)
    }, [])

    // Close on Escape.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    // Auto-open when the page is visited with ?booking=true.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("booking") === "true") setOpen(true)
    }, [])

    // Load enabled payment methods (and QR image) when the modal opens.
    useEffect(() => {
        if (!open) return
        setVerifyingDone(false)
        fetch("/api/booking/config")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) return
                const m: string[] = data.methods?.length ? data.methods : ["stripe"]
                setMethods(m)
                setQrCode(data.qrCode || null)
                const online = m.some((x) => x === "stripe" || x === "razorpay")
                setPayMethod(online ? "online" : "qr")
            })
            .catch(() => { })
    }, [open])

    // Load available slots whenever the date or duration changes while open.
    useEffect(() => {
        if (!open || !date || !durationMin) {
            setSlots([])
            return
        }
        let cancelled = false
        setLoadingSlots(true)
        fetch(`/api/booking/availability?date=${date}&duration=${durationMin}`)
            .then((r) => (r.ok ? r.json() : { slots: [] }))
            .then((data) => {
                if (cancelled) return
                const next: Slot[] = data.slots || []
                setSlots(next)
                setSlotsTz(data.timeZone || "")
                // Drop a previously chosen time if it's no longer selectable.
                setTime((prev) => (next.some((s) => s.time === prev && s.available) ? prev : ""))
            })
            .catch(() => !cancelled && setSlots([]))
            .finally(() => !cancelled && setLoadingSlots(false))
        return () => {
            cancelled = true
        }
    }, [open, date, durationMin, refreshKey])

    const price = durationMin ? BOOKING_PRICES[durationMin] : null

    const canSubmit = useMemo(() => {
        const named = loggedIn ? true : firstName.trim() && lastName.trim() && email.trim()
        const base = Boolean(named && phone.trim() && date && durationMin && time && !submitting)
        if (payMethod === "qr") return base && transactionId.trim().length === 12
        return base
    }, [loggedIn, firstName, lastName, email, phone, date, durationMin, time, submitting, payMethod, transactionId])

    const handleQrSubmit = useCallback(async () => {
        setError(null)
        setSubmitting(true)
        try {
            const res = await fetch("/api/booking/qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, phone, date, time, durationMin, transactionId }),
            })
            const data = await res.json()
            if (!res.ok || !data.ok) {
                setError(data.error || "Could not submit your booking. Please try again.")
                setSubmitting(false)
                if (res.status === 409) {
                    setTime("")
                    setRefreshKey((k) => k + 1)
                }
                return
            }
            setVerifyingDone(true)
            setSubmitting(false)
        } catch {
            setError("Something went wrong. Please try again.")
            setSubmitting(false)
        }
    }, [firstName, lastName, email, phone, date, time, durationMin, transactionId])

    const handleSubmit = useCallback(async () => {
        if (payMethod === "qr") return handleQrSubmit()
        setError(null)
        setSubmitting(true)
        try {
            const res = await fetch("/api/booking/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, phone, date, time, durationMin }),
            })
            const data = await res.json()
            if (!res.ok || (!data.url && !data.razorpay)) {
                setError(data.error || "Could not start booking. Please try again.")
                setSubmitting(false)
                // Slot was taken meanwhile — refresh the grid so it shows as booked.
                if (res.status === 409) {
                    setTime("")
                    setRefreshKey((k) => k + 1)
                }
                return
            }

            if (data.url) {
                window.location.href = data.url // → Stripe hosted checkout
                return
            }

            // → Razorpay widget
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
                const verify = await fetch("/api/booking/razorpay/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...result, bookingId: rp.bookingId, localOrderId: rp.localOrderId }),
                })
                const vData = await verify.json()
                if (verify.ok && vData.ok) {
                    window.location.href = `/booking/${vData.bookingId}?success=1`
                } else {
                    setError(vData.error || "Payment could not be verified. Please contact support.")
                    setSubmitting(false)
                }
            } catch (e: any) {
                setError(e?.message === "Payment cancelled." ? null : e?.message || "Payment failed.")
                setSubmitting(false)
            }
        } catch {
            setError("Something went wrong. Please try again.")
            setSubmitting(false)
        }
    }, [payMethod, handleQrSubmit, firstName, lastName, email, phone, date, time, durationMin])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <div
                className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl"
                style={{ background: "#2f3342" }}
            >
                {/* Header */}
                <div
                    className="relative px-7 pt-7 pb-6 rounded-t-3xl"
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, rgba(134,71,151,0.25))` }}
                >
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:bg-white/15"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center">
                            <CalendarClock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Book a Consultation</h3>
                            <p className="text-sm text-white/80">Pick a slot and pay securely to confirm.</p>
                        </div>
                    </div>
                </div>

                {verifyingDone && (
                    <div className="p-8 text-center space-y-4">
                        <div className="mx-auto h-14 w-14 rounded-full bg-green-500/15 flex items-center justify-center">
                            <Check className="h-7 w-7 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Booking received</h3>
                        <p className="text-sm text-gray-300">
                            Thanks! We&apos;ve recorded your booking and transaction id. Your slot is held while we
                            verify the payment — you&apos;ll get a confirmation email with the meeting link once it&apos;s
                            approved.
                        </p>
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-full px-6 py-2.5 font-semibold text-white"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, #6d3a7d)` }}
                        >
                            Done
                        </button>
                    </div>
                )}

                <div className={`p-7 space-y-6 ${verifyingDone ? "hidden" : ""}`}>
                    {/* Duration selector */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                            Session Duration
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {BOOKING_DURATIONS.map((d) => {
                                const active = d === durationMin
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDurationMin(d)}
                                        className="rounded-xl border px-2 py-3 text-center transition-all"
                                        style={{
                                            borderColor: active ? PURPLE : "rgba(255,255,255,0.12)",
                                            background: active ? "rgba(134,71,151,0.25)" : "rgba(255,255,255,0.04)",
                                        }}
                                    >
                                        <span className="block text-base font-bold text-white">{d}</span>
                                        <span className="block text-[11px] text-gray-400">min</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Price */}
                    {durationMin && (
                        <div
                            className="flex items-center justify-between rounded-2xl border px-5 py-4"
                            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(12,192,223,0.08)" }}
                        >
                            <span className="text-sm text-gray-300">Total for {durationMin} minutes</span>
                            <span className="text-2xl font-extrabold" style={{ color: PARROT }}>
                                ₹{price} <span className="text-sm font-medium text-gray-400">{BOOKING_CURRENCY}</span>
                            </span>
                        </div>
                    )}

                    {/* Personal details */}
                    {loggedIn ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2 text-sm text-gray-300">
                            <Check className="h-4 w-4 text-green-400 shrink-0" />
                            <span>
                                Booking as <span className="text-white font-medium">{session?.user?.name || email}</span>
                                {session?.user?.email ? ` · ${session.user.email}` : ""}
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Jane" />
                            <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Doe" />
                            <div className="col-span-2">
                                <Field
                                    label="Email"
                                    value={email}
                                    onChange={setEmail}
                                    type="email"
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Field label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="+91 98765 43210" />
                        </div>
                        <div className="col-span-2">
                            <Field label="Date" value={date} onChange={setDate} type="date" min={todayStr()} />
                        </div>
                    </div>

                    {/* Available time slots — only once a date and duration are chosen */}
                    {date && durationMin && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Available Time
                            </label>
                            {slotsTz && (
                                <span className="text-[11px] text-gray-500">Times in {slotsTz}</span>
                            )}
                        </div>

                        {loadingSlots ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading available times…
                            </div>
                        ) : slots.length === 0 ? (
                            <p className="text-sm text-gray-500 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                                No slots for this date. Try another day.
                            </p>
                        ) : slots.every((s) => !s.available) ? (
                            <p className="text-sm text-gray-400 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                                Fully booked on this date — please choose another day.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {slots.map((s) => {
                                    const selected = s.time === time
                                    const label = `${s.time}–${addMinutes(s.time, durationMin)}`
                                    return (
                                        <button
                                            key={s.time}
                                            type="button"
                                            disabled={!s.available}
                                            onClick={() => setTime(s.time)}
                                            title={s.available ? undefined : "Already booked"}
                                            className="rounded-lg border px-1 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: selected ? PURPLE : "rgba(255,255,255,0.12)",
                                                background: selected
                                                    ? "rgba(134,71,151,0.30)"
                                                    : s.available
                                                        ? "rgba(255,255,255,0.04)"
                                                        : "rgba(255,255,255,0.02)",
                                                color: s.available ? "#fff" : "#6b7280",
                                                textDecoration: s.available ? "none" : "line-through",
                                            }}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Payment method chooser (only when both online + QR are enabled) */}
                    {hasOnline && hasQr && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Pay with
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setPayMethod("online"); setError(null) }}
                                    className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all"
                                    style={{
                                        borderColor: payMethod === "online" ? PURPLE : "rgba(255,255,255,0.12)",
                                        background: payMethod === "online" ? "rgba(134,71,151,0.25)" : "rgba(255,255,255,0.04)",
                                        color: "#fff",
                                    }}
                                >
                                    <CreditCard className="h-4 w-4" /> Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPayMethod("qr"); setError(null) }}
                                    className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all"
                                    style={{
                                        borderColor: payMethod === "qr" ? PURPLE : "rgba(255,255,255,0.12)",
                                        background: payMethod === "qr" ? "rgba(134,71,151,0.25)" : "rgba(255,255,255,0.04)",
                                        color: "#fff",
                                    }}
                                >
                                    <QrCode className="h-4 w-4" /> QR Code
                                </button>
                            </div>
                        </div>
                    )}

                    {/* QR: scan + enter transaction id */}
                    {payMethod === "qr" && hasQr && (
                        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-gray-300">
                                Scan and pay{price ? <span className="font-bold" style={{ color: PARROT }}> ₹{price}</span> : ""},
                                then enter the <strong className="text-white">12-digit transaction id (UTR)</strong> from your
                                payment app. Your slot is held while we verify the payment.
                            </p>
                            {qrCode && (
                                <div className="flex justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrCode} alt="Payment QR code" className="w-48 h-48 object-contain rounded-xl bg-white p-2" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={12}
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ""))}
                                    placeholder="12-digit UTR, e.g. 415023987654"
                                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#864797] focus:ring-1 focus:ring-[#864797] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* No-cancellation / no-refund notice */}
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
                        <p className="text-xs text-red-300 leading-relaxed">
                            <strong>Please note:</strong> once booked, this consultation cannot be cancelled and no
                            refund can be requested. You may request a reschedule via the{" "}
                            <a href="/contact" className="underline font-medium hover:text-red-200">
                                Contact Us
                            </a>{" "}
                            form.
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="w-full rounded-full py-3.5 font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                        style={{ background: `linear-gradient(135deg, ${PURPLE}, #6d3a7d)` }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> {payMethod === "qr" ? "Submitting…" : "Redirecting to payment…"}
                            </>
                        ) : payMethod === "qr" ? (
                            <>I have paid — Submit <ArrowRight className="h-5 w-5" /></>
                        ) : (
                            <>
                                Confirm &amp; Pay{price ? ` ₹${price}` : ""} <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500">
                        {payMethod === "qr"
                            ? "Your booking is confirmed after we verify the payment; the meeting invite follows by email."
                            : "Secured payment · You'll receive a Google Calendar invite after payment."}
                    </p>
                </div>
            </div>
        </div>
    )
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    min,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    type?: string
    placeholder?: string
    min?: string
}) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{label}</span>
            <input
                type={type}
                value={value}
                min={min}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#864797] focus:ring-1 focus:ring-[#864797] transition-colors [color-scheme:dark]"
            />
        </label>
    )
}
