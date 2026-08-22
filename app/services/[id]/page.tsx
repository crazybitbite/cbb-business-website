"use client"

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ServiceDetailPage() {
    const params = useParams()
    const id = params.id

    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <Link href="/services" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Services</span>
                </Link>

                <h1 className="text-4xl font-bold text-white">Service Detail: {id}</h1>
                <p className="text-xl text-gray-400">
                    This is a placeholder page for service ID: {id}. In a real application, we would fetch the service details from the database using this ID.
                </p>

                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">What's Included</h2>
                    <ul className="space-y-2 text-gray-400">
                        <li>• Feature 1</li>
                        <li>• Feature 2</li>
                        <li>• Feature 3</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}
