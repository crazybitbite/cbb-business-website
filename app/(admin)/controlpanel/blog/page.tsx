"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Loader2, FileText } from "lucide-react"
import { epochToDate } from "@/lib/utils"

interface BlogPost {
    id: number
    title: string
    published: boolean
    author: {
        name: string | null
        email: string
    }
    createdAt: number | bigint | string
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/blog")
            const data = await res.json()
            setPosts(data)
        } catch (error) {
            console.error("Failed to fetch blog posts:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                const numId = parseInt(id, 10)
                setPosts(posts.filter((p) => p.id !== numId))
            }
        } catch (error) {
            console.error("Failed to delete blog post:", error)
        }
    }

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
                    <p className="text-gray-400">Manage your articles and tutorials</p>
                </div>
                <Link
                    href="/controlpanel/blog/new"
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Post</span>
                </Link>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search posts..."
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
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Author</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Created</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No blog posts found
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span>{post.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {post.author.name || post.author.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-yellow-500/10 text-yellow-400"
                                                    }`}
                                            >
                                                {post.published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {epochToDate(post.createdAt)?.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={`/controlpanel/blog/${post.id}`}
                                                className="inline-block p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id.toString())}
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
