import { auth } from "@/auth"
import { epochToDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/currency"
import { OrderSuccessBanner } from "@/components/OrderSuccessBanner"
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function OrderDetailPage({
    params,
    searchParams,
}: {
    params: { id: string }
    searchParams?: { success?: string; submitted?: string }
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const orderId = parseInt(params.id, 10)
    const sessionUserId = typeof session.user?.id === 'string' ? parseInt(session.user.id, 10) : session.user?.id

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    page: true
                }
            },
            notes: { orderBy: { createdAt: "desc" } }
        }
    })

    if (!order || order.userId !== sessionUserId) {
        redirect("/orders")
    }

    // Notes shown to the purchaser: the admin-checked ones; if none are
    // checked, just the latest note. Legacy single-note fallback.
    const checkedNotes = order.notes.filter((n) => n.visible)
    const shownNotes = checkedNotes.length
        ? checkedNotes
        : order.notes.length
            ? [order.notes[0]]
            : []

    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <Link href="/orders" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Link>

            {searchParams?.success === "1" && <OrderSuccessBanner />}
            {searchParams?.submitted === "1" && <OrderSuccessBanner variant="verifying" />}

            {(shownNotes.length > 0 || order.verificationNote) && (
                <div className={`mb-8 rounded-xl border p-4 space-y-3 ${order.status === "REJECTED"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-white/5 border-white/10 text-gray-300"}`}>
                    <p className="text-sm font-semibold">
                        {shownNotes.length > 1 ? "Notes about your order" : "A note about your order"}
                    </p>
                    {shownNotes.length > 0 ? (
                        shownNotes.map((note) => (
                            <div key={note.id} className="border-l-2 border-orange-500/50 pl-3">
                                <p className="text-sm whitespace-pre-line">{note.content}</p>
                                <p className="text-xs opacity-60 mt-1">
                                    {epochToDate(note.createdAt)?.toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm whitespace-pre-line">{order.verificationNote}</p>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order #{order.id}</h1>
                    <p className="text-gray-400">Placed on {epochToDate(order.createdAt)?.toLocaleDateString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${order.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                    order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400" :
                        order.status === "VERIFYING" ? "bg-blue-500/10 text-blue-400" :
                            "bg-gray-500/10 text-gray-400"
                    }`}>
                    {order.status === "VERIFYING" ? "PAYMENT UNDER VERIFICATION" : order.status}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <Package className="h-5 w-5 mr-2 text-orange-500" />
                                Order Items
                            </h2>
                        </div>
                        <div className="divide-y divide-white/10">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                                            {/* Placeholder for image */}
                                            Img
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {item.page?.name || "Unknown Item"}
                                            </p>
                                            <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-white">{formatPrice(item.price, order.currency)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-black/20">
                            <div className="flex justify-between text-gray-400 mb-2">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.total, order.currency)}</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10">
                                <span>Total</span>
                                <span>{formatPrice(order.total, order.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
                            Payment Info
                        </h3>
                        <p className="text-gray-400">Payment via {order.paymentMethod === "qr" ? "QR Code" : "Stripe"}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {order.paymentMethod === "qr"
                                ? `Transaction ID: ${order.transactionId || "Not submitted yet"}`
                                : `ID: ${order.stripeSessionId || "N/A"}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
