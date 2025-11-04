import { UserMenu } from "./UserMenu";
import logo from "@/assets/aciex-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate('/auth');
  };
  
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">ACIEX</h1>
              <p className="text-xs text-muted-foreground">Base de Données Institutionnelle</p>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Non connecté</div>
          )}
        </div>
      </div>
    </header>
  );
};
