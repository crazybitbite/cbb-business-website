import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const TOKEN_RE = /^[a-z0-9]{8,32}$/i
const MAX_BODY = 64 * 1024
const MAX_REQUESTS_PER_BIN = 50

/** Capture any incoming request into the bin. */
async function capture(req: NextRequest, token: string) {
    if (!TOKEN_RE.test(token)) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
        if (!["cookie", "authorization"].includes(key)) headers[key] = value
    })

    let body = ""
    try {
        body = (await req.text()).slice(0, MAX_BODY)
    } catch { }

    await prisma.postBinRequest.create({
        data: {
            token,
            method: req.method,
            headers,
            body,
            ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null,
        },
    })

    // Keep only the newest N requests per bin
    const excess = await prisma.postBinRequest.findMany({
        where: { token },
        orderBy: { createdAt: "desc" },
        skip: MAX_REQUESTS_PER_BIN,
        select: { id: true },
    })
    if (excess.length) {
        await prisma.postBinRequest.deleteMany({ where: { id: { in: excess.map((r) => r.id) } } })
    }

    return NextResponse.json({ ok: true, captured: req.method })
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
    return capture(req, params.token)
}
export async function PUT(req: NextRequest, { params }: { params: { token: string } }) {
    return capture(req, params.token)
}
export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
    return capture(req, params.token)
}

/** List captured requests (the tool UI polls this). */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
    if (!TOKEN_RE.test(params.token)) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }
    const rows = await prisma.postBinRequest.findMany({
        where: { token: params.token },
        orderBy: { createdAt: "desc" },
        take: MAX_REQUESTS_PER_BIN,
    })
    return NextResponse.json({
        requests: rows.map((r) => ({
            id: r.id,
            method: r.method,
            headers: r.headers,
            body: r.body,
            ip: r.ip,
            createdAt: Number(r.createdAt),
        })),
    })
}

/** Clear the bin. */
export async function DELETE(req: NextRequest, { params }: { params: { token: string } }) {
    if (!TOKEN_RE.test(params.token)) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }
    await prisma.postBinRequest.deleteMany({ where: { token: params.token } })
    return NextResponse.json({ ok: true })
}
