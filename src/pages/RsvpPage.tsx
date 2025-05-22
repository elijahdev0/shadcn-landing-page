import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Skeleton } from '@/components/ui/skeleton';

interface EventMinDetails {
  id: string;
  name: string;
  event_date: string | null;
}

type RsvpStatus = 'attending' | 'not_attending';

export function RsvpPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate(); // For a "back to home" or similar button if needed

  const [eventDetails, setEventDetails] = useState<EventMinDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('attending');
  const [isRsvping, setIsRsvping] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEventError('Event ID is missing.');
      setLoadingEvent(false);
      return;
    }

    const fetchMinEventDetails = async () => {
      setLoadingEvent(true);
      setEventError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('id, name, event_date')
          .eq('id', eventId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setEventError('Event not found. Please check the link.');
        } else {
          setEventDetails(data as EventMinDetails);
        }
      } catch (err: any) {
        console.error('Error fetching event details for RSVP page:', err);
        setEventError(err.message || 'Failed to load event information.');
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchMinEventDetails();
  }, [eventId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleRsvpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventId) {
      setRsvpError("Event ID is missing. Cannot submit RSVP.");
      return;
    }
    if (!rsvpName.trim() || !rsvpEmail.trim()) {
      setRsvpError("Name and Email are required to RSVP.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(rsvpEmail)) {
      setRsvpError("Please enter a valid email address.");
      return;
    }

    setIsRsvping(true);
    setRsvpError(null);
    setRsvpSuccess(null);

    try {
      const { error: insertError } = await supabase.from('rsvps').insert({
        event_id: eventId,
        name: rsvpName,
        email: rsvpEmail,
        status: rsvpStatus,
      });

      if (insertError) throw insertError;
      
      setRsvpSuccess(`Thank you for RSVPing, ${rsvpName}! Your response (${rsvpStatus}) has been recorded.`);
      toast.success("RSVP submitted successfully!");
      // Clear form or disable after successful submission
      setRsvpName('');
      setRsvpEmail('');
      // Potentially disable the form or show a "Submitted" message prominently
    } catch (err: any) {
      console.error("Error submitting RSVP:", err);
      const errorMessage = err.message || "Failed to submit RSVP. Please try again.";
      setRsvpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRsvping(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventError || !eventDetails) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4 text-red-600">
        <Card className="w-full max-w-md p-6">
          <CardHeader><CardTitle>Error Loading Event</CardTitle></CardHeader>
          <CardContent>
            <p>{eventError || "Could not load event details. Please ensure the link is correct."}</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">RSVP for: {eventDetails.name}</CardTitle>
          <CardDescription>Event Date: {formatDate(eventDetails.event_date)}</CardDescription>
        </CardHeader>
        
        {rsvpSuccess ? (
          <CardContent className="text-center py-8">
            <p className="text-green-600 text-lg">{rsvpSuccess}</p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Go to Homepage
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleRsvpSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="rsvpName">Full Name</Label>
                <Input
                  id="rsvpName"
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Your Name"
                  required
                  disabled={isRsvping}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rsvpEmail">Email Address</Label>
                <Input
                  id="rsvpEmail"
                  type="email"
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={isRsvping}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Are you attending?</Label>
                <RadioGroup
                  value={rsvpStatus}
                  onValueChange={(value: string) => setRsvpStatus(value as RsvpStatus)}
                  className="flex space-x-4 pt-2"
                  disabled={isRsvping}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attending" id="rsvpAttending" />
                    <Label htmlFor="rsvpAttending">Attending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_attending" id="rsvpNotAttending" />
                    <Label htmlFor="rsvpNotAttending">Not Attending</Label>
                  </div>
                </RadioGroup>
              </div>
              {rsvpError && <p className="text-sm text-red-600">{rsvpError}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isRsvping} className="w-full">
                {isRsvping ? 'Submitting...' : 'Submit RSVP'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}