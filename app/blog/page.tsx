import { CategoryPagesBrowser } from "@/components/CategoryPagesBrowser"

export const dynamic = "force-dynamic"

export default function Blog() {
    return (
        <div className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                    Latest Insights
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Thoughts, tutorials, and updates from the world of 3D web development.
                </p>
            </div>
            <CategoryPagesBrowser category="Blog" variant="readmore" columns={3} />
        </div>
    )
}
