import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, message } = await req.json()

        // Validation
        if (!firstName || !lastName || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        const fullName = `${firstName} ${lastName}`

        // HTML Email Template
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; }
                .header { background-color: #ea580c; color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { padding: 30px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #ea580c; display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
                .value { background-color: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6; }
                .footer { text-align: center; font-size: 12px; color: #6b7280; padding: 20px; }
                .message-box { background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #ea580c; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Contact Inquiry</h1>
                </div>
                <div class="content">
                    <p>You have received a new message from your website contact form.</p>
                    
                    <div class="field">
                        <span class="label">From</span>
                        <div class="value">${fullName} (${email})</div>
                    </div>
                    
                    <div class="field">
                        <span class="label">Message</span>
                        <div class="message-box">${message}</div>
                    </div>
                </div>
                <div class="footer">
                    <p>This email was sent from the contact form on CrazyBitBite.</p>
                </div>
            </div>
        </body>
        </html>
        `

        // Send email
        await transporter.sendMail({
            from: `"${fullName}" <${process.env.SMTP_FROM}>`,
            to: process.env.SMTP_FROM,
            subject: `New Contact Form Submission: ${fullName}`,
            text: `Name: ${fullName}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: html,
            replyTo: email,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Email sending error:", error)
        return NextResponse.json(
            { error: "Failed to send email. Please try again later." },
            { status: 500 }
        )
    }
}
