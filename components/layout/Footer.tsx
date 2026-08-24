"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { BrandLogo } from "@/components/layout/Navbar"

export function Footer({ initialNavigation }: { initialNavigation?: { name: string; href: string }[] | null }) {
    const defaultLinks = [
        { name: "About Us", href: "/about-us" },
        { name: "Services", href: "/services" },
        { name: "Digital Products", href: "/digital-products" },
        { name: "Blog", href: "/blog" },
    ]

    const [navigation, setNavigation] = useState(initialNavigation?.length ? initialNavigation : defaultLinks)

    useEffect(() => {
        // Server already resolved the menu — no client fetch, no pop-in
        if (initialNavigation?.length) return

        const fetchNav = async () => {
            try {
                const res = await fetch("/api/navigation")
                if (res.ok) {
                    const navs = await res.json()
                    // Find "Footer" or "footer" or "footer-menu"
                    const footerNav = navs.find((n: any) =>
                        n.slug === "footer" ||
                        n.slug === "footer-menu" ||
                        n.name.toLowerCase() === "footer"
                    )
                    if (footerNav) {
                        const itemsRes = await fetch(`/api/navigation/${footerNav.id}`)
                        if (itemsRes.ok) {
                            const data = await itemsRes.json()
                            const filterEnabled = (items: any[]): any[] => {
                                return items.filter(i => i.isEnabled).map(i => ({
                                    name: i.title,
                                    href: i.path,
                                    // Flatten footer? Or support depth? Footer usually flat list or columns. 
                                    // Let's assume flat for Quick Links or support depth if UI allowed.
                                    // For now, let's just show top level enabled.
                                }))
                            }
                            setNavigation(filterEnabled(data.items))
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch footer navigation")
            }
        }
        fetchNav()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <footer className="border-t border-white/10 bg-black py-12 text-gray-400">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center">
                            <BrandLogo />
                        </Link>
                        <p className="text-sm">
                            Building the future of digital experiences with 3D technology and modern design.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            {navigation.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-orange-500">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy-policy" className="hover:text-orange-500">Privacy Policy</Link></li>
                            <li><Link href="/terms-condition" className="hover:text-orange-500">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/crazybitbite" className="hover:text-orange-500"><Facebook className="h-5 w-5" /></a>
                            <a href="https://twitter.com/crazybitbite" className="hover:text-orange-500"><Twitter className="h-5 w-5" /></a>
                            <a href="https://www.instagram.com/crazybitbite" className="hover:text-orange-500"><Instagram className="h-5 w-5" /></a>
                            <a href="https://www.linkedin.com/company/crazybitbite" className="hover:text-orange-500"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} CrazyBitBite. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
