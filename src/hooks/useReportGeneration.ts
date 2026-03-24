import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ReportType = "monthly" | "pme" | "opportunities" | "tasks" | "pme_global";

interface ReportParams {
  reportType: ReportType;
  dateFrom?: Date;
  dateTo?: Date;
  selectedPme?: string;
  period?: string;
}

export function useReportGeneration() {
  // Fonction helper pour créer une feuille de statistiques avec graphiques
  const createStatsSheet = (stats: any[], title: string) => {
    const ws = XLSX.utils.json_to_sheet(stats);
    
    // Définir la largeur des colonnes
    const colWidths = [
      { wch: 30 }, // Colonne A
      { wch: 15 }, // Colonne B
    ];
    ws['!cols'] = colWidths;
    
    return ws;
  };

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

    // Check for errors
    const errors = [events, trainings, partnerships, projects, imputations, kpis]
      .filter(r => r.error)
      .map(r => r.error?.message);
    if (errors.length > 0) {
      throw new Error(`Erreur lors de la récupération des données: ${errors.join(', ')}`)
    }

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

    // Feuille Statistiques générales
    const statsData = [{
      'Indicateur': 'Total événements',
      'Valeur': events.data?.length || 0
    }, {
      'Indicateur': 'Total formations',
      'Valeur': trainings.data?.length || 0
    }, {
      'Indicateur': 'Total partenariats',
      'Valeur': partnerships.data?.length || 0
    }, {
      'Indicateur': 'Total projets',
      'Valeur': projects.data?.length || 0
    }, {
      'Indicateur': 'Total imputations',
      'Valeur': imputations.data?.length || 0
    }, {
      'Indicateur': 'Imputations en attente',
      'Valeur': imputations.data?.filter(i => i.etat === 'En attente').length || 0
    }, {
      'Indicateur': 'Imputations en cours',
      'Valeur': imputations.data?.filter(i => i.etat === 'En cours').length || 0
    }, {
      'Indicateur': 'Imputations terminées',
      'Valeur': imputations.data?.filter(i => i.etat === 'Terminé').length || 0
    }];
    const wsStats = createStatsSheet(statsData, 'Statistiques');
    XLSX.utils.book_append_sheet(workbook, wsStats, 'Statistiques');

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
    const { data: eventParticipations, error: epError } = await supabase
      .from('event_participants')
      .select('*, event:events(*)')
      .eq('company_id', companyId);

    if (epError) throw new Error(`Erreur récupération participations: ${epError.message}`);

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
    const { data: applications, error: appError } = await supabase
      .from('opportunity_applications')
      .select('*, opportunity:export_opportunities(*)')
      .eq('company_id', companyId);

    if (appError) throw new Error(`Erreur récupération candidatures: ${appError.message}`);

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
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', companyId);

    if (tasksError) throw new Error(`Erreur récupération tâches: ${tasksError.message}`);

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

    const { data: opportunities, error: oppError } = await supabase
      .from('export_opportunities')
      .select('*')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    if (oppError) throw new Error(`Erreur récupération opportunités: ${oppError.message}`);

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
    const { data: applications, error: appError2 } = await supabase
      .from('opportunity_applications')
      .select('*, opportunity:export_opportunities(*), company:companies(*)')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    if (appError2) throw new Error(`Erreur récupération candidatures: ${appError2.message}`);

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

  const generateGlobalPmeReport = async () => {
    // Récupérer toutes les entreprises
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .order('company_name');

    if (!companies || companies.length === 0) {
      throw new Error("Aucune entreprise trouvée");
    }

    const workbook = XLSX.utils.book_new();

    // Feuille 1: Liste des PME
    const companiesData = companies.map(c => ({
      'Nom': c.company_name,
      'RCCM': c.rccm_number,
      'DFE': c.dfe_number,
      'Secteur': c.activity_sector || 'N/A',
      'Ville': c.city || 'N/A',
      'Statut accompagnement': c.accompaniment_status || 'N/A',
      'CA annuel (FCFA)': c.annual_turnover || 'N/A',
      'Taille': c.company_size || 'N/A',
      'Service export': c.has_export_service ? 'Oui' : 'Non',
      'Marchés actuels': c.current_export_markets?.join(', ') || 'N/A',
      'Marchés cibles': c.target_export_markets?.join(', ') || 'N/A',
      'Contact': c.legal_representative_name || 'N/A',
      'Téléphone': c.phone || 'N/A',
      'Email': c.email || 'N/A'
    }));
    const wsCompanies = XLSX.utils.json_to_sheet(companiesData);
    wsCompanies['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
      { wch: 15 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsCompanies, 'PME');

    // Statistiques par secteur
    const sectorStats = companies.reduce((acc: any, c) => {
      const sector = c.activity_sector || 'Non spécifié';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    const sectorData = Object.entries(sectorStats).map(([sector, count]) => ({
      'Secteur': sector,
      'Nombre d\'entreprises': count
    }));
    const wsSectors = createStatsSheet(sectorData, 'Par Secteur');
    XLSX.utils.book_append_sheet(workbook, wsSectors, 'Par Secteur');

    // Statistiques par statut d'accompagnement
    const statusStats = companies.reduce((acc: any, c) => {
      const status = c.accompaniment_status || 'Non défini';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusStats).map(([status, count]) => ({
      'Statut': status,
      'Nombre d\'entreprises': count
    }));
    const wsStatus = createStatsSheet(statusData, 'Par Statut');
    XLSX.utils.book_append_sheet(workbook, wsStatus, 'Par Statut');

    // Statistiques par taille
    const sizeStats = companies.reduce((acc: any, c) => {
      const size = c.company_size || 'Non spécifié';
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {});

    const sizeData = Object.entries(sizeStats).map(([size, count]) => ({
      'Taille': size,
      'Nombre d\'entreprises': count
    }));
    const wsSize = createStatsSheet(sizeData, 'Par Taille');
    XLSX.utils.book_append_sheet(workbook, wsSize, 'Par Taille');

    // Statistiques par ville
    const cityStats = companies.reduce((acc: any, c) => {
      const city = c.city || 'Non spécifié';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const cityData = Object.entries(cityStats)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([city, count]) => ({
        'Ville': city,
        'Nombre d\'entreprises': count
      }));
    const wsCity = createStatsSheet(cityData, 'Par Ville');
    XLSX.utils.book_append_sheet(workbook, wsCity, 'Par Ville');

    // Feuille Événements et participations
    const { data: eventParticipations } = await supabase
      .from('event_participants')
      .select('*, event:events(*), company:companies(company_name)');

    const eventsData = eventParticipations?.map(ep => ({
      'Entreprise': ep.company?.company_name,
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
      .select('*, opportunity:export_opportunities(*), company:companies(company_name)');

    const opportunitiesData = applications?.map(app => ({
      'Entreprise': app.company?.company_name,
      'Opportunité': app.opportunity?.title,
      'Pays': app.opportunity?.destination_country,
      'Secteur': app.opportunity?.sector,
      'Valeur estimée': `${app.opportunity?.estimated_value} ${app.opportunity?.currency || 'EUR'}`,
      'Date candidature': format(new Date(app.application_date), 'dd/MM/yyyy', { locale: fr }),
      'Statut': app.status
    })) || [];
    const wsOpportunities = XLSX.utils.json_to_sheet(opportunitiesData);
    XLSX.utils.book_append_sheet(workbook, wsOpportunities, 'Opportunités');

    // Statistiques générales
    const generalStats = [{
      'Indicateur': 'Total entreprises',
      'Valeur': companies.length
    }, {
      'Indicateur': 'Avec service export',
      'Valeur': companies.filter(c => c.has_export_service).length
    }, {
      'Indicateur': 'Sans service export',
      'Valeur': companies.filter(c => !c.has_export_service).length
    }, {
      'Indicateur': 'Participations événements',
      'Valeur': eventParticipations?.length || 0
    }, {
      'Indicateur': 'Candidatures opportunités',
      'Valeur': applications?.length || 0
    }, {
      'Indicateur': 'Candidatures en cours',
      'Valeur': applications?.filter(a => a.status === 'En cours').length || 0
    }, {
      'Indicateur': 'Candidatures acceptées',
      'Valeur': applications?.filter(a => a.status === 'Accepté').length || 0
    }];
    const wsGeneralStats = createStatsSheet(generalStats, 'Vue Générale');
    
    // Insérer cette feuille en premier
    XLSX.utils.book_append_sheet(workbook, wsGeneralStats, 'Vue Générale');
    
    // Réorganiser pour que Vue Générale soit en premier
    const sheets = workbook.SheetNames;
    const vueGeneraleIndex = sheets.indexOf('Vue Générale');
    if (vueGeneraleIndex > 0) {
      sheets.splice(vueGeneraleIndex, 1);
      sheets.unshift('Vue Générale');
      workbook.SheetNames = sheets;
    }

    return workbook;
  };

  const generateTasksReport = async (dateFrom: Date, dateTo: Date) => {
    const fromStr = format(dateFrom, "yyyy-MM-dd");
    const toStr = format(dateTo, "yyyy-MM-dd");

    const { data: tasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*, company:companies(*)')
      .gte('created_at', fromStr)
      .lte('created_at', toStr);

    if (tasksErr) throw new Error(`Erreur récupération tâches: ${tasksErr.message}`);

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
        case "pme_global": {
          workbook = await generateGlobalPmeReport();
          fileName = `Rapport_Global_PME_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
          break;
        }

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
