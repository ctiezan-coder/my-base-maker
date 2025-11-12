import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SendToOperatorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  opportunityTitle: string;
  opportunitySector: string;
}

export const SendToOperatorsDialog = ({
  open,
  onOpenChange,
  opportunityId,
  opportunityTitle,
  opportunitySector,
}: SendToOperatorsDialogProps) => {
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>(opportunitySector);
  const [sending, setSending] = useState(false);

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedOperators(new Set());
      setSearchTerm("");
      setSectorFilter(opportunitySector);
    }
  }, [open, opportunitySector]);

  // Fetch companies (operators) matching the opportunity sector
  const { data: operators = [], isLoading } = useQuery({
    queryKey: ["operators-for-opportunity", sectorFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("*")
        .order("company_name", { ascending: true });

      // Filter by sector - use ilike for case-insensitive matching
      if (sectorFilter && sectorFilter !== "all") {
        query = query.ilike("activity_sector", sectorFilter);
      }

      // Search filter
      if (searchTerm) {
        query = query.or(
          `company_name.ilike.%${searchTerm}%,exported_products.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch available sectors from database
  const { data: availableSectors = [] } = useQuery({
    queryKey: ["unique-sectors-operators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("activity_sector")
        .not("activity_sector", "is", null);
      
      if (error) throw error;
      
      const uniqueSectors = Array.from(
        new Set(data.map(c => c.activity_sector).filter(Boolean))
      ).sort();
      
      return uniqueSectors;
    },
    enabled: open,
  });

  const toggleOperator = (operatorId: string) => {
    const newSelected = new Set(selectedOperators);
    if (newSelected.has(operatorId)) {
      newSelected.delete(operatorId);
    } else {
      newSelected.add(operatorId);
    }
    setSelectedOperators(newSelected);
  };

  const selectAll = () => {
    if (selectedOperators.size === operators.length) {
      setSelectedOperators(new Set());
    } else {
      setSelectedOperators(new Set(operators.map((op) => op.id)));
    }
  };

  const handleSend = async () => {
    if (selectedOperators.size === 0) {
      toast.error("Veuillez sélectionner au moins un opérateur");
      return;
    }

    setSending(true);
    try {
      // Get opportunity details
      const { data: opportunity } = await supabase
        .from("export_opportunities")
        .select("*")
        .eq("id", opportunityId)
        .single();

      if (!opportunity) {
        throw new Error("Opportunité introuvable");
      }

      // Create notifications for each selected operator
      const notifications = Array.from(selectedOperators).map((operatorId) => {
        const operator = operators.find((op) => op.id === operatorId);
        return {
          user_id: operator?.created_by,
          title: "Nouvelle opportunité d'export",
          message: `L'opportunité "${opportunityTitle}" correspond à votre secteur d'activité (${opportunity.sector}). Destination: ${opportunity.destination_country}, Valeur: ${opportunity.estimated_value.toLocaleString()} ${opportunity.currency}.`,
          type: "opportunity",
          reference_table: "export_opportunities",
          reference_id: opportunityId,
        };
      });

      // Insert all notifications
      const { error } = await supabase
        .from("notifications")
        .insert(notifications.filter((n) => n.user_id));

      if (error) throw error;

      toast.success(
        `Opportunité envoyée à ${selectedOperators.size} opérateur${
          selectedOperators.size > 1 ? "s" : ""
        }`
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending opportunity:", error);
      toast.error("Erreur lors de l'envoi de l'opportunité");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Envoyer l'opportunité aux opérateurs</DialogTitle>
          <DialogDescription>
            Sélectionnez les opérateurs qui correspondent à cette opportunité :{" "}
            <span className="font-semibold">{opportunityTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 min-h-0">
          {/* Search and filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou produits exportés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {availableSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select all button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedOperators.size} opérateur{selectedOperators.size > 1 ? "s" : ""}{" "}
              sélectionné{selectedOperators.size > 1 ? "s" : ""}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={operators.length === 0}
            >
              {selectedOperators.size === operators.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </Button>
          </div>

          {/* Operators list */}
          <ScrollArea className="flex-1 pr-4 min-h-0">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : operators.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun opérateur trouvé pour ce secteur
              </p>
            ) : (
              <div className="space-y-3">
                {operators.map((operator) => (
                  <div
                    key={operator.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOperators.has(operator.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleOperator(operator.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedOperators.has(operator.id)}
                        onCheckedChange={() => toggleOperator(operator.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold truncate">{operator.company_name}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {operator.activity_sector && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {operator.activity_sector}
                              </Badge>
                            </div>
                          )}
                          {operator.exported_products && (
                            <p className="text-xs">
                              Produits: {operator.exported_products}
                            </p>
                          )}
                          {operator.target_export_markets &&
                            operator.target_export_markets.length > 0 && (
                              <p className="text-xs">
                                Marchés cibles:{" "}
                                {operator.target_export_markets.join(", ")}
                              </p>
                            )}
                          {operator.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{operator.email}</span>
                            </div>
                          )}
                          {operator.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{operator.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t bg-background">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={selectedOperators.size === 0 || sending}
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Envoi en cours..." : `Envoyer à ${selectedOperators.size} opérateur${selectedOperators.size > 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
