"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Upload, X, ExternalLink } from "lucide-react"
import Link from "next/link"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { CategoryDropdown } from "@/components/ui/CategoryDropdown"
import { slugify, isValidSlug } from "@/lib/slugify"
import { CURRENCIES } from "@/lib/currency"
import { SideContentEditor } from "@/components/admin/SideContentEditor"
import { EMPTY_SIDE_CONTENT, normalizeSideContent, type SideContent } from "@/lib/sideContent"

const DOWNLOAD_PLATFORMS = [
    { id: "youtube", label: "YouTube" },
    { id: "instagram", label: "Instagram" },
    { id: "facebook", label: "Facebook" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "twitter", label: "Twitter" },
]

export default function EditPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        price: "",
        currency: "USD",
        category: "",
        featuredImages: [] as string[],
        bannerImages: [] as string[],
        featured: false,
        isPublished: false,
        showcase: false,
        showcaseOrder: "",
        downloadable: false,
        downloadPlatforms: [] as string[],
        modelUrl: "",
        ctaEnabled: false,
        ctaTitle: "",
        ctaDescription: "",
        ctaButtonLabel: "",
        ctaButtonUrl: "",
        sideContent: EMPTY_SIDE_CONTENT as SideContent,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch page
                const res = await fetch(`/api/pages/${params.id}`)
                if (res.ok) {
                    const pageData = await res.json()
                    setFormData({
                        name: pageData.name,
                        slug: pageData.slug || "",
                        description: pageData.description || "",
                        shortDescription: pageData.shortDescription || "",
                        price: pageData.price != null ? pageData.price.toString() : "",
                        currency: pageData.currency || "USD",
                        category: pageData.category || "",
                        featuredImages: pageData.featuredImages || [],
                        bannerImages: pageData.bannerImages || [],
                        featured: !!pageData.featured,
                        isPublished: !!pageData.isPublished,
                        showcase: !!pageData.showcase,
                        showcaseOrder: pageData.showcaseOrder != null ? pageData.showcaseOrder.toString() : "",
                        downloadable: !!pageData.downloadable,
                        downloadPlatforms: pageData.downloadPlatforms || [],
                        modelUrl: pageData.modelUrl || "",
                        ctaEnabled: !!pageData.cta?.enabled,
                        ctaTitle: pageData.cta?.title || "",
                        ctaDescription: pageData.cta?.description || "",
                        ctaButtonLabel: pageData.cta?.buttonLabel || "",
                        ctaButtonUrl: pageData.cta?.buttonUrl || "",
                        sideContent: normalizeSideContent(pageData.sideContent),
                    })
                }
            } catch (error) {
                console.error("Failed to fetch page")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'featured' | 'banner') => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            const reader = new FileReader()
            reader.onload = (event) => {
                const base64 = event.target?.result as string
                if (imageType === 'featured') {
                    setFormData(prev => ({
                        ...prev,
                        featuredImages: [...prev.featuredImages, base64]
                    }))
                } else {
                    setFormData(prev => ({
                        ...prev,
                        bannerImages: [...prev.bannerImages, base64]
                    }))
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index: number, imageType: 'featured' | 'banner') => {
        if (imageType === 'featured') {
            setFormData(prev => ({
                ...prev,
                featuredImages: prev.featuredImages.filter((_, i) => i !== index)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                bannerImages: prev.bannerImages.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/pages/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    cta: {
                        enabled: formData.ctaEnabled,
                        title: formData.ctaTitle,
                        description: formData.ctaDescription,
                        buttonLabel: formData.ctaButtonLabel,
                        buttonUrl: formData.ctaButtonUrl,
                    },
                }),
            })

            if (res.ok) {
                router.push("/controlpanel/pages")
                router.refresh()
            } else {
                alert("Failed to update page")
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
                <Link href="/controlpanel/pages" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-400" />
                </Link>
                <h1 className="text-3xl font-bold text-white">Edit Page</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Page Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Slug<span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors font-mono text-sm"
                        placeholder="services/ai-development"
                    />
                    {formData.slug && !isValidSlug(formData.slug) && (
                        <p className="text-sm text-red-400">Slug can only contain lowercase letters, numbers, hyphens, and forward slashes</p>
                    )}
                    {formData.slug && isValidSlug(formData.slug) && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <ExternalLink className="h-4 w-4" />
                            <span>Preview: <span className="text-orange-400">{process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/{formData.slug}</span></span>
                        </div>
                    )}
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
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category <span className="text-gray-500 text-xs">(optional)</span></label>
                    <CategoryDropdown
                        value={formData.category}
                        onChange={(id) => setFormData({ ...formData, category: id })}
                        placeholder="No category — page is served at its slug from the root URL"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Price</label>
                    <div className="flex gap-3">
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-white focus:border-orange-500 focus:outline-none [&>option]:bg-gray-900"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Leave empty for free / open to use"
                            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                        />
                    </div>
                    <p className="text-xs text-gray-500">If no price is entered, the page is treated as open to use and no price is shown to visitors.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Featured Images</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">Click to upload featured images</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'featured')}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {formData.featuredImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {formData.featuredImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt="featured" className="w-full h-24 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx, 'featured')}
                                        className="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Banner Images</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">Click to upload banner images</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'banner')}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {formData.bannerImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {formData.bannerImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt="banner" className="w-full h-24 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx, 'banner')}
                                        className="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={(value) => setFormData({ ...formData, description: value })}
                        placeholder="Page description..."
                    />
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

                <div className="flex items-center space-x-3 pt-2">
                    <label className="text-sm font-medium text-gray-300">Published</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                        className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.isPublished ? 'bg-green-600' : 'bg-gray-400'}`}
                    >
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.isPublished ? 'translate-x-6' : ''}`}></span>
                    </button>
                    <span className="text-sm text-white">{formData.isPublished ? "Published" : "Draft"}</span>
                </div>

                <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-gray-300">Order</label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        value={formData.showcaseOrder}
                        onChange={(e) => setFormData({ ...formData, showcaseOrder: e.target.value })}
                        placeholder="Optional — position in home page section (lower shows first)"
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                    <label className="text-sm font-medium text-gray-300">Showcase</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, showcase: !formData.showcase })}
                        className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.showcase ? 'bg-orange-600' : 'bg-gray-400'}`}
                    >
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.showcase ? 'translate-x-6' : ''}`}></span>
                    </button>
                    <span className="text-sm text-white">{formData.showcase ? "Shown on home page" : "Hidden from home page"}</span>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300">Downloadable</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, downloadable: !formData.downloadable })}
                            className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.downloadable ? 'bg-orange-600' : 'bg-gray-400'}`}
                        >
                            <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.downloadable ? 'translate-x-6' : ''}`}></span>
                        </button>
                        <span className="text-sm text-white">{formData.downloadable ? "Enabled" : "Disabled"}</span>
                    </div>
                    {formData.downloadable && (
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                            <p className="text-sm font-medium text-gray-300">Required subscriptions to download</p>
                            <p className="text-xs text-gray-500">If none are selected, the page can be downloaded without any social subscription.</p>
                            <div className="flex flex-wrap gap-4">
                                {DOWNLOAD_PLATFORMS.map((p) => (
                                    <label key={p.id} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.downloadPlatforms.includes(p.id)}
                                            onChange={() => setFormData({
                                                ...formData,
                                                downloadPlatforms: formData.downloadPlatforms.includes(p.id)
                                                    ? formData.downloadPlatforms.filter((id) => id !== p.id)
                                                    : [...formData.downloadPlatforms, p.id]
                                            })}
                                            className="h-4 w-4 rounded accent-orange-600"
                                        />
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-gray-300">Download File URL</label>
                                <input
                                    type="text"
                                    value={formData.modelUrl}
                                    onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                                    placeholder="https://... (optional)"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300">Call to Action</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, ctaEnabled: !formData.ctaEnabled })}
                            className={`w-12 h-6 flex items-center rounded-full transition-colors ${formData.ctaEnabled ? 'bg-orange-600' : 'bg-gray-400'}`}
                        >
                            <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.ctaEnabled ? 'translate-x-6' : ''}`}></span>
                        </button>
                        <span className="text-sm text-white">{formData.ctaEnabled ? "Shown at page bottom" : "Hidden"}</span>
                    </div>
                    {formData.ctaEnabled && (
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                            <input
                                type="text"
                                value={formData.ctaTitle}
                                onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                                placeholder="CTA title (e.g. Ready to start your project?)"
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                            />
                            <textarea
                                value={formData.ctaDescription}
                                onChange={(e) => setFormData({ ...formData, ctaDescription: e.target.value })}
                                placeholder="CTA description"
                                rows={2}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.ctaButtonLabel}
                                    onChange={(e) => setFormData({ ...formData, ctaButtonLabel: e.target.value })}
                                    placeholder="Button label (default: Contact Us)"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={formData.ctaButtonUrl}
                                    onChange={(e) => setFormData({ ...formData, ctaButtonUrl: e.target.value })}
                                    placeholder="Button link (default: /contact)"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-gray-300">Left / Right Side Content</label>
                    <p className="text-xs text-gray-500">Stack ads, menus, or custom HTML beside the page content. If left empty, the category&apos;s side content applies (page-level settings take precedence).</p>
                    <SideContentEditor
                        value={formData.sideContent}
                        onChange={(sideContent) => setFormData({ ...formData, sideContent })}
                    />
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
