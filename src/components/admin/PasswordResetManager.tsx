import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, RefreshCw } from "lucide-react";

export function PasswordResetManager() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une adresse email et un mot de passe",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email, newPassword },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Mot de passe réinitialisé",
        description: `Le mot de passe de ${email} a été réinitialisé avec succès`,
      });

      // Copy password to clipboard
      navigator.clipboard.writeText(newPassword);
      toast({
        title: "Copié",
        description: "Le mot de passe a été copié dans le presse-papier",
      });

      setEmail("");
      setNewPassword("");
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <CardTitle>Réinitialisation de mot de passe</CardTitle>
        </div>
        <CardDescription>
          Réinitialiser le mot de passe d'un utilisateur (réservé aux administrateurs)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email de l'utilisateur</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@cotedivoirexport.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="flex gap-2">
              <Input
                id="newPassword"
                type="text"
                placeholder="Minimum 8 caractères"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                title="Générer un mot de passe"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le mot de passe sera copié automatiquement dans le presse-papier
            </p>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            <Key className="mr-2 h-4 w-4" />
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
