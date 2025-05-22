import { useState, useCallback } from 'react';
import { UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

// Removed EventGuestList import
import { type Contact } from '@/components/guestlist/ContactsTable';
import { type Event } from '@/types/guestlist'; // Added for userEvents type

import { useUserEvents } from '@/hooks/useUserEvents';
// Removed useEventGuestLists import

// EventSelector will be merged, so remove direct import
// import { EventSelector } from './EventSelector';
import { Label } from "@/components/ui/label"; // Added for merged EventSelector
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added for merged EventSelector

// Removed GuestListItem, CreateEditGuestListDialog, DeleteGuestListAlertDialog imports
import { ManageContactsDialog } from './ManageContactsDialog';

interface EventGuestListsManagerProps {
  user: UserProfile | null;
  mainContacts: Contact[]; // This will be passed down to ManageContactsDialog
}

export function EventGuestListsManager({ user, mainContacts }: EventGuestListsManagerProps) {
  const { userEvents, loadingUserEvents } = useUserEvents(user);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // State for ManageContactsDialog
  const [isManageContactsModalOpen, setIsManageContactsModalOpen] = useState(false);

  const handleEventSelect = (eventId: string | null) => {
    setSelectedEventId(eventId);
    // If an event is deselected, close the contacts modal
    if (!eventId) {
      setIsManageContactsModalOpen(false);
    }
  };

  const openManageContactsDialog = () => {
    if (!selectedEventId) {
      toast.error("Please select an event first to manage its contacts.");
      return;
    }
    setIsManageContactsModalOpen(true);
  };

  const handleContactsUpdatedForEventManager = useCallback((eventId: string | null) => {
    // This callback is called when contacts are updated in ManageContactsDialog.
    // For now, we can just log it. In the future, this could trigger
    // a refetch of event-specific summary data if displayed directly here.
    console.log(`Contacts updated for event: ${eventId}`);
    // Potentially refetch event summary data here if needed
  }, []);

  const clearManageContactsDialogState = () => {
    // This function is passed to ManageContactsDialog to be called on close.
    // Currently, ManageContactsDialog handles its internal state reset on close.
    // This could be used for additional cleanup in EventGuestListsManager if needed.
    console.log("ManageContactsDialog closed, clearManagingState called in parent.");
  };
  
  const selectedEventName = userEvents.find(e => e.id === selectedEventId)?.name;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Event Guest List Management</CardTitle>
        <CardDescription>
          Select an event to manage its guest list. Each event has a single guest list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Merged EventSelector JSX */}
        <div className="mb-4">
          <Label htmlFor="eventSelectForGuestListManager">Select Event</Label>
          <Select
            value={selectedEventId || ''}
            onValueChange={(value) => handleEventSelect(value === 'none' ? null : value)}
            disabled={loadingUserEvents || userEvents.length === 0}
          >
            <SelectTrigger id="eventSelectForGuestListManager" className="w-full md:w-[300px]">
              <SelectValue placeholder={loadingUserEvents ? "Loading events..." : "Select an event"} />
            </SelectTrigger>
            <SelectContent>
              {loadingUserEvents && <SelectItem value="loading" disabled>Loading events...</SelectItem>}
              {!loadingUserEvents && userEvents.length === 0 && <SelectItem value="no-events" disabled>No events found</SelectItem>}
              {!loadingUserEvents && userEvents.length > 0 && userEvents.map((event: Event) => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* End of Merged EventSelector JSX */}

        {selectedEventId && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Guest List for: {selectedEventName || 'Selected Event'}
              </h3>
              <Button
                onClick={openManageContactsDialog}
                size="sm"
              >
                Manage Contacts
              </Button>
            </div>
            {/*
              Future enhancement: Display a summary of the guest list here,
              e.g., total contacts, RSVP counts, etc. This data would
              need to be fetched, possibly by a modified useEventContacts hook
              or a new hook that gets event summary.
            */}
            <p className="text-sm text-muted-foreground">
              Click "Manage Contacts" to add or remove attendees for this event.
            </p>
          </div>
        )}

        {!selectedEventId && !loadingUserEvents && userEvents.length > 0 && (
          <p className="text-muted-foreground mt-4">Please select an event to manage its guest list.</p>
        )}
        {!selectedEventId && !loadingUserEvents && userEvents.length === 0 && (
          <p className="text-muted-foreground mt-4">You need to create an event first before managing guest lists.</p>
        )}
      </CardContent>

      {/* Render ManageContactsDialog: It's controlled by isManageContactsModalOpen and selectedEventId */}
      {selectedEventId && (
        <ManageContactsDialog
          user={user}
          isOpen={isManageContactsModalOpen}
          onOpenChange={setIsManageContactsModalOpen}
          selectedEventId={selectedEventId}
          selectedEventName={selectedEventName}
          mainContacts={mainContacts}
          onContactsUpdated={handleContactsUpdatedForEventManager}
          clearManagingState={clearManageContactsDialogState}
        />
      )}
    </Card>
  );
}