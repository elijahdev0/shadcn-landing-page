import { useState, useCallback } from 'react';
import { supabase, UserProfile } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { type EventGuestListContact } from '@/types/guestlist';
import { type Contact } from '@/components/guestlist/ContactsTable';

export function useEventContacts(user: UserProfile | null) {
  const [eventContacts, setEventContacts] = useState<EventGuestListContact[]>([]);
  const [loadingEventContacts, setLoadingEventContacts] = useState(false);
  const [eventContactsError, setEventContactsError] = useState<string | null>(null);

  const fetchContactsForEvent = useCallback(async (eventId: string | null) => {
    if (!user || !eventId) {
      setEventContacts([]);
      setLoadingEventContacts(false);
      setEventContactsError(null);
      return;
    }
    setLoadingEventContacts(true);
    setEventContactsError(null);
    try {
      const { data, error } = await supabase
        .from('event_guest_list_contacts')
        .select(`
          status,
          added_at,
          contacts (
            id,
            user_id,
            name,
            email,
            phone,
            source,
            created_at,
            updated_at
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      
      const transformedData: EventGuestListContact[] = data?.map(item => {
        const contactDetails = Array.isArray(item.contacts) ? item.contacts[0] : item.contacts;
        if (!contactDetails) {
          console.warn('Event contact item found without contact details:', item);
          return null;
        }
        return {
          ...(contactDetails as Contact), // Spread the actual contact properties
          event_id: eventId, // Link directly to event
          status: item.status || 'Invited',
          added_at: item.added_at,
          contacts: contactDetails as Contact, // Keep the nested contact object if your UI expects it
        };
      }).filter(Boolean) as EventGuestListContact[] || [];
      setEventContacts(transformedData);
    } catch (err: unknown) {
      console.error("Error fetching contacts for event:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setEventContactsError(errorMessage || "Failed to fetch contacts for this event.");
      toast.error("Failed to load contacts for the event.");
      setEventContacts([]);
    } finally {
      setLoadingEventContacts(false);
    }
  }, [user]);

  return {
    eventContacts,
    loadingEventContacts,
    eventContactsError,
    fetchContactsForEvent,
    setEventContacts
  };
}