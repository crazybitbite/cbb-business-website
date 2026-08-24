"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone, Send, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

const contactSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const { settings } = useSiteSettings()

    // Values managed in admin settings, with the original copy as fallback
    const contactEmail = settings.contactEmail || "contact@crazybitbite.com"
    const supportPhone = settings.supportPhone || "+91 9725 44 99 11"
    const address = settings.address || "123 Innovation Dr, Tech City, TC 90210"

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    })

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true)
        setIsSuccess(false)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setIsSuccess(true)
                reset()
                setTimeout(() => setIsSuccess(false), 5000)
            } else {
                const errorData = await response.json()
                alert(errorData.error || "Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error("Submission error:", error)
            alert("Failed to send message. Please check your connection.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-4xl font-bold text-white sm:text-5xl">Get in Touch</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have a project in mind? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid gap-12 md:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <Mail className="h-6 w-6 text-orange-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Email</p>
                                        <a href={`mailto:${contactEmail}`} className="text-white hover:text-orange-400 transition-colors">{contactEmail}</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <Phone className="h-6 w-6 text-orange-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Phone</p>
                                        <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="text-white hover:text-orange-400 transition-colors">{supportPhone}</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <MapPin className="h-6 w-6 text-orange-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Office</p>
                                        <p className="text-white whitespace-pre-line">{address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {isSuccess && (
                            <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 p-4 rounded-lg">
                                <AlertCircle className="h-5 w-5" />
                                <span>Message sent successfully! We'll get back to you soon.</span>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">First Name</label>
                                <input
                                    {...register("firstName")}
                                    type="text"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="Firstname"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-red-400">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Last Name</label>
                                <input
                                    {...register("lastName")}
                                    type="text"
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-red-400">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                placeholder="youremail@example.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Message</label>
                            <textarea
                                {...register("message")}
                                rows={4}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                                placeholder="Tell us about your project..."
                            />
                            {errors.message && (
                                <p className="text-xs text-red-400">{errors.message.message}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-orange-600 px-8 py-4 font-bold text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
