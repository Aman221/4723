// pages/api/calendars.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const GO_API_URL = 'http://localhost:8080'; // Adjust if your Go API is running elsewhere

// Define types to match your Go API responses (adjust as needed)
interface GoCalendar {
  ID: string; // Assuming Go uses 'ID' by convention
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
  Date?: string;
}

// Helper function to fetch from the Go API
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
        const goCalendars: GoCalendar[] = await fetchFromGoAPI('/calendars');
        // Optionally transform the data if needed
        const calendars = goCalendars.map(cal => ({
          id: cal.ID,
          name: cal.Name,
          color: cal.Color,
          visible: cal.Visible,
        }));
        res.status(200).json(calendars);
        break;

      case 'POST':
        const { name, color } = req.body;
        const newGoCalendar: GoCalendar = await fetchFromGoAPI('/calendars', 'POST', { Name: name, Color: color });
        // Optionally transform the data
        const newCalendar = {
          id: newGoCalendar.ID,
          name: newGoCalendar.Name,
          color: newGoCalendar.Color,
          visible: newGoCalendar.Visible,
        };
        res.status(201).json(newCalendar);
        break;

      // Add PUT and DELETE handlers for updating and deleting calendars
      case 'PUT':
        const { id: updateId } = req.query;
        const updateData = req.body;
        const updatedGoCalendar: GoCalendar = await fetchFromGoAPI(`/calendars/${updateId}`, 'PUT', updateData);
        const updatedCalendar = {
          id: updatedGoCalendar.ID,
          name: updatedGoCalendar.Name,
          color: updatedGoCalendar.Color,
          visible: updatedGoCalendar.Visible,
        };
        res.status(200).json(updatedCalendar);
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        await fetchFromGoAPI(`/calendars/${deleteId}`, 'DELETE');
        res.status(204).end(); // No content on successful deletion
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Error handling calendars:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate with Go API' });
  }
}