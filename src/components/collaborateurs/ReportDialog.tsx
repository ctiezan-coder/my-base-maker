import { useState } from "react";
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

type ReportType = "monthly" | "pme" | "opportunities" | "tasks";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
}

const reportTitles: Record<ReportType, string> = {
  monthly: "Rapport mensuel d'activités",
  pme: "Rapport PME",
  opportunities: "Rapport opportunités",
  tasks: "Rapport tâches"
};

const reportDescriptions: Record<ReportType, string> = {
  monthly: "Générez un rapport complet de vos activités sur une période donnée",
  pme: "Rapport détaillé sur une PME spécifique",
  opportunities: "Analyse des opportunités et matches",
  tasks: "Suivi et performance de vos tâches"
};

export function ReportDialog({ open, onOpenChange, reportType }: ReportDialogProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedPme, setSelectedPme] = useState<string>("");
  const [period, setPeriod] = useState<string>("");

  const pmeList = [
    "Cacao Excellence CI",
    "BioKarité Côte d'Ivoire",
    "Textile Africain Premium",
    "Anacarde Export Plus"
  ];

  const handleGenerate = () => {
    console.log("Génération du rapport:", { reportType, dateFrom, dateTo, selectedPme, period });
    toast.success("Rapport généré avec succès");
    onOpenChange(false);
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
                    <SelectItem key={pme} value={pme}>
                      {pme}
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerate}>
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
