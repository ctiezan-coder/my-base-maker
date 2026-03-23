import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logo from '@/assets/ci-export-logo.png';
import { useUserRole } from '@/hooks/useUserRole';
import { QuickApprovalPanel } from '@/components/admin/QuickApprovalPanel';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .refine((email) => email.endsWith('@cotedivoirexport.ci'), {
      message: 'Seuls les emails @cotedivoirexport.ci sont autorisés',
    }),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string()
    .email('Email invalide')
    .refine((email) => email.endsWith('@cotedivoirexport.ci'), {
      message: 'Seuls les emails @cotedivoirexport.ci sont autorisés',
    }),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  directionId: z.string().min(1, 'La direction est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [directionId, setDirectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';
  const { t } = useTranslation();

  // Fetch directions for signup
  const { data: directions, isLoading: directionsLoading, error: directionsError } = useQuery({
    queryKey: ['directions-signup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching directions:', error);
        throw error;
      }
      console.log('Directions loaded:', data);
      return data;
    },
    enabled: true,
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect"
          : "Une erreur s'est produite lors de la connexion",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur ACIEX !",
      });
      navigate('/pme-registration');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signupSchema.parse({ fullName, email, password, confirmPassword, directionId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);

    // Vérifier si l'email existe déjà dans profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingProfile) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Compte existant",
        description: "Un compte avec cet email existe déjà",
      });
      return;
    }

    // Vérifier si l'email est dans la liste blanche
    const { data: isAllowed } = await supabase
      .rpc("is_email_allowed", { check_email: email.toLowerCase().trim() });

    if (!isAllowed) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Email non autorisé",
        description: "Cet email n'est pas autorisé à s'inscrire. Contactez un administrateur pour être ajouté à la liste des emails autorisés.",
        duration: 8000,
      });
      return;
    }
    
    // Sign up the user with direction_id in metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          direction_id: directionId,
        }
      }
    });
    
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Compte existant",
          description: "Un compte avec cet email existe déjà",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: "Une erreur s'est produite lors de l'inscription",
        });
      }
    } else {
      toast({
        title: "Inscription réussie",
        description: "Un email de vérification a été envoyé à votre adresse @cotedivoirexport.ci. Veuillez confirmer votre email avant de vous connecter.",
        duration: 8000,
      });
      setIsLogin(true); // Revenir à l'écran de connexion
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Formes décoratives subtiles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 relative z-10">
        {/* Carte principale */}
        <Card className="w-full backdrop-blur-sm bg-card/95 border-primary/20 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-2">
            {/* Logo avec effet glow */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative bg-card p-4 rounded-2xl border border-primary/10 shadow-lg">
                  <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-20 w-auto" />
                </div>
              </div>
            </div>
            
            {/* Titre avec gradient */}
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                ACIEX
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Base de données institutionnelle centralisée
              </CardDescription>
            </div>

            {/* Barre de séparation décorative */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-12 rounded-full bg-primary" />
              <div className="h-1 w-8 rounded-full bg-accent" />
              <div className="h-1 w-4 rounded-full bg-secondary" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  {t('auth.register')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email professionnel</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="prenom.nom@cotedivoirexport.ci"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">{t('auth.password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {t('common.loading')}
                      </span>
                    ) : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Nom complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Votre nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email professionnel</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="prenom.nom@cotedivoirexport.ci"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-direction" className="text-sm font-medium">Direction *</Label>
                    <Select value={directionId} onValueChange={setDirectionId} required>
                      <SelectTrigger className="h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30">
                        <SelectValue placeholder={
                          directionsLoading 
                            ? "Chargement..." 
                            : directionsError 
                              ? "Erreur de chargement" 
                              : "Sélectionner votre direction"
                        } />
                      </SelectTrigger>
                      <SelectContent className="z-[100] bg-popover">
                        {directionsLoading ? (
                          <SelectItem value="loading" disabled>Chargement...</SelectItem>
                        ) : directionsError ? (
                          <SelectItem value="error" disabled>Erreur de chargement</SelectItem>
                        ) : directions && directions.length > 0 ? (
                          directions.map((dir) => (
                            <SelectItem key={dir.id} value={dir.id}>
                              {dir.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>Aucune direction disponible</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 caractères avec majuscule, minuscule et chiffre
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 bg-muted/30 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {t('common.loading')}
                      </span>
                    ) : t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Panel admin avec nouveau style */}
        {isAdmin && (
          <div className="hidden lg:block animate-slide-in-from-bottom-4">
            <QuickApprovalPanel />
          </div>
        )}
      </div>
    </div>
  );
}
