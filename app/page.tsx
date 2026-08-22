"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import { ServiceCards } from "@/components/ServiceCards"
import { PageShowcase } from "@/components/home/PageShowcase"
export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section id="home" className="relative flex min-h-[90vh] items-center justify-center px-4 text-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="z-10 max-w-4xl space-y-6"
        >
          <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white sm:text-7xl md:text-8xl">
            Technology <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600">
              Reimagined
            </span>
          </h1>
          <p>Pushing the Boundaries of Digital Innovation</p>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            We fuse AI innovation, advanced technology, and expert craftsmanship to create intelligent, future-ready web, software, chatbot, and mobile solutions.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-black dark:bg-white px-8 py-3 font-semibold text-white dark:text-black transition-transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/10 px-8 py-3 font-semibold text-gray-900 dark:text-white backdrop-blur-sm transition-colors hover:bg-black/10 dark:hover:bg-white/20"
            >
              View Work
            </Link>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">About <span className="font-bold text-gray-900 dark:text-white">
            Crazy<span className="text-2xl text-orange-500">Bit</span>Bite</span></h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                We are a passionate team of engineers, developers and designers focused on building intelligent digital experiences. By combining AI-driven technologies with clean, modern design, we deliver impactful web solutions, <b>automations</b>, software development, smart chatbots, and high-performance mobile applications.
              </p>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none">
                  <h3 className="text-2xl font-bold text-orange-500 dark:text-orange-400">50+</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none">
                  <h3 className="text-2xl font-bold text-pink-500 dark:text-pink-400">100%</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Client Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 border border-black/10 dark:border-white/10 flex items-center justify-center">
              <div className="text-gray-500 w-full h-full">
                {/* <video autoPlay loop muted className="w-full h-full object-cover">
                  <source src="https://cdnl.iconscout.com/lottie/premium/preview-watermark/creative-idea-animation-gif-download-4429969.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video> */}
                <video autoPlay loop muted className="w-full h-full object-cover">
                  <source src="https://cdnl.iconscout.com/lottie/premium/preview-watermark/business-meeting-animation-gif-download-3463552.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
          {/* <PageShowcase category="Services" variant="readmore" columns={4} /> */}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-gray-50/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">Featured Digital Products</h2>
              <p className="text-gray-600 dark:text-gray-400">Check out some of our recent work.</p>
            </div>
            <Link href="/pages" className="hidden md:flex items-center text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <PageShowcase category="Digital Products" variant="product" columns={3} />
          <div className="mt-8 text-center md:hidden">
            <Link href="/pages" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 inline-flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pages Section */}
      <section id="pages" className="py-24 bg-white dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">Pages</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              High-quality assets and templates for your next project.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden hover:border-orange-500/50 transition-colors">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Product {i}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">3D Model</p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 dark:text-orange-400 font-bold">$29.00</span>
                    <button className="text-xs bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white px-3 py-1 rounded-full transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-gray-50/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-12 text-center">Latest Insights</h2>
          <PageShowcase category="Blog" variant="readmore" columns={3} />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-transparent">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 border border-black/10 dark:border-white/10 p-8 md:p-12 text-center">
            <Mail className="h-12 w-12 text-gray-900 dark:text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to start your project?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
              Let's create something amazing together. Reach out to us and we'll get back to you within 24 hours.
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
    </div>
  )
}
