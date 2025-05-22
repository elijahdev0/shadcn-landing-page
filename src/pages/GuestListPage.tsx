import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
// We'll use papaparse for CSV parsing, ensure it's installed: npm install papaparse
// And its types: npm install @types/papaparse
import Papa from 'papaparse';
import vCard from 'vcf'; // Import the vcf library

interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
}

// Expected CSV row structure
interface CsvRow {
  Name: string;
  Email?: string;
  Phone?: string;
}

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
  const [isSavingContact, setIsSavingContact] = useState(false); // Used for both add and edit

  // State for Edit Contact Modal
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');

  // State for Delete Contact Alert Dialog
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  const fetchContacts = async () => {
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
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setContactsError(err.message || "Failed to fetch contacts.");
      toast.error("Failed to load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.type !== "text/csv") {
        toast.error("Invalid file type. Please upload a CSV file.");
        return;
    }

    setIsImporting(true);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<CsvRow>) => {
        if (!user) {
          toast.error("User not authenticated.");
          setIsImporting(false);
          return;
        }
        if (results.errors.length > 0) {
          console.error("CSV Parsing errors:", results.errors);
          toast.error(`Error parsing CSV: ${results.errors.map((e: Papa.ParseError) => e.message).join(', ')}`);
          setIsImporting(false);
          return;
        }

        const newContacts = results.data
          .filter(row => row.Name && row.Name.trim() !== "") // Ensure Name is present
          .map(row => ({
            user_id: user.id,
            name: row.Name.trim(),
            email: row.Email?.trim() || null,
            phone: row.Phone?.trim() || null,
            source: 'csv_import',
          }));

        if (newContacts.length === 0) {
          toast.info("No valid contacts found in the CSV to import.");
          setIsImporting(false);
          return;
        }

        try {
          const { error: insertError } = await supabase.from('contacts').insert(newContacts);
          if (insertError) throw insertError;
          toast.success(`${newContacts.length} contact(s) imported successfully!`);
          fetchContacts(); // Refresh the list
        } catch (err: any) {
          console.error("Error importing contacts:", err);
          toast.error(`Failed to import contacts: ${err.message}`);
        } finally {
          setIsImporting(false);
          // Reset file input
          if (event.target) {
            event.target.value = ""; 
          }
        }
      },
      error: (error: Error) => {
        console.error("CSV Parsing error:", error);
        toast.error(`Failed to parse CSV: ${error.message}`);
        setIsImporting(false);
      }
    });
  };

  const handleVcfUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.type !== "text/vcard" && file.type !== "text/x-vcard") {
        toast.error("Invalid file type. Please upload a VCF (.vcf) file.");
        // Note: MIME types for .vcf can vary. text/vcard is common.
        // Consider also checking file extension if MIME type is unreliable.
        // if (!file.name.toLowerCase().endsWith('.vcf')) { ... }
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!user) {
        toast.error("User not authenticated.");
        setIsImporting(false);
        return;
      }
      if (!e.target?.result || typeof e.target.result !== 'string') {
        toast.error("Failed to read VCF file content.");
        setIsImporting(false);
        return;
      }

      try {
        const vcfString = e.target.result;
        const cards: vCard[] = vCard.parse(vcfString); // Returns an array of vCard objects

        if (!cards || cards.length === 0) {
          toast.info("No contacts found in the VCF file.");
          setIsImporting(false);
          return;
        }

        const newContacts = cards.map(card => {
          // Helper to get a property value, handling potential arrays
          const getPropertyValue = (propName: string): string | undefined => {
            const property = card.get(propName); // property can be a single Property or Property[]
            if (Array.isArray(property)) {
              // If it's an array of properties (e.g., multiple TEL or EMAIL entries)
              // For now, we'll take the value of the first property in the array.
              // A more sophisticated approach might inspect property.toJSON()[1] (parameters)
              // for 'TYPE=PREF' or similar, but this is simpler for now.
              return property[0]?.valueOf();
            }
            // If it's a single Property object
            return property?.valueOf();
          };

          const name = getPropertyValue('fn') || getPropertyValue('n'); // Full Name or Formatted Name
          const email = getPropertyValue('email');
          const phone = getPropertyValue('tel');

          if (!name || name.trim() === "") return null; // Skip if no name

          return {
            user_id: user.id,
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            source: 'vcard_import',
          };
        }).filter(contact => contact !== null) as Omit<Contact, 'id' | 'created_at' | 'updated_at'>[];

        if (newContacts.length === 0) {
          toast.info("No valid contacts with names found in the VCF to import.");
          setIsImporting(false);
          return;
        }

        const { error: insertError } = await supabase.from('contacts').insert(newContacts);
        if (insertError) throw insertError;

        toast.success(`${newContacts.length} contact(s) imported successfully from VCF!`);
        fetchContacts(); // Refresh the list

      } catch (err: any) {
        console.error("Error processing VCF file:", err);
        toast.error(`Failed to process VCF: ${err.message || 'Unknown error'}`);
      } finally {
        setIsImporting(false);
        // Reset file input
        if (event.target) {
          event.target.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading VCF file.");
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

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
      fetchContacts(); // Refresh list
      setIsAddContactModalOpen(false); // Close modal
      // Reset form fields
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
    } catch (err: any) {
      console.error("Error adding new contact:", err);
      toast.error(`Failed to add contact: ${err.message}`);
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
          updated_at: new Date().toISOString(), // Manually set updated_at
        })
        .eq('id', editingContact.id)
        .eq('user_id', user.id); // Ensure user owns the contact

      if (error) throw error;

      toast.success(`Contact "${editContactName.trim()}" updated successfully!`);
      fetchContacts(); // Refresh list
      setIsEditContactModalOpen(false); // Close modal
      setEditingContact(null);
    } catch (err: any) {
      console.error("Error updating contact:", err);
      toast.error(`Failed to update contact: ${err.message}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  const openDeleteConfirm = (contact: Contact) => {
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
        .eq('user_id', user.id); // Ensure user owns the contact

      if (error) throw error;

      toast.success(`Contact "${contactToDelete.name}" deleted successfully!`);
      fetchContacts(); // Refresh list
      setContactToDelete(null); // Close/reset alert dialog state
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      toast.error(`Failed to delete contact: ${err.message}`);
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
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Guest Lists & Contacts</h1>
        <p className="text-muted-foreground">Manage your contacts and organize guest lists for your events.</p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
          <CardDescription>Upload CSV or VCF (.vcf) files to add multiple contacts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Import from CSV</h3>
            <div className="flex items-center space-x-2">
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={isImporting}
                className="max-w-xs"
              />
              <Button onClick={() => document.getElementById('csvFile')?.click()} disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Upload CSV'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected CSV headers: <code>Name</code> (required), <code>Email</code>, <code>Phone</code>.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Import from VCF (vCard)</h3>
            <div className="flex items-center space-x-2">
              <Input
                id="vcfFile"
                type="file"
                accept=".vcf,text/vcard,text/x-vcard"
                onChange={handleVcfUpload}
                disabled={isImporting}
                className="max-w-xs"
              />
              <Button onClick={() => document.getElementById('vcfFile')?.click()} disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Upload VCF'}
              </Button>
            </div>
             <p className="text-xs text-muted-foreground mt-1">
              Accepts standard <code>.vcf</code> files.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
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
          {loadingContacts && <p>Loading contacts...</p>}
          {!loadingContacts && contactsError && (
            <p className="text-red-600">Error: {contactsError}</p>
          )}
          {!loadingContacts && !contactsError && contacts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No contacts found. Upload a CSV or add contacts manually (feature coming soon!).
            </p>
          )}
          {!loadingContacts && !contactsError && contacts.length > 0 && (
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
                      <Button variant="outline" size="sm" onClick={() => openEditModal(contact)}>Edit</Button>
                      <AlertDialog open={contactToDelete?.id === contact.id} onOpenChange={(isOpen) => !isOpen && setContactToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(contact)}>Delete</Button>
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
                            <AlertDialogCancel disabled={isDeletingContact}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteContact} disabled={isDeletingContact}>
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
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Modal */}
      {editingContact && (
        <Dialog open={isEditContactModalOpen} onOpenChange={(isOpen) => {
          setIsEditContactModalOpen(isOpen);
          if (!isOpen) setEditingContact(null); // Reset editing contact when modal closes
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
    </div>
  );
}