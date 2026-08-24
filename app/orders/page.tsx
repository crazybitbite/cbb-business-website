import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { epochToDate } from "@/lib/utils"
import { formatPrice } from "@/lib/currency"
import { Package, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function OrdersPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const sessionUserId = typeof session.user?.id === 'string' ? parseInt(session.user.id, 10) : session.user?.id

    const orders = await prisma.order.findMany({
        where: { userId: sessionUserId },
        orderBy: { createdAt: "desc" },
        include: { items: true }
    })

    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                        <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
                        <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                        <Link href="/pages" className="text-orange-500 hover:text-orange-400 font-medium">
                            Browse Pages
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-orange-500/10 p-3 rounded-lg">
                                        <Package className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Order #{order.id}</p>
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {epochToDate(order.createdAt)?.toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white">{formatPrice(order.total, order.currency)}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                                        order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400" :
                                            order.status === "VERIFYING" ? "bg-blue-500/10 text-blue-400" :
                                                "bg-gray-500/10 text-gray-400"
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <p className="text-sm text-gray-400">{order.items.length} items</p>
                                <Link
                                    href={`/orders/${order.id}`}
                                    className="flex items-center text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
                                >
                                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
