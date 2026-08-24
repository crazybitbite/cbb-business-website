import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCurrencyRates } from "@/lib/currencyRates"
import { convertPrice, CURRENCY_CODES } from "@/lib/currency"
import { isValidTransactionId } from "@/lib/paymentMethods"

/**
 * QR checkout, single-shot: the buyer has already scanned and paid, and now
 * submits the transaction id (UTR). Only if the id passes validation (12-digit
 * format + never used before) is the order created — directly in VERIFYING
 * status, awaiting admin approval against the bank statement. Nothing is
 * written to the database before that.
 */
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 })
        }
        const userId = parseInt(session.user.id)

        const [qrRow, contactRow] = await Promise.all([
            prisma.settings.findUnique({ where: { key: "paymentQrCode" } }),
            prisma.settings.findUnique({ where: { key: "contactEmail" } }),
        ])
        const qrCode = typeof qrRow?.value === "string" ? qrRow.value : ""
        if (!qrCode) {
            return NextResponse.json({ error: "QR payment is not configured." }, { status: 400 })
        }
        const contactEmail = typeof contactRow?.value === "string" && contactRow.value ? contactRow.value : "our support email"
        const helpMessage = `We could not validate this transaction id — a UPI transaction id (UTR) is a 12-digit number shown in your payment app. If your reference looks different, please share your payment screenshot along with the transaction id at ${contactEmail} and we will confirm your order manually.`

        const json = await req.json()
        const requestedItems: { id: number; quantity: number }[] = json.items || []
        const transactionId = String(json.transactionId || "").trim()

        if (!requestedItems.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }
        if (json.acceptedTerms !== true) {
            return NextResponse.json({ error: "Please accept the checkout terms first." }, { status: 400 })
        }

        // Validate the transaction id BEFORE creating anything
        if (!isValidTransactionId(transactionId)) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }
        const reused = await prisma.order.findFirst({
            where: { transactionId },
            select: { id: true },
        })
        if (reused) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }

        const checkoutCurrency: string = CURRENCY_CODES.includes(json.currency) ? json.currency : "USD"
        const rates = await getCurrencyRates()

        // Always price from the database — never trust client-side amounts
        const pages = await prisma.page.findMany({
            where: { id: { in: requestedItems.map((i) => Number(i.id)) }, isPublished: true },
        })

        const orderItems: { pageId: number; quantity: number; price: number }[] = []
        let total = 0
        for (const item of requestedItems) {
            const page = pages.find((p) => p.id === Number(item.id))
            if (!page || page.price == null || page.price <= 0) continue

            const converted = convertPrice(page.price, page.currency || "USD", checkoutCurrency, rates)
            if (converted === null) {
                return NextResponse.json(
                    { error: `Currency conversion unavailable for ${page.currency}. Please try again later.` },
                    { status: 400 }
                )
            }
            const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1))
            orderItems.push({ pageId: page.id, quantity, price: Math.round(converted * 100) / 100 })
            total += converted * quantity
        }

        if (!orderItems.length) {
            return NextResponse.json({ error: "No purchasable items in cart" }, { status: 400 })
        }

        const order = await prisma.order.create({
            data: {
                userId,
                status: "VERIFYING",
                total: Math.round(total * 100) / 100,
                currency: checkoutCurrency,
                paymentMethod: "qr",
                transactionId,
                items: { create: orderItems },
            },
        })

        return NextResponse.json({ ok: true, orderId: order.id, verifying: true })
    } catch (error) {
        console.error("QR checkout error:", error)
        return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 })
    }
}
