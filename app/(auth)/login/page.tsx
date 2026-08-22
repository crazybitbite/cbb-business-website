"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Mail, Lock, Chrome, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-sm"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center space-x-2 rounded-lg bg-white text-black px-4 py-3 font-bold hover:bg-gray-200 transition-colors"
                    >
                        <Chrome className="h-5 w-5" />
                        <span>Sign in with Google</span>
                    </button>

                    {/* <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-black px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center">
                        <Link href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300">
                            Forgot your password?
                        </Link>
                    </div> */}
                </div>
            </motion.div>
        </div>
    )
}
