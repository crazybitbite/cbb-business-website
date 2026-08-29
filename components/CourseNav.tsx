"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, ArrowLeft, ArrowRight, CheckCircle2, Circle, Menu, X } from "lucide-react"

interface Lesson { id: number; name: string; slug: string }
interface Level { name: string; lessons: Lesson[] }
export interface CourseOutlineData {
    courseName: string
    levels: Level[]
    prev: Lesson | null
    next: Lesson | null
    currentId: number
    currentLevel: string
    lessonNumberInLevel: number
}

/** Left sidebar listing a course's levels and ordered, numbered lessons. */
export function CourseSidebar({ outline }: { outline: CourseOutlineData }) {
    const [open, setOpen] = useState(false) // mobile drawer

    const body = (
        <nav className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{outline.courseName}</p>
            {outline.levels.map((level) => (
                <LevelGroup key={level.name} level={level} currentId={outline.currentId} defaultOpen={level.name === outline.currentLevel} />
            ))}
        </nav>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setOpen(true)}
                className="xl:hidden inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white mb-4"
            >
                <Menu className="h-4 w-4" /> Course contents
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden xl:block w-64 shrink-0">
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-5">
                    {body}
                </div>
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="xl:hidden fixed inset-0 z-[90]">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-gray-900 border-r border-white/10 p-5">
                        <button onClick={() => setOpen(false)} className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                            <X className="h-4 w-4" /> Close
                        </button>
                        {body}
                    </div>
                </div>
            )}
        </>
    )
}

function LevelGroup({ level, currentId, defaultOpen }: { level: Level; currentId: number; defaultOpen: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-sm font-bold text-white py-1"
            >
                <span>{level.name}</span>
                {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </button>
            {open && (
                <ol className="mt-1 space-y-0.5">
                    {level.lessons.map((lesson, i) => {
                        const active = lesson.id === currentId
                        return (
                            <li key={lesson.id}>
                                <Link
                                    href={`/${lesson.slug}`}
                                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${active ? "bg-orange-500/15 text-orange-300 font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                                >
                                    {active
                                        ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-400" />
                                        : <Circle className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-600" />}
                                    <span><span className="text-gray-500">{i + 1}.</span> {lesson.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ol>
            )}
        </div>
    )
}

/** Previous / Next lesson links shown at the bottom of a course lesson. */
export function CoursePrevNext({ prev, next }: { prev: Lesson | null; next: Lesson | null }) {
    if (!prev && !next) return null
    return (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 border-t border-white/10 pt-8">
            {prev ? (
                <Link href={`/${prev.slug}`} className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:border-orange-500/40 transition-colors">
                    <span className="flex items-center gap-1 text-xs text-gray-500 mb-1"><ArrowLeft className="h-3 w-3" /> Previous</span>
                    <span className="text-sm font-medium text-white group-hover:text-orange-300">{prev.name}</span>
                </Link>
            ) : <div />}
            {next ? (
                <Link href={`/${next.slug}`} className="group rounded-xl border border-white/10 bg-white/5 p-4 text-right hover:border-orange-500/40 transition-colors">
                    <span className="flex items-center justify-end gap-1 text-xs text-gray-500 mb-1">Next <ArrowRight className="h-3 w-3" /></span>
                    <span className="text-sm font-medium text-white group-hover:text-orange-300">{next.name}</span>
                </Link>
            ) : <div />}
        </div>
    )
}
