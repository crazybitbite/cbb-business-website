import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isValidTransactionId } from "@/lib/paymentMethods"

/**
 * Submit a QR payment's transaction id. The id is validated (12-digit UPI UTR
 * format + not already used) and the order moves to VERIFYING — an admin
 * cross-checks the UTR against the bank statement and approves it, which is
 * what finally marks the order paid. On validation failure the message directs
 * the buyer to email a payment screenshot + transaction id to the contact email.
 */
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Please sign in" }, { status: 401 })
        }
        const userId = parseInt(session.user.id)

        const json = await req.json()
        const orderId = parseInt(json.orderId)
        const transactionId = String(json.transactionId || "").trim()

        const contactRow = await prisma.settings.findUnique({ where: { key: "contactEmail" } })
        const contactEmail = typeof contactRow?.value === "string" && contactRow.value ? contactRow.value : "our support email"
        const helpMessage = `We could not validate this transaction id — a UPI transaction id (UTR) is a 12-digit number shown in your payment app. If your reference looks different, please share your payment screenshot along with the transaction id at ${contactEmail} and we will confirm your order manually.`

        if (!orderId || Number.isNaN(orderId)) {
            return NextResponse.json({ error: "Invalid order" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order || order.userId !== userId || order.paymentMethod !== "qr") {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }
        if (order.status === "COMPLETED") {
            return NextResponse.json({ ok: true, orderId: order.id, alreadyPaid: true })
        }

        // Validation 1: transaction id format (UPI/bank references: 10–23 alphanumeric)
        if (!isValidTransactionId(transactionId)) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }

        // Validation 2: the same transaction id cannot pay for two orders
        const reused = await prisma.order.findFirst({
            where: { transactionId, id: { not: order.id } },
            select: { id: true },
        })
        if (reused) {
            return NextResponse.json({ error: helpMessage, invalid: true }, { status: 400 })
        }

        // Passed automated checks — now awaits manual verification against the
        // bank statement. Access unlocks only when an admin approves (COMPLETED).
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "VERIFYING", transactionId },
        })

        return NextResponse.json({ ok: true, orderId: order.id, verifying: true })
    } catch (error) {
        console.error("QR confirm error:", error)
        return NextResponse.json({ error: "Confirmation failed. Please try again." }, { status: 500 })
    }
}
