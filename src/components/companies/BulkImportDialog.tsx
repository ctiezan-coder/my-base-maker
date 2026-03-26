import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const EXPECTED_COLUMNS = ["N°", "Entreprises", "Produits", "Contacts", "Personne Ressource", "Marchés d'exportation", "Dirigeant", "Observations"];

export function BulkImportDialog({ open, onOpenChange, onClose }: BulkImportDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const downloadSampleFile = () => {
    const sampleData = [
      {
        "N°": 1,
        "Entreprises": "EXEMPLE SARL",
        "Produits": "Café, Cacao, Noix de cajou",
        "Contacts": "contact@exemple.com Tel : 07 07 00 00 00",
        "Personne Ressource": "M. Jean Dupont",
        "Marchés d'exportation": "France, Belgique, Sous-région",
        "Dirigeant": "SELECTIONNER",
        "Observations": ""
      },
      {
        "N°": 2,
        "Entreprises": "AGRO EXPORT CI",
        "Produits": "Fruits tropicaux, Mangues séchées",
        "Contacts": "info@agroexport.ci Tel : 05 05 00 00 00",
        "Personne Ressource": "Mme Koné Fatou",
        "Marchés d'exportation": "Europe, USA",
        "Dirigeant": "FEMME",
        "Observations": ""
      }
    ];

    const wb = XLSX.utils.book_new();
    
    // Create sheets per sector
    const sectors = ["AGROALIMENTAIRE", "TEXTILES", "COSMÉTIQUES", "ARTISANAT", "BIENS ET SERVICES"];
    sectors.forEach(sector => {
      const ws = XLSX.utils.json_to_sheet(sampleData);
      XLSX.utils.book_append_sheet(wb, ws, sector);
    });

    XLSX.writeFile(wb, "modele-import-operateurs.xlsx");
    
    toast({
      title: "Fichier téléchargé",
      description: "Le modèle d'import a été téléchargé. Chaque onglet correspond à un secteur d'activité.",
    });
  };

  const extractEmailAndPhone = (contactStr: string | null | undefined): { email: string | null; phone: string | null } => {
    if (!contactStr) return { email: null, phone: null };
    const s = String(contactStr).trim();
    
    const emailMatch = s.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch ? emailMatch[1] : null;
    
    const phoneMatch = s.match(/(?:(?:\+?225\s*)?(?:\d{2}\s*){5}|\(\+?225\)\s*(?:\d{2}\s*){5})/);
    const phone = phoneMatch ? phoneMatch[0].trim() : null;
    
    return { email, phone };
  };

  const parseMarkets = (val: any): string[] => {
    if (!val) return [];
    const s = String(val).trim();
    if (!s || s === "ND") return [];
    const parts = s.split(/[,;/]|\bet\b/);
    return parts.map(p => p.trim()).filter(p => p.length > 1);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      
      let allRows: any[] = [];
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Detect sector from sheet name or content
        const sector = sheetName.toUpperCase().includes("AGRO") ? "Agroalimentaire"
          : sheetName.toUpperCase().includes("TEXT") ? "Textiles et Accessoires"
          : sheetName.toUpperCase().includes("COSM") ? "Cosmétiques"
          : sheetName.toUpperCase().includes("ARTIS") ? "Artisanat"
          : sheetName.toUpperCase().includes("BIEN") ? "Biens et Services"
          : sheetName;
        
        const validRows = jsonData.filter((row: any) => {
          const name = row["Entreprises"] || row["entreprises"];
          return name && String(name).trim().length > 0;
        });
        
        validRows.forEach((row: any) => {
          (row as any).__sector = sector;
          (row as any).__sheet = sheetName;
        });
        
        allRows = [...allRows, ...validRows];
      }
      
      setTotalCount(allRows.length);
      setPreview(allRows.slice(0, 10));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de lire le fichier Excel",
      });
    }
  };

  const generateHash = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const seenNames = new Set<string>();
      const companies: any[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const sector = sheetName.toUpperCase().includes("AGRO") ? "Agroalimentaire"
          : sheetName.toUpperCase().includes("TEXT") ? "Textiles et Accessoires"
          : sheetName.toUpperCase().includes("COSM") ? "Cosmétiques"
          : sheetName.toUpperCase().includes("ARTIS") ? "Artisanat"
          : sheetName.toUpperCase().includes("BIEN") ? "Biens et Services"
          : sheetName;

        for (const row of jsonData as any[]) {
          const name = (row["Entreprises"] || row["entreprises"] || "").toString().trim();
          if (!name) continue;
          
          const nameUpper = name.toUpperCase();
          if (seenNames.has(nameUpper)) continue;
          seenNames.add(nameUpper);

          const { email, phone } = extractEmailAndPhone(row["Contacts"] || row["contacts"]);
          const markets = parseMarkets(row["Marchés d'exportation"] || row["marchés d'exportation"] || row["Marché d'exportation"]);
          const contactName = (row["Personne Ressource"] || row["Personnes Ressources"] || row["personne ressource"] || "").toString().trim() || null;
          const products = (row["Produits"] || row["produits"] || "").toString().trim() || null;
          const observations = (row["Observations"] || row["observations"] || row["Observation"] || "").toString().trim() || null;
          
          const hash = generateHash(nameUpper + Date.now().toString());
          
          companies.push({
            company_name: name,
            activity_sector: sector,
            exported_products: products,
            email: email,
            phone: phone,
            legal_representative_name: contactName,
            current_export_markets: markets.length > 0 ? markets : [],
            rccm_number: `RCCM-IMP-${hash}`,
            dfe_number: `DFE-IMP-${hash}`,
            headquarters_location: "Abidjan, Côte d'Ivoire",
            legal_form: "Autre" as const,
            accompaniment_status: "Actif",
            aciex_interaction_history: observations && observations !== "SELECTIONNER" ? observations : null,
          });
        }
      }

      if (companies.length === 0) {
        toast({
          variant: "destructive",
          title: "Aucune donnée",
          description: "Aucun opérateur valide trouvé dans le fichier",
        });
        return;
      }

      // Insert in batches of 50
      const batchSize = 50;
      let inserted = 0;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const { error } = await supabase.from("companies").insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }

      toast({
        title: "Import réussi",
        description: `${inserted} opérateurs ont été importés avec succès`,
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
            Import en masse des opérateurs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Format attendu :</p>
                <p className="text-sm">Fichier Excel (.xlsx) avec <strong>un onglet par secteur</strong> (Agroalimentaire, Textiles, Cosmétiques, etc.).</p>
                <p className="text-sm">Colonnes requises : <strong>N°, Entreprises, Produits, Contacts, Personne Ressource, Marchés d'exportation, Dirigeant, Observations</strong></p>
                <p className="text-sm text-muted-foreground">La colonne Contacts peut contenir email et téléphone ensemble (ex: "contact@email.com Tel : 07 07 00 00 00")</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadSampleFile}
                  type="button"
                  className="w-full sm:w-auto mt-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le fichier modèle
                </Button>
              </div>
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
              <h3 className="font-medium">Aperçu ({totalCount} opérateurs trouvés, 10 premiers affichés)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Entreprise</th>
                      <th className="p-2 text-left">Secteur</th>
                      <th className="p-2 text-left">Produits</th>
                      <th className="p-2 text-left">Contact</th>
                      <th className="p-2 text-left">Marchés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-medium text-xs">{row["Entreprises"] || row["entreprises"] || "-"}</td>
                        <td className="p-2 text-xs">{row.__sector || "-"}</td>
                        <td className="p-2 text-xs max-w-[200px] truncate">{row["Produits"] || row["produits"] || "-"}</td>
                        <td className="p-2 text-xs">{row["Personne Ressource"] || row["Personnes Ressources"] || "-"}</td>
                        <td className="p-2 text-xs max-w-[150px] truncate">{row["Marchés d'exportation"] || row["Marché d'exportation"] || "-"}</td>
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
              {loading ? "Import en cours..." : `Importer${totalCount > 0 ? ` (${totalCount})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
