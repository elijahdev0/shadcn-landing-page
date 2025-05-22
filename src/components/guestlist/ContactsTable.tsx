import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Assuming Contact interface is defined in GuestListPage.tsx or a shared types file
// If not, define it here or import it. For now, let's define a minimal version.
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  loadingContacts: boolean;
  contactsError: string | null;
  onEditContact: (contact: Contact) => void;
  formatDate: (dateString: string | null) => string;
  // For inline Delete Contact Dialog
  contactToDelete: Contact | null;
  setContactToDelete: (contact: Contact | null) => void; // This is effectively openDeleteConfirm from parent
  handleActualDeleteContact: () => Promise<void>; // This is handleDeleteContact from parent
  isDeletingContact: boolean;
}

export function ContactsTable({
  contacts,
  loadingContacts,
  contactsError,
  onEditContact,
  formatDate,
  contactToDelete,
  setContactToDelete,
  handleActualDeleteContact,
  isDeletingContact,
}: ContactsTableProps) {

  if (loadingContacts) return <p>Loading contacts...</p>;
  if (contactsError) return <p className="text-red-600">Error: {contactsError}</p>;
  if (contacts.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No contacts found. Upload a CSV/VCF or add contacts manually.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Added On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell className="font-medium">{contact.name}</TableCell>
            <TableCell>{contact.email || '-'}</TableCell>
            <TableCell>{contact.phone || '-'}</TableCell>
            <TableCell>{contact.source || '-'}</TableCell>
            <TableCell>{formatDate(contact.created_at)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEditContact(contact)}>Edit</Button>
              <AlertDialog 
                open={contactToDelete?.id === contact.id} 
                onOpenChange={(isOpen) => { if (!isOpen) setContactToDelete(null); }}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={() => setContactToDelete(contact)}>Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the contact
                      "{contactToDelete?.name}" from your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingContact} onClick={() => setContactToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleActualDeleteContact} disabled={isDeletingContact}>
                      {isDeletingContact ? "Deleting..." : "Yes, delete contact"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}