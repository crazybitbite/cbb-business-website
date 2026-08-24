"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Upload, X } from "lucide-react"
import { CURRENCIES } from "@/lib/currency"
import { SideContentEditor } from "@/components/admin/SideContentEditor"
import { EMPTY_SIDE_CONTENT, normalizeSideContent, type SideContent } from "@/lib/sideContent"

const EMPTY_SETTINGS = {
    siteName: "",
    contactEmail: "",
    supportPhone: "",
    address: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    defaultCurrency: "USD",
    logo: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    defaultPaymentMethod: "stripe",
    paymentQrCode: "",
}

type SettingsForm = typeof EMPTY_SETTINGS

export default function AdminSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS)
    const [sideContent, setSideContent] = useState<SideContent>(EMPTY_SIDE_CONTENT)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                // Only pick keys this form manages — the settings store also holds
                // machine-managed entries (e.g. currencyRates) we must not resave.
                setSettings(prev => {
                    const next = { ...prev }
                    for (const key of Object.keys(EMPTY_SETTINGS) as (keyof SettingsForm)[]) {
                        if (typeof data[key] === "string") next[key] = data[key]
                    }
                    return next
                })
                setSideContent(normalizeSideContent(data.sideContent))
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            setSettings(prev => ({ ...prev, logo: base64 }))
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...settings, sideContent }),
            })

            if (!res.ok) throw new Error("Failed to save settings")

            alert("Settings saved successfully")
        } catch (error) {
            console.error(error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const inputClass = "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Settings */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">General Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Contact Email</label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Support Phone</label>
                            <input
                                type="text"
                                value={settings.supportPhone}
                                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Address</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Branding</h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Website Logo</label>
                        <p className="text-xs text-gray-500">Shown in the navbar and footer. If no logo is uploaded, the site name text is displayed instead.</p>
                        {settings.logo ? (
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-white/10 p-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={settings.logo} alt="Logo preview" className="h-12 w-auto max-w-[200px] object-contain" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, logo: "" })}
                                    className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                                >
                                    <X className="h-4 w-4" /> Remove logo
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">Click to upload logo</p>
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                {/* Localization */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Localization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Default Currency</label>
                            <p className="text-xs text-gray-500">Prices are shown in the visitor&apos;s local currency when detected; this currency is the fallback.</p>
                            <select
                                value={settings.defaultCurrency}
                                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                                className={`${inputClass} [&>option]:bg-gray-900`}
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} — {c.name} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Payments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Default Payment Method</label>
                            <p className="text-xs text-gray-500">Used at checkout for pages that don&apos;t choose their own payment method.</p>
                            <select
                                value={settings.defaultPaymentMethod}
                                onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value })}
                                className={`${inputClass} [&>option]:bg-gray-900`}
                            >
                                <option value="stripe">Stripe (Card)</option>
                                <option value="qr">QR Code</option>
                                <option value="both">Both (QR + Stripe)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Payment QR Code</label>
                            <p className="text-xs text-gray-500">Shown to customers who choose QR payment. Upload your UPI / bank QR image.</p>
                            {settings.paymentQrCode ? (
                                <div className="flex items-center gap-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={settings.paymentQrCode} alt="Payment QR preview" className="h-24 w-24 object-contain rounded-lg bg-white p-1" />
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, paymentQrCode: "" })}
                                        className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                                    >
                                        <X className="h-4 w-4" /> Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                    <Upload className="h-5 w-5 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-400">Click to upload QR code</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const reader = new FileReader()
                                            reader.onload = (ev) => setSettings(prev => ({ ...prev, paymentQrCode: ev.target?.result as string }))
                                            reader.readAsDataURL(file)
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Stripe keys — from your Stripe dashboard → Developers → API keys.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Publishable Key</label>
                            <input
                                type="text"
                                placeholder="pk_live_..."
                                value={settings.stripePublishableKey}
                                onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Secret Key</label>
                            <input
                                type="password"
                                placeholder="sk_live_..."
                                value={settings.stripeSecretKey}
                                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Site-wide Side Content */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Left / Right Side Content</h2>
                    <p className="text-xs text-gray-500">
                        Shown beside every page on the site, including the home page. Pages and categories with their own
                        side content take precedence: page → category → these site-wide settings.
                    </p>
                    <SideContentEditor value={sideContent} onChange={setSideContent} />
                </div>

                {/* Social Media */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Facebook URL</label>
                            <input
                                type="url"
                                value={settings.facebook}
                                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Twitter URL</label>
                            <input
                                type="url"
                                value={settings.twitter}
                                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Instagram URL</label>
                            <input
                                type="url"
                                value={settings.instagram}
                                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.linkedin}
                                onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
