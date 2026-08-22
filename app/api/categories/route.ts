import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

export async function POST(request: Request) {
    try {
        const { name, description, sideContent } = await request.json()
        if (!name || !description) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        const count = await prisma.category.count()
        const category = await prisma.category.create({
            data: { name, description, order: count + 1, sideContent: sideContent ?? undefined }
        })
        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error("Error creating category:", error)
        return NextResponse.json({ error: "Failed to create category", details: (error as Error).message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany({ orderBy: { order: "asc" } })
        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }
}
