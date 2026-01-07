import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Phone, Plus, Pencil, Trash2, Users, Crown, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ExtendedCompany, CompanyContact, CompanyLeadershipHistory, DEPARTMENT_OPTIONS } from "@/types/company-extended";

interface CompanyContactsTabProps {
  company: ExtendedCompany;
}

const DEPARTMENTS = ['Commercial', 'Production', 'Qualité', 'Logistique', 'Finance', 'Direction', 'Export', 'RH', 'Autre'];

export function CompanyContactsTab({ company }: CompanyContactsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [formData, setFormData] = useState({
    department: '',
    name: '',
    function: '',
    email: '',
    phone: '',
    is_primary: false
  });

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['company-contacts', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', company.id)
        .order('is_primary', { ascending: false })
        .order('department');
      
      if (error) throw error;
      return data as CompanyContact[];
    }
  });

  // Fetch leadership history
  const { data: leadershipHistory = [] } = useQuery({
    queryKey: ['company-leadership-history', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_leadership_history')
        .select('*')
        .eq('company_id', company.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as CompanyLeadershipHistory[];
    }
  });

  // Save contact mutation
  const saveContact = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingContact) {
        const { error } = await supabase
          .from('company_contacts')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_contacts')
          .insert([{ ...data, company_id: company.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contacts', company.id] });
      toast({ title: editingContact ? 'Contact mis à jour' : 'Contact ajouté' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    }
  });

  // Delete contact mutation
  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contacts', company.id] });
      toast({ title: 'Contact supprimé' });
    }
  });

  const handleOpenDialog = (contact?: CompanyContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        department: contact.department,
        name: contact.name,
        function: contact.function || '',
        email: contact.email || '',
        phone: contact.phone || '',
        is_primary: contact.is_primary
      });
    } else {
      setEditingContact(null);
      setFormData({
        department: '',
        name: '',
        function: '',
        email: '',
        phone: '',
        is_primary: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Nom et département requis' });
      return;
    }
    saveContact.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Représentant légal et contacts principaux */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-500" />
            Représentant Légal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{company.legal_representative_name || 'Non renseigné'}</p>
              </div>
              {company.legal_representative_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${company.legal_representative_email}`} className="text-primary hover:underline">
                    {company.legal_representative_email}
                  </a>
                </div>
              )}
              {company.legal_representative_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{company.legal_representative_phone}</span>
                </div>
              )}
            </div>
            
            {/* Contact principal */}
            {company.main_contact_name && (
              <div className="space-y-4 border-l pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Contact principal</p>
                  <p className="font-medium">{company.main_contact_name}</p>
                  {company.main_contact_function && (
                    <p className="text-sm text-muted-foreground">{company.main_contact_function}</p>
                  )}
                </div>
                {company.main_contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${company.main_contact_email}`} className="text-primary hover:underline">
                      {company.main_contact_email}
                    </a>
                  </div>
                )}
                {company.main_contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.main_contact_phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Responsable Export */}
          {company.export_manager_name && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Responsable Export
                </p>
                <div className="flex items-start gap-4">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{company.export_manager_name}</p>
                    {company.export_manager_email && (
                      <a href={`mailto:${company.export_manager_email}`} className="text-sm text-primary hover:underline block">
                        {company.export_manager_email}
                      </a>
                    )}
                    {company.export_manager_phone && (
                      <p className="text-sm text-muted-foreground">{company.export_manager_phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contacts par département */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Contacts par Département ({contacts.length})
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : contacts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun contact enregistré</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border rounded-lg bg-muted/50 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenDialog(contact)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => {
                        if (confirm('Supprimer ce contact ?')) deleteContact.mutate(contact.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{contact.department}</Badge>
                        {contact.is_primary && (
                          <Badge className="text-xs bg-amber-500/10 text-amber-600">Principal</Badge>
                        )}
                      </div>
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.function && (
                        <p className="text-sm text-muted-foreground truncate">{contact.function}</p>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline block truncate">
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des changements de direction */}
      {leadershipHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Historique de Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadershipHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.leader_name}</p>
                        <p className="text-sm text-muted-foreground">{item.position}</p>
                      </div>
                      <div className="text-right text-sm">
                        {item.start_date && (
                          <p>{format(new Date(item.start_date), "MMM yyyy", { locale: fr })}</p>
                        )}
                        {item.end_date && (
                          <p className="text-muted-foreground">
                            → {format(new Date(item.end_date), "MMM yyyy", { locale: fr })}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.reason_for_change && (
                      <p className="text-sm text-muted-foreground mt-2">{item.reason_for_change}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for adding/editing contact */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Département *</label>
              <Select 
                value={formData.department} 
                onValueChange={(v) => setFormData({ ...formData, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fonction</label>
              <Input 
                value={formData.function} 
                onChange={(e) => setFormData({ ...formData, function: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_primary" className="text-sm">Contact principal du département</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Annuler</Button>
              <Button type="submit" disabled={saveContact.isPending}>
                {saveContact.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
