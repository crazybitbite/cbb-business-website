"use client"

import { Plus, Trash2 } from "lucide-react"
import {
    WEEKDAYS,
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME,
    type ConsultationHours,
    type DayHours,
    type PauseWindow,
} from "@/lib/booking"

interface Props {
    hours: ConsultationHours
    pauses: PauseWindow[]
    onHoursChange: (h: ConsultationHours) => void
    onPausesChange: (p: PauseWindow[]) => void
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function ConsultationEditor({ hours, pauses, onHoursChange, onPausesChange }: Props) {
    const input = "rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-orange-500 focus:outline-none disabled:opacity-40"

    const dayOf = (key: string): DayHours => hours[key] || { enabled: true, open: DEFAULT_OPEN_TIME, close: DEFAULT_CLOSE_TIME }

    const setDay = (key: string, patch: Partial<DayHours>) => {
        const current = dayOf(key)
        onHoursChange({ ...hours, [key]: { ...current, ...patch } })
    }

    const setPause = (i: number, patch: Partial<PauseWindow>) => {
        onPausesChange(pauses.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
    }
    const addPause = () => onPausesChange([...pauses, { start: "", end: "", reason: "" }])
    const removePause = (i: number) => onPausesChange(pauses.filter((_, idx) => idx !== i))

    return (
        <div className="space-y-6">
            {/* Weekly hours */}
            <div>
                <p className="text-sm text-gray-400 mb-3">
                    Set bookable hours for each day. Untick a day to close it. Days left untouched use the default
                    work hours ({DEFAULT_OPEN_TIME}–{DEFAULT_CLOSE_TIME}).
                </p>
                <div className="space-y-2">
                    {WEEKDAYS.map((key) => {
                        const day = dayOf(key)
                        const enabled = day.enabled !== false
                        return (
                            <div key={key} className="flex items-center gap-3 flex-wrap">
                                <label className="flex items-center gap-2 w-40 shrink-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enabled}
                                        onChange={(e) => setDay(key, { enabled: e.target.checked })}
                                        className="h-4 w-4 accent-orange-500"
                                    />
                                    <span className="text-white font-medium">{cap(key)}</span>
                                </label>
                                {enabled ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={day.open || DEFAULT_OPEN_TIME}
                                            onChange={(e) => setDay(key, { open: e.target.value })}
                                            className={input}
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="time"
                                            value={day.close || DEFAULT_CLOSE_TIME}
                                            onChange={(e) => setDay(key, { close: e.target.value })}
                                            className={input}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">Closed</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Pause windows */}
            <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Pause bookings</h3>
                    <button
                        type="button"
                        onClick={addPause}
                        className="inline-flex items-center gap-1 text-sm rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-white hover:bg-white/10"
                    >
                        <Plus className="h-4 w-4" /> Add window
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                    During these date-time ranges no consultation can be booked; those slots appear as already booked
                    to visitors.
                </p>
                {pauses.length === 0 ? (
                    <p className="text-sm text-gray-500">No pause windows.</p>
                ) : (
                    <div className="space-y-2">
                        {pauses.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 flex-wrap rounded-lg bg-white/5 border border-white/10 p-2">
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-500 mb-0.5">From</span>
                                    <input
                                        type="datetime-local"
                                        value={p.start || ""}
                                        onChange={(e) => setPause(i, { start: e.target.value })}
                                        className={input}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-500 mb-0.5">To</span>
                                    <input
                                        type="datetime-local"
                                        value={p.end || ""}
                                        onChange={(e) => setPause(i, { end: e.target.value })}
                                        className={input}
                                    />
                                </div>
                                <div className="flex flex-col flex-1 min-w-[140px]">
                                    <span className="text-[11px] text-gray-500 mb-0.5">Reason (optional, internal)</span>
                                    <input
                                        type="text"
                                        value={p.reason || ""}
                                        placeholder="e.g. Holiday"
                                        onChange={(e) => setPause(i, { reason: e.target.value })}
                                        className={input}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePause(i)}
                                    className="mt-4 p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                                    aria-label="Remove"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
