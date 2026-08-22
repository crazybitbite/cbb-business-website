import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(params.id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(params.id)
        const sessionUserId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id
        // @ts-ignore
        const isOwner = sessionUserId === userId
        // @ts-ignore
        const isAdmin = session.user.role === "ADMIN"

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const json = await req.json()
        const updateData: any = {
            name: json.name,
            email: json.email,
            role: json.role,
        }

        if (json.password) {
            updateData.password = await bcrypt.hash(json.password, 10)
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
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
        console.error("Error updating user:", error)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(params.id)

        // Prevent deleting self
        if (session.user?.email) {
            const currentUser = await prisma.user.findUnique({
                where: { email: session.user.email }
            })
            if (currentUser?.id === userId) {
                return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
            }
        }

        await prisma.user.delete({
            where: { id: userId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
