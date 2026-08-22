"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        // Here you would typically call your API to send the reset email
    }

    return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-sm"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
                    <p className="text-gray-400">Enter your email to reset your password</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700 transition-colors"
                        >
                            <span>Send Reset Link</span>
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-green-500/10 text-green-400 p-4 rounded-lg">
                            <p>If an account exists for {email}, we have sent a password reset link.</p>
                        </div>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-orange-400 hover:text-orange-300 text-sm"
                        >
                            Try another email
                        </button>
                    </div>
                )}

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
