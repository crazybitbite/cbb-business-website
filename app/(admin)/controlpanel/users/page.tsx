"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { epochToDate } from "@/lib/utils"
import { Plus, Search, Edit, Trash2, Loader2, Shield } from "lucide-react"

interface User {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users")
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setUsers(users.filter((u) => u.id !== id))
            } else {
                const error = await res.json()
                alert(error.error || "Failed to delete user")
            }
        } catch (error) {
            console.error("Failed to delete user:", error)
        }
    }

    const filteredUsers = users.filter((user) =>
        (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-gray-400">Manage user accounts and permissions</p>
                </div>
                <Link
                    href="/controlpanel/users/new"
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add User</span>
                </Link>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white placeholder-gray-500 w-full"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20">
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Role</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">
                                            {user.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN"
                                                    ? "bg-purple-500/10 text-purple-400"
                                                    : "bg-blue-500/10 text-blue-400"
                                                    }`}
                                            >
                                                {user.role === "ADMIN" && <Shield className="h-3 w-3" />}
                                                <span>{user.role}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {epochToDate(user.createdAt)?.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={`/controlpanel/users/${user.id}`}
                                                className="inline-block p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="inline-block p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

