import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const json = await req.json()
        const product = await prisma.product.create({
            data: {
                name: json.name,
                description: json.description,
                price: parseFloat(json.price),
                category: json.category,
                images: json.images || [],
                fileUrl: json.fileUrl
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
