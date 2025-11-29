import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, Send } from "lucide-react";

export function PasswordResetManager() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `Un email de réinitialisation a été envoyé à ${email}`,
      });

      setEmail("");
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation",
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
          Envoyer un email de réinitialisation de mot de passe à un utilisateur
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
          
          <Button type="submit" disabled={loading} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Envoi en cours..." : "Envoyer l'email de réinitialisation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
