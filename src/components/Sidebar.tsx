import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/", module: null },
  { icon: MessageSquare, label: "Messagerie", path: "/chat", module: null },
  { icon: Building2, label: "Opérateurs", path: "/companies", module: "companies" as const },
  { icon: Globe, label: "Marchés Export", path: "/market-development", module: "market_development" as const },
  { icon: Handshake, label: "Partenariats", path: "/partnerships", module: "partnerships" as const },
  { icon: FolderKanban, label: "Projets", path: "/projects", module: "projects" as const },
  { icon: GraduationCap, label: "Formations", path: "/trainings", module: "trainings" as const },
  { icon: Users, label: "Formateurs", path: "/trainers", module: "trainings" as const },
  { icon: Calendar, label: "Événements", path: "/events", module: "events" as const },
  { icon: FileText, label: "Documents", path: "/documents", module: "documents" as const },
  { icon: ClipboardList, label: "Imputations", path: "/imputations", module: "imputations" as const },
  { icon: TrendingUp, label: "Suivi & Évaluation", path: "/suivi-evaluation", module: "suivi_evaluation" as const },
  { icon: Image, label: "Médias", path: "/media", module: "media" as const },
  { icon: BarChart3, label: "KPIs", path: "/kpis", module: "kpis" as const },
  { icon: Archive, label: "Archive Activités", path: "/activities-archive", module: null },
  { icon: ShoppingCart, label: "Achats", path: "/achats", module: null },
  { icon: Headphones, label: "Support", path: "/support", module: null },
  { icon: UserCheck, label: "Ressources Humaines", path: "/rh", module: null },
  { icon: Plane, label: "Missions", path: "/missions", module: null },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite", module: null },
];

export function Sidebar() {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const { canAccess } = useCanAccessModule(item.module || 'companies', 'user');
          
          // Always show dashboard and chat
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
        
        <NavLink
          to="/collaborateurs"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )
          }
        >
          <UserCircle className="w-5 h-5" />
          Espace Collaborateurs
        </NavLink>
        
        {isAdmin && (
          <>
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
            <NavLink
              to="/permissions"
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
              Gestion Permissions
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
