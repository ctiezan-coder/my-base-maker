import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Factory, Package, Plus, Pencil, Trash2, TrendingUp, Star, Leaf, Clock, Warehouse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { ExtendedCompany, CompanyProduct } from "@/types/company-extended";

interface CompanyProductionTabProps {
  company: ExtendedCompany;
}

export function CompanyProductionTab({ company }: CompanyProductionTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CompanyProduct | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    hs_code: '',
    category: '',
    product_range: '',
    description: '',
    unit: '',
    price_fob: '',
    price_cif: '',
    currency: 'XOF',
    min_order_quantity: '',
    production_capacity: '',
    available_quantity: '',
    is_exported: false,
    is_featured: false,
    is_new_development: false
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['company-products', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_products')
        .select('*')
        .eq('company_id', company.id)
        .order('is_featured', { ascending: false })
        .order('product_name');
      
      if (error) throw error;
      return data as CompanyProduct[];
    }
  });

  // Save product mutation
  const saveProduct = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        price_fob: data.price_fob ? parseFloat(data.price_fob) : null,
        price_cif: data.price_cif ? parseFloat(data.price_cif) : null,
        min_order_quantity: data.min_order_quantity ? parseFloat(data.min_order_quantity) : null,
        production_capacity: data.production_capacity ? parseFloat(data.production_capacity) : null,
        available_quantity: data.available_quantity ? parseFloat(data.available_quantity) : null,
      };
      
      if (editingProduct) {
        const { error } = await supabase
          .from('company_products')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_products')
          .insert([{ ...payload, company_id: company.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-products', company.id] });
      toast({ title: editingProduct ? 'Produit mis à jour' : 'Produit ajouté' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    }
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-products', company.id] });
      toast({ title: 'Produit supprimé' });
    }
  });

  const handleOpenDialog = (product?: CompanyProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name,
        product_code: product.product_code || '',
        hs_code: product.hs_code || '',
        category: product.category || '',
        product_range: product.product_range || '',
        description: product.description || '',
        unit: product.unit || '',
        price_fob: product.price_fob?.toString() || '',
        price_cif: product.price_cif?.toString() || '',
        currency: product.currency || 'XOF',
        min_order_quantity: product.min_order_quantity?.toString() || '',
        production_capacity: product.production_capacity?.toString() || '',
        available_quantity: product.available_quantity?.toString() || '',
        is_exported: product.is_exported,
        is_featured: product.is_featured,
        is_new_development: product.is_new_development
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '',
        product_code: '',
        hs_code: '',
        category: '',
        product_range: '',
        description: '',
        unit: '',
        price_fob: '',
        price_cif: '',
        currency: 'XOF',
        min_order_quantity: '',
        production_capacity: '',
        available_quantity: '',
        is_exported: false,
        is_featured: false,
        is_new_development: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Nom du produit requis' });
      return;
    }
    saveProduct.mutate(formData);
  };

  const utilizationRate = company.capacity_utilization_rate || 0;

  return (
    <div className="space-y-6">
      {/* Capacités de production */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Factory className="h-5 w-5 text-primary" />
            Capacités de Production
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Capacité annuelle</p>
              </div>
              <p className="text-2xl font-bold">
                {company.annual_capacity?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Production actuelle</p>
              </div>
              <p className="text-2xl font-bold">
                {company.current_production?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Délai production (jours)</p>
              </div>
              <p className="text-2xl font-bold">
                {company.production_lead_time_days || 'N/A'}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Warehouse className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Stock disponible</p>
              </div>
              <p className="text-lg font-medium">
                {company.available_stock || 'Non renseigné'}
              </p>
            </div>
          </div>
          
          {/* Taux d'utilisation */}
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Taux d'utilisation des capacités</p>
              <span className="text-lg font-bold">{utilizationRate}%</span>
            </div>
            <Progress value={utilizationRate} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Infos supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {company.production_equipment && (
              <div>
                <p className="text-sm font-medium mb-2">Équipements et lignes de production</p>
                <p className="text-sm text-muted-foreground">{company.production_equipment}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Possibilité d'augmentation</p>
              <Badge variant={company.can_increase_capacity ? "default" : "secondary"}>
                {company.can_increase_capacity ? "Oui, capacité extensible" : "Non"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produits */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Produits ({products.length})
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun produit enregistré</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg bg-card relative group hover:shadow-md transition-shadow">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => {
                        if (confirm('Supprimer ce produit ?')) deleteProduct.mutate(product.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    {product.is_featured && (
                      <Badge className="bg-amber-500/10 text-amber-600 gap-1">
                        <Star className="h-3 w-3" /> Vedette
                      </Badge>
                    )}
                    {product.is_new_development && (
                      <Badge className="bg-green-500/10 text-green-600 gap-1">
                        <Leaf className="h-3 w-3" /> Nouveau
                      </Badge>
                    )}
                    {product.is_exported && (
                      <Badge variant="outline">Exporté</Badge>
                    )}
                  </div>
                  
                  <h4 className="font-medium mb-1">{product.product_name}</h4>
                  {product.hs_code && (
                    <p className="text-xs text-muted-foreground font-mono mb-2">Code SH: {product.hs_code}</p>
                  )}
                  {product.category && (
                    <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
                  )}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.price_fob && (
                      <div>
                        <p className="text-muted-foreground text-xs">Prix FOB</p>
                        <p className="font-medium">{product.price_fob.toLocaleString()} {product.currency}</p>
                      </div>
                    )}
                    {product.available_quantity && (
                      <div>
                        <p className="text-muted-foreground text-xs">Disponible</p>
                        <p className="font-medium">{product.available_quantity.toLocaleString()} {product.unit}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom du produit *</label>
                <Input 
                  value={formData.product_name} 
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code produit</label>
                <Input 
                  value={formData.product_code} 
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Code SH</label>
                <Input 
                  value={formData.hs_code} 
                  onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })} 
                  placeholder="ex: 0801.11.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Input 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Prix FOB</label>
                <Input 
                  type="number"
                  value={formData.price_fob} 
                  onChange={(e) => setFormData({ ...formData, price_fob: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prix CIF</label>
                <Input 
                  type="number"
                  value={formData.price_cif} 
                  onChange={(e) => setFormData({ ...formData, price_cif: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Devise</label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Quantité min. commande</label>
                <Input 
                  type="number"
                  value={formData.min_order_quantity} 
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacité production</label>
                <Input 
                  type="number"
                  value={formData.production_capacity} 
                  onChange={(e) => setFormData({ ...formData, production_capacity: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantité disponible</label>
                <Input 
                  type="number"
                  value={formData.available_quantity} 
                  onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={formData.is_exported}
                  onChange={(e) => setFormData({ ...formData, is_exported: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Produit exporté</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Produit vedette</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={formData.is_new_development}
                  onChange={(e) => setFormData({ ...formData, is_new_development: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">En développement</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Annuler</Button>
              <Button type="submit" disabled={saveProduct.isPending}>
                {saveProduct.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
