"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditUserPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER",
    })

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${params.id}`)
                if (!res.ok) throw new Error("Failed to fetch user")
                const data = await res.json()
                setFormData({
                    name: data.name || "",
                    email: data.email,
                    password: "", // Don't show existing password
                    role: data.role,
                })
            } catch (error) {
                console.error(error)
                alert("Failed to load user")
                router.push("/controlpanel/users")
            } finally {
                setIsFetching(false)
            }
        }
        fetchUser()
    }, [params.id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`/api/users/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed to update user")

            router.push("/controlpanel/users")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to update user")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Link
                    href="/controlpanel/users"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit User</h1>
                    <p className="text-gray-400">Update user details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">New Password (Optional)</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Leave blank to keep current password"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Role</label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
