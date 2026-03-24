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
import { useTranslation } from "react-i18next";

interface MenuItem {
  icon: any;
  labelKey: string;
  path: string;
  module: AppModule | null;
}

const dgItems: MenuItem[] = [
  { icon: LayoutDashboard, labelKey: "sidebar.dashboard", path: "/dashboard", module: null },
  { icon: MessageSquare, labelKey: "sidebar.chat", path: "/dashboard/chat", module: null },
  { icon: Building2, labelKey: "sidebar.companies", path: "/dashboard/companies", module: "companies" },
  { icon: FolderKanban, labelKey: "sidebar.projects", path: "/dashboard/projects", module: "projects" },
  { icon: FileText, labelKey: "sidebar.documents", path: "/dashboard/documents", module: "documents" },
  { icon: TrendingUp, labelKey: "sidebar.monitoring", path: "/dashboard/suivi-evaluation", module: "suivi_evaluation" },
  { icon: BarChart3, labelKey: "sidebar.kpis", path: "/dashboard/kpis", module: "kpis" },
];

const dafItems: MenuItem[] = [
  { icon: ShoppingCart, labelKey: "sidebar.purchases", path: "/dashboard/achats", module: "achats" },
  { icon: Headphones, labelKey: "sidebar.support", path: "/dashboard/support", module: "support" },
  { icon: UserCheck, labelKey: "sidebar.hr", path: "/dashboard/rh", module: "rh" },
  { icon: Plane, labelKey: "sidebar.missions", path: "/dashboard/missions", module: "missions" },
  { icon: Wallet, labelKey: "sidebar.budgets", path: "/dashboard/budgets", module: "comptabilite" },
  { icon: Calculator, labelKey: "sidebar.accounting", path: "/dashboard/comptabilite", module: "comptabilite" },
];

const operationalItems: MenuItem[] = [
  { icon: Globe, labelKey: "sidebar.marketDevelopment", path: "/dashboard/market-development", module: "market_development" },
  { icon: Handshake, labelKey: "sidebar.partnerships", path: "/dashboard/partnerships", module: "partnerships" },
  { icon: GraduationCap, labelKey: "sidebar.trainings", path: "/dashboard/trainings", module: "trainings" },
  { icon: Calendar, labelKey: "sidebar.calendar", path: "/dashboard/agenda", module: "events" },
  { icon: Calendar, labelKey: "sidebar.events", path: "/dashboard/events", module: "events" },
  { icon: Image, labelKey: "sidebar.media", path: "/dashboard/media", module: "media" },
  { icon: ClipboardList, labelKey: "sidebar.imputations", path: "/dashboard/imputations", module: "imputations" },
  { icon: Archive, labelKey: "activitiesArchive", path: "/dashboard/activities-archive", module: null },
  { icon: UserCircle, labelKey: "sidebar.collaborators", path: "/dashboard/collaborateurs", module: "collaborators" },
];

const adminItems: MenuItem[] = [
  { icon: Shield, labelKey: "sidebar.admin", path: "/dashboard/admin", module: null },
  { icon: Shield, labelKey: "permissions", path: "/dashboard/permissions", module: null },
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

const MenuItemLink = ({ item, isAdmin }: { item: MenuItem; isAdmin: boolean }) => {
  const { canAccess } = useCanAccessModule(item.module || 'companies', 'user');
  const { t } = useTranslation();

  if (!item.module || canAccess || isAdmin) {
    return (
      <NavLink
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
        {t(item.labelKey)}
      </NavLink>
    );
  }
  return null;
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
        {items.map((item) => (
          <MenuItemLink key={item.path} item={item} isAdmin={isAdmin} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar() {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';
  const { t } = useTranslation();

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex justify-center mb-6 pb-4 border-b border-border">
        <img src={logo} alt="CI Export" className="h-14 w-auto" />
      </div>
      
      <nav className="space-y-4">
        <MenuSection 
          title={t('sectionDG', 'Direction Générale')} 
          items={dgItems} 
          isAdmin={isAdmin} 
          color="orange"
          defaultOpen={true}
        />
        
        <MenuSection 
          title={t('sectionDAF', 'DAF')} 
          items={dafItems} 
          isAdmin={isAdmin} 
          color="green"
          defaultOpen={true}
        />
        
        <MenuSection 
          title={t('sectionOperational', 'Directions Opérationnelles')} 
          items={operationalItems} 
          isAdmin={isAdmin} 
          color="cyan"
          defaultOpen={true}
        />
        
        {isAdmin && (
          <MenuSection 
            title={t('sidebar.admin')} 
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
