import { UserMenu } from "./UserMenu";
import logo from "@/assets/aciex-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user } = useAuth();
  
  console.log("Header - User:", user?.email);
  
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
            <UserMenu />
          ) : (
            <div className="text-sm text-muted-foreground">Non connecté</div>
          )}
        </div>
      </div>
    </header>
  );
};
