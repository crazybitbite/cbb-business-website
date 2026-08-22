import Link from "next/link"
import { Calendar, User as UserIcon, ArrowRight } from "lucide-react"
import { format } from "date-fns"

export interface BlogPost {
    id: number
    title: string
    content: string
    createdAt: string
    author: { name?: string; email?: string }
    featured?: boolean
    category?: string
    shortDescription?: string | null
    updatedAt?: bigint | null
    published?: boolean
    featuredImages?: string[]
    bannerImages?: string[]
    authorId?: number
}

interface BlogListProps {
    posts?: BlogPost[]
    total_columns?: number
    featured_only?: boolean
    total_rows?: number
    category?: string
}

export function BlogList({ posts = [], total_columns = 3, featured_only = false, total_rows = 9, category = "all" }: BlogListProps) {
    let filtered = posts
    if (category !== "all") filtered = filtered.filter(p => p.category === category)
    if (featured_only) filtered = filtered.filter(p => p.featured)
    filtered = filtered.slice(0, total_rows)
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${total_columns} gap-8`}>
            {filtered.length === 0 ? (
                <div className={`col-span-${total_columns} text-center text-gray-500 dark:text-gray-400 py-12`}>
                    No blog posts found.
                </div>
            ) : (
                filtered.map((post) => (
                    <BlogCard key={post.id} post={post} />
                ))
            )}
        </div>
    )
}

export function BlogCard({ post }: { post: BlogPost }) {
    return (
        <article className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:bg-white/10 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {post.author.name || "Admin"}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    <Link href={`/blog/${post.id}`} className="hover:text-orange-500 transition-colors">
                        {post.title}
                    </Link>
                </h3>
                <div className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="mt-auto pt-4">
                    <Link href={`/blog/${post.id}`} className="inline-flex items-center text-orange-500 hover:text-orange-400 font-medium transition-colors">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    )
}
