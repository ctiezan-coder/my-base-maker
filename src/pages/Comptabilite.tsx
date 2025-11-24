import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, FileText, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasRole } from "@/hooks/useUserRole";
import { EntryDialog } from "@/components/comptabilite/EntryDialog";
import { AccountDialog } from "@/components/comptabilite/AccountDialog";

export default function Comptabilite() {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const isAdminOrManager = useHasRole("manager");

  const { data: accounts } = useQuery({
    queryKey: ['accounting_accounts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('accounting_accounts')
        .select('*')
        .order('account_number');
      return data || [];
    }
  });

  const { data: entries } = useQuery({
    queryKey: ['accounting_entries'],
    queryFn: async () => {
      const { data } = await supabase
        .from('accounting_entries')
        .select('*, account:accounting_accounts(account_number, account_name)')
        .order('entry_date', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  const stats = {
    totalAccounts: accounts?.length || 0,
    totalEntries: entries?.length || 0,
    debits: entries?.filter(e => e.entry_type === 'Débit').reduce((sum, e) => sum + Number(e.amount), 0) || 0,
    credits: entries?.filter(e => e.entry_type === 'Crédit').reduce((sum, e) => sum + Number(e.amount), 0) || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Comptabilité</h1>
          <p className="text-muted-foreground">Gestion comptable SYSCOHADA</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écritures</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Débits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.debits.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crédits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.credits.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Écritures</TabsTrigger>
          <TabsTrigger value="accounts">Plan Comptable</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dernières Écritures Comptables</CardTitle>
              {isAdminOrManager && (
                <Button onClick={() => setIsEntryDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Écriture
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Écriture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.entry_number}</TableCell>
                      <TableCell>{new Date(entry.entry_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        {entry.account?.account_number} - {entry.account?.account_name}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <Badge className={entry.entry_type === 'Débit' ? 'bg-red-500' : 'bg-green-500'}>
                          {entry.entry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{Number(entry.amount).toLocaleString()} FCFA</TableCell>
                    </TableRow>
                  ))}
                  {entries?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucune écriture
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plan Comptable</CardTitle>
              {isAdminOrManager && (
                <Button onClick={() => setIsAccountDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Compte
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Compte</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Solde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts?.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_number}</TableCell>
                      <TableCell>{account.account_name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      <TableCell>{Number(account.balance).toLocaleString()} FCFA</TableCell>
                    </TableRow>
                  ))}
                  {accounts?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Aucun compte
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EntryDialog 
        open={isEntryDialogOpen} 
        onOpenChange={setIsEntryDialogOpen}
      />
      
      <AccountDialog 
        open={isAccountDialogOpen} 
        onOpenChange={setIsAccountDialogOpen}
      />
    </div>
  );
}
