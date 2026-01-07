import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Percent, BarChart3, Globe, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ExtendedCompany } from "@/types/company-extended";

interface CompanyPerformanceTabProps {
  company: ExtendedCompany;
}

export function CompanyPerformanceTab({ company }: CompanyPerformanceTabProps) {
  const exportRate = company.export_rate || 0;
  const turnoverEvolution = company.turnover_evolution_3y as Record<string, number> | null;
  
  // Calculer l'évolution
  const getEvolutionTrend = () => {
    if (!turnoverEvolution) return null;
    const years = Object.keys(turnoverEvolution).sort();
    if (years.length < 2) return null;
    
    const firstYear = turnoverEvolution[years[0]];
    const lastYear = turnoverEvolution[years[years.length - 1]];
    const change = ((lastYear - firstYear) / firstYear) * 100;
    
    return {
      value: change,
      isPositive: change > 0,
      isNeutral: change === 0
    };
  };

  const trend = getEvolutionTrend();

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Md FCFA`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} M FCFA`;
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA Total</p>
                <p className="text-2xl font-bold">{formatCurrency(company.annual_turnover)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA Export</p>
                <p className="text-2xl font-bold">{formatCurrency(company.export_turnover)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux d'export</p>
                <p className="text-2xl font-bold">{exportRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Part de marché</p>
                <p className="text-2xl font-bold">{company.market_share || 'N/A'}%</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taux d'export visualisé */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Part des exportations dans le CA</span>
                <span className="text-lg font-bold">{exportRate}%</span>
              </div>
              <Progress value={exportRate} className="h-4" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Marché local</span>
                <span>Export</span>
              </div>
            </div>

            {trend && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                <div className={`p-2 rounded-full ${trend.isPositive ? 'bg-green-500/10' : trend.isNeutral ? 'bg-gray-500/10' : 'bg-red-500/10'}`}>
                  {trend.isPositive ? (
                    <ArrowUp className="h-5 w-5 text-green-600" />
                  ) : trend.isNeutral ? (
                    <Minus className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    Évolution sur 3 ans: {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trend.isPositive ? 'Croissance' : trend.isNeutral ? 'Stable' : 'Baisse'} du chiffre d'affaires
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Évolution sur 3 ans */}
      {turnoverEvolution && Object.keys(turnoverEvolution).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Évolution du CA sur 3 ans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(turnoverEvolution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([year, value]) => (
                  <div key={year} className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{year}</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(value as number)}</p>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segmentation et catégorisation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Segmentation & Catégorisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Catégorie entreprise</p>
              <Badge variant="outline" className="text-base">
                {company.company_category || company.company_size || 'Non classé'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Catégorie CA</p>
              <Badge variant="outline" className="text-base">
                {company.turnover_category || 'Non classé'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Potentiel croissance</p>
              <Badge 
                className={
                  company.growth_potential === 'Très fort' ? 'bg-green-500' :
                  company.growth_potential === 'Fort' ? 'bg-blue-500' :
                  company.growth_potential === 'Moyen' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }
              >
                {company.growth_potential || 'Non évalué'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Segment stratégique</p>
              <Badge 
                className={
                  company.strategic_segment === 'Champion' ? 'bg-amber-500' :
                  company.strategic_segment === 'En développement' ? 'bg-blue-500' :
                  company.strategic_segment === 'À potentiel' ? 'bg-green-500' :
                  'bg-gray-500'
                }
              >
                {company.strategic_segment || 'Non classé'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores et notations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Évaluations & Notations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Score export</p>
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl font-bold text-primary">
                  {company.export_performance_score || '-'}
                </div>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            {[
              { label: 'Qualité', value: company.quality_rating },
              { label: 'Capacité', value: company.capacity_rating },
              { label: 'Gestion', value: company.management_rating },
              { label: 'Engagement', value: company.engagement_rating },
            ].map((item) => (
              <div key={item.label} className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div 
                      key={star}
                      className={`w-4 h-4 rounded-full ${
                        star <= (item.value || 0) ? 'bg-amber-400' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-lg font-bold mt-1">{item.value || '-'}/5</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
