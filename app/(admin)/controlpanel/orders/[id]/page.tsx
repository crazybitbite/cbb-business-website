import { prisma } from "@/lib/prisma"
import { epochToDate } from "@/lib/utils"
import { formatPrice } from "@/lib/currency"
import { paymentMethodLabel } from "@/lib/paymentMethods"
import { VerifyOrderActions } from "@/components/admin/VerifyOrderActions"
import { ArrowLeft, Package, CreditCard, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const STATUS_STYLES: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-400",
    PENDING: "bg-yellow-500/10 text-yellow-400",
    VERIFYING: "bg-blue-500/10 text-blue-400",
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const orderId = parseInt(params.id, 10)
    if (Number.isNaN(orderId)) notFound()

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: { select: { name: true, email: true, id: true } },
            items: { include: { page: { select: { name: true, slug: true } } } },
        },
    })

    if (!order) notFound()

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <Link href="/controlpanel/orders" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Placed on {epochToDate(order.createdAt)?.toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_STYLES[order.status] || "bg-red-500/10 text-red-400"}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Items */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <Package className="h-5 w-5 mr-2 text-orange-500" /> Items
                        </h2>
                    </div>
                    <div className="divide-y divide-white/10">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">{item.page?.name || item.title || "Unknown Item"}</p>
                                    {item.page?.slug && (
                                        <Link href={`/${item.page.slug}`} target="_blank" className="text-xs text-orange-400 hover:text-orange-300">
                                            /{item.page.slug}
                                        </Link>
                                    )}
                                    <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-white">{formatPrice(item.price, order.currency)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-5 bg-black/20 flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(order.total, order.currency)}</span>
                    </div>
                </div>

                {/* Customer + Payment */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-orange-500" /> Customer
                        </h3>
                        <p className="text-white font-medium">{order.user.name || "Guest"}</p>
                        <p className="text-sm text-gray-400 break-all">{order.user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">User ID: {order.user.id}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-orange-500" /> Payment
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Method: <span className="text-white">{paymentMethodLabel(order.paymentMethod)}</span>
                        </p>
                        {order.paymentMethod === "qr" ? (
                            <p className="text-gray-400 text-sm">
                                Transaction ID (UTR): <span className="text-white font-mono">{order.transactionId || "Not submitted yet"}</span>
                            </p>
                        ) : order.paymentMethod === "razorpay" ? (
                            <p className="text-gray-400 text-sm break-all">
                                Razorpay Payment: <span className="text-white font-mono text-xs">{order.transactionId || order.stripeSessionId || "N/A"}</span>
                            </p>
                        ) : (
                            <p className="text-gray-400 text-sm break-all">
                                Stripe Session: <span className="text-white font-mono text-xs">{order.stripeSessionId || "N/A"}</span>
                            </p>
                        )}

                        {order.status === "VERIFYING" && order.paymentMethod === "qr" && (
                            <div className="pt-2 border-t border-white/10">
                                <p className="text-xs text-gray-500 mb-2">Match the UTR with your bank records, then:</p>
                                <VerifyOrderActions orderId={order.id} transactionId={order.transactionId} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
