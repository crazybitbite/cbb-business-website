import { prisma } from "@/lib/prisma"
import { epochToDate } from "@/lib/utils"
import { format } from "date-fns"
import { Package, Search, Eye } from "lucide-react"
import Link from "next/link"
import { VerifyOrderActions } from "@/components/admin/VerifyOrderActions"
import { OrderDetailModal } from "@/components/admin/OrderDetailModal"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: true,
            items: true,
        },
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-gray-400">Manage customer orders and transactions</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                </div>
                <select className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20">
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Order ID</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Customer</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Total</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Items</th>
                                <th className="px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{order.user.name || "Guest"}</span>
                                                <span className="text-xs text-gray-500">{order.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {format(epochToDate(order.createdAt)!, "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white font-medium">
                                            {order.currency || "USD"} {order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "COMPLETED"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : order.status === "PENDING"
                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                            : order.status === "VERIFYING"
                                                                ? "bg-blue-500/10 text-blue-400"
                                                                : "bg-red-500/10 text-red-400"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {order.items.length} items
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <OrderDetailModal orderId={order.id} />
                                                {order.status === "VERIFYING" && order.paymentMethod === "qr" && (
                                                    <VerifyOrderActions orderId={order.id} transactionId={order.transactionId} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
