import nodemailer from "nodemailer"
import { getSmtpConfig } from "@/lib/serverConfig"

interface OrderQrNotificationInput {
    orderId: number
    transactionId: string
    total: number
    currency: string
    buyerName?: string | null
    buyerEmail?: string | null
    items: { name: string; quantity: number }[]
}

/**
 * Notifies the admin (the SMTP From address) that a QR order is awaiting
 * payment verification, with the submitted transaction id (UTR). Best-effort:
 * if SMTP isn't configured it logs and returns without throwing.
 */
export async function sendOrderQrNotification(input: OrderQrNotificationInput): Promise<void> {
    const smtp = await getSmtpConfig()
    if (!smtp.host || !smtp.user) {
        console.warn("SMTP not configured — skipping order QR notification email")
        return
    }
    const to = smtp.from || smtp.user

    const itemRows = input.items
        .map((i) => `<li>${i.name} × ${i.quantity}</li>`)
        .join("")

    const row = (label: string, value: string) =>
        `<div class="field"><span class="label">${label}</span><div class="value">${value}</div></div>`

    const html = `<!DOCTYPE html><html><head><style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #2f3342; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background:#fff; }
        .header { background:#2f3342; color:#fff; padding:20px; text-align:center; border-radius:12px 12px 0 0; }
        .header h1 { margin:0; font-size:20px; }
        .content { padding:24px; }
        .field { margin-bottom:14px; }
        .label { font-weight:bold; color:#864797; display:block; margin-bottom:3px; text-transform:uppercase; font-size:11px; letter-spacing:1px; }
        .value { background:#f7f5fa; padding:10px; border-radius:8px; border:1px solid #eee; }
        .utr { font-family: monospace; font-size:18px; }
        .footer { text-align:center; font-size:12px; color:#6b7280; padding:14px; }
        ul { margin:6px 0 0 18px; padding:0; }
    </style></head><body><div class="container">
        <div class="header"><h1>QR order — verify payment</h1></div>
        <div class="content">
            <p>A QR payment was submitted and is awaiting your verification.</p>
            ${row("Transaction ID (UTR)", `<span class="utr">${input.transactionId}</span>`)}
            ${row("Amount", `${input.currency} ${input.total}`)}
            ${row("Order", `#${input.orderId}`)}
            ${row("Buyer", `${input.buyerName || "—"}${input.buyerEmail ? ` (${input.buyerEmail})` : ""}`)}
            <div class="field"><span class="label">Items</span><div class="value"><ul>${itemRows}</ul></div></div>
            <p>Verify the UTR against your bank records, then approve Order #${input.orderId} in the control panel.</p>
        </div>
        <div class="footer">CrazyBitBite · Order verification</div>
    </div></body></html>`

    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: { user: smtp.user, pass: smtp.password },
    })

    await transporter.sendMail({
        from: smtp.from || smtp.user,
        to,
        subject: `QR order to verify — UTR ${input.transactionId} (Order #${input.orderId})`,
        html,
    })
}
