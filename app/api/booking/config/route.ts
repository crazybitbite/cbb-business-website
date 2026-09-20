import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getConsultationPaymentMethods } from "@/lib/serverConfig"

export const dynamic = "force-dynamic"

/**
 * Public booking configuration for the consultation modal: which payment
 * methods are enabled, and the QR image when QR is offered. Secrets are never
 * included — the online gateway keys stay server-side.
 */
export async function GET() {
    try {
        const methods = await getConsultationPaymentMethods()
        let qrCode: string | null = null
        if (methods.includes("qr")) {
            const row = await prisma.settings.findUnique({ where: { key: "paymentQrCode" } })
            qrCode = typeof row?.value === "string" && row.value ? row.value : null
        }
        // Drop QR from the offered methods if no QR image is configured.
        const available = methods.filter((m) => m !== "qr" || !!qrCode)
        return NextResponse.json({ methods: available, qrCode })
    } catch (error) {
        console.error("Booking config error:", error)
        return NextResponse.json({ methods: ["stripe"], qrCode: null })
    }
}
