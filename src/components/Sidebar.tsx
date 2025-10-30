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
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: Building2, label: "Entreprises", path: "/companies" },
  { icon: GraduationCap, label: "Formations", path: "/trainings" },
  { icon: Users, label: "Formateurs", path: "/trainers" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: Handshake, label: "Partenariats", path: "/partnerships" },
  { icon: FolderKanban, label: "Projets", path: "/projects" },
  { icon: BarChart3, label: "KPIs", path: "/kpis" },
  { icon: Calendar, label: "Événements", path: "/events" },
  { icon: Image, label: "Médias", path: "/media" },
];

export function Sidebar() {
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
      </nav>
    </aside>
  );
}
