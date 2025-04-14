"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  MoreVertical,
} from "lucide-react"
import SettingsModal from "@/components/settings-modal"
import CreateEventModal from "@/components/create-event-modal"
import EditEventModal from "@/components/edit-event-modal"
import AddCalendarModal from "@/components/add-calendar-modal"
import CalendarMenu from "@/components/calendar-menu"
import UserMenu from "@/components/user-menu"
import { api, type CalendarEvent, type Calendar as CalendarType } from "@/lib/api"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showAddCalendar, setShowAddCalendar] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentBackground, setCurrentBackground] = useState("#F5F5F5") // Default to solid light
  const [calendars, setCalendars] = useState<CalendarType[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 2, 5)) // March 5, 2025
  const [currentView, setCurrentView] = useState("week")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [preFilledEventData, setPreFilledEventData] = useState<any>(null)
  const [calendarMenuOpen, setCalendarMenuOpen] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const username = "Aman" // This would come from authentication in a real app

  useEffect(() => {
    setIsLoaded(true)

    // Fetch calendars and events on component mount
    const fetchCalendarData = async () => {
      setIsLoading(true)
      try {
        // Get all calendars
        const calendarData = await api.getCalendars()
        setCalendars(calendarData)

        // Set initially visible calendars
        const initialVisibleIds = calendarData.filter((cal) => cal.visible).map((cal) => cal.id)
        setVisibleCalendarIds(initialVisibleIds)

        // Get events for visible calendars
        const eventData = await api.getEvents(initialVisibleIds)
        setEvents(eventData)

        // Get current date from API
        const apiDate = await api.getCurrentDate()
        setCurrentDate(apiDate)
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendarData()
  }, [])

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  // Format month for display
  const formatDisplayMonth = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  // Calculate week dates based on current date
  const calculateWeekDates = (date: Date) => {
    const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = date.getDate() - day // Adjust to get Sunday

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date)
      d.setDate(diff + i)
      return d
    })
  }

  const weekDatesObjects = calculateWeekDates(currentDate)
  const weekDates = weekDatesObjects.map(date => date.getDate())
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Navigate calendar
  const navigateCalendar = async (direction: "prev" | "next" | "today") => {
    setIsNavigating(true)
    try {
      const newDate = await api.navigateCalendar(direction)
      setCurrentDate(newDate)

      // Refresh events for the new date range
      const updatedEvents = await api.getEvents(visibleCalendarIds)
      setEvents(updatedEvents)
    } catch (error) {
      console.error("Error navigating calendar:", error)
    } finally {
      setIsNavigating(false)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  // Toggle calendar visibility
  const toggleCalendarVisibility = async (calendarId: string) => {
    // Find the calendar and toggle its visibility
    const calendarToToggle = calendars.find((cal) => cal.id === calendarId)
    if (!calendarToToggle) return

    const newVisibility = !calendarToToggle.visible

    try {
      // Update the calendar visibility in the API
      const updatedCalendars = await api.updateCalendarVisibility(calendarId, newVisibility)
      setCalendars(updatedCalendars)

      // Update visible calendar IDs
      const newVisibleIds = updatedCalendars.filter((cal) => cal.visible).map((cal) => cal.id)
      setVisibleCalendarIds(newVisibleIds)

      // Fetch events for the updated visible calendars
      const updatedEvents = await api.getEvents(newVisibleIds)
      setEvents(updatedEvents)
    } catch (error) {
      console.error("Error toggling calendar visibility:", error)
    }
  }

  // Add a new event
  const handleAddEvent = async (eventData: CalendarEvent) => {
    try {
      const newEvent = await api.addEvent(eventData)
      setEvents((prev) => [...prev, newEvent])
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  // Add a new calendar
  const handleAddCalendar = async (calendarData: { name: string; color: string }) => {
    try {
      const newCalendar = await api.addCalendar(calendarData)
      setCalendars((prev) => [...prev, newCalendar])

      // Automatically make the new calendar visible
      setVisibleCalendarIds((prev) => [...prev, newCalendar.id])
    } catch (error) {
      console.error("Error adding calendar:", error)
    }
  }

  // Update an existing event
  const handleUpdateEvent = async (eventId: string, updatedData: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await api.updateEvent(eventId, updatedData)

      // Update the events list
      setEvents((prev) => prev.map((event) => (event.id === eventId ? updatedEvent : event)))

      // Close the edit modal
      setEditingEvent(null)
    } catch (error) {
      console.error("Error updating event:", error)
    }
  }

  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.deleteEvent(eventId)

      // Remove the event from the events list
      setEvents((prev) => prev.filter((event) => event.id !== eventId))

      // Close any open modals
      setEditingEvent(null)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  // Update a calendar
  const handleUpdateCalendar = async (calendarId: string, data: { name?: string; color?: string }) => {
    try {
      const updatedCalendar = await api.updateCalendar(calendarId, data)
      
      // Update the calendars list
      setCalendars((prev) => prev.map((cal) => (cal.id === calendarId ? updatedCalendar : cal)))
      
      // Update events with the new calendar color if it changed
      if (data.color) {
        setEvents((prev) => 
          prev.map((event) => 
            event.calendarId === calendarId 
              ? { ...event, color: data.color as string } 
              : event
          )
        )
      }
      
      // Close the calendar menu
      setCalendarMenuOpen(null)
    } catch (error) {
      console.error("Error updating calendar:", error)
    }
  }

  // Delete a calendar
  const handleDeleteCalendar = async (calendarId: string) => {
    try {
      await api.deleteCalendar(calendarId)
      
      // Remove the calendar from the calendars list
      setCalendars((prev) => prev.filter((cal) => cal.id !== calendarId))
      
      // Remove all events in this calendar
      setEvents((prev) => prev.filter((event) => event.calendarId !== calendarId))
      
      // Update visible calendar IDs
      setVisibleCalendarIds((prev) => prev.filter((id) => id !== calendarId))
    } catch (error) {
      console.error("Error deleting calendar:", error)
    }
  }

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  const handleTimeSlotDoubleClick = (dayIndex: number, timeIndex: number) => {
    // Calculate the date for the clicked day
    const clickedDate = new Date(currentDate)
    const dayDiff = dayIndex - clickedDate.getDay()
    clickedDate.setDate(clickedDate.getDate() + dayDiff)
    
    // Format the date as YYYY-MM-DD
    const formattedDate = clickedDate.toISOString().split('T')[0]
    
    // Calculate the time for the clicked slot (8AM + timeIndex)
    const startHour = 8 + timeIndex
    const endHour = startHour + 1
    
    // Format times as HH:00
    const startTime = `${startHour.toString().padStart(2, '0')}:00`
    const endTime = `${endHour.toString().padStart(2, '0')}:00`
    
    // Create pre-filled event data
    const preFilledEventData = {
      title: "",
      startDate: formattedDate,
      startTime,
      endTime,
      location: "",
      description: "",
      calendarId: calendars[0]?.id || "",
    }
    
    // Set the pre-filled data and open the create event modal
    setPreFilledEventData(preFilledEventData)
    setShowCreateEvent(true)
  }

  const isToday = (date: Date) => {
    const today = new Date(); // Get the actual current date and time
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Function to render day view
  const renderDayView = () => {
    const dayIndex = currentDate.getDay()
    
    return (
      <div className={`${isDarkMode ? "bg-white/20" : "bg-white/80"} backdrop-blur-lg rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl h-full`}>
        {/* Day Header */}
        <div className={`grid grid-cols-2 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
          <div className="p-2 text-center text-white/50 dark:text-white/50 text-xs"></div>
          <div className={`p-2 text-center border-l ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
            <div className="text-xs text-white/70 dark:text-white/70 font-medium">{weekDays[dayIndex]}</div>
            <div
              className={`text-lg font-medium mt-1 text-white dark:text-white ${
                isToday(currentDate)
                  ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                  : ""
              }`}
            >
              {currentDate.getDate()}
            </div>
          </div>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2">
          {/* Time Labels */}
          <div className="text-white/70 dark:text-white/70">
            {timeSlots.map((time, i) => (
              <div key={i} className={`h-20 border-b ${isDarkMode ? "border-white/10" : "border-gray-300"} pr-2 text-right text-xs`}>
                {time > 12 ? `${time - 12} PM` : `${time} AM`}
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className={`border-l ${isDarkMode ? "border-white/20" : "border-gray-400"} relative`}>
            {timeSlots.map((_, timeIndex) => (
              <div 
                key={timeIndex} 
                className={`h-20 border-b ${isDarkMode ? "border-white/10" : "border-gray-300"}`}
                onDoubleClick={() => handleTimeSlotDoubleClick(dayIndex, timeIndex)}
              ></div>
            ))}

            {/* Events */}
            {isLoading || isNavigating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
              </div>
            ) : (
              events
                .filter((event) => {
                  if (event.date) {
                    const eventDate = new Date(event.date)
                    return (
                      eventDate.getDate() === currentDate.getDate() &&
                      eventDate.getMonth() === currentDate.getMonth() &&
                      eventDate.getFullYear() === currentDate.getFullYear()
                    )
                  }
                  return event.day === dayIndex + 1
                })
                .map((event, i) => {
                  const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                  return (
                    <div
                      key={i}
                      className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                      style={{
                        ...eventStyle,
                        left: "4px",
                        right: "4px",
                      }}
                      onClick={() => setEditingEvent(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>
    )
  }

  // Function to render month view
  const renderMonthView = () => {
    // Get first day of the month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const firstDayIndex = firstDay.getDay()
    
    // Get number of days in the month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    
    // Create array of days
    const days = Array.from({ length: 42 }, (_, i) => {
      const dayNumber = i - firstDayIndex + 1
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        return dayNumber
      }
      return null
    })
    
    // Group events by date
    const eventsByDate: Record<string, CalendarEvent[]> = {}
    events.forEach(event => {
      if (event.date) {
        const date = new Date(event.date)
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
          const day = date.getDate()
          if (!eventsByDate[day]) {
            eventsByDate[day] = []
          }
          eventsByDate[day].push(event)
        }
      }
    })
    
    return (
      <div className={`${isDarkMode ? "bg-white/20" : "bg-white/80"} backdrop-blur-lg rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl h-full p-4`}>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-white/70 dark:text-white/70 font-medium p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, i) => {
            const today = new Date(2025, 2, 5) // March 5, 2025 as "today" for this app
            const isCurrentDay = 
              day === today.getDate() && 
              currentDate.getMonth() === today.getMonth() && 
              currentDate.getFullYear() === today.getFullYear()
            
            return (
              <div 
                key={i} 
                className={`min-h-24 p-1 border ${isDarkMode ? "border-white/10" : "border-gray-300"} rounded-md ${
                  day ? (isDarkMode ? 'bg-white/5' : 'bg-white/30') : 'bg-transparent'
                }`}
                onDoubleClick={() => {
                  if (day) {
                    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const formattedDate = clickedDate.toISOString().split('T')[0]
                    
                    setPreFilledEventData({
                      title: "",
                      startDate: formattedDate,
                      startTime: "09:00",
                      endTime: "10:00",
                      location: "",
                      description: "",
                      calendarId: calendars[0]?.id || "",
                    })
                    setShowCreateEvent(true)
                  }
                }}
              >
                {day && (
                  <>
                    <div className={`text-right mb-1 ${
                      isCurrentDay 
                        ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center ml-auto" 
                        : "text-white dark:text-white"
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {eventsByDate[day]?.slice(0, 3).map((event, idx) => (
                        <div 
                          key={idx}
                          className={`${event.color} text-white text-xs p-1 rounded truncate cursor-pointer`}
                          onClick={() => setEditingEvent(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      {eventsByDate[day]?.length > 3 && (
                        <div className="text-white/70 dark:text-white/70 text-xs text-center">
                          +{eventsByDate[day].length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Function to render week view
  const renderWeekView = () => {
    return (
      <div className={`${isDarkMode ? "bg-white/20" : "bg-white/80"} backdrop-blur-lg rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl h-full`}>
        {/* Week Header */}
        <div className={`grid grid-cols-8 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
          <div className="p-2 text-center text-white/50 dark:text-white/50 text-xs"></div>
          {weekDays.map((day, i) => {
            const date = weekDatesObjects[i]
            const isCurrentDay = isToday(date)
            
            return (
              <div key={i} className={`p-2 text-center border-l ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
                <div className="text-xs text-white/70 dark:text-white/70 font-medium">{day}</div>
                <div
                  className={`text-lg font-medium mt-1 text-white dark:text-white ${
                    isCurrentDay
                      ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                      : ""
                  }`}
                >
                  {weekDates[i]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-8">
          {/* Time Labels */}
          <div className="text-white/70 dark:text-white/70">
            {timeSlots.map((time, i) => (
              <div key={i} className={`h-20 border-b ${isDarkMode ? "border-white/10" : "border-gray-300"} pr-2 text-right text-xs`}>
                {time > 12 ? `${time - 12} PM` : `${time} AM`}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className={`border-l ${isDarkMode ? "border-white/20" : "border-gray-400"} relative`}>
              {timeSlots.map((_, timeIndex) => (
                <div 
                  key={timeIndex} 
                  className={`h-20 border-b ${isDarkMode ? "border-white/10" : "border-gray-300"}`}
                  onDoubleClick={() => handleTimeSlotDoubleClick(dayIndex, timeIndex)}
                ></div>
              ))}

              {/* Events */}
              {isLoading || isNavigating ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              ) : (
                events
                  .filter((event) => {
                    if (event.date) {
                      const eventDate = new Date(event.date)
                      const columnDate = weekDatesObjects[dayIndex]
                      return (
                        eventDate.getDate() === columnDate.getDate() &&
                        eventDate.getMonth() === columnDate.getMonth() &&
                        eventDate.getFullYear() === columnDate.getFullYear()
                      )
                    }
                    return event.day === dayIndex + 1
                  })
                  .map((event, i) => {
                    const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                    return (
                      <div
                        key={i}
                        className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                        style={{
                          ...eventStyle,
                          left: "4px",
                          right: "4px",
                        }}
                        onClick={() => setEditingEvent(event)}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                      </div>
                    )
                  })
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Apply light mode class to body
  useEffect(() => {
    if (!isDarkMode) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }, [isDarkMode])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      {currentBackground.startsWith('#') ? (
        <div 
          className="absolute inset-0 z-0" 
          style={{ backgroundColor: currentBackground }}
        />
      ) : (
        <Image
          src={currentBackground || "/placeholder.svg"}
          alt="Background landscape"
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarVisible(!sidebarVisible)}>
            <Menu className="h-6 w-6 text-white dark:text-white" />
          </button>
          <span className="text-2xl font-semibold text-white dark:text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettings(true)}>
            <Settings className="h-6 w-6 text-white dark:text-white drop-shadow-md" />
          </button>
          <div 
            className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          
          {userMenuOpen && (
            <UserMenu onClose={() => setUserMenuOpen(false)} username={username} isDarkMode={isDarkMode} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full ${isDarkMode ? "bg-white/10" : "bg-white/80"} backdrop-blur-lg p-4 shadow-xl border-r ${isDarkMode ? "border-white/20" : "border-gray-400"} rounded-tr-3xl opacity-0 ${
            isLoaded ? "animate-fade-in" : ""
          } flex flex-col justify-between ${
            sidebarVisible ? "" : "hidden"
          }`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
              onClick={() => setShowCreateEvent(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white dark:text-white font-medium">{formatDisplayMonth(currentDate)}</h3>
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded-full hover:bg-white/20"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 text-white dark:text-white" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-white/20"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-white dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 dark:text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => {
                  const today = new Date(2025, 2, 5) // March 5, 2025 as "today" for this app
                  const isCurrentDay = 
                    day === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear()
                  
                  return (
                    <div
                      key={i}
                      className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                        isCurrentDay ? "bg-blue-500 text-white" : "text-white dark:text-white hover:bg-white/20"
                      } ${!day ? "invisible" : ""}`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white dark:text-white font-medium">My calendars</h3>
                <button
                  className="p-1 rounded-full hover:bg-white/20 text-white dark:text-white"
                  onClick={() => setShowAddCalendar(true)}
                  aria-label="Add calendar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {calendars.map((cal) => (
                  <div key={cal.id} className="flex items-center gap-3">
                    <button
                      className={`w-3 h-3 rounded-sm ${cal.visible ? cal.color : "bg-white/30"}`}
                      onClick={() => toggleCalendarVisibility(cal.id)}
                      aria-label={`Toggle ${cal.name} visibility`}
                    ></button>
                    <span className={`text-white dark:text-white text-sm ${!cal.visible ? "opacity-50" : ""}`}>
                      {cal.name}
                    </span>
                    <button
                      className="ml-auto p-1 rounded-full hover:bg-white/20 text-white/70 dark:text-white/70 hover:text-white dark:hover:text-white"
                      onClick={() => setCalendarMenuOpen(cal.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New position for the big plus button */}
          <button
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start"
            onClick={() => setShowCreateEvent(true)}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-md" onClick={() => navigateCalendar("today")}>
                Today
              </button>
              <div className="flex">
                <button
                  className="p-2 text-white dark:text-white hover:bg-white/10 rounded-l-md"
                  onClick={() => navigateCalendar("prev")}
                  disabled={isNavigating}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-white dark:text-white hover:bg-white/10 rounded-r-md"
                  onClick={() => navigateCalendar("next")}
                  disabled={isNavigating}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white dark:text-white">{formatDisplayDate(currentDate)}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white dark:text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white dark:text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white dark:text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            {currentView === "day" && renderDayView()}
            {currentView === "week" && renderWeekView()}
            {currentView === "month" && renderMonthView()}
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location || "No location"}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${formatDisplayMonth(currentDate)}`}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.length > 0 ? selectedEvent.attendees.join(", ") : "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description || "No description"}
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  className="bg-white/20 text-white px-4 py-2 rounded hover:bg-white/30 transition-colors"
                  onClick={() => {
                    setEditingEvent(selectedEvent)
                    setSelectedEvent(null)
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            currentBackground={currentBackground}
            setCurrentBackground={setCurrentBackground}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}

        {/* Create Event Modal */}
        {showCreateEvent && (
          <CreateEventModal 
            onClose={() => {
              setShowCreateEvent(false);
              setPreFilledEventData(null);
            }} 
            onSave={handleAddEvent} 
            calendars={calendars}
            preFilledData={preFilledEventData}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            calendars={calendars}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Add Calendar Modal */}
        {showAddCalendar && <AddCalendarModal onClose={() => setShowAddCalendar(false)} onAdd={handleAddCalendar} isDarkMode={isDarkMode} />}

        {/* Calendar Menu Modal */}
        {calendarMenuOpen && (
          <CalendarMenu
            calendar={calendars.find(cal => cal.id === calendarMenuOpen)!}
            onClose={() => setCalendarMenuOpen(null)}
            onDelete={handleDeleteCalendar}
            onUpdate={handleUpdateCalendar}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  )
}
