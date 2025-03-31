import { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import { UploadCloud, PlusCircle } from "lucide-react";

export default function Calendar4723() {
  const [googleSync, setGoogleSync] = useState(true);
  const [appleSync, setAppleSync] = useState(true);
  const [events, setEvents] = useState([
    { id: 1, title: "Create-X Capstone Presentation", time: "12:00 PM" },
    { id: 2, title: "Gym", time: "2:30 PM" },
    { id: 3, title: "Networking Homework", time: "5:00 PM" },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">4723 Encrypted Calendar</h1>
      
      {/* Sync & Import Section */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-bold mb-4">Calendar LiveSync</h2>
        <div className="flex items-center justify-between mb-2">
          <span>Google Calendar</span>
          <Switch checked={googleSync} onChange={() => setGoogleSync(!googleSync)} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span>Apple Calendar</span>
          <Switch checked={appleSync} onChange={() => setAppleSync(!appleSync)} />

        </div>
        <div className="flex space-x-4">
          <Button>
            <UploadCloud size={18} /> Upload .cal File
          </Button>
          <Dialog>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2">
              <PlusCircle size={18} /> Add a New Event
            </Button>
          </DialogTrigger>
            <DialogContent>
              <h2 className="text-lg font-bold">Create New Event</h2>
              <Input placeholder="Event Title" className="mb-2" />
              <Input type="time" className="mb-2" />
              <Button className="w-full">Save Event</Button>
            </DialogContent>
          </Dialog>





        </div>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          <ul>
            {events.map((event) => (
              <li key={event.id} className="border-b py-2">
                <strong>{event.time}</strong> - {event.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
