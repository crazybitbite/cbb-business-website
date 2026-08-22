"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { CategoryDropdown } from "@/components/ui/CategoryDropdown"

export default function NewBlogPostPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        published: false,
        category: "",
        featured: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed to create blog post")

            router.push("/controlpanel/blog")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to create blog post")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Link
                    href="/controlpanel/blog"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">New Blog Post</h1>
                    <p className="text-gray-400">Write a new article</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category<span className="text-red-500">*</span></label>
                    <CategoryDropdown
                        value={formData.category}
                        onChange={(id) => setFormData({ ...formData, category: id })}
                        placeholder="Search and select category..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Article title..."
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="published" className="text-sm font-medium text-gray-300">
                        Publish immediately
                    </label>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                    <label className="text-sm font-medium text-gray-300">Featured</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                        className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.featured ? 'bg-orange-600' : 'bg-gray-400'}`}
                    >
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.featured ? 'translate-x-6' : ''}`}></span>
                    </button>
                    <span className="text-sm text-white">{formData.featured ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Content</label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Write your article content here..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Creating..." : "Create Post"}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
