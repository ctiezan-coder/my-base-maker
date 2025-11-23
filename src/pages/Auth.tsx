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
import logo from '@/assets/aciex-logo.jpg';
import { useUserRole } from '@/hooks/useUserRole';
import { QuickApprovalPanel } from '@/components/admin/QuickApprovalPanel';

const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .refine((email) => email.endsWith('@cotedivoirexport.ci'), {
      message: 'Seuls les emails @cotedivoirexport.ci sont autorisés',
    }),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string()
    .email('Email invalide')
    .refine((email) => email.endsWith('@cotedivoirexport.ci'), {
      message: 'Seuls les emails @cotedivoirexport.ci sont autorisés',
    }),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
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

    // Vérifier si l'email existe déjà
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
          description: "Votre demande d'inscription a été envoyée. Un administrateur doit approuver votre compte avant que vous puissiez accéder à la plateforme.",
          duration: 8000,
        });
        // Optionally redirect to pending approval page after signup
        navigate('/pending-approval');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full shadow-elegant">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-24 w-auto" />
          </div>
          <CardTitle className="text-2xl">ACIEX</CardTitle>
          <CardDescription>
            Base de données institutionnelle centralisée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="prenom.nom@cotedivoirexport.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Votre nom complet"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="prenom.nom@cotedivoirexport.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-direction">Direction *</Label>
                  <Select value={directionId} onValueChange={setDirectionId} required>
                    <SelectTrigger>
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
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="hidden lg:block">
          <QuickApprovalPanel />
        </div>
      )}
      </div>
    </div>
  );
}
