import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  FileText,
  Handshake,
  FolderKanban,
  BarChart3,
  Calendar,
  Image,
  Globe,
  Shield,
  UserCircle,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Archive,
  ShoppingCart,
  Headphones,
  UserCheck,
  Plane,
  Calculator,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { AppModule } from "@/hooks/useModulePermission";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  module: AppModule | null;
}

const dgItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/", module: null },
  { icon: MessageSquare, label: "Messagerie", path: "/chat", module: null },
  { icon: Building2, label: "Opérateurs", path: "/companies", module: "companies" },
  { icon: FolderKanban, label: "Projets", path: "/projects", module: "projects" },
  { icon: FileText, label: "Documents", path: "/documents", module: "documents" },
  { icon: TrendingUp, label: "Suivi & Évaluation", path: "/suivi-evaluation", module: "suivi_evaluation" },
  { icon: BarChart3, label: "KPIs", path: "/kpis", module: "kpis" },
];

const dafItems: MenuItem[] = [
  { icon: ShoppingCart, label: "Achats", path: "/achats", module: "achats" },
  { icon: Headphones, label: "Support", path: "/support", module: "support" },
  { icon: UserCheck, label: "Ressources Humaines", path: "/rh", module: "rh" },
  { icon: Plane, label: "Missions", path: "/missions", module: "missions" },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite", module: "comptabilite" },
];

const operationalItems: MenuItem[] = [
  { icon: Globe, label: "Marchés Export", path: "/market-development", module: "market_development" },
  { icon: Handshake, label: "Partenariats", path: "/partnerships", module: "partnerships" },
  { icon: GraduationCap, label: "Formations", path: "/trainings", module: "trainings" },
  { icon: Users, label: "Formateurs", path: "/trainers", module: "trainings" },
  { icon: Calendar, label: "Événements", path: "/events", module: "events" },
  { icon: Image, label: "Médias", path: "/media", module: "media" },
  { icon: ClipboardList, label: "Imputations", path: "/imputations", module: "imputations" },
  { icon: Archive, label: "Archive Activités", path: "/activities-archive", module: null },
  { icon: UserCircle, label: "Espace Collaborateurs", path: "/collaborateurs", module: "collaborators" },
];

const MenuSection = ({ 
  title, 
  items, 
  isAdmin 
}: { 
  title: string; 
  items: MenuItem[]; 
  isAdmin: boolean;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {items.map((item) => {
        const { canAccess } = useCanAccessModule(item.module || 'companies', 'user');
        
        if (!item.module || canAccess || isAdmin) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        }
        return null;
      })}
    </div>
  );
};

export function Sidebar() {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <nav className="space-y-6">
        <MenuSection title="Direction Générale" items={dgItems} isAdmin={isAdmin} />
        
        <Separator />
        
        <MenuSection title="DAF" items={dafItems} isAdmin={isAdmin} />
        
        <Separator />
        
        <MenuSection title="Directions Opérationnelles" items={operationalItems} isAdmin={isAdmin} />
        
        {isAdmin && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                <Shield className="w-5 h-5" />
                Administration
              </NavLink>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
