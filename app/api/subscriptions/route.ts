
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const subscription = await prisma.userSubscription.findUnique({
            where: {
                userId: parseInt(session.user.id as string),
            },
        })

        return NextResponse.json(subscription?.subscription || {})
    } catch (error) {
        console.error("[SUBSCRIPTION_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { platform, status } = body

        if (!platform) {
            return new NextResponse("Platform is required", { status: 400 })
        }

        const userId = parseInt(session.user.id as string)

        // Fetch existing subscription or create default
        const existing = await prisma.userSubscription.findUnique({
            where: { userId },
        })

        const currentData = (existing?.subscription as Record<string, any>) || {}
        const updatedData = { ...currentData, [platform]: status }

        const subscription = await prisma.userSubscription.upsert({
            where: {
                userId,
            },
            update: {
                subscription: updatedData,
            },
            create: {
                userId,
                subscription: updatedData,
            },
        })

        return NextResponse.json(subscription.subscription)
    } catch (error) {
        console.error("[SUBSCRIPTION_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
