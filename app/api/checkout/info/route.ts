import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cartPaymentMethods } from "@/lib/paymentMethods"
import { effectivePrice } from "@/lib/pricing"

export const dynamic = "force-dynamic"

/**
 * Pre-checkout info for the cart: which payment methods apply (intersection of
 * item settings, falling back to the settings default), whether items conflict
 * (must be bought separately), each item's checkout terms, and the QR code +
 * contact email when QR payment is available.
 */
export async function POST(req: Request) {
    try {
        const json = await req.json()
        const ids: number[] = (json.items || []).map((i: any) => Number(i.id)).filter(Number.isFinite)
        if (!ids.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }

        const [pages, settingsRows] = await Promise.all([
            prisma.page.findMany({
                where: { id: { in: ids }, isPublished: true },
                select: {
                    id: true, name: true, paymentMethods: true, checkoutNote: true,
                    price: true, currency: true, discountAmount: true, discountPercent: true,
                },
            }),
            prisma.settings.findMany({
                where: { key: { in: ["defaultPaymentMethod", "paymentQrCode", "contactEmail"] } },
            }),
        ])

        const settings = settingsRows.reduce((acc, row) => {
            acc[row.key] = typeof row.value === "string" ? row.value : ""
            return acc
        }, {} as Record<string, string>)

        const { methods, conflict } = cartPaymentMethods(
            pages.map((p) => p.paymentMethods),
            settings.defaultPaymentMethod
        )

        // QR is only usable when a QR image is configured
        const qrConfigured = !!settings.paymentQrCode
        let effectiveMethods = methods.filter((m) => m !== "qr" || qrConfigured)
        if (!conflict && effectiveMethods.length === 0) {
            // QR-only cart but no QR uploaded — fall back to Stripe so checkout isn't dead
            effectiveMethods = ["stripe"]
        }

        const notes = pages
            .filter((p) => p.checkoutNote && p.checkoutNote.trim())
            .map((p) => ({ pageId: p.id, name: p.name, note: p.checkoutNote }))

        // Live pricing so the cart never shows stale prices from add-to-cart time
        const pricing = pages
            .map((p) => {
                const ep = effectivePrice(p.price, p.discountAmount, p.discountPercent)
                if (!ep) return null
                return {
                    pageId: p.id,
                    original: ep.original,
                    final: ep.final,
                    percentOff: ep.percentOff,
                    currency: p.currency || "USD",
                }
            })
            .filter(Boolean)

        return NextResponse.json({
            methods: conflict ? [] : effectiveMethods,
            conflict,
            notes,
            pricing,
            qrCode: !conflict && effectiveMethods.includes("qr") ? settings.paymentQrCode : null,
            contactEmail: settings.contactEmail || null,
        })
    } catch (error) {
        console.error("Checkout info failed:", error)
        return NextResponse.json({ error: "Failed to load checkout info" }, { status: 500 })
    }
}
