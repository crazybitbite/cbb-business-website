import { prisma } from "@/lib/prisma"
import { Mail } from "lucide-react"
import Link from "next/link"
import { ServiceCards } from "@/components/ServiceCards"
import { PageShowcase } from "@/components/home/PageShowcase"
export const dynamic = "force-dynamic"

export default async function Services() {
    // const services = await prisma.service.findMany({
    //     orderBy: { createdAt: "desc" },
    // })

    return (
        <div className="container mx-auto px-4 py-4">
            {/* Services Section */}
            <section id="services" className="py-24 bg-white dark:bg-transparent">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">Our Services</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Comprehensive digital solutions tailored to your needs.
                        </p>
                    </div>
                    <ServiceCards total_columns={4} />
                    {/* <PageShowcase category="Services" variant="readmore" columns={2} /> */}
                </div>
            </section>
            {/* Contact Section */}
            <section id="contact" className="py-0 bg-white dark:bg-transparent">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 border border-black/10 dark:border-white/10 p-8 md:p-12 text-center">
                        <Mail className="h-12 w-12 text-gray-900 dark:text-white mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Didn't find matching service above?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                            No worries! Reach out to us for customized solutions tailored to your unique needs.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block rounded-full bg-black dark:bg-white px-8 py-3 font-semibold text-white dark:text-black transition-transform hover:scale-105"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-12">
                        No services available at the moment.
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-lg dark:hover:bg-white/10 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{service.name}</h3>
                            <div className="text-3xl font-bold text-orange-500 mb-6">
                                ${service.price.toFixed(2)}<span className="text-lg text-gray-500 dark:text-gray-400 font-normal">/starting</span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 mb-8 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />

                            <button className="w-full py-3 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors">
                                Get Started
                            </button>
                        </div>
                    ))
                )}
            </div> */}
        </div>
    )
}
