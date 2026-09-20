"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Upload, X } from "lucide-react"
import { CURRENCIES } from "@/lib/currency"
import { SideContentEditor } from "@/components/admin/SideContentEditor"
import { EMPTY_SIDE_CONTENT, normalizeSideContent, type SideContent } from "@/lib/sideContent"
import { ConsultationEditor } from "@/components/admin/ConsultationEditor"
import type { ConsultationHours, PauseWindow } from "@/lib/booking"

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
    stripeWebhookSecret: "",
    defaultPaymentMethod: "stripe",
    paymentQrCode: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",
    defaultSeoKeywords: "",
    telegram: "",
    whatsapp: "",
    telegramQr: "",
    whatsappQr: "",
    // Email (SMTP)
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
    // Consultation host / Google Calendar
    meetingEmail: "",
    meetingTimezone: "",
    googleCalendarClientId: "",
    googleCalendarClientSecret: "",
    googleCalendarRefreshToken: "",
    googleCalendarId: "",
    // Social subscription verification (target account IDs)
    youtubeChannelId: "",
    twitterTargetAccountId: "",
    linkedinCompanyId: "",
    facebookPageId: "",
    instagramBusinessAccountId: "",
}

type SettingsForm = typeof EMPTY_SETTINGS

export default function AdminSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS)
    const [sideContent, setSideContent] = useState<SideContent>(EMPTY_SIDE_CONTENT)
    const [consultationHours, setConsultationHours] = useState<ConsultationHours>({})
    const [consultationPauses, setConsultationPauses] = useState<PauseWindow[]>([])

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
                if (data.consultationHours && typeof data.consultationHours === "object") {
                    setConsultationHours(data.consultationHours)
                }
                if (Array.isArray(data.consultationPauses)) {
                    setConsultationPauses(data.consultationPauses)
                }
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
                body: JSON.stringify({ ...settings, sideContent, consultationHours, consultationPauses }),
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
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Webhook Signing Secret</label>
                            <input
                                type="password"
                                placeholder="whsec_..."
                                value={settings.stripeWebhookSecret}
                                onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Email (SMTP) */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Email (SMTP)</h2>
                    <p className="text-xs text-gray-500">
                        Used to send the contact-form messages and booking confirmation emails.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">SMTP Host</label>
                            <input type="text" placeholder="smtp.gmail.com" value={settings.smtpHost}
                                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">SMTP Port</label>
                            <input type="text" placeholder="587" value={settings.smtpPort}
                                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">SMTP Username</label>
                            <input type="text" autoComplete="off" value={settings.smtpUser}
                                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">SMTP Password</label>
                            <input type="password" autoComplete="new-password" value={settings.smtpPassword}
                                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">From Address</label>
                            <input type="email" placeholder="no-reply@yourdomain.com" value={settings.smtpFrom}
                                onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })} className={inputClass} />
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

                {/* Consultation Booking */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Consultation Booking</h2>
                    <ConsultationEditor
                        hours={consultationHours}
                        pauses={consultationPauses}
                        onHoursChange={setConsultationHours}
                        onPausesChange={setConsultationPauses}
                    />

                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <h3 className="text-white font-medium">Meeting host &amp; Google Calendar</h3>
                        <p className="text-xs text-gray-500">
                            Paid bookings create a real Google Calendar event (with a Meet link) on the host account.
                            Generate the refresh token once via <code>scripts/google-calendar-token.mjs</code>. The OAuth
                            client falls back to the site&apos;s Google sign-in credentials if left blank.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Meeting Host Email</label>
                                <input type="email" placeholder="host@yourdomain.com" value={settings.meetingEmail}
                                    onChange={(e) => setSettings({ ...settings, meetingEmail: e.target.value })} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Timezone (IANA)</label>
                                <input type="text" placeholder="Asia/Kolkata" value={settings.meetingTimezone}
                                    onChange={(e) => setSettings({ ...settings, meetingTimezone: e.target.value })} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Calendar ID</label>
                                <input type="text" placeholder="primary" value={settings.googleCalendarId}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarId: e.target.value })} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">OAuth Client ID</label>
                                <input type="text" autoComplete="off" placeholder="(defaults to Google sign-in)" value={settings.googleCalendarClientId}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarClientId: e.target.value })} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">OAuth Client Secret</label>
                                <input type="password" autoComplete="new-password" placeholder="(defaults to Google sign-in)" value={settings.googleCalendarClientSecret}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarClientSecret: e.target.value })} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">OAuth Refresh Token</label>
                                <input type="password" autoComplete="new-password" value={settings.googleCalendarRefreshToken}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarRefreshToken: e.target.value })} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Subscription Verification */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Social Subscription Verification</h2>
                    <p className="text-xs text-gray-500">
                        Target account IDs used to verify that a user follows/subscribes on each platform. The OAuth app
                        credentials for sign-in stay in environment variables.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">YouTube Channel ID</label>
                            <input type="text" value={settings.youtubeChannelId}
                                onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Twitter Target Account ID</label>
                            <input type="text" value={settings.twitterTargetAccountId}
                                onChange={(e) => setSettings({ ...settings, twitterTargetAccountId: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">LinkedIn Company ID</label>
                            <input type="text" value={settings.linkedinCompanyId}
                                onChange={(e) => setSettings({ ...settings, linkedinCompanyId: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Facebook Page ID</label>
                            <input type="text" value={settings.facebookPageId}
                                onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })} className={inputClass} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Instagram Business Account ID</label>
                            <input type="text" value={settings.instagramBusinessAccountId}
                                onChange={(e) => setSettings({ ...settings, instagramBusinessAccountId: e.target.value })} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* SEO Defaults */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">SEO Defaults</h2>
                    <p className="text-xs text-gray-500">Used for any page that doesn&apos;t define its own SEO fields, and as the site-wide defaults.</p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Default SEO Title</label>
                            <input
                                type="text"
                                maxLength={70}
                                value={settings.defaultSeoTitle}
                                onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
                                placeholder="e.g. CrazyBitBite — Web, AI & Mobile Solutions"
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Default Meta Description</label>
                            <textarea
                                rows={2}
                                maxLength={170}
                                value={settings.defaultSeoDescription}
                                onChange={(e) => setSettings({ ...settings, defaultSeoDescription: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Default Keywords</label>
                            <input
                                type="text"
                                value={settings.defaultSeoKeywords}
                                onChange={(e) => setSettings({ ...settings, defaultSeoKeywords: e.target.value })}
                                placeholder="comma, separated, keywords"
                                className={inputClass}
                            />
                        </div>
                    </div>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Telegram Group/Channel Link</label>
                            <input
                                type="url"
                                value={settings.telegram}
                                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                                placeholder="https://t.me/..."
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">WhatsApp Channel Link</label>
                            <input
                                type="url"
                                value={settings.whatsapp}
                                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                                placeholder="https://whatsapp.com/channel/..."
                                className={inputClass}
                            />
                        </div>
                        {([
                            ["telegramQr", "Telegram QR Code"] as const,
                            ["whatsappQr", "WhatsApp QR Code"] as const,
                        ]).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{label} <span className="text-gray-500 text-xs">(optional)</span></label>
                                {settings[key] ? (
                                    <div className="flex items-center gap-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={settings[key]} alt={`${label} preview`} className="h-20 w-20 object-contain rounded-lg bg-white p-1" />
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, [key]: "" })}
                                            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-4 w-4" /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                        <Upload className="h-4 w-4 text-gray-400 mb-1" />
                                        <p className="text-xs text-gray-400">Upload QR image</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                const reader = new FileReader()
                                                reader.onload = (ev) => setSettings(prev => ({ ...prev, [key]: ev.target?.result as string }))
                                                reader.readAsDataURL(file)
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
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
