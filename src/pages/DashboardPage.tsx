import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNavigate } from "react-router-dom"; // Using Link from react-router-dom
import { useAuth } from "../contexts/AuthContext"; // To get user info and logout
import { supabase } from "../contexts/AuthContext"; // Import Supabase client
import { useState, useEffect } from 'react'; // Added useState and useEffect
import { AppHeader } from "@/components/AppHeader"; // Import the new AppHeader component

// Unused example data removed
// const recentSales = [ ... ];
// const recentTransactions = [ ... ];

interface Event {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  description?: string | null;
  event_date?: string | null;
  location?: string | null;
  is_public: boolean;
}

export function DashboardPage() {
  const { user } = useAuth(); // logout is now handled by AppHeader
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setLoadingEvents(false);
        setEvents([]); // Clear events if user logs out
        return;
      }

      setLoadingEvents(true);
      setEventsError(null);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('event_date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setEventsError(err.message || "Failed to fetch events.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user]); // Refetch if user changes

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Placeholder for "Create New Event" Button */}
        <div className="mb-6">
          <Button size="lg" onClick={() => navigate('/create-event')}> {/* Ensure navigate is defined and imported if used here, or handle navigation differently */}
            Create New Event
          </Button>
        </div>

        {/* Placeholder for User's Events List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Events</h2>
          {/*
            This is where the list of events will be rendered.
            You might use a grid of Cards or a Table component.
            Example structure for an event item (to be repeated/mapped):
            <Card onClick={() => navigate('/event/EVENT_ID')} className="cursor-pointer">
              <CardHeader>
                <CardTitle>Event Name</CardTitle>
                <CardDescription>Event Date - Event Status</CardDescription>
              </CardHeader>
              <CardContent>
                <p>RSVPs: X / Y</p>
              </CardContent>
            </Card>
          */}
          {loadingEvents && <p>Loading your events...</p>}
          {eventsError && <p className="text-red-600">Error: {eventsError}</p>}
          {!loadingEvents && !eventsError && events.length === 0 && (
            <div className="border-dashed border-2 border-gray-300 p-8 rounded-lg text-center">
              <p className="text-muted-foreground">You haven't created any events yet.</p>
              <p className="text-sm text-muted-foreground">Click "Create New Event" to get started.</p>
            </div>
          )}
          {!loadingEvents && !eventsError && events.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date TBD'}
                      {event.location && ` - ${event.location}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground truncate">{event.description || 'No description available.'}</p>
                    <Badge variant={event.is_public ? "default" : "secondary"} className="mt-2">
                      {event.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// useNavigate is already imported at the top after changes