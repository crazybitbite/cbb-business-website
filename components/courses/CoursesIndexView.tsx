import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import type { CourseCard } from "@/lib/pageData"

/** Grid of course overview cards for /digital-products/courses. */
export function CoursesIndexView({ courses }: { courses: CourseCard[] }) {
    return (
        <div className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                    Courses
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Structured learning paths from beginner to advanced. Pick a track and start learning.
                </p>
            </div>

            {courses.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No courses available yet.</p>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Link
                            key={course.slug}
                            href={`/${course.slug}`}
                            className="group flex flex-col rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden hover:border-orange-500/40 hover:-translate-y-1 transition-all"
                        >
                            <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                {course.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen className="h-10 w-10" /></div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 p-5">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                                    {course.name}
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex-1">{course.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {course.levels.map((lv) => (
                                        <span key={lv.name} className="rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium px-2.5 py-1">
                                            {lv.name} · {lv.count}
                                        </span>
                                    ))}
                                </div>
                                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-500 dark:text-orange-400">
                                    {course.totalLessons} lessons — Start learning <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
