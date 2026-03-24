import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, LogOut } from 'lucide-react';

export default function PendingApproval() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.account_status === 'approved') {
      navigate('/dashboard');
    } else if (profile?.account_status === 'rejected' || profile?.account_status === 'suspended') {
      // Force sign-out after a delay so user can see the message
      const timer = setTimeout(() => {
        signOut().then(() => navigate('/auth'));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Compte en attente d'approbation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Votre compte a été créé avec succès !
            </p>
            <p className="text-sm text-muted-foreground">
              Un administrateur doit approuver votre demande avant que vous puissiez accéder à la plateforme.
              Vous recevrez une notification par email une fois votre compte approuvé.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Email de confirmation
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Vous recevrez un email de confirmation à {user?.email} dès que votre compte sera approuvé.
                </p>
              </div>
            </div>
          </div>

          {profile?.account_status === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Demande refusée
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Votre demande d'accès a été refusée. Veuillez contacter un administrateur pour plus d'informations.
              </p>
            </div>
          )}

          {profile?.account_status === 'suspended' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Compte suspendu
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Votre compte a été suspendu. Veuillez contacter un administrateur.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
