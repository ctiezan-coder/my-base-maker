import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check account status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        navigate('/auth');
      } else if (profile && profile.account_status !== 'approved') {
        navigate('/pending-approval');
      }
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 xl:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
