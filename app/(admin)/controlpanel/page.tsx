import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrencyRates } from "@/lib/currencyRates"
import { convertPrice, formatPrice } from "@/lib/currency"
import { epochToDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_STYLES: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-600 dark:text-green-400",
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    VERIFYING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

export default async function AdminDashboard() {
    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - 30 * 24 * 3600

    const [orders, userCount, newUsers, pageStats, recentOrders, recentUsers, rates, currencyRow] = await Promise.all([
        prisma.order.findMany({ select: { status: true, total: true, currency: true, createdAt: true } }),
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: BigInt(thirtyDaysAgo) } } }),
        prisma.page.groupBy({ by: ["isPublished"], _count: true }),
        prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { page: { select: { name: true } } }, take: 1 },
            },
        }),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, email: true, image: true, createdAt: true },
        }),
        getCurrencyRates(),
        prisma.settings.findUnique({ where: { key: "defaultCurrency" } }),
    ])

    const displayCurrency = typeof currencyRow?.value === "string" && currencyRow.value ? currencyRow.value : "USD"

    // Revenue: COMPLETED orders converted into the default currency
    const toDisplay = (amount: number, from: string) =>
        convertPrice(amount, from, displayCurrency, rates) ?? amount

    const completed = orders.filter((o) => o.status === "COMPLETED")
    const totalRevenue = completed.reduce((sum, o) => sum + toDisplay(o.total, o.currency), 0)
    const revenue30d = completed
        .filter((o) => Number(o.createdAt) >= thirtyDaysAgo)
        .reduce((sum, o) => sum + toDisplay(o.total, o.currency), 0)

    const verifyingCount = orders.filter((o) => o.status === "VERIFYING").length
    const pendingCount = orders.filter((o) => o.status === "PENDING").length
    const publishedPages = pageStats.find((s) => s.isPublished)?._count ?? 0
    const draftPages = pageStats.find((s) => !s.isPublished)?._count ?? 0

    const stats = [
        {
            title: "Total Revenue",
            value: formatPrice(totalRevenue, displayCurrency),
            note: `${formatPrice(revenue30d, displayCurrency)} in last 30 days`,
            color: "text-green-500 dark:text-green-400",
            href: "/controlpanel/orders",
        },
        {
            title: "Orders",
            value: String(orders.length),
            note: verifyingCount > 0
                ? `${verifyingCount} awaiting verification`
                : `${completed.length} completed · ${pendingCount} pending`,
            color: verifyingCount > 0 ? "text-blue-500 dark:text-blue-400" : "text-orange-500 dark:text-orange-400",
            href: "/controlpanel/orders",
        },
        {
            title: "Users",
            value: String(userCount),
            note: `+${newUsers} in last 30 days`,
            color: "text-blue-500 dark:text-blue-400",
            href: "/controlpanel/users",
        },
        {
            title: "Pages",
            value: String(publishedPages),
            note: draftPages > 0 ? `${draftPages} draft${draftPages > 1 ? "s" : ""}` : "all published",
            color: "text-pink-500 dark:text-pink-400",
            href: "/controlpanel/pages",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, Admin.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300 hover:border-orange-500/40"
                    >
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                        <div className="mt-2 space-y-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                            <p className={`text-xs font-medium ${stat.color}`}>{stat.note}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link href="/controlpanel/orders" className="text-xs font-medium text-orange-500 hover:text-orange-400">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No orders yet.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Order #{order.id}
                                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                {formatPrice(order.total, order.currency)}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {order.items[0]?.page?.name || "—"}
                                            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                                            {" · "}{order.user.name || order.user.email}
                                        </p>
                                    </div>
                                    <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] || "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Users</h3>
                        <Link href="/controlpanel/users" className="text-xs font-medium text-orange-500 hover:text-orange-400">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No users yet.</p>
                        ) : (
                            recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center space-x-4">
                                    {user.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={user.image} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white">
                                            {(user.name || user.email)[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{user.name || "Unnamed"}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                            {epochToDate(user.createdAt) ? ` · joined ${epochToDate(user.createdAt)!.toLocaleDateString()}` : ""}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
