import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useReportGeneration } from "@/hooks/useReportGeneration";

type ReportType = "monthly" | "pme" | "opportunities" | "tasks" | "pme_global";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
}

const reportTitles: Record<ReportType, string> = {
  monthly: "Rapport mensuel d'activités",
  pme: "Rapport PME",
  pme_global: "Rapport global PME",
  opportunities: "Rapport opportunités",
  tasks: "Rapport tâches"
};

const reportDescriptions: Record<ReportType, string> = {
  monthly: "Générez un rapport complet de vos activités sur une période donnée",
  pme: "Rapport détaillé sur une PME spécifique",
  pme_global: "Vue d'ensemble de toutes les PME avec statistiques et analyses",
  opportunities: "Analyse des opportunités et matches",
  tasks: "Suivi et performance de vos tâches"
};

export function ReportDialog({ open, onOpenChange, reportType }: ReportDialogProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedPme, setSelectedPme] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { generateReport } = useReportGeneration();

  // Charger la liste des PME depuis la base de données
  const { data: companiesData } = useQuery({
    queryKey: ['companies-for-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, company_name')
        .order('company_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const pmeList = companiesData || [];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateReport({
        reportType,
        dateFrom,
        dateTo,
        selectedPme,
        period
      });
      toast.success("Rapport généré et téléchargé avec succès");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération du rapport");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{reportTitles[reportType]}</DialogTitle>
          <DialogDescription>
            {reportDescriptions[reportType]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {reportType === "pme" && (
            <div className="space-y-2">
              <Label>Sélectionner une PME</Label>
              <Select value={selectedPme} onValueChange={setSelectedPme}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une PME..." />
                </SelectTrigger>
                <SelectContent>
                  {pmeList.map((pme) => (
                    <SelectItem key={pme.id} value={pme.id}>
                      {pme.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === "monthly" && (
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Mois en cours</SelectItem>
                  <SelectItem value="last">Mois dernier</SelectItem>
                  <SelectItem value="last3">3 derniers mois</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(reportType === "opportunities" || reportType === "tasks" || period === "custom") && (
            <>
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Génération en cours..." : "Générer le rapport"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
