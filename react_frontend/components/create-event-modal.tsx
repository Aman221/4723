"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Users, AlignLeft, Upload, FileUp } from "lucide-react"

interface CreateEventModalProps {
  onClose: () => void
  onSave: (eventData: any) => void
  calendars: { id: string; name: string; color: string }[]
  preFilledData?: {
    title: string
    startDate: string
    startTime: string
    endTime: string
    location: string
    description: string
    calendarId: string
  } | null
  isDarkMode: boolean
}

export default function CreateEventModal({
  onClose,
  onSave,
  calendars,
  preFilledData,
  isDarkMode,
}: CreateEventModalProps) {
  const [eventData, setEventData] = useState({
    title: preFilledData?.title || "",
    startDate: preFilledData?.startDate || new Date().toISOString().split("T")[0],
    startTime: preFilledData?.startTime || "09:00",
    endTime: preFilledData?.endTime || "10:00",
    location: preFilledData?.location || "",
    description: preFilledData?.description || "",
    calendarId: preFilledData?.calendarId || calendars[0]?.id || "",
  })

  const [showImportMenu, setShowImportMenu] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the selected calendar to get its color
    const selectedCalendar = calendars.find((cal) => cal.id === eventData.calendarId)

    // Create the event object with all necessary data
    const newEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      date: eventData.startDate,
      location: eventData.location,
      description: eventData.description,
      calendarId: eventData.calendarId,
      color: selectedCalendar?.color || "bg-blue-500",
      // Calculate day of week (1-7) from the date
      day: new Date(eventData.startDate).getDay() + 1,
      attendees: [],
      organizer: "You",
    }

    onSave(newEvent)
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, we would process the .ics file here
    // For now, we'll just show a success message and close the import menu
    if (e.target.files && e.target.files.length > 0) {
      alert(`File "${e.target.files[0].name}" would be imported in a real application.`)
      setShowImportMenu(false)
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
          <h2 className="text-xl font-semibold text-white">Create Event</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {showImportMenu ? (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-white mb-2">Import from .ics file</h3>
            <p className="text-white/70 text-sm">
              Upload an .ics file to import events from other calendar applications.
            </p>

            <div
              className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed ${isDarkMode ? "border-white/30" : "border-gray-400"} rounded-lg p-6`}
            >
              <FileUp className="h-12 w-12 text-white/50 mb-3" />
              <p className="text-white text-center mb-4">Drag and drop your .ics file here, or click to browse</p>

              <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors cursor-pointer">
                <input type="file" accept=".ics" className="hidden" onChange={handleFileUpload} />
                Browse Files
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowImportMenu(false)}
                className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
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

            <button
              type="button"
              onClick={() => setShowImportMenu(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import from .ics file
            </button>

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
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
