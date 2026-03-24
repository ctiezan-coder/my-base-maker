import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, BookOpen, Package, Eye, Edit, Trash2, Download, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sanitizeFilterValue } from "@/lib/utils";

interface ProductCatalog {
  id: string;
  catalog_name: string;
  sector: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  publish_date: string | null;
  version: string;
  download_count: number;
  created_at: string;
}

interface CatalogProduct {
  id: string;
  catalog_id: string | null;
  product_name: string;
  product_code: string | null;
  hs_code: string | null;
  description: string | null;
  category: string | null;
  origin_region: string | null;
  company_id: string | null;
  image_url: string | null;
  price_fob: number | null;
  price_cif: number | null;
  currency: string;
  unit: string | null;
  min_order_quantity: number | null;
  production_capacity: string | null;
  packaging_details: string | null;
  certifications: string[] | null;
  available_quantity: number | null;
  lead_time_days: number | null;
  is_featured: boolean;
  created_at: string;
}

interface ProductCatalogsTabProps {
  canManage: boolean;
}

export function ProductCatalogsTab({ canManage }: ProductCatalogsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<ProductCatalog | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [catalogFormData, setCatalogFormData] = useState({
    catalog_name: "",
    sector: "",
    description: "",
    version: "1.0",
  });
  const [productFormData, setProductFormData] = useState({
    product_name: "",
    product_code: "",
    hs_code: "",
    description: "",
    category: "",
    origin_region: "",
    price_fob: "",
    price_cif: "",
    currency: "EUR",
    unit: "",
    min_order_quantity: "",
    production_capacity: "",
    packaging_details: "",
    certifications: "",
    available_quantity: "",
    lead_time_days: "",
    is_featured: false,
  });

  const { data: catalogs = [], isLoading } = useQuery({
    queryKey: ["product-catalogs", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("product_catalogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`catalog_name.ilike.%${sanitizeFilterValue(searchTerm)}%,sector.ilike.%${sanitizeFilterValue(searchTerm)}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductCatalog[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["catalog-products", selectedCatalog?.id],
    queryFn: async () => {
      if (!selectedCatalog) return [];
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*")
        .eq("catalog_id", selectedCatalog.id)
        .order("is_featured", { ascending: false });

      if (error) throw error;
      return data as CatalogProduct[];
    },
    enabled: !!selectedCatalog,
  });

  const createCatalogMutation = useMutation({
    mutationFn: async (data: typeof catalogFormData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("product_catalogs").insert([{
        ...data,
        created_by: user.user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catalogue créé avec succès" });
      queryClient.invalidateQueries({ queryKey: ["product-catalogs"] });
      setCatalogDialogOpen(false);
      resetCatalogForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateCatalogMutation = useMutation({
    mutationFn: async (data: Partial<ProductCatalog> & { id: string }) => {
      const { id, ...rest } = data;
      const { error } = await supabase.from("product_catalogs").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catalogue mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["product-catalogs"] });
      setCatalogDialogOpen(false);
      resetCatalogForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteCatalogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_catalogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catalogue supprimé" });
      queryClient.invalidateQueries({ queryKey: ["product-catalogs"] });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof productFormData) => {
      const { error } = await supabase.from("catalog_products").insert([{
        catalog_id: selectedCatalog?.id,
        product_name: data.product_name,
        product_code: data.product_code || null,
        hs_code: data.hs_code || null,
        description: data.description || null,
        category: data.category || null,
        origin_region: data.origin_region || null,
        price_fob: data.price_fob ? parseFloat(data.price_fob) : null,
        price_cif: data.price_cif ? parseFloat(data.price_cif) : null,
        currency: data.currency,
        unit: data.unit || null,
        min_order_quantity: data.min_order_quantity ? parseFloat(data.min_order_quantity) : null,
        production_capacity: data.production_capacity || null,
        packaging_details: data.packaging_details || null,
        certifications: data.certifications ? data.certifications.split(",").map(s => s.trim()) : null,
        available_quantity: data.available_quantity ? parseFloat(data.available_quantity) : null,
        lead_time_days: data.lead_time_days ? parseInt(data.lead_time_days) : null,
        is_featured: data.is_featured,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produit ajouté au catalogue" });
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalog_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produit supprimé" });
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const resetCatalogForm = () => {
    setCatalogFormData({ catalog_name: "", sector: "", description: "", version: "1.0" });
    setSelectedCatalog(null);
  };

  const resetProductForm = () => {
    setProductFormData({
      product_name: "",
      product_code: "",
      hs_code: "",
      description: "",
      category: "",
      origin_region: "",
      price_fob: "",
      price_cif: "",
      currency: "EUR",
      unit: "",
      min_order_quantity: "",
      production_capacity: "",
      packaging_details: "",
      certifications: "",
      available_quantity: "",
      lead_time_days: "",
      is_featured: false,
    });
    setSelectedProduct(null);
  };

  const handleEditCatalog = (catalog: ProductCatalog) => {
    setSelectedCatalog(catalog);
    setCatalogFormData({
      catalog_name: catalog.catalog_name,
      sector: catalog.sector,
      description: catalog.description || "",
      version: catalog.version,
    });
    setCatalogDialogOpen(true);
  };

  const handleSubmitCatalog = () => {
    if (!catalogFormData.catalog_name || !catalogFormData.sector) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    if (selectedCatalog) {
      updateCatalogMutation.mutate({ ...catalogFormData, id: selectedCatalog.id });
    } else {
      createCatalogMutation.mutate(catalogFormData);
    }
  };

  const handleSubmitProduct = () => {
    if (!productFormData.product_name) {
      toast({ title: "Erreur", description: "Le nom du produit est requis", variant: "destructive" });
      return;
    }
    createProductMutation.mutate(productFormData);
  };

  const togglePublish = (catalog: ProductCatalog) => {
    updateCatalogMutation.mutate({
      id: catalog.id,
      is_published: !catalog.is_published,
      publish_date: !catalog.is_published ? new Date().toISOString().split("T")[0] : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un catalogue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {canManage && (
          <Button onClick={() => { resetCatalogForm(); setCatalogDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau catalogue
          </Button>
        )}
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : catalogs.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun catalogue de produits</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogs.map((catalog) => (
            <Card key={catalog.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={catalog.is_published ? "default" : "secondary"}>
                    {catalog.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">v{catalog.version}</span>
                </div>
                <CardTitle className="text-lg mt-2">{catalog.catalog_name}</CardTitle>
                <CardDescription>{catalog.sector}</CardDescription>
              </CardHeader>
              <CardContent>
                {catalog.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{catalog.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {catalog.download_count} téléchargements
                  </span>
                  {catalog.publish_date && (
                    <span>Publié le {format(new Date(catalog.publish_date), "dd/MM/yyyy")}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedCatalog(catalog); setProductsDialogOpen(true); }}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Produits
                  </Button>
                  {canManage && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEditCatalog(catalog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish(catalog)}
                      >
                        {catalog.is_published ? "Dépublier" : "Publier"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Catalog Dialog */}
      <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCatalog ? "Modifier le catalogue" : "Nouveau catalogue"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du catalogue *</Label>
              <Input
                value={catalogFormData.catalog_name}
                onChange={(e) => setCatalogFormData({ ...catalogFormData, catalog_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secteur *</Label>
              <Input
                value={catalogFormData.sector}
                onChange={(e) => setCatalogFormData({ ...catalogFormData, sector: e.target.value })}
                placeholder="ex: Agroalimentaire"
              />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                value={catalogFormData.version}
                onChange={(e) => setCatalogFormData({ ...catalogFormData, version: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={catalogFormData.description}
                onChange={(e) => setCatalogFormData({ ...catalogFormData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCatalogDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmitCatalog} disabled={createCatalogMutation.isPending || updateCatalogMutation.isPending}>
              {selectedCatalog ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products List Dialog */}
      <Dialog open={productsDialogOpen} onOpenChange={setProductsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Produits - {selectedCatalog?.catalog_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {canManage && (
              <Button onClick={() => { resetProductForm(); setProductDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            )}
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun produit dans ce catalogue</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix FOB</TableHead>
                    <TableHead>Prix CIF</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">{product.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.product_code || "-"}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell>
                        {product.price_fob ? `${product.price_fob.toLocaleString()} ${product.currency}` : "-"}
                      </TableCell>
                      <TableCell>
                        {product.price_cif ? `${product.price_cif.toLocaleString()} ${product.currency}` : "-"}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Supprimer ce produit ?")) {
                                deleteProductMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nom du produit *</Label>
              <Input
                value={productFormData.product_name}
                onChange={(e) => setProductFormData({ ...productFormData, product_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code produit</Label>
              <Input
                value={productFormData.product_code}
                onChange={(e) => setProductFormData({ ...productFormData, product_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code HS</Label>
              <Input
                value={productFormData.hs_code}
                onChange={(e) => setProductFormData({ ...productFormData, hs_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Input
                value={productFormData.category}
                onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Région d'origine</Label>
              <Input
                value={productFormData.origin_region}
                onChange={(e) => setProductFormData({ ...productFormData, origin_region: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix FOB</Label>
              <Input
                type="number"
                value={productFormData.price_fob}
                onChange={(e) => setProductFormData({ ...productFormData, price_fob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix CIF</Label>
              <Input
                type="number"
                value={productFormData.price_cif}
                onChange={(e) => setProductFormData({ ...productFormData, price_cif: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unité</Label>
              <Input
                value={productFormData.unit}
                onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                placeholder="ex: kg, tonne, carton"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantité min. commande</Label>
              <Input
                type="number"
                value={productFormData.min_order_quantity}
                onChange={(e) => setProductFormData({ ...productFormData, min_order_quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacité de production</Label>
              <Input
                value={productFormData.production_capacity}
                onChange={(e) => setProductFormData({ ...productFormData, production_capacity: e.target.value })}
                placeholder="ex: 500 tonnes/an"
              />
            </div>
            <div className="space-y-2">
              <Label>Délai de livraison (jours)</Label>
              <Input
                type="number"
                value={productFormData.lead_time_days}
                onChange={(e) => setProductFormData({ ...productFormData, lead_time_days: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Certifications (séparées par virgule)</Label>
              <Input
                value={productFormData.certifications}
                onChange={(e) => setProductFormData({ ...productFormData, certifications: e.target.value })}
                placeholder="ISO 22000, Bio, Fairtrade"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Détails emballage</Label>
              <Input
                value={productFormData.packaging_details}
                onChange={(e) => setProductFormData({ ...productFormData, packaging_details: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Switch
                checked={productFormData.is_featured}
                onCheckedChange={(checked) => setProductFormData({ ...productFormData, is_featured: checked })}
              />
              <Label>Produit vedette</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmitProduct} disabled={createProductMutation.isPending}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
