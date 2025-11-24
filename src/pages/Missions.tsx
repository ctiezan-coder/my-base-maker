import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, DollarSign } from "lucide-react";

export default function Missions() {
  const { data: missions } = useQuery({
    queryKey: ['mission_orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mission_orders')
        .select('*, employee:employees!mission_orders_employee_id_fkey(first_name, last_name), direction:directions(name)')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Brouillon': 'bg-gray-500',
      'En attente validation': 'bg-yellow-500',
      'Validée': 'bg-blue-500',
      'En cours': 'bg-green-500',
      'Terminée': 'bg-gray-700',
      'Annulée': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const stats = {
    total: missions?.length || 0,
    validated: missions?.filter(m => m.status === 'Validée').length || 0,
    ongoing: missions?.filter(m => m.status === 'En cours').length || 0,
    completed: missions?.filter(m => m.status === 'Terminée').length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Gestion des Missions</h1>
          <p className="text-muted-foreground">Ordres de mission et déplacements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validées</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ordres de Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Mission</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions?.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">{mission.mission_number}</TableCell>
                  <TableCell>
                    {mission.employee?.first_name} {mission.employee?.last_name}
                  </TableCell>
                  <TableCell>{mission.destination}</TableCell>
                  <TableCell>
                    {new Date(mission.start_date).toLocaleDateString('fr-FR')} - {new Date(mission.end_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{mission.duration_days} jours</TableCell>
                  <TableCell>
                    {mission.estimated_budget ? `${mission.estimated_budget.toLocaleString()} FCFA` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(mission.status)}>{mission.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {missions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune mission
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
