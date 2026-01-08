import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Download, Filter } from "lucide-react";

interface MissionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onClear: () => void;
  onExport?: () => void;
}

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "Brouillon", label: "Brouillon" },
  { value: "Soumise", label: "Soumise" },
  { value: "En validation N1", label: "En validation N1" },
  { value: "En validation DAF", label: "En validation DAF" },
  { value: "En validation DG", label: "En validation DG" },
  { value: "Approuvée", label: "Approuvée" },
  { value: "Rejetée", label: "Rejetée" },
  { value: "Planifiée", label: "Planifiée" },
  { value: "En cours", label: "En cours" },
  { value: "Terminée", label: "Terminée" },
  { value: "En attente rapport", label: "En attente rapport" },
  { value: "Rapport soumis", label: "Rapport soumis" },
  { value: "En liquidation", label: "En liquidation" },
  { value: "Liquidée", label: "Liquidée" },
  { value: "Soldée", label: "Soldée" },
];

const typeOptions = [
  { value: "all", label: "Tous les types" },
  { value: "Nationale", label: "Nationale" },
  { value: "Internationale", label: "Internationale" },
];

export function MissionFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onClear,
  onExport
}: MissionFiltersProps) {
  const hasFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par n°, destination, objet..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Effacer
        </Button>
      )}

      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Exporter
        </Button>
      )}
    </div>
  );
}
