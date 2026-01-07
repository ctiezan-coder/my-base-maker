import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Users, Factory, TrendingUp, Target, Award, Globe, FileText } from "lucide-react";
import { CompanyIdentityTab } from "./tabs/CompanyIdentityTab";
import { CompanyContactsTab } from "./tabs/CompanyContactsTab";
import { CompanyProductionTab } from "./tabs/CompanyProductionTab";
import { CompanyHRTab } from "./tabs/CompanyHRTab";
import { CompanyPerformanceTab } from "./tabs/CompanyPerformanceTab";
import { CompanyAccompanimentTab } from "./tabs/CompanyAccompanimentTab";
import type { ExtendedCompany } from "@/types/company-extended";

interface CompanyDetailsDialogEnrichedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function CompanyDetailsDialogEnriched({ 
  open, 
  onOpenChange, 
  companyId,
  companyName 
}: CompanyDetailsDialogEnrichedProps) {
  const { data: company, isLoading } = useQuery({
    queryKey: ["company-details-enriched", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
      
      if (error) throw error;
      return data as ExtendedCompany;
    },
    enabled: open && !!companyId,
  });

  if (!company && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span>{companyName}</span>
              {company?.sigle && (
                <span className="text-muted-foreground ml-2">({company.sigle})</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : company ? (
          <Tabs defaultValue="identity" className="flex-1">
            <div className="px-6 border-b">
              <TabsList className="h-12 bg-transparent gap-2">
                <TabsTrigger value="identity" className="gap-2 data-[state=active]:bg-primary/10">
                  <Building2 className="h-4 w-4" /> Identité
                </TabsTrigger>
                <TabsTrigger value="contacts" className="gap-2 data-[state=active]:bg-primary/10">
                  <Users className="h-4 w-4" /> Contacts
                </TabsTrigger>
                <TabsTrigger value="production" className="gap-2 data-[state=active]:bg-primary/10">
                  <Factory className="h-4 w-4" /> Production
                </TabsTrigger>
                <TabsTrigger value="hr" className="gap-2 data-[state=active]:bg-primary/10">
                  <Users className="h-4 w-4" /> RH
                </TabsTrigger>
                <TabsTrigger value="performance" className="gap-2 data-[state=active]:bg-primary/10">
                  <TrendingUp className="h-4 w-4" /> Performance
                </TabsTrigger>
                <TabsTrigger value="accompaniment" className="gap-2 data-[state=active]:bg-primary/10">
                  <Target className="h-4 w-4" /> Accompagnement
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(95vh-180px)]">
              <div className="p-6">
                <TabsContent value="identity" className="m-0">
                  <CompanyIdentityTab company={company} />
                </TabsContent>
                <TabsContent value="contacts" className="m-0">
                  <CompanyContactsTab company={company} />
                </TabsContent>
                <TabsContent value="production" className="m-0">
                  <CompanyProductionTab company={company} />
                </TabsContent>
                <TabsContent value="hr" className="m-0">
                  <CompanyHRTab company={company} />
                </TabsContent>
                <TabsContent value="performance" className="m-0">
                  <CompanyPerformanceTab company={company} />
                </TabsContent>
                <TabsContent value="accompaniment" className="m-0">
                  <CompanyAccompanimentTab company={company} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
