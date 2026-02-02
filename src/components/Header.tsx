import { UserMenu } from "./UserMenu";
import logo from "@/assets/ci-export-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { EmployeeLeaveRequestDialog } from "@/components/rh/EmployeeLeaveRequestDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const { t } = useTranslation();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('auth.signOut'),
        description: t('auth.signOutSuccess'),
      });
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('auth.error'),
        description: t('auth.signOutError'),
      });
    }
  };
  
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('header.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <NotificationsMenu />
              <Button onClick={() => setLeaveDialogOpen(true)} variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {t('header.leaveRequest')}
              </Button>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.signOut')}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t('header.notConnected')}</div>
          )}
        </div>
      </div>
      <EmployeeLeaveRequestDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen} />
    </header>
  );
};
