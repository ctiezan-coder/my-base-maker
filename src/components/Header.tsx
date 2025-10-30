import { Database } from "lucide-react";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ACIEX</h1>
              <p className="text-xs text-muted-foreground">Base de Données Institutionnelle</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
