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
  Images,
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
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { AppModule } from "@/hooks/useModulePermission";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import logo from "@/assets/ci-export-logo.png";

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
  { icon: Wallet, label: "Budgets", path: "/budgets", module: "comptabilite" },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite", module: "comptabilite" },
];

const operationalItems: MenuItem[] = [
  { icon: Globe, label: "Marchés Export", path: "/market-development", module: "market_development" },
  { icon: Handshake, label: "Partenariats", path: "/partnerships", module: "partnerships" },
  { icon: GraduationCap, label: "Formations", path: "/trainings", module: "trainings" },
  { icon: Calendar, label: "Agenda", path: "/agenda", module: "events" },
  { icon: Calendar, label: "Événements", path: "/events", module: "events" },
  { icon: Image, label: "Médias", path: "/media", module: "media" },
  { icon: Images, label: "Médiathèque", path: "/mediatheque", module: "media" },
  { icon: ClipboardList, label: "Imputations", path: "/imputations", module: "imputations" },
  { icon: Archive, label: "Archive Activités", path: "/activities-archive", module: null },
  { icon: UserCircle, label: "Espace Collaborateurs", path: "/collaborateurs", module: "collaborators" },
];

const adminItems: MenuItem[] = [
  { icon: Shield, label: "Administration", path: "/admin", module: null },
  { icon: Shield, label: "Gestion Permissions", path: "/permissions", module: null },
];

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  isAdmin: boolean;
  defaultOpen?: boolean;
  color: "orange" | "green" | "cyan" | "red";
}

const colorMap = {
  orange: {
    bg: "bg-ci-orange/10",
    border: "border-ci-orange/30",
    text: "text-ci-orange",
    hover: "hover:bg-ci-orange/20",
  },
  green: {
    bg: "bg-ci-green/10",
    border: "border-ci-green/30",
    text: "text-ci-green",
    hover: "hover:bg-ci-green/20",
  },
  cyan: {
    bg: "bg-ci-cyan/10",
    border: "border-ci-cyan/30",
    text: "text-ci-cyan",
    hover: "hover:bg-ci-cyan/20",
  },
  red: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    hover: "hover:bg-destructive/20",
  },
};

const MenuSection = ({ 
  title, 
  items, 
  isAdmin,
  defaultOpen = true,
  color,
}: MenuSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = colorMap[color];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(
        "flex items-center justify-between w-full px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-200 border",
        colors.bg,
        colors.border,
        colors.text,
        colors.hover
      )}>
        <span>{title}</span>
        <ChevronDown className={cn(
          "w-5 h-5 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1 pl-2">
        {items.map((item) => {
          const { canAccess } = useCanAccessModule(item.module || 'companies', 'user');
          
          if (!item.module || canAccess || isAdmin) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-semibold transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/30"
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar() {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex justify-center mb-6 pb-4 border-b border-border">
        <img src={logo} alt="CI Export" className="h-14 w-auto" />
      </div>
      
      <nav className="space-y-4">
        <MenuSection 
          title="Direction Générale" 
          items={dgItems} 
          isAdmin={isAdmin} 
          color="orange"
          defaultOpen={true}
        />
        
        <MenuSection 
          title="DAF" 
          items={dafItems} 
          isAdmin={isAdmin} 
          color="green"
          defaultOpen={true}
        />
        
        <MenuSection 
          title="Directions Opérationnelles" 
          items={operationalItems} 
          isAdmin={isAdmin} 
          color="cyan"
          defaultOpen={true}
        />
        
        {isAdmin && (
          <MenuSection 
            title="Administration" 
            items={adminItems} 
            isAdmin={isAdmin} 
            color="red"
            defaultOpen={true}
          />
        )}
      </nav>
    </aside>
  );
}
