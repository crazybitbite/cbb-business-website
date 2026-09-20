import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/currency"
import { CheckCircle2, Calendar, Clock, Video, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function BookingConfirmationPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10)
    if (Number.isNaN(id)) notFound()

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) notFound()

    const when = new Intl.DateTimeFormat("en-GB", {
        timeZone: booking.timeZone,
        dateStyle: "full",
        timeStyle: "short",
    }).format(booking.startsAt)

    const confirmed = booking.status === "CONFIRMED"

    return (
        <div className="container mx-auto px-4 py-24 max-w-2xl">
            <Link
                href="/service/consulting-services"
                className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Consulting
            </Link>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div
                    className="p-8 text-center"
                    style={{ background: "linear-gradient(135deg, rgba(134,71,151,0.35), rgba(12,192,223,0.15))" }}
                >
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-9 w-9 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        {confirmed ? "Booking Confirmed!" : "Payment Received"}
                    </h1>
                    <p className="text-gray-300 mt-2">
                        Thank you, {booking.firstName}. A calendar invite has been sent to{" "}
                        <span className="text-white font-medium">{booking.email}</span>.
                    </p>
                </div>

                <div className="p-8 space-y-5">
                    <div className="flex items-start gap-4">
                        <Calendar className="h-5 w-5 text-[#864797] mt-1 shrink-0" />
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">When</p>
                            <p className="text-white font-medium">{when}</p>
                            <p className="text-sm text-gray-400">{booking.timeZone}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Clock className="h-5 w-5 text-[#864797] mt-1 shrink-0" />
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Duration &amp; Fee</p>
                            <p className="text-white font-medium">
                                {booking.durationMin} minutes · {formatPrice(booking.price, booking.currency)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Video className="h-5 w-5 text-[#864797] mt-1 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Meeting Link</p>
                            {booking.meetingLink ? (
                                <a
                                    href={booking.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#0CC0DF] hover:underline break-all font-medium"
                                >
                                    {booking.meetingLink}
                                </a>
                            ) : (
                                <p className="text-gray-400">
                                    Your meeting link will arrive with the calendar invite in your inbox.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 bg-black/20 text-center">
                    <p className="text-sm text-gray-400">
                        Booking reference <span className="text-white font-mono">#{booking.id}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
