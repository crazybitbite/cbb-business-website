import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { verifyAndSaveSubscription } from "@/lib/subscriptionVerification"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ verified: false, message: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(session.user.id)
        const { platform } = await req.json()

        // Use shared helper
        const isVerified = await verifyAndSaveSubscription(userId, platform)

        if (isVerified) {
            return NextResponse.json({ verified: true })
        } else {
            const linkedEmail = session.user.email
            return NextResponse.json({
                verified: false,
                message: linkedEmail
                    ? `Could not verify subscription. Make sure you subscribed using the account linked to this site (${linkedEmail}) — your browser may be logged into a different account on that platform.`
                    : "Could not verify subscription. Make sure you subscribed using the same account you signed in with here — your browser may be logged into a different account on that platform."
            })
        }

    } catch (error) {
        console.error("Verification failed", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
