"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto space-y-12"
            >
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-white sm:text-5xl">About Us</h1>
                    <p className="text-xl text-gray-400 text-justify">
                        Let's get acquainted! We're not your average software development company - we're a team of passionate individuals who live and breathe code, innovation, and all things tech. At <span className="text-orange-500"><span className="font-bold text-gray-900 dark:text-white">Crazy
                        <span className="text-orange-500">Bit
                            </span>Bite</span>
                        </span>, 
                        We're on a mission to turn your ideas into reality, one line of code at a time! We're a bunch of coding geniuses, design enthusiasts, and tech aficionados who believe that software development should be engaging, cutting-edge, and truly transformative.
                    </p>
                </div>

                <div className="grid gap-12 md:grid-cols-2">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-justify">Our Mission</h2>
                        <p className="text-gray-400">
                            Our mission is to empower businesses to excel in the digital era through advanced software solutions, personalized services, and an unwavering commitment to excellence. We strive to be trusted partners, delivering innovative results and exceptional experiences that drive growth, foster confidence, and exceed expectations. With integrity, creativity, and a relentless pursuit of success, we are dedicated to shaping a brighter future for our clients and our community.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-justify">Our Vision</h2>
                        <p className="text-gray-400">
                            Our vision is to be the leading force in the software development industry, renowned for our innovation, excellence, and transformative impact on businesses worldwide. We aim to continuously push the boundaries of technology, delivering groundbreaking solutions that empower our clients to achieve their highest potential. By fostering a culture of creativity, integrity, and collaboration, we envision a future where our software revolutionizes industries, drives progress, and enhances the lives of people everywhere.
                        </p>
                    </div>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                    Leadership Team
                </h2>

                <div className="grid gap-8 md:grid-cols-3">
                    {[
                    { name: "Prashant Gautam", profile_img: "prashant.png", role: "CEO" },
                    { name: "Nisha Seth", profile_img: "nisha.png", role: "COO" },
                    { name: "Akshay Singh", profile_img: "akshay.png", role: "CTO" },
                    ].map((member, index) => (
                    <div key={index} className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gray-800 border-2 border-orange-500 overflow-hidden">
                            <img src={member.profile_img} alt={member.name} className="w-32 h-32 mx-auto rounded-full object-cover" />
                        </div>
                        <div>
                        <h3 className="text-lg font-bold text-white">{member.name}</h3>
                        <p className="text-sm text-orange-400">{member.role}</p>
                        </div>
                        <div className="flex space-x-4 justify-center">
                                <a href="#" className="hover:text-orange-500"><Facebook className="h-5 w-5" /></a>
                                <a href="#" className="hover:text-orange-500"><Twitter className="h-5 w-5" /></a>
                                <a href="#" className="hover:text-orange-500"><Instagram className="h-5 w-5" /></a>
                                <a href="#" className="hover:text-orange-500"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </motion.div>
        </div>
    )
}
