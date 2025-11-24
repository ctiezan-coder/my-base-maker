import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: userRole, isLoading } = useUserRole();

  console.log("UserMenu - User:", user?.email);
  console.log("UserMenu - Role:", userRole);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se déconnecter",
      });
    }
  };

  if (!user) {
    console.log("UserMenu - No user, returning null");
    return null;
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || "U";
  const isAdmin = userRole === 'admin';

  console.log("UserMenu - Rendering with isAdmin:", isAdmin);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {!isLoading && userRole && (
              <Badge variant={userRole === 'admin' ? 'destructive' : 'default'} className="w-fit mt-1">
                {userRole}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Administration</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
