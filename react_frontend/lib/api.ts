// Mock API service for calendar events

// Define event type
export interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
  calendarId: string
  date?: string
}

// Define calendar type
export interface Calendar {
  id: string
  name: string
  color: string
  visible: boolean
}

// Sample calendars - empty by default
const sampleCalendars: Calendar[] = []

// Sample events data - empty by default
const sampleEvents: CalendarEvent[] = []

// Current date for calendar navigation
let currentCalendarDate = new Date(2025, 2, 5) // March 5, 2025

// Mock API functions with artificial delay
export const api = {
  // Get all calendars
  getCalendars: async (): Promise<Calendar[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...sampleCalendars]
  },

  // Add a new calendar
  addCalendar: async (calendarData: { name: string; color: string }): Promise<Calendar> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newCalendar: Calendar = {
      id: `calendar-${Date.now()}`,
      name: calendarData.name,
      color: calendarData.color,
      visible: true,
    }

    // Add to sample calendars
    sampleCalendars.push(newCalendar)

    return newCalendar
  },

  // Update calendar
  updateCalendar: async (id: string, data: { name?: string; color?: string; visible?: boolean }): Promise<Calendar> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Find the calendar
    const calendarIndex = sampleCalendars.findIndex((cal) => cal.id === id)
    if (calendarIndex === -1) {
      throw new Error("Calendar not found")
    }

    // Update the calendar
    const updatedCalendar = {
      ...sampleCalendars[calendarIndex],
      ...data,
    }

    sampleCalendars[calendarIndex] = updatedCalendar

    // Also update the color of all events in this calendar if color changed
    if (data.color && data.color !== sampleCalendars[calendarIndex].color) {
      sampleEvents.forEach((event) => {
        if (event.calendarId === id) {
          event.color = data.color as string
        }
      })
    }

    return updatedCalendar
  },

  // Delete calendar
  deleteCalendar: async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find the calendar index
    const calendarIndex = sampleCalendars.findIndex((cal) => cal.id === id)
    if (calendarIndex === -1) {
      throw new Error("Calendar not found")
    }

    // Remove the calendar
    sampleCalendars.splice(calendarIndex, 1)

    // Remove all events in this calendar
    const updatedEvents = sampleEvents.filter((event) => event.calendarId !== id)
    sampleEvents.length = 0
    sampleEvents.push(...updatedEvents)
  },

  // Update calendar visibility
  updateCalendarVisibility: async (id: string, visible: boolean): Promise<Calendar[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Update the calendar visibility in our sample data
    const updatedCalendars = sampleCalendars.map((cal) => {
      if (cal.id === id) {
        return { ...cal, visible }
      }
      return cal
    })

    // In a real app, we would persist this change
    // For our mock, we'll update the reference
    sampleCalendars.length = 0
    sampleCalendars.push(...updatedCalendars)

    return [...updatedCalendars]
  },

  // Get events filtered by visible calendars
  getEvents: async (visibleCalendarIds: string[]): Promise<CalendarEvent[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Filter events by visible calendars
    return sampleEvents.filter((event) => visibleCalendarIds.includes(event.calendarId))
  },

  // Search events
  searchEvents: async (query: string, includeHidden = false): Promise<CalendarEvent[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (!query.trim()) {
      return []
    }

    const lowercaseQuery = query.toLowerCase()

    // Filter events by query
    return sampleEvents.filter((event) => {
      // If we're not including hidden calendars, check if the calendar is visible
      if (!includeHidden) {
        const calendar = sampleCalendars.find((cal) => cal.id === event.calendarId)
        if (!calendar?.visible) return false
      }

      // Search in title, description, location, and attendees
      return (
        event.title.toLowerCase().includes(lowercaseQuery) ||
        (event.description && event.description.toLowerCase().includes(lowercaseQuery)) ||
        (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
        event.attendees.some((attendee) => attendee.toLowerCase().includes(lowercaseQuery))
      )
    })
  },

  // Add a new event
  addEvent: async (event: CalendarEvent): Promise<CalendarEvent> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // If the event has a date but no day, calculate the day
    if (event.date && !event.day) {
      event.day = getDayFromDate(event.date)
    }

    // In a real app, we would persist this to a database
    // For our mock, we'll add it to our sample data
    sampleEvents.push(event)

    return event
  },

  // Update an existing event
  updateEvent: async (eventId: string, updatedData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find and update the event
    const eventIndex = sampleEvents.findIndex((event) => event.id === eventId)

    if (eventIndex === -1) {
      throw new Error("Event not found")
    }

    // If the date is being updated, recalculate the day
    if (updatedData.date && (!updatedData.day || updatedData.date !== sampleEvents[eventIndex].date)) {
      updatedData.day = getDayFromDate(updatedData.date)
    }

    // Update the event
    const updatedEvent = {
      ...sampleEvents[eventIndex],
      ...updatedData,
    }

    sampleEvents[eventIndex] = updatedEvent

    return updatedEvent
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Find the event index
    const eventIndex = sampleEvents.findIndex((event) => event.id === eventId)

    if (eventIndex === -1) {
      throw new Error("Event not found")
    }

    // Remove the event
    sampleEvents.splice(eventIndex, 1)
  },

  // Get current calendar date
  getCurrentDate: async (): Promise<Date> => {
    return currentCalendarDate
  },

  // Navigate calendar (previous, next, or today)
  navigateCalendar: async (direction: "prev" | "next" | "today"): Promise<Date> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const newDate = new Date(currentCalendarDate)

    if (direction === "prev") {
      // Go back 7 days for week view
      newDate.setDate(newDate.getDate() - 7)
    } else if (direction === "next") {
      // Go forward 7 days for week view
      newDate.setDate(newDate.getDate() + 7)
    } else if (direction === "today") {
      // Reset to today (for our mock, this is March 5, 2025)
      newDate.setFullYear(2025, 2, 5)
    }

    // Update the current date
    currentCalendarDate = newDate

    return newDate
  },
}

// Add a helper function to calculate day from date
export const getDayFromDate = (dateString: string): number => {
  const date = new Date(dateString)
  return date.getDay() + 1 // 1 = Sunday, 2 = Monday, etc.
}
