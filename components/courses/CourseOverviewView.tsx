import Link from "next/link"
import { ArrowRight, PlayCircle } from "lucide-react"
import { Breadcrumb } from "@/components/PageRenderer"
import { CourseSidebar } from "@/components/CourseNav"
import type { CourseOverviewData, CrumbItem } from "@/lib/pageData"

/** Landing page for one course: syllabus by level + persistent lesson sidebar. */
export function CourseOverviewView({ overview, crumbItems }: { overview: CourseOverviewData; crumbItems: CrumbItem[] }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-24">
                <div className="flex gap-8">
                    <CourseSidebar outline={overview.outline} />

                    <div className="flex-1 min-w-0 max-w-3xl">
                        <Breadcrumb items={crumbItems} />

                        {overview.image && (
                            <figure className="mt-2 mb-6 rounded-2xl overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={overview.image} alt={overview.name} className="w-full aspect-[16/9] object-cover" />
                            </figure>
                        )}

                        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{overview.name}</h1>
                        <p className="text-lg text-gray-400 mb-6">{overview.description}</p>

                        {overview.firstLessonSlug && (
                            <Link
                                href={`/${overview.firstLessonSlug}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-bold transition-colors mb-10"
                            >
                                <PlayCircle className="h-5 w-5" /> Start the course
                            </Link>
                        )}

                        <h2 className="text-xl font-bold mb-4">What you&apos;ll learn</h2>
                        <div className="space-y-5">
                            {overview.levels.map((level, li) => (
                                <div key={level.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white">{li + 1}</span>
                                        <h3 className="text-lg font-bold text-white">{level.name}</h3>
                                        <span className="text-xs text-gray-500">{level.lessons.length} lessons</span>
                                    </div>
                                    <ol className="space-y-1.5">
                                        {level.lessons.map((lesson, i) => (
                                            <li key={lesson.id}>
                                                <Link href={`/${lesson.slug}`} className="group flex items-start gap-2 text-sm text-gray-300 hover:text-orange-300 transition-colors">
                                                    <span className="text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                                                    <span>{lesson.name}</span>
                                                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
