"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Users, AlignLeft, Trash2 } from "lucide-react"
import type { CalendarEvent } from "@/lib/api"

interface EditEventModalProps {
  event: CalendarEvent
  onClose: () => void
  onUpdate: (eventId: string, updatedData: Partial<CalendarEvent>) => void
  onDelete: (eventId: string) => void
  calendars: { id: string; name: string; color: string }[]
  isDarkMode: boolean
}

export default function EditEventModal({
  event,
  onClose,
  onUpdate,
  onDelete,
  calendars,
  isDarkMode,
}: EditEventModalProps) {
  const [eventData, setEventData] = useState({
    title: event.title,
    startDate: event.date || new Date().toISOString().split("T")[0],
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location || "",
    description: event.description || "",
    calendarId: event.calendarId,
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the selected calendar to get its color
    const selectedCalendar = calendars.find((cal) => cal.id === eventData.calendarId)

    // Calculate day of week (1-7) from the date
    const day = new Date(eventData.startDate).getDay() + 1

    // Create the updated event object
    const updatedEvent = {
      title: eventData.title,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      date: eventData.startDate,
      location: eventData.location,
      description: eventData.description,
      calendarId: eventData.calendarId,
      color: selectedCalendar?.color || "bg-blue-500",
      day,
    }

    onUpdate(event.id, updatedEvent)
    onClose()
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(event.id)
      onClose()
    } else {
      setConfirmDelete(true)
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
          <h2 className="text-xl font-semibold text-white">Edit Event</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Add title"
              className={`w-full ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg`}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-white/70" />
            <input
              type="date"
              name="startDate"
              value={eventData.startDate}
              onChange={handleChange}
              className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30`}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-white/70" />
            <div className="flex-1 flex gap-2 items-center">
              <input
                type="time"
                name="startTime"
                value={eventData.startTime}
                onChange={handleChange}
                className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30`}
                required
              />
              <span className="text-white">to</span>
              <input
                type="time"
                name="endTime"
                value={eventData.endTime}
                onChange={handleChange}
                className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30`}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-white/70" />
            <input
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              placeholder="Add location"
              className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30`}
            />
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-white/70" />
            <select
              name="calendarId"
              value={eventData.calendarId}
              onChange={handleChange}
              className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30`}
              required
            >
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-3">
            <AlignLeft className="h-5 w-5 text-white/70 mt-1" />
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Add description"
              rows={3}
              className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-md px-3 py-1.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none`}
            ></textarea>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2 ${
                confirmDelete ? "bg-red-600 hover:bg-red-700" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
            <div className="flex gap-3">
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
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
