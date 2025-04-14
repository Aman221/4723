// Real API service for calendar events connecting to backend at 127.0.0.1:8080

// Keep the same interfaces
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

export interface Calendar {
  id: string
  name: string
  color: string
  visible: boolean
}

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8080';

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // credentials: 'include', // Include cookies if your API uses session authentication
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  // For DELETE requests that don't return content
  if (method === 'DELETE' && response.status === 204) {
    return {} as T;
  }
  
  return await response.json();
};

// Helper function to handle query parameters
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(`${key}[]`, item.toString()));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Calculate day from date (keep local helper function)
export const getDayFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getDay() + 1; // 1 = Sunday, 2 = Monday, etc.
};

// Real API implementation
export const api = {
  // Get all calendars
  getCalendars: async (): Promise<Calendar[]> => {
    return apiRequest<Calendar[]>('/calendars');
  },

  // Add a new calendar
  addCalendar: async (calendarData: { name: string; color: string }): Promise<Calendar> => {
    return apiRequest<Calendar>('/calendars', 'POST', calendarData);
  },

  // Update calendar
  updateCalendar: async (id: string, data: { name?: string; color?: string; visible?: boolean }): Promise<Calendar> => {
    return apiRequest<Calendar>(`/calendars/${id}`, 'PUT', data);
  },

  // Delete calendar
  deleteCalendar: async (id: string): Promise<void> => {
    await apiRequest<void>(`/calendars/${id}`, 'DELETE');
  },

  // Update calendar visibility
  updateCalendarVisibility: async (id: string, visible: boolean): Promise<Calendar[]> => {
    await apiRequest<Calendar>(`/calendars/${id}/visibility`, 'PUT', { visible });
    // Get updated list of calendars after the change
    return api.getCalendars();
  },

  // Get events filtered by visible calendars
  getEvents: async (visibleCalendarIds: string[]): Promise<CalendarEvent[]> => {
    const queryString = buildQueryString({ calendarIds: visibleCalendarIds });
    return apiRequest<CalendarEvent[]>(`/events${queryString}`);
  },

  // Search events
  searchEvents: async (query: string, includeHidden = false): Promise<CalendarEvent[]> => {
    const queryString = buildQueryString({ 
      query, 
      includeHidden: includeHidden.toString() 
    });
    return apiRequest<CalendarEvent[]>(`/events/search${queryString}`);
  },

  // Add a new event
  addEvent: async (event: CalendarEvent): Promise<CalendarEvent> => {
    // If the event has a date but no day, calculate the day
    if (event.date && !event.day) {
      event.day = getDayFromDate(event.date);
    }
    
    return apiRequest<CalendarEvent>('/events', 'POST', event);
  },

  // Update an existing event
  updateEvent: async (eventId: string, updatedData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    // If the date is being updated, recalculate the day
    if (updatedData.date && !updatedData.day) {
      updatedData.day = getDayFromDate(updatedData.date);
    }
    
    return apiRequest<CalendarEvent>(`/events/${eventId}`, 'PUT', updatedData);
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<void> => {
    await apiRequest<void>(`/events/${eventId}`, 'DELETE');
  },

  // Get current calendar date
  getCurrentDate: async (): Promise<Date> => {
    const response = await apiRequest<{ currentDate: string }>('/calendar/current-date');
    return new Date(response.currentDate);
  },

  // Navigate calendar (previous, next, or today)
  navigateCalendar: async (direction: "prev" | "next" | "today"): Promise<Date> => {
    const response = await apiRequest<{ currentDate: string }>(
      `/calendar/navigate/${direction}`, 
      'POST'
    );
    return new Date(response.currentDate);
  },
};