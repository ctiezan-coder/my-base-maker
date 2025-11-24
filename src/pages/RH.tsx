import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, UserCheck, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RH() {
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('*, direction:directions(name)')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ['leave_requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('leave_requests')
        .select('*, employee:employees!leave_requests_employee_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'En attente': 'bg-yellow-500',
      'Approuvé': 'bg-green-500',
      'Refusé': 'bg-red-500',
      'Annulé': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Ressources Humaines</h1>
          <p className="text-muted-foreground">Gestion des employés et congés</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees?.filter(e => e.status === 'Actif').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes de Congé</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Briefcase className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests?.filter(l => l.status === 'En attente').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="leaves">Congés</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Employés</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Type Contrat</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_number}</TableCell>
                      <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.direction?.name || 'N/A'}</TableCell>
                      <TableCell>{employee.contract_type}</TableCell>
                      <TableCell>
                        <Badge className={employee.status === 'Actif' ? 'bg-green-500' : 'bg-gray-500'}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucun employé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de Congé</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Jours</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests?.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        {leave.employee?.first_name} {leave.employee?.last_name}
                      </TableCell>
                      <TableCell>{leave.leave_type}</TableCell>
                      <TableCell>{new Date(leave.start_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{new Date(leave.end_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{leave.total_days}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaveRequests?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucune demande de congé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
