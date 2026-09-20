import nodemailer from "nodemailer"
import { getSmtpConfig } from "@/lib/serverConfig"

interface BookingEmailInput {
    to: string
    name: string
    startsAt: Date
    timeZone: string
    durationMin: number
    price: number
    currency: string
    meetingLink: string | null
}

/**
 * Sends a booking confirmation email to the customer. Best-effort: if SMTP
 * isn't configured it logs and returns without throwing, so payment/calendar
 * flow is never blocked by mail delivery.
 */
export async function sendBookingEmail(input: BookingEmailInput): Promise<void> {
    const smtp = await getSmtpConfig()
    if (!smtp.host || !smtp.user) {
        console.warn("SMTP not configured — skipping booking confirmation email")
        return
    }

    const when = new Intl.DateTimeFormat("en-GB", {
        timeZone: input.timeZone,
        dateStyle: "full",
        timeStyle: "short",
    }).format(input.startsAt)

    const meetRow = input.meetingLink
        ? `<div class="field"><span class="label">Meeting Link</span><div class="value"><a href="${input.meetingLink}">${input.meetingLink}</a></div></div>`
        : `<div class="field"><span class="label">Meeting Link</span><div class="value">A calendar invite with the meeting link will arrive shortly.</div></div>`

    const html = `<!DOCTYPE html><html><head><style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #2f3342; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background:#fff; }
        .header { background:#864797; color:#fff; padding:24px; text-align:center; border-radius:12px 12px 0 0; }
        .header h1 { margin:0; font-size:22px; }
        .content { padding:28px; }
        .field { margin-bottom:16px; }
        .label { font-weight:bold; color:#864797; display:block; margin-bottom:4px; text-transform:uppercase; font-size:12px; letter-spacing:1px; }
        .value { background:#f7f5fa; padding:12px; border-radius:8px; border:1px solid #eee; }
        .footer { text-align:center; font-size:12px; color:#6b7280; padding:16px; }
        a { color:#864797; }
    </style></head><body><div class="container">
        <div class="header"><h1>Your consultation is confirmed ✅</h1></div>
        <div class="content">
            <p>Hi ${input.name}, thank you for your booking. Here are your session details:</p>
            <div class="field"><span class="label">When</span><div class="value">${when} (${input.timeZone})</div></div>
            <div class="field"><span class="label">Duration</span><div class="value">${input.durationMin} minutes</div></div>
            <div class="field"><span class="label">Amount Paid</span><div class="value">${input.currency} ${input.price}</div></div>
            ${meetRow}
            <p>We look forward to speaking with you. If you need to reschedule, just reply to this email.</p>
        </div>
        <div class="footer">CrazyBitBite · Consultation Booking</div>
    </div></body></html>`

    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: { user: smtp.user, pass: smtp.password },
    })

    await transporter.sendMail({
        from: smtp.from || smtp.user,
        to: input.to,
        subject: "Your CrazyBitBite consultation is confirmed",
        html,
    })
}
