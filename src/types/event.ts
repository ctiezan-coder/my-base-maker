export interface Event {
  id: string;
  title: string;
  description?: string;
  objectives?: string;
  target_audience?: string;
  sectors?: string[];
  event_type: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  recurrence_type?: string;
  recurrence_end_date?: string;
  status?: string;
  location_type?: string;
  location?: string;
  country?: string;
  city?: string;
  venue?: string;
  full_address?: string;
  capacity?: number;
  max_participants?: number;
  video_link?: string;
  access_instructions?: string;
  venue_map_url?: string;
  direction_id: string;
  direction?: { name: string };
  project_manager_id?: string;
  budget_estimated?: number;
  budget_actual?: number;
  registration_deadline?: string;
  registration_link?: string;
  is_registration_open?: boolean;
  waitlist_enabled?: boolean;
  require_approval?: boolean;
  program_pdf_url?: string;
  satisfaction_score?: number;
  total_participants_actual?: number;
  hashtag?: string;
  press_release_url?: string;
  social_media_links?: Record<string, string>;
  roi_percentage?: number;
  contracts_value?: number;
  leads_generated?: number;
  b2b_meetings?: number;
  media_coverage_value?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  day_number?: number;
  session_date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  room?: string;
  session_type?: string;
  max_attendees?: number;
  is_break?: boolean;
  is_parallel?: boolean;
  materials_url?: string;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  session_id?: string;
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  topics?: string[];
  is_keynote?: boolean;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  company_id: string;
  company?: { company_name: string };
  status: string;
  category?: string;
  badge_printed?: boolean;
  badge_number?: string;
  check_in_time?: string;
  check_out_time?: string;
  qr_code?: string;
  certificate_sent?: boolean;
  certificate_url?: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  hotel_reservation?: boolean;
  transport_needed?: boolean;
  waitlist_position?: number;
  payment_status?: string;
  payment_amount?: number;
  registration_date?: string;
  notes?: string;
}

export interface EventTeamMember {
  id: string;
  event_id: string;
  user_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  is_external?: boolean;
  organization?: string;
  notes?: string;
}

export interface EventBudgetItem {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  description?: string;
  estimated_amount?: number;
  actual_amount?: number;
  currency?: string;
  vendor?: string;
  invoice_number?: string;
  invoice_url?: string;
  status?: string;
  notes?: string;
}

export interface EventSponsor {
  id: string;
  event_id: string;
  name: string;
  sponsor_level?: string;
  contribution_type?: string;
  contribution_value?: number;
  currency?: string;
  benefits_offered?: string;
  logo_url?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_media_partner?: boolean;
  notes?: string;
}

export interface EventLogistics {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  quantity?: number;
  description?: string;
  vendor?: string;
  status?: string;
  assigned_to?: string;
  due_date?: string;
  completed?: boolean;
  notes?: string;
}

export interface EventCatering {
  id: string;
  event_id: string;
  service_type: string;
  service_date: string;
  service_time?: string;
  expected_count?: number;
  menu_description?: string;
  dietary_options?: string[];
  caterer_name?: string;
  caterer_contact?: string;
  cost?: number;
  currency?: string;
  status?: string;
  notes?: string;
}

export interface EventSurvey {
  id: string;
  event_id: string;
  participant_id?: string;
  overall_rating?: number;
  organization_rating?: number;
  content_rating?: number;
  speakers_rating?: number;
  logistics_rating?: number;
  venue_rating?: number;
  comments?: string;
  suggestions?: string;
  would_recommend?: boolean;
  submitted_at?: string;
}

export interface EventReport {
  id: string;
  event_id: string;
  report_type?: string;
  title: string;
  summary?: string;
  objectives_achieved?: string;
  key_statistics?: Record<string, any>;
  lessons_learned?: string;
  strengths?: string;
  improvements?: string;
  recommendations?: string;
  financial_summary?: Record<string, any>;
  testimonials?: string[];
  media_urls?: string[];
  file_url?: string;
  status?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface DiscoveredEvent {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  country?: string;
  city?: string;
  venue?: string;
  website?: string;
  sectors?: string[];
  source?: string;
  relevance_score?: number;
  status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
}

export const EVENT_TYPES = [
  { value: 'salon', label: 'Salon professionnel' },
  { value: 'mission', label: 'Mission commerciale' },
  { value: 'formation', label: 'Formation' },
  { value: 'conference', label: 'Conférence' },
  { value: 'seminaire', label: 'Séminaire' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'webinaire', label: 'Webinaire' },
  { value: 'networking', label: 'Networking' },
  { value: 'lancement', label: 'Lancement' },
  { value: 'reunion', label: 'Réunion' },
  { value: 'autre', label: 'Autre' },
];

export const EVENT_STATUSES = [
  { value: 'planned', label: 'Planifié', color: 'bg-gray-500' },
  { value: 'confirmed', label: 'Confirmé', color: 'bg-blue-500' },
  { value: 'open', label: 'Ouvert aux inscriptions', color: 'bg-green-500' },
  { value: 'full', label: 'Complet', color: 'bg-orange-500' },
  { value: 'ongoing', label: 'En cours', color: 'bg-purple-500' },
  { value: 'completed', label: 'Terminé', color: 'bg-gray-600' },
  { value: 'evaluated', label: 'Évalué', color: 'bg-teal-500' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-500' },
  { value: 'postponed', label: 'Reporté', color: 'bg-yellow-500' },
];

export const LOCATION_TYPES = [
  { value: 'in_person', label: 'Présentiel' },
  { value: 'online', label: 'En ligne' },
  { value: 'hybrid', label: 'Hybride' },
];

export const PARTICIPANT_CATEGORIES = [
  { value: 'vip', label: 'VIP' },
  { value: 'exhibitor', label: 'Exposant' },
  { value: 'visitor', label: 'Visiteur' },
  { value: 'organizer', label: 'Organisateur' },
  { value: 'press', label: 'Presse' },
  { value: 'speaker', label: 'Intervenant' },
];

export const PARTICIPANT_STATUSES = [
  { value: 'registered', label: 'Inscrit' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'waitlist', label: 'Liste d\'attente' },
];

export const SPONSOR_LEVELS = [
  { value: 'platinum', label: 'Platine', color: 'bg-gray-300' },
  { value: 'gold', label: 'Or', color: 'bg-yellow-400' },
  { value: 'silver', label: 'Argent', color: 'bg-gray-400' },
  { value: 'bronze', label: 'Bronze', color: 'bg-orange-600' },
];

export const BUDGET_CATEGORIES = [
  { value: 'venue', label: 'Lieu / Salle' },
  { value: 'catering', label: 'Restauration' },
  { value: 'equipment', label: 'Équipement technique' },
  { value: 'communication', label: 'Communication' },
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Hébergement' },
  { value: 'speakers', label: 'Intervenants' },
  { value: 'other', label: 'Autres' },
];

export const LOGISTICS_CATEGORIES = [
  { value: 'signage', label: 'Signalétique' },
  { value: 'equipment', label: 'Équipement' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'goodies', label: 'Goodies' },
  { value: 'technical', label: 'Technique' },
  { value: 'furniture', label: 'Mobilier' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'other', label: 'Autres' },
];
