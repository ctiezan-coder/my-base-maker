import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Building2,
  Clock,
  MapPin,
  Users,
  Target,
  FileText,
  AlertCircle,
  Euro,
  Megaphone,
} from "lucide-react";

interface MediaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: any;
  directionName?: string;
}

export function MediaDetailsDialog({
  open,
  onOpenChange,
  media,
  directionName,
}: MediaDetailsDialogProps) {
  if (!media) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livré":
        return "default";
      case "Validé":
        return "outline";
      case "En cours":
        return "secondary";
      case "Annulé":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Résumé - Service Communication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* En-tête avec titre et statut */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{media.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{media.media_type}</Badge>
              <Badge variant={getStatusColor(media.statut_workflow || "Demande")}>
                {media.statut_workflow || "Demande"}
              </Badge>
              {media.priority_level && (
                <Badge
                  variant={
                    media.priority_level === "Haute"
                      ? "destructive"
                      : media.priority_level === "Moyenne"
                      ? "outline"
                      : "secondary"
                  }
                >
                  Priorité {media.priority_level}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations principales */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informations
            </h4>

            <InfoRow
              icon={Building2}
              label="Direction"
              value={directionName}
            />

            <InfoRow
              icon={Calendar}
              label="Date de l'événement"
              value={
                media.date_evenement
                  ? format(new Date(media.date_evenement), "dd MMMM yyyy", {
                      locale: fr,
                    })
                  : null
              }
            />

            <InfoRow
              icon={Clock}
              label="Heure"
              value={media.heure_evenement}
            />

            <InfoRow
              icon={MapPin}
              label="Lieu"
              value={media.lieu_evenement}
            />

            <InfoRow
              icon={Euro}
              label="Budget estimé"
              value={
                media.budget_estime
                  ? `${media.budget_estime.toLocaleString()} FCFA`
                  : null
              }
            />
          </div>

          {/* Description et objectifs */}
          {(media.description || media.objectifs || media.contexte_activite) && (
            <>
              <Separator />
              <div className="space-y-3">
                {media.contexte_activite && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Contexte</span>
                    </div>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">
                      {media.contexte_activite}
                    </p>
                  </div>
                )}

                {media.objectifs && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Objectifs</span>
                    </div>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">
                      {media.objectifs}
                    </p>
                  </div>
                )}

                {media.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Description</span>
                    </div>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">
                      {media.description}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cibles et parties prenantes */}
          {(media.cibles || media.parties_prenantes) && (
            <>
              <Separator />
              <div className="space-y-3">
                {media.cibles && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Cibles</span>
                    </div>
                    <p className="text-sm">{media.cibles}</p>
                  </div>
                )}

                {media.parties_prenantes && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Parties prenantes
                      </span>
                    </div>
                    <p className="text-sm">{media.parties_prenantes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Observations */}
          {media.observations && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Observations</span>
                </div>
                <p className="text-sm bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                  {media.observations}
                </p>
              </div>
            </>
          )}

          {/* Dates de suivi */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Date de demande</p>
              <p className="font-medium">
                {media.date_demande
                  ? format(new Date(media.date_demande), "dd/MM/yyyy", { locale: fr })
                  : format(new Date(media.created_at), "dd/MM/yyyy", { locale: fr })}
              </p>
            </div>
            {media.date_livraison_prevue && (
              <div>
                <p className="text-muted-foreground">Livraison prévue</p>
                <p className="font-medium">
                  {format(new Date(media.date_livraison_prevue), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            )}
            {media.date_livraison_effective && (
              <div>
                <p className="text-muted-foreground">Livraison effective</p>
                <p className="font-medium text-green-600">
                  {format(new Date(media.date_livraison_effective), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
