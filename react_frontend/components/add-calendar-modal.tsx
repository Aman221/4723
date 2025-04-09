"use client"

import type React from "react"

import { useState } from "react"
import { X, Check } from "lucide-react"

// Available calendar colors
const calendarColors = [
  { id: "blue", class: "bg-blue-500" },
  { id: "green", class: "bg-green-500" },
  { id: "purple", class: "bg-purple-500" },
  { id: "orange", class: "bg-orange-500" },
  { id: "pink", class: "bg-pink-500" },
  { id: "teal", class: "bg-teal-500" },
  { id: "yellow", class: "bg-yellow-500" },
  { id: "red", class: "bg-red-500" },
]

interface AddCalendarModalProps {
  onClose: () => void
  onAdd: (calendarData: { name: string; color: string }) => void
  isDarkMode: boolean
}

export default function AddCalendarModal({ onClose, onAdd, isDarkMode }: AddCalendarModalProps) {
  const [calendarName, setCalendarName] = useState("")
  const [selectedColor, setSelectedColor] = useState(calendarColors[0].class)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (calendarName.trim()) {
      onAdd({
        name: calendarName,
        color: selectedColor,
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-gray-100"} rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl w-full max-w-md mx-4`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}
        >
          <h2 className="text-xl font-semibold text-white">Add Calendar</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="calendar-name" className="block text-white text-sm font-medium mb-2">
              Calendar Name
            </label>
            <input
              id="calendar-name"
              type="text"
              value={calendarName}
              onChange={(e) => setCalendarName(e.target.value)}
              placeholder="Enter calendar name"
              className={`w-full ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30`}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Calendar Color</label>
            <div className="grid grid-cols-4 gap-3">
              {calendarColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={`w-full aspect-square rounded-md ${color.class} flex items-center justify-center transition-transform ${selectedColor === color.class ? "scale-110 ring-2 ring-white" : "hover:scale-105"}`}
                  onClick={() => setSelectedColor(color.class)}
                >
                  {selectedColor === color.class && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              Add Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
