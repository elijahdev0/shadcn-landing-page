import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, useAuth } from '@/contexts/AuthContext'; // Modified
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { type Contact } from '@/components/guestlist/ContactsTable'; // Added
import { ManageContactsDialog } from '@/components/guestlist/ManageContactsDialog'; // Added

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

interface RsvpEntry {
  id: string;
  event_id: string;
  name: string;
  email: string;
  status: 'attending' | 'not_attending';
  submitted_at: string;
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Added

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  const [rsvpsList, setRsvpsList] = useState<RsvpEntry[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(true);
  const [rsvpsError, setRsvpsError] = useState<string | null>(null);

  // New state for main contacts
  const [mainContacts, setMainContacts] = useState<Contact[]>([]);
  const [loadingMainContacts, setLoadingMainContacts] = useState(true);
  const [mainContactsError, setMainContactsError] = useState<string | null>(null);

  // New state for dialog
  const [isManageGuestListDialogOpen, setIsManageGuestListDialogOpen] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setEventError('Event ID is missing.');
      setLoadingEvent(false);
      setLoadingRsvps(false);
      setLoadingMainContacts(false); // Also set main contacts loading to false
      return;
    }

    const fetchAllDetails = async () => {
      setLoadingEvent(true);
      setLoadingRsvps(true);
      // setLoadingMainContacts(true); // This will be handled by fetchMainContactsForUser
      setEventError(null);
      setRsvpsError(null);
      // setMainContactsError(null); // This will be handled by fetchMainContactsForUser

      try {
        // Fetch Event Details (existing logic)
        const { data: eventData, error: fetchEventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (fetchEventError) throw fetchEventError;
        if (!eventData) {
          setEventError('Event not found.');
          setLoadingEvent(false);
          setLoadingRsvps(false);
          // setLoadingMainContacts(false); // Ensure all loading states are handled
          return;
        }
        setEvent(eventData as Event);
        // setLoadingEvent(false); // Moved to finally block

        // Fetch RSVPs (existing logic)
        const { data: rsvpsData, error: fetchRsvpsError } = await supabase
          .from('rsvps')
          .select('*')
          .eq('event_id', eventId)
          .order('submitted_at', { ascending: false });

        if (fetchRsvpsError) throw fetchRsvpsError;
        setRsvpsList(rsvpsData || []);
        // setLoadingRsvps(false); // Moved to finally block

      } catch (err: any) {
        console.error('Error fetching event details or RSVPs:', err);
        if (!event) setEventError(err.message || 'Failed to fetch event details.');
        else setRsvpsError(err.message || 'Failed to fetch RSVPs.'); // if event loaded, error is likely rsvps
      } finally {
        setLoadingEvent(false);
        setLoadingRsvps(false);
      }
    };

    const fetchMainContactsForUser = async () => {
      if (!user) {
        setMainContacts([]);
        setLoadingMainContacts(false);
        // Optionally set an error or info message if user is expected but not present
        // setMainContactsError("User not available to fetch contacts.");
        return;
      }
      setLoadingMainContacts(true);
      setMainContactsError(null);
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
        if (error) throw error;
        setMainContacts(data || []);
      } catch (err: any) {
        console.error("Error fetching main contacts:", err);
        setMainContactsError(err.message || "Failed to fetch contacts.");
      } finally {
        setLoadingMainContacts(false);
      }
    };

    fetchAllDetails();
    fetchMainContactsForUser(); // Call the new function

  }, [eventId, user]); // Add user to dependency array

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

  const handleCopyLink = async () => {
    try {
      if (!eventId) {
        toast.error("Event ID not found. Cannot copy link.");
        return;
      }
      const rsvpLink = `${import.meta.env.VITE_APP_URL}/rsvp/${eventId}`;
      await navigator.clipboard.writeText(rsvpLink);
      toast.success("RSVP link copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy link: ', err);
      toast.error("Failed to copy link.");
    }
  };

  // handleRsvpSubmit function is removed

  if (loadingEvent) { // Check loadingEvent specifically for the main card
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center p-4 md:p-8 space-y-8">
          {/* Skeleton for Event Details Card */}
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
          {/* Skeleton for RSVP List Card */}
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <Skeleton className="h-7 w-1/3 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (eventError) { // Prioritize event error
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col justify-center items-center p-4 md:p-8 text-red-600">
          <Card className="w-full max-w-md p-6">
            <CardHeader><CardTitle>Error Loading Event</CardTitle></CardHeader>
            <CardContent>
              <p>{eventError}</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!event) { // Should be caught by eventError if fetch failed
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col justify-center items-center p-4 md:p-8">
          <Card className="w-full max-w-md p-6">
            <CardHeader><CardTitle>Event Not Found</CardTitle></CardHeader>
            <CardContent>
              <p>The requested event could not be found.</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Helper to format RSVP submission time
  const formatRsvpTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 md:p-8 space-y-8">
        {/* Event Details Card */}
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
                <CardDescription>Event ID: {event.id}</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy RSVP link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
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
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)} variant="outline">
              Back
            </Button>
          </CardFooter>
        </Card>

        {/* RSVP List Card - Modified Header */}
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Guest List / RSVPs</CardTitle>
              {event && user && ( // Only show button if event and user are loaded
                <Button
                  onClick={() => setIsManageGuestListDialogOpen(true)}
                  disabled={loadingMainContacts || !!mainContactsError}
                  size="sm"
                >
                  Manage Guest List
                </Button>
              )}
            </div>
            <CardDescription>
              {rsvpsList.length > 0
                ? `${rsvpsList.length} guest(s) have responded.`
                : "No RSVPs received yet."}
            </CardDescription>
            {mainContactsError && (
              <p className="text-sm text-red-600 mt-2">Error loading contacts: {mainContactsError}</p>
            )}
          </CardHeader>
          <CardContent>
            {loadingRsvps && (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {!loadingRsvps && rsvpsError && (
              <p className="text-red-600">Error loading RSVPs: {rsvpsError}</p>
            )}
            {!loadingRsvps && !rsvpsError && rsvpsList.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rsvpsList.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell className="font-medium">{rsvp.name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>
                        <Badge variant={rsvp.status === 'attending' ? 'default' : 'outline'}>
                          {rsvp.status === 'attending' ? 'Attending' : 'Not Attending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDate(rsvp.submitted_at)} at {formatRsvpTime(rsvp.submitted_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!loadingRsvps && !rsvpsError && rsvpsList.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No one has RSVP'd yet. Share the link to get responses!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Conditionally render the ManageContactsDialog */}
        {event && user && (
          <ManageContactsDialog
            user={user}
            isOpen={isManageGuestListDialogOpen}
            onOpenChange={setIsManageGuestListDialogOpen}
            selectedEventId={event.id}
            selectedEventName={event.name}
            mainContacts={mainContacts}
            onContactsUpdated={(updatedEventId) => {
              console.log(`Guest list updated for event: ${updatedEventId}. Consider refreshing RSVP/guest summary.`);
              // Future enhancement: Trigger a refetch of RSVP data or a guest count summary
              // if displayed directly on EventDetailPage.tsx.
            }}
            clearManagingState={() => {
              // Optional: Any specific cleanup needed in EventDetailPage when dialog closes.
            }}
          />
        )}
      </main>
    </div>
  );
}