import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: json.email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(json.password, 10)

        const user = await prisma.user.create({
            data: {
                name: json.name,
                email: json.email,
                password: hashedPassword,
                role: json.role || "USER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        })
        return NextResponse.json(user)
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: "Failed to create user", details: (error as Error).message }, { status: 500 })
    }
}
