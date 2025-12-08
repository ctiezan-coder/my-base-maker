import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Database, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const { toast } = useToast();

  const exportDatabase = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      const tables = [
        'directions',
        'partnerships',
        'trainings',
        'business_connections',
        'folders',
        'documents',
        'media_content',
        'companies',
        'events',
        'projects',
        'imputations',
        'export_opportunities',
        'kpi_tracking',
        'potential_markets',
        'trainers',
        'suppliers',
        'purchase_orders',
        'equipments',
        'support_tickets',
        'mission_orders',
        'accounting_accounts',
        'accounting_entries',
        'employees',
        'leave_requests'
      ];

      const exportData: Record<string, unknown[]> = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*');
          
          if (!error && data) {
            exportData[table] = data;
          } else {
            exportData[table] = [];
          }
        } catch {
          exportData[table] = [];
        }
      }

      // Create JSON file
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Download file
      const link = document.createElement('a');
      link.href = url;
      link.download = `ci-export-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast({
        title: "Export réussi",
        description: "Le fichier JSON a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const tableStats = [
    { name: 'Directions', count: 11 },
    { name: 'Partenariats', count: 10 },
    { name: 'Formations', count: 2 },
    { name: 'Connexions Business', count: 7 },
    { name: 'Dossiers', count: 5 },
    { name: 'Documents', count: 4 },
    { name: 'Médias', count: 5 },
    { name: 'Entreprises', count: 146 },
    { name: 'Événements', count: 414 },
    { name: 'Projets', count: 399 },
    { name: 'Imputations', count: 398 },
    { name: 'Opportunités', count: 87 },
    { name: 'KPIs', count: 27 },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Export Base de Données</CardTitle>
          <CardDescription>
            Téléchargez toutes les données de la plateforme CI Export en format JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {tableStats.map((stat) => (
              <div key={stat.name} className="flex justify-between p-2 bg-muted rounded">
                <span className="text-muted-foreground">{stat.name}</span>
                <span className="font-medium">{stat.count}</span>
              </div>
            ))}
          </div>

          {/* Export Button */}
          <Button 
            onClick={exportDatabase} 
            disabled={isExporting}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Export en cours...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Export terminé - Cliquez pour re-télécharger
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Télécharger la base de données (JSON)
              </>
            )}
          </Button>

          {exportComplete && (
            <p className="text-center text-sm text-muted-foreground">
              Le fichier a été téléchargé dans votre dossier de téléchargements.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
