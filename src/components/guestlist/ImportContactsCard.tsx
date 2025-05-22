import { ChangeEvent } from 'react';
import { supabase, UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import Papa from 'papaparse';
import vCard from 'vcf';

// Minimal Contact structure for insertion (id, created_at, updated_at are auto-generated)
interface ContactUploadData {
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
}

// Expected CSV row structure
interface CsvRow {
  Name: string;
  Email?: string;
  Phone?: string;
}

interface ImportContactsCardProps {
  user: UserProfile | null;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  onImportSuccess: () => void;
}

export function ImportContactsCard({
  user,
  isImporting,
  setIsImporting,
  onImportSuccess,
}: ImportContactsCardProps) {
  const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.type !== "text/csv") {
        toast.error("Invalid file type. Please upload a CSV file.");
        if (event.target) event.target.value = ""; // Reset file input
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
          if (event.target) event.target.value = "";
          return;
        }
        if (results.errors.length > 0) {
          console.error("CSV Parsing errors:", results.errors);
          toast.error(`Error parsing CSV: ${results.errors.map((e: Papa.ParseError) => e.message).join(', ')}`);
          setIsImporting(false);
          if (event.target) event.target.value = "";
          return;
        }

        const newContacts: ContactUploadData[] = results.data
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
          if (event.target) event.target.value = "";
          return;
        }

        try {
          const { error: insertError } = await supabase.from('contacts').insert(newContacts);
          if (insertError) throw insertError;
          toast.success(`${newContacts.length} contact(s) imported successfully!`);
          onImportSuccess(); // Refresh the list in parent
        } catch (err: any) {
          console.error("Error importing contacts:", err);
          toast.error(`Failed to import contacts: ${err.message}`);
        } finally {
          setIsImporting(false);
          if (event.target) event.target.value = "";
        }
      },
      error: (error: Error) => {
        console.error("CSV Parsing error:", error);
        toast.error(`Failed to parse CSV: ${error.message}`);
        setIsImporting(false);
        if (event.target) event.target.value = "";
      }
    });
  };

  const handleVcfUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.type !== "text/vcard" && file.type !== "text/x-vcard" && !file.name.toLowerCase().endsWith('.vcf')) {
        toast.error("Invalid file type. Please upload a VCF (.vcf) file.");
        if (event.target) event.target.value = "";
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!user) {
        toast.error("User not authenticated.");
        setIsImporting(false);
        if (event.target) event.target.value = "";
        return;
      }
      if (!e.target?.result || typeof e.target.result !== 'string') {
        toast.error("Failed to read VCF file content.");
        setIsImporting(false);
        if (event.target) event.target.value = "";
        return;
      }

      try {
        const vcfString = e.target.result;
        const cards: vCard[] = vCard.parse(vcfString);

        if (!cards || cards.length === 0) {
          toast.info("No contacts found in the VCF file.");
          setIsImporting(false);
          if (event.target) event.target.value = "";
          return;
        }

        const newContacts: ContactUploadData[] = cards.map(card => {
          const getPropertyValue = (propName: string): string | undefined => {
            const property = card.get(propName);
            if (Array.isArray(property)) {
              return property[0]?.valueOf();
            }
            return property?.valueOf();
          };

          const name = getPropertyValue('fn') || getPropertyValue('n');
          const email = getPropertyValue('email');
          const phone = getPropertyValue('tel');

          if (!name || name.trim() === "") return null;

          return {
            user_id: user.id,
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            source: 'vcard_import',
          };
        }).filter(contact => contact !== null) as ContactUploadData[];

        if (newContacts.length === 0) {
          toast.info("No valid contacts with names found in the VCF to import.");
          setIsImporting(false);
          if (event.target) event.target.value = "";
          return;
        }

        const { error: insertError } = await supabase.from('contacts').insert(newContacts);
        if (insertError) throw insertError;

        toast.success(`${newContacts.length} contact(s) imported successfully from VCF!`);
        onImportSuccess(); // Refresh the list in parent

      } catch (err: any) {
        console.error("Error processing VCF file:", err);
        toast.error(`Failed to process VCF: ${err.message || 'Unknown error'}`);
      } finally {
        setIsImporting(false);
        if (event.target) event.target.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Error reading VCF file.");
      setIsImporting(false);
      if (event.target) event.target.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <Card className="md:col-span-2">
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
            {/* This button is styled but the actual click is on the hidden input */}
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
  );
}