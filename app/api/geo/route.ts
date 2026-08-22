import { NextRequest, NextResponse } from "next/server"
import { COUNTRY_TO_CURRENCY } from "@/lib/currency"

export const dynamic = "force-dynamic"

function isPrivateIp(ip: string): boolean {
    return (
        ip === "::1" ||
        ip.startsWith("127.") ||
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
    )
}

/**
 * Resolve the visitor's country (and matching currency) from their IP.
 * Used as a fallback when the browser locale has no region information.
 */
export async function GET(req: NextRequest) {
    try {
        const forwarded = req.headers.get("x-forwarded-for")
        const ip = (forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "").trim()

        // Prefer geo headers when deployed behind a platform that sets them
        const headerCountry =
            req.headers.get("x-vercel-ip-country") ||
            req.headers.get("cf-ipcountry")

        let countryCode = headerCountry?.toUpperCase() || null

        if (!countryCode && ip && !isPrivateIp(ip)) {
            const res = await fetch(`https://ipapi.co/${ip}/json/`, {
                headers: { "User-Agent": "crazybitbite-website" },
                cache: "no-store",
            })
            if (res.ok) {
                const data = await res.json()
                if (data.country_code) countryCode = String(data.country_code).toUpperCase()
            }
        }

        const currency = countryCode ? COUNTRY_TO_CURRENCY[countryCode] || null : null
        return NextResponse.json({ countryCode, currency })
    } catch (error) {
        console.error("Geo lookup failed:", error)
        return NextResponse.json({ countryCode: null, currency: null })
    }
}
