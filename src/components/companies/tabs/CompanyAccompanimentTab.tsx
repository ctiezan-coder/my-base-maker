import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Calendar, User, Plus, FileText, CheckCircle2, 
  Clock, AlertCircle, Briefcase, TrendingUp, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ExtendedCompany, CompanyAccompanimentHistory, CompanyAccompanimentPlan, INTERACTION_TYPES } from "@/types/company-extended";

interface CompanyAccompanimentTabProps {
  company: ExtendedCompany;
}

const INTERACTION_TYPES_LIST = [
  'Réunion',
  'Appel téléphonique',
  'Email',
  'Visite terrain',
  'Formation',
  'Conseil',
  'Mise en relation B2B',
  'Participation événement',
  'Autre'
];

export function CompanyAccompanimentTab({ company }: CompanyAccompanimentTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    interaction_type: '',
    subject: '',
    description: '',
    outcome: '',
    next_steps: '',
    duration_minutes: '',
    location: ''
  });

  // Fetch accompaniment history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['company-accompaniment-history', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_accompaniment_history')
        .select('*')
        .eq('company_id', company.id)
        .order('interaction_date', { ascending: false });
      
      if (error) throw error;
      return data as CompanyAccompanimentHistory[];
    }
  });

  // Fetch accompaniment plans
  const { data: plans = [] } = useQuery({
    queryKey: ['company-accompaniment-plans', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_accompaniment_plans')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CompanyAccompanimentPlan[];
    }
  });

  // Save history entry
  const saveHistory = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('company_accompaniment_history')
        .insert([{
          ...data,
          company_id: company.id,
          duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-accompaniment-history', company.id] });
      toast({ title: 'Interaction enregistrée' });
      setHistoryDialogOpen(false);
      setFormData({
        interaction_type: '',
        subject: '',
        description: '',
        outcome: '',
        next_steps: '',
        duration_minutes: '',
        location: ''
      });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    }
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'En accompagnement':
      case 'En cours':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Accompagnement terminé':
      case 'Terminé':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Non accompagné':
      case 'Suspendu':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  const getMaturityColor = (level?: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-500';
      case 'Avancé':
        return 'bg-blue-500';
      case 'Intermédiaire':
        return 'bg-amber-500';
      case 'Débutant':
        return 'bg-gray-500';
      default:
        return 'bg-muted';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.interaction_type || !formData.subject) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Type et sujet requis' });
      return;
    }
    saveHistory.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Statut d'accompagnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge className={getStatusColor(company.accompaniment_status)}>
                  {company.accompaniment_status || 'Non défini'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maturité export</p>
                <Badge className={getMaturityColor(company.export_maturity_level)}>
                  {company.export_maturity_level || 'Non évalué'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="outline">
                  {company.accompaniment_type || 'Non défini'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <User className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsable ACIEX</p>
                <p className="font-medium text-sm">
                  {company.assigned_aciex_officer || 'Non assigné'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates clés */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Dates clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Premier contact</p>
              <p className="font-medium">
                {company.first_contact_date 
                  ? format(new Date(company.first_contact_date), "dd MMMM yyyy", { locale: fr })
                  : 'Non renseigné'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Début accompagnement</p>
              <p className="font-medium">
                {company.accompaniment_start_date 
                  ? format(new Date(company.accompaniment_start_date), "dd MMMM yyyy", { locale: fr })
                  : 'Non renseigné'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enregistrement ACIEX</p>
              <p className="font-medium">
                {company.registration_date_aciex 
                  ? format(new Date(company.registration_date_aciex), "dd MMMM yyyy", { locale: fr })
                  : 'Non renseigné'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Besoins d'accompagnement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Besoins d'accompagnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { label: 'Financier', value: company.financial_needs },
                { label: 'Technique', value: company.technical_needs },
                { label: 'Marketing', value: company.marketing_needs },
                { label: 'Logistique', value: company.logistics_needs },
              ].map((need) => (
                need.value && (
                  <div key={need.label} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{need.label}</p>
                      <p className="text-sm text-muted-foreground">{need.value}</p>
                    </div>
                  </div>
                )
              ))}
              {!company.financial_needs && !company.technical_needs && !company.marketing_needs && !company.logistics_needs && (
                <p className="text-muted-foreground">Aucun besoin identifié</p>
              )}
            </div>
            <div>
              {company.needs_priority && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Priorité</p>
                  <Badge 
                    className={
                      company.needs_priority === 'Urgent' ? 'bg-red-500' :
                      company.needs_priority === 'Important' ? 'bg-orange-500' :
                      company.needs_priority === 'Moyen' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }
                  >
                    {company.needs_priority}
                  </Badge>
                </div>
              )}
              {company.specific_needs_details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Détails spécifiques</p>
                  <p className="text-sm">{company.specific_needs_details}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique d'accompagnement */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Historique d'accompagnement ({history.length})
          </CardTitle>
          <Button size="sm" onClick={() => setHistoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle interaction
          </Button>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune interaction enregistrée</p>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{item.interaction_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.interaction_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </span>
                      {item.duration_minutes && (
                        <span className="text-xs text-muted-foreground">
                          • {item.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <p className="font-medium">{item.subject}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                    )}
                    {item.outcome && (
                      <div className="mt-2 p-2 bg-green-500/10 rounded text-sm">
                        <span className="font-medium text-green-600">Résultat:</span> {item.outcome}
                      </div>
                    )}
                    {item.next_steps && (
                      <div className="mt-2 p-2 bg-blue-500/10 rounded text-sm">
                        <span className="font-medium text-blue-600">Prochaines étapes:</span> {item.next_steps}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans d'accompagnement */}
      {plans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Plans d'accompagnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{plan.plan_title}</h4>
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  </div>
                  {plan.fiscal_year && (
                    <p className="text-sm text-muted-foreground">Année fiscale: {plan.fiscal_year}</p>
                  )}
                  {plan.allocated_budget && (
                    <p className="text-sm text-muted-foreground">
                      Budget: {plan.allocated_budget.toLocaleString()} FCFA
                      {plan.consumed_budget && ` (consommé: ${plan.consumed_budget.toLocaleString()} FCFA)`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog nouvelle interaction */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle interaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type d'interaction *</label>
                <Select 
                  value={formData.interaction_type} 
                  onValueChange={(v) => setFormData({ ...formData, interaction_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPES_LIST.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Durée (minutes)</label>
                <Input 
                  type="number"
                  value={formData.duration_minutes} 
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} 
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Sujet *</label>
              <Input 
                value={formData.subject} 
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Résultat / Issue</label>
              <Textarea 
                value={formData.outcome} 
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} 
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prochaines étapes</label>
              <Textarea 
                value={formData.next_steps} 
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })} 
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Lieu</label>
              <Input 
                value={formData.location} 
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveHistory.isPending}>
                {saveHistory.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
