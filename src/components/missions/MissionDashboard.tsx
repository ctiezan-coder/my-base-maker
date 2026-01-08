import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { AlertTriangle, Clock, FileText, CheckCircle, Plane, DollarSign } from "lucide-react";
import type { MissionOrder, MissionStats } from "@/types/mission";

interface MissionDashboardProps {
  missions: MissionOrder[];
  stats: MissionStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function MissionDashboard({ missions, stats }: MissionDashboardProps) {
  
  // Missions par statut
  const statusData = [
    { name: 'Brouillon', value: stats.brouillon, color: '#9CA3AF' },
    { name: 'En validation', value: stats.enValidation, color: '#F59E0B' },
    { name: 'Approuvées', value: stats.approuvees, color: '#10B981' },
    { name: 'En cours', value: stats.enCours, color: '#8B5CF6' },
    { name: 'Terminées', value: stats.terminees, color: '#6B7280' },
  ].filter(d => d.value > 0);

  // Missions par type
  const typeData = [
    { name: 'Nationales', value: stats.nationales, color: '#3B82F6' },
    { name: 'Internationales', value: stats.internationales, color: '#10B981' },
  ].filter(d => d.value > 0);

  // Alertes
  const pendingValidation = missions.filter(m => 
    ['Soumise', 'En validation N1', 'En validation DAF', 'En validation DG'].includes(m.extended_status || '')
  );
  const upcomingMissions = missions.filter(m => {
    if (!m.start_date || m.extended_status !== 'Approuvée') return false;
    const startDate = new Date(m.start_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return startDate > today && startDate <= weekFromNow;
  });
  const missionsAwaitingReport = missions.filter(m => m.extended_status === 'En attente rapport');
  const missionsAwaitingLiquidation = missions.filter(m => 
    ['En liquidation', 'Rapport soumis'].includes(m.extended_status || '')
  );

  // Budget
  const budgetUsed = stats.budgetConsomme || 0;
  const budgetTotal = stats.budgetTotal || 1;
  const budgetPercentage = Math.min(100, (budgetUsed / budgetTotal) * 100);

  // Budget evolution (mock data)
  const budgetData = [
    { month: 'Jan', budget: 15000000, reel: 14500000 },
    { month: 'Fév', budget: 12000000, reel: 13200000 },
    { month: 'Mar', budget: 18000000, reel: 17800000 },
    { month: 'Avr', budget: 20000000, reel: 19500000 },
    { month: 'Mai', budget: 16000000, reel: 16800000 },
    { month: 'Jun', budget: 22000000, reel: 21000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Alertes */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente de validation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingValidation.length}</div>
            <p className="text-xs text-muted-foreground">Missions à valider</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missions à venir (7j)</CardTitle>
            <Plane className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMissions.length}</div>
            <p className="text-xs text-muted-foreground">Départs imminents</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports en attente</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionsAwaitingReport.length}</div>
            <p className="text-xs text-muted-foreground">À soumettre</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidations en attente</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionsAwaitingLiquidation.length}</div>
            <p className="text-xs text-muted-foreground">À liquider</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle>Type de Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Consommation Budgétaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget consommé</p>
              <p className="text-2xl font-bold">{budgetUsed.toLocaleString()} FCFA</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget estimé total</p>
              <p className="text-2xl font-bold">{budgetTotal.toLocaleString()} FCFA</p>
            </div>
          </div>
          <Progress value={budgetPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {budgetPercentage.toFixed(1)}% du budget utilisé
          </p>
        </CardContent>
      </Card>

      {/* Évolution budget */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution Budget vs Réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Budget estimé"
                />
                <Line 
                  type="monotone" 
                  dataKey="reel" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Dépenses réelles"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Liste des actions requises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Actions Requises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingValidation.slice(0, 5).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{mission.mission_number}</p>
                  <p className="text-sm text-muted-foreground">{mission.purpose}</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  En attente validation
                </Badge>
              </div>
            ))}
            {missionsAwaitingReport.slice(0, 5).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{mission.mission_number}</p>
                  <p className="text-sm text-muted-foreground">{mission.purpose}</p>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  Rapport à soumettre
                </Badge>
              </div>
            ))}
            {(pendingValidation.length === 0 && missionsAwaitingReport.length === 0) && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Aucune action requise
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
