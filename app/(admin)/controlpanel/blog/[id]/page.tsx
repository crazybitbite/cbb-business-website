"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { CategoryDropdown } from "@/components/ui/CategoryDropdown"

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        shortDescription: "",
        category: "",
        published: false,
        featured: false,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/blog/${params.id}`)
                if (res.ok) {
                    const postData = await res.json()
                    setFormData({
                        title: postData.title,
                        content: postData.content || "",
                        shortDescription: postData.shortDescription || "",
                        category: postData.category || "",
                        published: !!postData.published,
                        featured: !!postData.featured,
                    })
                }
            } catch (error) {
                console.error("Failed to fetch blog post")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/blog/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/controlpanel/blog")
                router.refresh()
            } else {
                alert("Failed to update blog post")
            }
        } catch (error) {
            alert("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/controlpanel/blog" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-400" />
                </Link>
                <h1 className="text-3xl font-bold text-white">Edit Blog Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Short Description</label>
                    <textarea
                        value={formData.shortDescription}
                        onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white"
                        rows={2}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Category<span className="text-red-500">*</span></label>
                        <CategoryDropdown
                            value={formData.category}
                            onChange={(id) => setFormData({ ...formData, category: id })}
                            placeholder="Search and select category..."
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Content</label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Blog post content..."
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300">Published</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, published: !formData.published })}
                            className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.published ? 'bg-orange-600' : 'bg-gray-400'}`}
                        >
                            <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.published ? 'translate-x-6' : ''}`}></span>
                        </button>
                        <span className="text-sm text-white">{formData.published ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300">Featured</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                            className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.featured ? 'bg-orange-600' : 'bg-gray-400'}`}
                        >
                            <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.featured ? 'translate-x-6' : ''}`}></span>
                        </button>
                        <span className="text-sm text-white">{formData.featured ? "Yes" : "No"}</span>
                    </div>
                </div>
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 rounded-lg bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
