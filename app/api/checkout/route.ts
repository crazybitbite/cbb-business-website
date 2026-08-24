import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { getCurrencyRates } from "@/lib/currencyRates"
import { convertPrice, CURRENCY_CODES, ZERO_DECIMAL_CURRENCIES } from "@/lib/currency"
import { effectivePrice } from "@/lib/pricing"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 })
        }
        const userId = parseInt(session.user.id)

        const stripe = await getStripe()
        if (!stripe) {
            return NextResponse.json(
                { error: "Payments are not configured yet. Please add Stripe keys in admin settings." },
                { status: 400 }
            )
        }

        const json = await req.json()
        const requestedItems: { id: number; quantity: number }[] = json.items || []
        if (!requestedItems.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }

        // Items with checkout terms require explicit acceptance
        const withNotes = await prisma.page.count({
            where: {
                id: { in: requestedItems.map((i) => Number(i.id)) },
                checkoutNote: { not: null },
                NOT: { checkoutNote: "" },
            },
        })
        if (withNotes > 0 && json.acceptedTerms !== true) {
            return NextResponse.json({ error: "Please accept the checkout terms first." }, { status: 400 })
        }

        const checkoutCurrency: string = CURRENCY_CODES.includes(json.currency) ? json.currency : "USD"
        const rates = await getCurrencyRates()

        // Always price from the database — never trust client-side amounts
        const pages = await prisma.page.findMany({
            where: { id: { in: requestedItems.map((i) => Number(i.id)) }, isPublished: true },
        })

        const lineItems: { pageId: number; name: string; unitPrice: number; quantity: number }[] = []
        for (const item of requestedItems) {
            const page = pages.find((p) => p.id === Number(item.id))
            const pricing = effectivePrice(page?.price, page?.discountAmount, page?.discountPercent)
            if (!page || !pricing || pricing.final <= 0) continue // free/open pages can't be purchased

            const converted = convertPrice(pricing.final, page.currency || "USD", checkoutCurrency, rates)
            if (converted === null) {
                return NextResponse.json(
                    { error: `Currency conversion unavailable for ${page.currency}. Please try again later.` },
                    { status: 400 }
                )
            }

            lineItems.push({
                pageId: page.id,
                name: page.name,
                unitPrice: converted,
                quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
            })
        }

        if (!lineItems.length) {
            return NextResponse.json({ error: "No purchasable items in cart" }, { status: 400 })
        }

        const total = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)

        const order = await prisma.order.create({
            data: {
                userId,
                status: "PENDING",
                total: Math.round(total * 100) / 100,
                currency: checkoutCurrency,
                items: {
                    create: lineItems.map((li) => ({
                        pageId: li.pageId,
                        quantity: li.quantity,
                        price: Math.round(li.unitPrice * 100) / 100,
                    })),
                },
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin
        const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(checkoutCurrency)

        const stripeSession = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: session.user.email || undefined,
            line_items: lineItems.map((li) => ({
                price_data: {
                    currency: checkoutCurrency.toLowerCase(),
                    product_data: { name: li.name },
                    unit_amount: Math.round(li.unitPrice * (isZeroDecimal ? 1 : 100)),
                },
                quantity: li.quantity,
            })),
            metadata: { orderId: order.id.toString() },
            success_url: `${baseUrl}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cart`,
        })

        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: stripeSession.id },
        })

        return NextResponse.json({ url: stripeSession.url })
    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 })
    }
}
