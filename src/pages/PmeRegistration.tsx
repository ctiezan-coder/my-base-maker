import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserDirection } from "@/hooks/useUserDirection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/ci-export-logo.png";
import { Building2, User, Globe, Package, ChevronRight, ChevronLeft, Check } from "lucide-react";

const FILIERES = [
  "AGROALIMENTAIRE",
  "TEXTILE ET HABILLEMENT",
  "COSMÉTIQUE",
  "ARTISANAT",
  "NUMÉRIQUE / TIC",
  "INDUSTRIE",
  "BTP",
  "MINES",
  "SERVICES",
  "AGRICULTURE",
  "PÊCHE ET AQUACULTURE",
  "BOIS ET DÉRIVÉS",
  "CHIMIE ET PHARMACIE",
  "AUTRE",
];

const STATUTS_JURIDIQUES = [
  "SA",
  "SARL",
  "SAS",
  "SARLU",
  "EI",
  "GIE",
  "COOPÉRATIVE",
  "ASSOCIATION",
  "AUTRE",
];

const QUALITES_EXPORT = [
  "Exportateur direct",
  "Exportateur indirect",
  "Potentiel exportateur",
  "Non exportateur",
];

const GENRES = ["Homme", "Femme"];

interface FormData {
  codeNumber: string;
  companyName: string;
  creationDate: string;
  filiere: string;
  statutJuridique: string;
  rccm: string;
  compteContribuable: string;
  qualiteExportation: string;
  codeExportateur: string;
  marchesExportation: string;
  produits: string;
  personneRessource: string;
  contacts: string;
  nomDirigeant: string;
  genreDirigeant: string;
  activiteRenforcement: string;
  observations: string;
}

const initialFormData: FormData = {
  codeNumber: "",
  companyName: "",
  creationDate: "",
  filiere: "",
  statutJuridique: "",
  rccm: "",
  compteContribuable: "",
  qualiteExportation: "",
  codeExportateur: "",
  marchesExportation: "",
  produits: "",
  personneRessource: "",
  contacts: "",
  nomDirigeant: "",
  genreDirigeant: "",
  activiteRenforcement: "",
  observations: "",
};

const STEPS = [
  { id: 1, title: "Identification", icon: Building2 },
  { id: 2, title: "Exportation", icon: Globe },
  { id: 3, title: "Produits & Contact", icon: Package },
  { id: 4, title: "Dirigeant & Observations", icon: User },
];

