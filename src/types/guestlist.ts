import { type Contact } from '@/components/guestlist/ContactsTable';

export interface Event {
  id: string;
  name: string;
}

export interface EventGuestListContact extends Contact {
  event_id: string; // Keep event_id, not guest_list_id
  status: string;
  added_at: string;
  contacts: Contact; // This holds the joined contact details
}