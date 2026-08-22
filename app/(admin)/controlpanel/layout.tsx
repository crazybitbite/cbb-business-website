"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Briefcase, FileText, Settings, Users, LogOut, Package, Layers, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const sidebarItems = [
        { name: "Dashboard", href: "/controlpanel", icon: LayoutDashboard },
        { name: "Pages", href: "/controlpanel/pages", icon: ShoppingBag },
        { name: "Orders", href: "/controlpanel/orders", icon: Package },
        { name: "Categories", href: "/controlpanel/categories", icon: Package },
        { name: "Navigation", href: "/controlpanel/navigation", icon: Map },
        { name: "Users", href: "/controlpanel/users", icon: Users },
        { name: "Settings", href: "/controlpanel/settings", icon: Settings },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 backdrop-blur-xl transition-colors duration-300">
                <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/10 px-6 transition-colors duration-300">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
                    <div className="relative">
                        <ModeToggle />
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-orange-600 text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                    <button
                        onClick={() => import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/admin-login" }))}
                        className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-8"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}