export default function PmeRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userDirection } = useUserDirection();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!formData.companyName || !formData.compteContribuable || !formData.rccm) {
      toast.error("Veuillez remplir les champs obligatoires : Nom de l'entreprise, N° Compte Contribuable et RCCM");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("companies").insert({
        company_name: formData.companyName,
        creation_date: formData.creationDate || null,
        filiere: formData.filiere || null,
        legal_status: formData.statutJuridique || null,
        rccm_number: formData.rccm,
        dfe_number: formData.compteContribuable,
        export_maturity_level: formData.qualiteExportation || null,
        target_export_markets: formData.marchesExportation ? formData.marchesExportation.split(",").map((m) => m.trim()) : null,
        products_services: formData.produits || null,
        main_contact_name: formData.personneRessource || null,
        phone: formData.contacts || null,
        legal_representative_name: formData.nomDirigeant || null,
        legal_representative_gender: formData.genreDirigeant === "Homme" ? "male" : formData.genreDirigeant === "Femme" ? "female" : null,
        aciex_interaction_history: formData.observations || null,
        exported_products: formData.produits || null,
        headquarters_location: "Côte d'Ivoire",
        direction_id: userDirection?.direction_id || null,
        created_by: user.id,
        accompaniment_status: "Prospection",
      });

      if (error) throw error;

      toast.success("Entreprise enregistrée avec succès !");
      navigate("/");
    } catch (error) {
      console.error("Error registering PME:", error);
      toast.error("Erreur lors de l'enregistrement de l'entreprise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const inputClass = "h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-3xl relative z-10">
        <Card className="backdrop-blur-sm bg-card/95 border-primary/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-xl opacity-30" />
                <div className="relative bg-card p-3 rounded-2xl border border-primary/10 shadow-lg">
                  <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-14 w-auto" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Enregistrement PME / SME Registration
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Remplissez les informations de votre entreprise pour accéder à la plateforme
            </CardDescription>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-1 mt-6">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : isDone
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{step.title}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-6 h-0.5 mx-1 rounded-full transition-colors ${isDone ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Identification */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>N° de Code</Label>
                    <Input className={inputClass} placeholder="Ex: CEP001" value={formData.codeNumber} onChange={(e) => updateField("codeNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom de l'entreprise *</Label>
                    <Input className={inputClass} required placeholder="Raison sociale" value={formData.companyName} onChange={(e) => updateField("companyName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de création</Label>
                    <Input className={inputClass} type="date" value={formData.creationDate} onChange={(e) => updateField("creationDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>DAS / Filière</Label>
                    <Select value={formData.filiere} onValueChange={(v) => updateField("filiere", v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner la filière" /></SelectTrigger>
                      <SelectContent>
                        {FILIERES.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut juridique</Label>
                    <Select value={formData.statutJuridique} onValueChange={(v) => updateField("statutJuridique", v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner le statut" /></SelectTrigger>
                      <SelectContent>
                        {STATUTS_JURIDIQUES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>RCCM *</Label>
                    <Input className={inputClass} required placeholder="Numéro RCCM" value={formData.rccm} onChange={(e) => updateField("rccm", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>N° de Compte Contribuable (DFE) *</Label>
                    <Input className={inputClass} required placeholder="Numéro DFE" value={formData.compteContribuable} onChange={(e) => updateField("compteContribuable", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Exportation */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qualité d'exportation</Label>
                    <Select value={formData.qualiteExportation} onValueChange={(v) => updateField("qualiteExportation", v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {QUALITES_EXPORT.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Code exportateur</Label>
                    <Input className={inputClass} placeholder="Code exportateur" value={formData.codeExportateur} onChange={(e) => updateField("codeExportateur", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Marchés d'exportation</Label>
                    <Input className={inputClass} placeholder="Ex: France, USA, Sous-région (séparés par des virgules)" value={formData.marchesExportation} onChange={(e) => updateField("marchesExportation", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Produits & Contact */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Produits exportés / à exporter</Label>
                    <Textarea className="bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30" placeholder="Décrivez vos produits..." rows={3} value={formData.produits} onChange={(e) => updateField("produits", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Personne ressource</Label>
                    <Input className={inputClass} placeholder="Nom de la personne ressource" value={formData.personneRessource} onChange={(e) => updateField("personneRessource", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contacts (Email / Téléphone)</Label>
                    <Input className={inputClass} placeholder="email@exemple.com / +225 XX XX XX XX" value={formData.contacts} onChange={(e) => updateField("contacts", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Dirigeant & Observations */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du Dirigeant</Label>
                    <Input className={inputClass} placeholder="Nom complet du dirigeant" value={formData.nomDirigeant} onChange={(e) => updateField("nomDirigeant", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Genre du Dirigeant</Label>
                    <Select value={formData.genreDirigeant} onValueChange={(v) => updateField("genreDirigeant", v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Activité de renforcement reçu</Label>
                    <Textarea className="bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30" placeholder="Formations, accompagnements reçus..." rows={2} value={formData.activiteRenforcement} onChange={(e) => updateField("activiteRenforcement", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Observations</Label>
                    <Textarea className="bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30" placeholder="Remarques ou observations..." rows={3} value={formData.observations} onChange={(e) => updateField("observations", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-primary/10">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Précédent
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
                  Passer / Skip
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                    Suivant <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Enregistrement...
                      </span>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Enregistrer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
