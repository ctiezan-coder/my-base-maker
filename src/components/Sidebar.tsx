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
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: MessageSquare, label: "Messagerie", path: "/chat" },
  { icon: Building2, label: "Opérateurs", path: "/companies" },
  { icon: Globe, label: "Marchés Export", path: "/market-development" },
  { icon: Handshake, label: "Partenariats", path: "/partnerships" },
  { icon: FolderKanban, label: "Projets", path: "/projects" },
  { icon: GraduationCap, label: "Formations", path: "/trainings" },
  { icon: Users, label: "Formateurs", path: "/trainers" },
  { icon: Calendar, label: "Événements", path: "/events" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: ClipboardList, label: "Imputations", path: "/imputations" },
  { icon: TrendingUp, label: "Suivi & Évaluation", path: "/suivi-evaluation" },
  { icon: Image, label: "Médias", path: "/media" },
  { icon: BarChart3, label: "KPIs", path: "/kpis" },
];

export function Sidebar() {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
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
        ))}
        
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
