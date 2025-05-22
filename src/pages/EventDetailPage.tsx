import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/contexts/AuthContext'; // Assuming supabase client is exported from AuthContext
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Define a type for the event data based on your table schema
interface Event {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  is_public: boolean;
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError('Event ID is missing.');
      setLoading(false);
      return;
    }

    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (fetchError) {
          throw fetchError;
        }
        if (!data) {
          setError('Event not found.');
        } else {
          setEvent(data as Event);
        }
      } catch (err: any) {
        console.error('Error fetching event details:', err);
        setError(err.message || 'Failed to fetch event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-start min-h-screen bg-background p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-24 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4 md:p-8 text-red-600">
        <Card className="w-full max-w-md p-6">
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    Go Back
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    // This case should ideally be covered by the error state if event not found
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4 md:p-8">
            <Card className="w-full max-w-md p-6">
                <CardHeader>
                    <CardTitle>Event Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested event could not be found.</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">
                        Go Back
                    </Button>
                </CardContent>
            </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
          <CardDescription>Event ID: {event.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">Date & Time</h3>
            <p className="text-muted-foreground">{formatDate(event.event_date)}</p>
          </div>
          {event.location && (
            <div>
              <h3 className="font-semibold text-lg">Location</h3>
              <p className="text-muted-foreground">{event.location}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">Visibility</h3>
            <p className="text-muted-foreground">{event.is_public ? 'Public' : 'Private'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Created By (User ID)</h3>
            <p className="text-muted-foreground">{event.user_id}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Created On</h3>
            <p className="text-muted-foreground">{formatDate(event.created_at)}</p>
          </div>
          <div className="pt-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Back to Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}