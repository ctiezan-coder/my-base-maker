import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function BulkImportDialog({ open, onOpenChange, onClose }: BulkImportDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setPreview(jsonData.slice(0, 5));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de lire le fichier Excel",
      });
    }
  };

  const mapExcelToDatabase = (row: any) => {
    // Nettoyer les valeurs "ND" et vides
    const cleanValue = (val: any) => {
      if (!val || val === "ND" || val === "") return null;
      return val;
    };

    // Extraire les emails et téléphones s'ils sont dans le format "code"
    const extractEmail = (val: any) => {
      if (!val || val === "ND") return null;
      // Si c'est un code numérique, ne pas l'utiliser comme email
      if (/^\d+$/.test(val)) return null;
      return val;
    };

    return {
      company_name: row["Entreprise"] || "",
      legal_form: cleanValue(row["Statut juridique"]),
      activity_sector: cleanValue(row["Secteur"]),
      exported_products: cleanValue(row["Produits principaux"]),
      current_export_markets: cleanValue(row["Pays d'exportation"]) ? [row["Pays d'exportation"]] : null,
      legal_representative_name: cleanValue(row["Personne de contact"]),
      email: extractEmail(row["Email"]),
      phone: cleanValue(row["Téléphone"]),
      headquarters_location: cleanValue(row["Adresse"]) || "Non spécifié",
      website: cleanValue(row["Site web"]),
      certifications: cleanValue(row["Certifications"]) ? [row["Certifications"]] : null,
      rccm_number: cleanValue(row["Code export"]) || `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dfe_number: `DFE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accompaniment_status: cleanValue(row["Statut"]),
      aciex_interaction_history: cleanValue(row["Notes"]),
    };
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const companies = jsonData.map(mapExcelToDatabase).filter(c => c.company_name);

      const { error } = await supabase
        .from("companies")
        .insert(companies);

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${companies.length} opérateurs ont été importés avec succès`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'import",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import en masse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Téléchargez un fichier Excel (.xlsx) contenant les colonnes : Entreprise, Statut juridique, Secteur, Produits principaux, Pays d'exportation, Personne de contact, Email, Téléphone, Adresse, Site web, Certifications, Code export, Statut, Notes.
              <br />
              <a href="/sample-import.xlsx" download className="text-primary hover:underline mt-1 inline-block">
                📥 Télécharger un fichier exemple
              </a>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Sélectionner un fichier Excel</span>
              </Button>
            </label>
            {file && (
              <p className="mt-2 text-sm text-muted-foreground">
                Fichier sélectionné : {file.name}
              </p>
            )}
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Aperçu (5 premières lignes)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Entreprise</th>
                      <th className="p-2 text-left">Secteur</th>
                      <th className="p-2 text-left">Contact</th>
                      <th className="p-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row["Entreprise"]}</td>
                        <td className="p-2">{row["Secteur"] || "-"}</td>
                        <td className="p-2">{row["Personne de contact"] || "-"}</td>
                        <td className="p-2">{row["Email"] || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Import en cours..." : "Importer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
