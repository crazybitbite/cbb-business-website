"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingCart, User, ChevronDown, LogOut, LayoutDashboard, Package, User as UserIcon, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { useCartStore } from "@/lib/store"
import { useSession, signOut } from "next-auth/react"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

export function BrandLogo({ className = "h-10" }: { className?: string }) {
    const { settings } = useSiteSettings()

    if (settings.logo) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={settings.logo}
                alt={settings.siteName || "CrazyBitBite"}
                className={`${className} w-auto max-w-[200px] object-contain`}
            />
        )
    }

    // Fallback: original text branding
    return (
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
            Crazy<span className="text-2xl text-orange-500">Bit</span>Bite
        </span>
    )
}

function UserDropdown() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    if (!session) {
        return (
            <Link href="/login" className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                <User className="h-5 w-5" />
            </Link>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
                {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="User" className="h-8 w-8 rounded-full" />
                ) : (
                    <User className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-black/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden py-2 shadow-xl"
                    >
                        <div className="px-4 py-2 border-b border-black/10 dark:border-white/10">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                        </div>

                        {/* @ts-ignore */}
                        {session.user?.role === "ADMIN" && (
                            <Link
                                href="/controlpanel"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Admin Panel</span>
                            </Link>
                        )}

                        <Link
                            href="/profile"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="h-4 w-4" />
                            <span>Profile</span>
                        </Link>

                        <Link
                            href="/orders"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Package className="h-4 w-4" />
                            <span>Orders</span>
                        </Link>

                        <Link
                            href="/subscriptions"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Repeat className="h-4 w-4" />
                            <span>Subscriptions</span>
                        </Link>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [openMenuName, setOpenMenuName] = useState<string | null>(null)
    const pathname = usePathname()
    const cartItemsCount = useCartStore((state) => state.totalItems())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])



    // Default Links as Fallback
    const defaultLinks = [
        { name: "Home", href: "/", isEnabled: true },
        { name: "About", href: "/about", isEnabled: true },
        { name: "Services", href: "/services", isEnabled: true, submenu: [] },
        { name: "Pages", href: "/pages", isEnabled: true },
        { name: "Projects", href: "/projects", isEnabled: true },
        { name: "Blog", href: "/blog", isEnabled: true },
        { name: "Contact", href: "/contact", isEnabled: true },
    ]

    const [navigation, setNavigation] = useState(defaultLinks)

    useEffect(() => {
        const fetchNav = async () => {
            try {
                const res = await fetch("/api/navigation")
                if (res.ok) {
                    const navs = await res.json()
                    // Find "Header" or "header" or "top-menu"
                    const headerNav = navs.find((n: any) =>
                        n.slug === "header" ||
                        n.slug === "top-menu" ||
                        n.name.toLowerCase() === "header" ||
                        n.name.toLowerCase() === "top menu"
                    )
                    if (headerNav) {
                        const itemsRes = await fetch(`/api/navigation/${headerNav.id}`)
                        if (itemsRes.ok) {
                            const data = await itemsRes.json()
                            // Filter disabled items
                            const filterEnabled = (items: any[]): any[] => {
                                return items.filter(i => i.isEnabled).map(i => ({
                                    name: i.title,
                                    href: i.path,
                                    submenu: i.children && i.children.length > 0 ? filterEnabled(i.children) : undefined
                                }))
                            }
                            setNavigation(filterEnabled(data.items))
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch navigation")
            }
        }
        fetchNav()
    }, [])

    // Hide Navbar on Admin pages
    if (pathname.startsWith("/controlpanel")) return null

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                isScrolled
                    ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <BrandLogo />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navigation.map((link: any) => (
                        <div key={link.name} className="relative group">
                            {link.submenu ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setOpenMenuName(link.name)}
                                    onMouseLeave={() => setOpenMenuName(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors flex items-center space-x-1",
                                            pathname === link.href
                                                ? "text-orange-500"
                                                : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                        )}
                                    >
                                        <span>{link.name}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </Link>
                                    <AnimatePresence>
                                        {openMenuName === link.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-black/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden py-2 shadow-xl"
                                            >
                                                {link.submenu.map((subItem: any) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        pathname === link.href
                                            ? "text-orange-500"
                                            : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/cart" className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors relative">
                        <ShoppingCart className="h-5 w-5" />
                        {mounted && cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>

                    <UserDropdown />

                    <div className="relative">
                        <ModeToggle />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 border-b border-white/10"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {navigation.map((link: any) => (
                                <div key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="block text-lg font-medium text-gray-300 hover:text-white"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                    {link.submenu && (
                                        <div className="pl-4 mt-2 space-y-2 border-l border-white/10">
                                            {link.submenu.map((subItem: any) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className="block text-sm text-gray-400 hover:text-white"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                                <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                                    <ShoppingCart className="h-5 w-5" />
                                    <span>Cart</span>
                                </button>
                                <Link href="/login" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                                    <User className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
