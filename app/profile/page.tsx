"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2 } from "lucide-react"

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        password: "",
        newPassword: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`/api/users/${session?.user?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    password: formData.newPassword || undefined,
                }),
            })

            if (!res.ok) throw new Error("Failed to update profile")

            await update({ name: formData.name })
            alert("Profile updated successfully")
            setFormData(prev => ({ ...prev, password: "", newPassword: "" }))
        } catch (error) {
            console.error(error)
            alert("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) {
        return <div className="p-8 text-center">Please log in to view this page.</div>
    }

    return (
        <div className="container mx-auto px-4 py-24 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            value={session.user?.email || ""}
                            disabled
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">New Password</label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
