import Link from "next/link"

export interface Course {
    id: string
    name: string
    description: string
    price: number
    category: string
    featured?: boolean
    subCategory?: string
    shortDescription?: string
}

interface CourseListProps {
    courses?: Course[]
    total_columns?: number
    featured_only?: boolean
    total_rows?: number
    category?: string
}

export function CourseList({ courses = [], total_columns = 3, featured_only = false, total_rows = 9, category = "all" }: CourseListProps) {
    let filtered = courses
    if (category !== "all") filtered = filtered.filter(c => c.category === category)
    if (featured_only) filtered = filtered.filter(c => c.featured)
    filtered = filtered.slice(0, total_rows)
    return (
        <div className={`grid gap-8 md:grid-cols-${total_columns}`}>
            {filtered.length === 0 ? (
                <div className={`col-span-${total_columns} text-center text-gray-500 dark:text-gray-400 py-12`}>
                    No courses available yet. Check back soon!
                </div>
            ) : (
                filtered.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                ))
            )}
        </div>
    )
}

export function CourseCard({ course, index }: { course: Course; index: number }) {
    return (
        <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden hover:border-orange-500/50 transition-colors group shadow-sm dark:shadow-none">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/courses/${course.id}`}>
                        <button className="bg-white text-black px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{course.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{course.category}</p>
                    </div>
                    <span className="text-orange-500 dark:text-orange-400 font-bold">${course.price.toFixed(2)}</span>
                </div>
                <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg transition-colors">
                    <span>Enroll Now</span>
                </button>
            </div>
        </div>
    )
}
