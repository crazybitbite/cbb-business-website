import { Metadata } from "next"
import { CategoryPagesBrowser } from "@/components/CategoryPagesBrowser"

export const metadata: Metadata = {
    title: "Digital Products | Crazyfactors",
    description: "Browse our digital products — apps, templates, and tools.",
}

export default function DigitalProductsPage() {
    return (
        <div className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                    Digital Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    High-quality apps, templates, and tools for your next project.
                </p>
            </div>
            <CategoryPagesBrowser category="Digital Products" variant="product" columns={3} collapse="Courses" />
        </div>
    )
}
