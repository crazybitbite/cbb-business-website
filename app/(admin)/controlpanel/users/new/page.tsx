"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewUserPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER",
        linkedin: "",
        twitter: "",
        instagram: "",
        facebook: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to create user")
            }

            router.push("/controlpanel/users")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert((error as Error).message)
        } finally {
            setIsLoading(false)
        }
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
                    <h1 className="text-3xl font-bold text-white">Add New User</h1>
                    <p className="text-gray-400">Create a new user account</p>
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
                        placeholder="John Doe"
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
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="••••••••"
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">LinkedIn Profile</label>
                    <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Twitter Profile</label>
                    <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="https://twitter.com/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Instagram Profile</label>
                    <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="https://instagram.com/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Facebook Profile</label>
                    <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="https://facebook.com/username"
                    />
                </div>
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Creating..." : "Create User"}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
