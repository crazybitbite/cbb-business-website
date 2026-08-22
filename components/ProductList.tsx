import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/store"

export interface Product {
    id: string
    name: string
    price: number
    description: string
    category: string
    featured?: boolean
}

interface ProductListProps {
    products?: Product[]
    total_columns?: number
    featured_only?: boolean
    total_rows?: number
    category?: string
}

export function ProductList({ products = [], total_columns = 3, featured_only = false, total_rows = 9, category = "all" }: ProductListProps) {
    let filtered = products
    if (category !== "all") filtered = filtered.filter(p => p.category === category)
    if (featured_only) filtered = filtered.filter(p => p.featured)
    filtered = filtered.slice(0, total_rows)
    return (
        <div className={`grid gap-8 md:grid-cols-${total_columns}`}>
            {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
    )
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
    const addItem = useCartStore((state) => state.addItem)
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden hover:border-orange-500/50 transition-colors group shadow-sm dark:shadow-none"
        >
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/products/${product.id}`}>
                        <button className="bg-white text-black px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                    <span className="text-orange-500 dark:text-orange-400 font-bold">${product.price.toFixed(2)}</span>
                </div>
                <button
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                    className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg transition-colors"
                >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                </button>
            </div>
        </motion.div>
    )
}
