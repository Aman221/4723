// pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const GO_API_URL = 'http://localhost:8080'; // Adjust if your Go API is running elsewhere

// Define types to match your Go API responses (adjust as needed)
interface GoCalendar {
  ID: string;
  Name: string;
  Color: string;
  Visible: boolean;
}

interface GoCalendarEvent {
  ID: string;
  Title: string;
  StartTime: string;
  EndTime: string;
  Color: string;
  Day: number;
  Description: string;
  Location: string;
  Attendees: string[];
  Organizer: string;
  CalendarID: string;
  Date?: string;
}

// Helper function to fetch from the Go API (reused from calendars.ts or create a shared utility)
const fetchFromGoAPI = async (path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body: any = null) => {
  const url = `${GO_API_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Go API Error (${response.status}):`, errorData);
    throw new Error(`Failed to fetch from Go API: ${response.statusText}`);
  }
  return await response.json();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { visibleCalendarIds } = req.query;
        const ids = Array.isArray(visibleCalendarIds) ? visibleCalendarIds : (visibleCalendarIds ? [visibleCalendarIds] : []);
        const goEvents: GoCalendarEvent[] = await fetchFromGoAPI(`/events?visibleCalendarIds=${ids.join(',')}`);
        // Optionally transform the data
        const events = goEvents.map(event => ({
          id: event.ID,
          title: event.Title,
          startTime: event.StartTime,
          endTime: event.EndTime,
          color: event.Color,
          day: event.Day,
          description: event.Description,
          location: event.Location,
          attendees: event.Attendees,
          organizer: event.Organizer,
          calendarId: event.CalendarID,
          date: event.Date,
        }));
        res.status(200).json(events);
        break;

      case 'POST':
        const eventData = req.body;
        const newGoEvent: GoCalendarEvent = await fetchFromGoAPI('/events', 'POST', eventData);
        // Optionally transform the data
        const newEvent = {
          id: newGoEvent.ID,
          title: newGoEvent.Title,
          startTime: newGoEvent.StartTime,
          endTime: newGoEvent.EndTime,
          color: newGoEvent.Color,
          day: newGoEvent.Day,
          description: newGoEvent.Description,
          location: newGoEvent.Location,
          attendees: newGoEvent.Attendees,
          organizer: newGoEvent.Organizer,
          calendarId: newGoEvent.CalendarID,
          date: newGoEvent.Date,
        };
        res.status(201).json(newEvent);
        break;

      case 'PUT':
        const { id: updateId } = req.query;
        const updatedEventData = req.body;
        const updatedGoEvent: GoCalendarEvent = await fetchFromGoAPI(`/events/${updateId}`, 'PUT', updatedEventData);
        const updatedEvent = {
          id: updatedGoEvent.ID,
          title: updatedGoEvent.Title,
          startTime: updatedGoEvent.StartTime,
          endTime: updatedGoEvent.EndTime,
          color: updatedGoEvent.Color,
          day: updatedGoEvent.Day,
          description: updatedGoEvent.Description,
          location: updatedGoEvent.Location,
          attendees: updatedGoEvent.Attendees,
          organizer: updatedGoEvent.Organizer,
          calendarId: updatedGoEvent.CalendarID,
          date: updatedGoEvent.Date,
        };
        res.status(200).json(updatedEvent);
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        await fetchFromGoAPI(`/events/${deleteId}`, 'DELETE');
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Error handling events:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate with Go API' });
  }
}