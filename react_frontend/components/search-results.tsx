"use client"

import { Clock } from "lucide-react"
import type { CalendarEvent } from "@/lib/api"

interface SearchResultsProps {
  results: Array<CalendarEvent & { calendarName: string }>
  onClose: () => void
  onEventClick: (event: CalendarEvent) => void
  isDarkMode: boolean
}

export default function SearchResults({ results, onClose, onEventClick, isDarkMode }: SearchResultsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div
      className={`absolute top-20 right-8 z-50 w-96 max-h-[70vh] overflow-auto ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl`}
    >
      <div className={`p-4 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
        <h3 className="text-lg font-medium text-white dark:text-white">Search Results ({results.length})</h3>
      </div>

      {results.length === 0 ? (
        <div className="p-6 text-center text-white/70 dark:text-white/70">No events found matching your search.</div>
      ) : (
        <div className={`divide-y ${isDarkMode ? "divide-white/10" : "divide-gray-400"}`}>
          {results.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => {
                onEventClick(event)
                onClose()
              }}
            >
              <h4 className="text-white dark:text-white font-medium mb-1">{event.title}</h4>
              <div className="flex items-center gap-4 text-white/70 dark:text-white/70 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {event.date ? formatDate(event.date) : ""} • {event.startTime}-{event.endTime}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${event.color}`}></div>
                <span className="text-white/70 dark:text-white/70 text-xs">{event.calendarName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
