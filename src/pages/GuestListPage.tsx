import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { supabase } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader'; // Import the AppHeader
import { ImportContactsCard } from '@/components/guestlist/ImportContactsCard';
import { ContactsTable, type Contact } from '@/components/guestlist/ContactsTable';
import { EventGuestListsManager } from '@/components/guestlist/EventGuestListsManager';

export function GuestListPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');

  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    setLoadingContacts(true);
    setContactsError(null);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (err: unknown) {
      console.error("Error fetching contacts:", err);
      setContactsError((err as Error).message || "Failed to fetch contacts.");
      toast.error("Failed to load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [user, fetchContacts]);

  const handleAddNewContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not authenticated.");
      return;
    }
    if (!newContactName.trim()) {
      toast.error("Contact name is required.");
      return;
    }

    setIsSavingContact(true);
    try {
      const { error } = await supabase.from('contacts').insert({
        user_id: user.id,
        name: newContactName.trim(),
        email: newContactEmail.trim() || null,
        phone: newContactPhone.trim() || null,
        source: 'manual',
      });

      if (error) throw error;

      toast.success(`Contact "${newContactName.trim()}" added successfully!`);
      fetchContacts();
      setIsAddContactModalOpen(false);
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
    } catch (err: unknown) {
      console.error("Error adding new contact:", err);
      toast.error(`Failed to add contact: ${(err as Error).message}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setEditContactName(contact.name);
    setEditContactEmail(contact.email || '');
    setEditContactPhone(contact.phone || '');
    setIsEditContactModalOpen(true);
  };

  const handleEditContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !editingContact) {
      toast.error("User not authenticated or no contact selected for editing.");
      return;
    }
    if (!editContactName.trim()) {
      toast.error("Contact name is required.");
      return;
    }

    setIsSavingContact(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: editContactName.trim(),
          email: editContactEmail.trim() || null,
          phone: editContactPhone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingContact.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Contact "${editContactName.trim()}" updated successfully!`);
      fetchContacts();
      setIsEditContactModalOpen(false);
      setEditingContact(null);
    } catch (err: unknown) {
      console.error("Error updating contact:", err);
      toast.error(`Failed to update contact: ${(err as Error).message}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  const openDeleteConfirm = (contact: Contact | null) => {
    setContactToDelete(contact);
  };

  const handleDeleteContact = async () => {
    if (!user || !contactToDelete) {
      toast.error("User not authenticated or no contact selected for deletion.");
      return;
    }
    setIsDeletingContact(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Contact "${contactToDelete.name}" deleted successfully!`);
      fetchContacts();
      setContactToDelete(null);
    } catch (err: unknown) {
      console.error("Error deleting contact:", err);
      toast.error(`Failed to delete contact: ${(err as Error).message}`);
    } finally {
      setIsDeletingContact(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Guest Lists & Contacts</h1>
          <p className="text-muted-foreground">Manage your contacts and organize guest lists for your events.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <ImportContactsCard
            user={user as UserProfile | null}
            isImporting={isImporting}
            setIsImporting={setIsImporting}
            onImportSuccess={fetchContacts}
          />
        </div>

        <EventGuestListsManager
          user={user as UserProfile | null}
          mainContacts={contacts}
        />

        <Card className="mt-8"> {/* Added margin-top for spacing */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Contacts</CardTitle>
              <CardDescription>
                {contacts.length > 0
                  ? `You have ${contacts.length} contact(s).`
                  : "You haven't added any contacts yet."}
              </CardDescription>
            </div>
            <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
              <DialogTrigger asChild>
                <Button>Add New Contact</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Manually enter the details for your new contact.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddNewContact}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactName" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="contactName"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="col-span-3"
                        required
                        disabled={isSavingContact}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactEmail" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="col-span-3"
                        disabled={isSavingContact}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactPhone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="col-span-3"
                        disabled={isSavingContact}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSavingContact}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSavingContact}>
                      {isSavingContact ? "Saving..." : "Save Contact"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ContactsTable
              contacts={contacts}
              loadingContacts={loadingContacts}
              contactsError={contactsError}
              onEditContact={openEditModal}
              formatDate={formatDate}
              contactToDelete={contactToDelete}
              setContactToDelete={openDeleteConfirm}
              handleActualDeleteContact={handleDeleteContact}
              isDeletingContact={isDeletingContact}
            />
          </CardContent>
        </Card>

        {editingContact && (
          <Dialog open={isEditContactModalOpen} onOpenChange={(isOpen) => {
            setIsEditContactModalOpen(isOpen);
            if (!isOpen) setEditingContact(null);
          }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Contact: {editingContact.name}</DialogTitle>
                <DialogDescription>
                  Update the details for this contact.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditContact}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editContactName" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="editContactName"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="col-span-3"
                      required
                      disabled={isSavingContact}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editContactEmail" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="editContactEmail"
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="col-span-3"
                      disabled={isSavingContact}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editContactPhone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="editContactPhone"
                      type="tel"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="col-span-3"
                      disabled={isSavingContact}
                    />
                  </div>
                </div>
                <DialogFooter>
                   <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSavingContact}>Cancel</Button>
                    </DialogClose>
                  <Button type="submit" disabled={isSavingContact}>
                    {isSavingContact ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}