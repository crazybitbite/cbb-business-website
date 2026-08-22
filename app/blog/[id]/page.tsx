"use client"

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"

export default function BlogPostPage() {
    const params = useParams()
    const id = params.id

    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <Link href="/blog" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Blog</span>
                </Link>

                <div className="space-y-4">
                    <span className="text-orange-400 font-medium">Tutorials</span>
                    <h1 className="text-4xl font-bold text-white sm:text-5xl">
                        Blog Post Title {id}
                    </h1>
                    <div className="flex items-center space-x-6 text-gray-400">
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Admin User</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Nov 28, 2025</span>
                        </div>
                    </div>
                </div>

                <div className="aspect-video rounded-3xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center text-gray-600">
                    Featured Image
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-gray-300 leading-relaxed">
                        This is a placeholder content for blog post {id}. In a real application, this content would be fetched from a database or CMS.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Introduction</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Key Concepts</h2>
                    <ul className="list-disc list-inside text-gray-400 space-y-2">
                        <li>Understanding the basics of 3D modeling</li>
                        <li>Optimizing assets for web performance</li>
                        <li>Implementing interactions with React Three Fiber</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}
