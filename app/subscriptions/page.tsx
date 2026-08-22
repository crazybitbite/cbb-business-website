
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SubscriptionGrid } from "./components/SubscriptionGrid"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Subscriptions | CrazyBitBite",
    description: "Manage your social media subscriptions",
}

export default async function SubscriptionsPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        My Subscriptions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Connect with us on social media to stay updated and unlock exclusive content.
                        Click the buttons below to update your subscription status.
                    </p>
                </div>

                <SubscriptionGrid userEmail={session.user?.email ?? null} />
            </div>
        </div>
    )
}
