import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ReportType = "monthly" | "pme" | "opportunities" | "tasks";

interface ReportParams {
  reportType: ReportType;
  dateFrom?: Date;
  dateTo?: Date;
  selectedPme?: string;
  period?: string;
}

export function useReportGeneration() {
  const generateMonthlyReport = async (dateFrom: Date, dateTo: Date) => {
    const fromStr = format(dateFrom, "yyyy-MM-dd");
    const toStr = format(dateTo, "yyyy-MM-dd");

    // Récupérer toutes les données pour la période
    const [events, trainings, partnerships, projects, imputations, kpis] = await Promise.all([
      supabase.from('events').select('*').gte('start_date', fromStr).lte('start_date', toStr),
      supabase.from('trainings').select('*').gte('start_date', fromStr).lte('start_date', toStr),
      supabase.from('partnerships').select('*').gte('start_date', fromStr).lte('start_date', toStr),
      supabase.from('projects').select('*').gte('start_date', fromStr).lte('start_date', toStr),
      supabase.from('imputations').select('*').gte('date_reception', fromStr).lte('date_reception', toStr),
      supabase.from('kpi_tracking').select('*').gte('period', fromStr).lte('period', toStr)
    ]);

    const workbook = XLSX.utils.book_new();

    // Feuille Événements
    const eventsData = events.data?.map(e => ({
      'Titre': e.title,
      'Type': e.event_type,
      'Date début': format(new Date(e.start_date), 'dd/MM/yyyy', { locale: fr }),
      'Date fin': format(new Date(e.end_date), 'dd/MM/yyyy', { locale: fr }),
      'Lieu': e.location || 'N/A',
      'Participants max': e.max_participants || 'N/A'
    })) || [];
    const wsEvents = XLSX.utils.json_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(workbook, wsEvents, 'Événements');

    // Feuille Formations
    const trainingsData = trainings.data?.map(t => ({
      'Titre': t.title,
      'Type': t.training_type,
      'Date début': format(new Date(t.start_date), 'dd/MM/yyyy', { locale: fr }),
      'Date fin': format(new Date(t.end_date), 'dd/MM/yyyy', { locale: fr }),
      'Lieu': t.location || 'N/A',
      'Participants': t.current_participants || 0
    })) || [];
    const wsTrainings = XLSX.utils.json_to_sheet(trainingsData);
    XLSX.utils.book_append_sheet(workbook, wsTrainings, 'Formations');

    // Feuille Partenariats
    const partnershipsData = partnerships.data?.map(p => ({
      'Partenaire': p.partner_name,
      'Type': p.partner_type || 'N/A',
      'Statut': p.status || 'N/A',
      'Date début': p.start_date ? format(new Date(p.start_date), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Budget': p.budget ? `${p.budget} FCFA` : 'N/A',
      'Contact': p.contact_person || 'N/A'
    })) || [];
    const wsPartnerships = XLSX.utils.json_to_sheet(partnershipsData);
    XLSX.utils.book_append_sheet(workbook, wsPartnerships, 'Partenariats');

    // Feuille Projets
    const projectsData = projects.data?.map(p => ({
      'Nom': p.name,
      'Statut': p.status || 'N/A',
      'Date début': p.start_date ? format(new Date(p.start_date), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Date fin': p.end_date ? format(new Date(p.end_date), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Budget': p.budget ? `${p.budget} FCFA` : 'N/A',
      'Priorité': p.priority_level || 'N/A'
    })) || [];
    const wsProjects = XLSX.utils.json_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(workbook, wsProjects, 'Projets');

    // Feuille Imputations
    const imputationsData = imputations.data?.map(i => ({
      'Date réception': format(new Date(i.date_reception), 'dd/MM/yyyy', { locale: fr }),
      'Provenance': i.provenance,
      'Objet': i.objet,
      'Imputation': i.imputation,
      'État': i.etat,
      'Date imputation': i.date_imputation ? format(new Date(i.date_imputation), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Observations': i.observations || 'N/A'
    })) || [];
    const wsImputations = XLSX.utils.json_to_sheet(imputationsData);
    XLSX.utils.book_append_sheet(workbook, wsImputations, 'Imputations');

    // Feuille KPIs
    const kpisData = kpis.data?.map(k => ({
      'KPI': k.kpi_name,
      'Valeur': k.kpi_value,
      'Cible': k.target_value || 'N/A',
      'Unité': k.unit || 'N/A',
      'Période': format(new Date(k.period), 'MMMM yyyy', { locale: fr }),
      'Notes': k.notes || 'N/A'
    })) || [];
    const wsKpis = XLSX.utils.json_to_sheet(kpisData);
    XLSX.utils.book_append_sheet(workbook, wsKpis, 'KPIs');

    return workbook;
  };

  const generatePmeReport = async (companyId: string) => {
    // Récupérer les données de l'entreprise
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) throw new Error("Entreprise non trouvée");

    const workbook = XLSX.utils.book_new();

    // Feuille Informations générales
    const companyInfo = [{
      'Nom': company.company_name,
      'Nom commercial': company.trade_name || 'N/A',
      'RCCM': company.rccm_number,
      'DFE': company.dfe_number,
      'Secteur': company.activity_sector || 'N/A',
      'Siège': company.headquarters_location,
      'Téléphone': company.phone || 'N/A',
      'Email': company.email || 'N/A',
      'Site web': company.website || 'N/A',
      'Statut accompagnement': company.accompaniment_status || 'N/A',
      'Chiffre d\'affaires': company.annual_turnover ? `${company.annual_turnover} FCFA` : 'N/A'
    }];
    const wsInfo = XLSX.utils.json_to_sheet(companyInfo);
    XLSX.utils.book_append_sheet(workbook, wsInfo, 'Informations');

    // Feuille Événements participés
    const { data: eventParticipations } = await supabase
      .from('event_participants')
      .select('*, event:events(*)')
      .eq('company_id', companyId);

    const eventsData = eventParticipations?.map(ep => ({
      'Événement': ep.event?.title,
      'Type': ep.event?.event_type,
      'Date': format(new Date(ep.event?.start_date), 'dd/MM/yyyy', { locale: fr }),
      'Statut': ep.status,
      'Notes': ep.notes || 'N/A'
    })) || [];
    const wsEvents = XLSX.utils.json_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(workbook, wsEvents, 'Événements');

    // Feuille Opportunités
    const { data: applications } = await supabase
      .from('opportunity_applications')
      .select('*, opportunity:export_opportunities(*)')
      .eq('company_id', companyId);

    const opportunitiesData = applications?.map(app => ({
      'Opportunité': app.opportunity?.title,
      'Pays': app.opportunity?.destination_country,
      'Secteur': app.opportunity?.sector,
      'Valeur estimée': `${app.opportunity?.estimated_value} ${app.opportunity?.currency || 'EUR'}`,
      'Date candidature': format(new Date(app.application_date), 'dd/MM/yyyy', { locale: fr }),
      'Statut': app.status,
      'Notes': app.notes || 'N/A'
    })) || [];
    const wsOpportunities = XLSX.utils.json_to_sheet(opportunitiesData);
    XLSX.utils.book_append_sheet(workbook, wsOpportunities, 'Opportunités');

    // Feuille Tâches
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', companyId);

    const tasksData = tasks?.map(t => ({
      'Titre': t.title,
      'Description': t.description || 'N/A',
      'Priorité': t.priority,
      'Statut': t.status,
      'Échéance': t.deadline ? format(new Date(t.deadline), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Créé le': format(new Date(t.created_at), 'dd/MM/yyyy', { locale: fr })
    })) || [];
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, wsTasks, 'Tâches');

    return workbook;
  };

  const generateOpportunitiesReport = async (dateFrom: Date, dateTo: Date) => {
    const fromStr = format(dateFrom, "yyyy-MM-dd");
    const toStr = format(dateTo, "yyyy-MM-dd");

    const { data: opportunities } = await supabase
      .from('export_opportunities')
      .select('*')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    const workbook = XLSX.utils.book_new();

    // Feuille Opportunités
    const opportunitiesData = opportunities?.map(o => ({
      'Titre': o.title,
      'Région': o.region,
      'Pays': o.destination_country,
      'Ville': o.destination_city || 'N/A',
      'Secteur': o.sector,
      'Valeur estimée': `${o.estimated_value} ${o.currency || 'EUR'}`,
      'Volume': o.volume,
      'Échéance': format(new Date(o.deadline), 'dd/MM/yyyy', { locale: fr }),
      'Statut': o.status,
      'Score compatibilité': o.compatibility_score || 'N/A',
      'Description': o.description
    })) || [];
    const wsOpportunities = XLSX.utils.json_to_sheet(opportunitiesData);
    XLSX.utils.book_append_sheet(workbook, wsOpportunities, 'Opportunités');

    // Feuille Candidatures
    const { data: applications } = await supabase
      .from('opportunity_applications')
      .select('*, opportunity:export_opportunities(*), company:companies(*)')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    const applicationsData = applications?.map(app => ({
      'Opportunité': app.opportunity?.title,
      'Entreprise': app.company?.company_name,
      'Date candidature': format(new Date(app.application_date), 'dd/MM/yyyy', { locale: fr }),
      'Statut': app.status,
      'Notes': app.notes || 'N/A'
    })) || [];
    const wsApplications = XLSX.utils.json_to_sheet(applicationsData);
    XLSX.utils.book_append_sheet(workbook, wsApplications, 'Candidatures');

    return workbook;
  };

  const generateTasksReport = async (dateFrom: Date, dateTo: Date) => {
    const fromStr = format(dateFrom, "yyyy-MM-dd");
    const toStr = format(dateTo, "yyyy-MM-dd");

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, company:companies(*)')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    const workbook = XLSX.utils.book_new();

    // Feuille Tâches
    const tasksData = tasks?.map(t => ({
      'Titre': t.title,
      'Description': t.description || 'N/A',
      'Entreprise': t.company?.company_name || t.company_name || 'N/A',
      'Priorité': t.priority,
      'Statut': t.status,
      'Échéance': t.deadline ? format(new Date(t.deadline), 'dd/MM/yyyy', { locale: fr }) : 'N/A',
      'Créé le': format(new Date(t.created_at), 'dd/MM/yyyy', { locale: fr }),
      'Mis à jour le': format(new Date(t.updated_at), 'dd/MM/yyyy', { locale: fr })
    })) || [];
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, wsTasks, 'Tâches');

    // Feuille Statistiques
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'Terminé').length || 0;
    const inProgressTasks = tasks?.filter(t => t.status === 'En cours').length || 0;
    const pendingTasks = tasks?.filter(t => t.status === 'À faire').length || 0;
    const highPriorityTasks = tasks?.filter(t => t.priority === 'Haute').length || 0;

    const statsData = [{
      'Total tâches': totalTasks,
      'Terminées': completedTasks,
      'En cours': inProgressTasks,
      'À faire': pendingTasks,
      'Haute priorité': highPriorityTasks,
      'Taux complétion': totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'
    }];
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, wsStats, 'Statistiques');

    return workbook;
  };

  const generateReport = async (params: ReportParams): Promise<void> => {
    let workbook: XLSX.WorkBook;
    let fileName: string;

    try {
      switch (params.reportType) {
        case "monthly": {
          let dateFrom = params.dateFrom;
          let dateTo = params.dateTo;

          // Handle period selection
          if (params.period === "current") {
            const now = new Date();
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          } else if (params.period === "last") {
            const now = new Date();
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            dateTo = new Date(now.getFullYear(), now.getMonth(), 0);
          } else if (params.period === "last3") {
            const now = new Date();
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          }

          if (!dateFrom || !dateTo) {
            throw new Error("Veuillez sélectionner une période");
          }

          workbook = await generateMonthlyReport(dateFrom, dateTo);
          fileName = `Rapport_Mensuel_${format(dateFrom, "MMMM_yyyy", { locale: fr })}.xlsx`;
          break;
        }

        case "pme": {
          if (!params.selectedPme) {
            throw new Error("Veuillez sélectionner une PME");
          }
          workbook = await generatePmeReport(params.selectedPme);
          
          // Get company name for filename
          const { data: company } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', params.selectedPme)
            .single();
          
          fileName = `Rapport_PME_${company?.company_name.replace(/\s+/g, '_')}_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
          break;
        }

        case "opportunities": {
          if (!params.dateFrom || !params.dateTo) {
            throw new Error("Veuillez sélectionner une période");
          }
          workbook = await generateOpportunitiesReport(params.dateFrom, params.dateTo);
          fileName = `Rapport_Opportunites_${format(params.dateFrom, "dd-MM-yyyy")}_${format(params.dateTo, "dd-MM-yyyy")}.xlsx`;
          break;
        }

        case "tasks": {
          if (!params.dateFrom || !params.dateTo) {
            throw new Error("Veuillez sélectionner une période");
          }
          workbook = await generateTasksReport(params.dateFrom, params.dateTo);
          fileName = `Rapport_Taches_${format(params.dateFrom, "dd-MM-yyyy")}_${format(params.dateTo, "dd-MM-yyyy")}.xlsx`;
          break;
        }

        default:
          throw new Error("Type de rapport non reconnu");
      }

      // Download the file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      throw error;
    }
  };

  return { generateReport };
}
