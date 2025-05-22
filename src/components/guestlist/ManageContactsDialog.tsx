import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription, // This is DialogDescription from ui/dialog
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase, UserProfile } from '@/contexts/AuthContext';
import { type Contact as MainContact } from '@/components/guestlist/ContactsTable';
import { useEventContacts } from '@/hooks/useEventGuestListContacts';
// Removed CurrentEventContactsList and AddContactsToEventList imports
import { Input } from '@/components/ui/input'; // Added
import { Checkbox } from '@/components/ui/checkbox'; // Added
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card'; // Added Card components and aliased CardDescription
import { type EventGuestListContact } from '@/types/guestlist'; // Added type import

interface ManageContactsDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedEventId: string | null;
  selectedEventName?: string;
  mainContacts: MainContact[];
  onContactsUpdated: (eventId: string | null) => void;
  clearManagingState: () => void;
}

export function ManageContactsDialog({
  user,
  isOpen,
  onOpenChange,
  selectedEventId,
  selectedEventName,
  mainContacts,
  onContactsUpdated,
  clearManagingState,
}: ManageContactsDialogProps) {
  const {
    eventContacts,
    loadingEventContacts,
    eventContactsError,
    fetchContactsForEvent,
    setEventContacts,
  } = useEventContacts(user);

  const [isAddingContacts, setIsAddingContacts] = useState(false);
  const [isRemovingContact, setIsRemovingContact] = useState(false);

  // State from AddContactsToEventList
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactsToAdd, setSelectedContactsToAdd] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && selectedEventId) {
      fetchContactsForEvent(selectedEventId);
    } else if (!isOpen) {
      setEventContacts([]);
      setSearchTerm(''); // Reset search term on close
      setSelectedContactsToAdd(new Set()); // Reset selected contacts on close
    }
  }, [isOpen, selectedEventId, fetchContactsForEvent, setEventContacts]);

  // Merged and adapted from AddContactsToEventList's onAddSelectedContacts and original handleAddSelectedContacts
  const handleAddSelectedContactsToEvent = async () => {
    if (!user || !selectedEventId || selectedContactsToAdd.size === 0) return;

    setIsAddingContacts(true);
    try {
      const contactsToAddObjects = Array.from(selectedContactsToAdd).map(contactId => ({
        event_id: selectedEventId,
        contact_id: contactId,
        status: 'Invited', // Default status
      }));

      const { error } = await supabase.from('event_guest_list_contacts').insert(contactsToAddObjects);
      if (error) throw error;

      toast.success(`${selectedContactsToAdd.size} contact(s) added to "${selectedEventName || 'the event'}".`);
      fetchContactsForEvent(selectedEventId); // Refresh list
      onContactsUpdated(selectedEventId); // Notify parent
      setSelectedContactsToAdd(new Set()); // Clear selection after successful add
    } catch (err: unknown) {
      console.error("Error adding contacts to event:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to add contacts: ${errorMessage}`);
    } finally {
      setIsAddingContacts(false);
    }
  };

  const handleRemoveContactFromEvent = async (contactIdToRemove: string) => {
    if (!user || !selectedEventId) return;

    setIsRemovingContact(true);
    try {
      const { error } = await supabase
        .from('event_guest_list_contacts')
        .delete()
        .eq('event_id', selectedEventId)
        .eq('contact_id', contactIdToRemove);

      if (error) throw error;

      toast.success(`Contact removed from "${selectedEventName || 'the event'}".`);
      fetchContactsForEvent(selectedEventId); // Refresh list
      onContactsUpdated(selectedEventId); // Notify parent
    } catch (err: unknown) {
      console.error("Error removing contact from event:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to remove contact: ${errorMessage}`);
    } finally {
      setIsRemovingContact(false);
    }
  };

  // Logic from AddContactsToEventList
  const availableContacts = useMemo(() => {
    const contactsInListIds = new Set(eventContacts.map((c: EventGuestListContact) => c.contacts.id));
    return mainContacts.filter(contact => {
      const notInList = !contactsInListIds.has(contact.id);
      if (!notInList) return false;
      if (!searchTerm.trim()) return true; // Show all available if no search term

      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = contact.name.toLowerCase().includes(searchTermLower);
      const emailMatch = contact.email?.toLowerCase().includes(searchTermLower) || false;
      const phoneMatch = contact.phone?.toLowerCase().includes(searchTermLower) || false;
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [mainContacts, eventContacts, searchTerm]);

  const handleToggleContactSelection = (contactId: string, checked: boolean) => {
    const newSet = new Set(selectedContactsToAdd);
    if (checked) {
      newSet.add(contactId);
    } else {
      newSet.delete(contactId);
    }
    setSelectedContactsToAdd(newSet);
  };

  if (!isOpen) return null;

  // JSX for CurrentEventContactsList (merged)
  const currentContactsDisplay = (
    <>
      <h4 className="text-md font-semibold mb-2">
        Current Contacts ({eventContacts.length})
      </h4>
      {loadingEventContacts && <p>Loading contacts...</p>}
      {!loadingEventContacts && eventContactsError && <p className="text-red-500">Error: {eventContactsError}</p>}
      {!loadingEventContacts && !eventContactsError && eventContacts.length === 0 && (
        <p className="text-sm text-muted-foreground">No contacts in this event's guest list yet.</p>
      )}
      {!loadingEventContacts && !eventContactsError && eventContacts.length > 0 && (
        <ul className="space-y-1 mb-6 max-h-[200px] overflow-y-auto border rounded-md p-2">
          {eventContacts.map((eglContact: EventGuestListContact) => (
            <li key={eglContact.contacts.id} className="flex justify-between items-center p-2 border-b last:border-b-0 rounded-md text-sm hover:bg-accent">
              <div>
                <span className="font-medium">{eglContact.contacts.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({eglContact.contacts.email || eglContact.contacts.phone || 'No contact info'})
                </span>
                <span className="text-xs text-muted-foreground ml-2">- Status: {eglContact.status}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveContactFromEvent(eglContact.contacts.id)}
                disabled={isRemovingContact || isAddingContacts}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  // JSX for AddContactsToEventList (merged)
  const addContactsDisplay = (
    <Card>
      <CardHeader>
        <CardTitle>Add Contacts to Event</CardTitle>
        <UiCardDescription>Select contacts from your main list to add to this event.</UiCardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search available contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        <div className="h-[200px] w-full rounded-md border p-4 overflow-y-auto">
          {availableContacts.length > 0 ? (
            availableContacts.map(contact => (
              <div key={`add-${contact.id}`} className="flex items-center space-x-2 mb-2 p-1 hover:bg-accent rounded-md">
                <Checkbox
                  id={`add-contact-${contact.id}`}
                  checked={selectedContactsToAdd.has(contact.id)}
                  onCheckedChange={(checked) => handleToggleContactSelection(contact.id, !!checked)}
                />
                <label
                  htmlFor={`add-contact-${contact.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                >
                  {contact.name} <span className="text-xs text-muted-foreground">({contact.email || contact.phone || 'No details'})</span>
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              {searchTerm.trim() ? "No matching contacts found to add." : "All contacts are already in the list or no contacts available to add."}
            </p>
          )}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={handleAddSelectedContactsToEvent} // Updated to call the merged handler
          disabled={selectedContactsToAdd.size === 0 || isAddingContacts}
        >
          {isAddingContacts ? "Adding..." : `Add ${selectedContactsToAdd.size} Selected Contact(s)`}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        clearManagingState();
      }
    }}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"> {/* Increased max width for better layout */}
        <DialogHeader>
          <DialogTitle>Manage Contacts for: {selectedEventName || "Selected Event"}</DialogTitle>
          <DialogDescription> {/* This is DialogDescription from ui/dialog */}
            Add or remove contacts for this event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto"> {/* Using grid for side-by-side layout on medium screens */}
          <div>
            {currentContactsDisplay}
          </div>
          <div>
            {addContactsDisplay}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => {
                onOpenChange(false);
                clearManagingState();
            }}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}