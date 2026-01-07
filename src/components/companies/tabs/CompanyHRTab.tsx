import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, UserMinus, Briefcase, GraduationCap, HardHat, TrendingUp, TrendingDown } from "lucide-react";
import type { ExtendedCompany } from "@/types/company-extended";

interface CompanyHRTabProps {
  company: ExtendedCompany;
}

export function CompanyHRTab({ company }: CompanyHRTabProps) {
  const totalEmployees = company.total_employees || 0;
  const permanentEmployees = company.permanent_employees || 0;
  const seasonalEmployees = company.seasonal_employees || 0;
  const maleEmployees = company.male_employees || 0;
  const femaleEmployees = company.female_employees || 0;
  const managersCount = company.managers_count || 0;
  const techniciansCount = company.technicians_count || 0;
  const workersCount = company.workers_count || 0;

  const femalePercentage = totalEmployees > 0 ? Math.round((femaleEmployees / totalEmployees) * 100) : 0;
  const permanentPercentage = totalEmployees > 0 ? Math.round((permanentEmployees / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effectif total</p>
                <p className="text-2xl font-bold">{totalEmployees || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permanents</p>
                <p className="text-2xl font-bold">{permanentEmployees}</p>
                <p className="text-xs text-muted-foreground">{permanentPercentage}% de l'effectif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <UserMinus className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saisonniers</p>
                <p className="text-2xl font-bold">{seasonalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-pink-500/10">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Femmes</p>
                <p className="text-2xl font-bold">{femalePercentage}%</p>
                <p className="text-xs text-muted-foreground">{femaleEmployees} sur {totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par type de contrat */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Répartition par type de contrat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Permanents</span>
                <span className="text-sm text-muted-foreground">{permanentEmployees} ({permanentPercentage}%)</span>
              </div>
              <Progress value={permanentPercentage} className="h-3 bg-muted" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Saisonniers</span>
                <span className="text-sm text-muted-foreground">
                  {seasonalEmployees} ({100 - permanentPercentage}%)
                </span>
              </div>
              <Progress value={100 - permanentPercentage} className="h-3 bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Répartition Hommes/Femmes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Répartition Hommes / Femmes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Hommes</span>
                <span className="text-sm text-muted-foreground">
                  {maleEmployees} ({100 - femalePercentage}%)
                </span>
              </div>
              <Progress value={100 - femalePercentage} className="h-3 bg-blue-200" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Femmes</span>
                <span className="text-sm text-muted-foreground">
                  {femaleEmployees} ({femalePercentage}%)
                </span>
              </div>
              <Progress value={femalePercentage} className="h-3 bg-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie professionnelle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Répartition par catégorie professionnelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cadres</p>
                <p className="text-2xl font-bold">{managersCount}</p>
                {totalEmployees > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Math.round((managersCount / totalEmployees) * 100)}% de l'effectif
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Techniciens</p>
                <p className="text-2xl font-bold">{techniciansCount}</p>
                {totalEmployees > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Math.round((techniciansCount / totalEmployees) * 100)}% de l'effectif
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <HardHat className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ouvriers</p>
                <p className="text-2xl font-bold">{workersCount}</p>
                {totalEmployees > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Math.round((workersCount / totalEmployees) * 100)}% de l'effectif
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Organisation Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${company.has_export_service ? 'bg-green-500/10' : 'bg-muted'}`}>
              {company.has_export_service ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {company.has_export_service 
                  ? "L'entreprise dispose d'un service export dédié" 
                  : "Pas de service export dédié"
                }
              </p>
              {company.export_manager_name && (
                <p className="text-sm text-muted-foreground">
                  Responsable: {company.export_manager_name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
