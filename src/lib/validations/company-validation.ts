import { z } from 'zod';

// Schémas de validation pour les champs Company
export const companySchema = z.object({
  company_name: z.string()
    .trim()
    .min(1, { message: "Le nom de l'entreprise est requis" })
    .max(200, { message: "Le nom ne peut pas dépasser 200 caractères" }),
  
  trade_name: z.string()
    .trim()
    .max(200, { message: "Le nom commercial ne peut pas dépasser 200 caractères" })
    .optional()
    .nullable(),
  
  rccm_number: z.string()
    .trim()
    .min(1, { message: "Le numéro RCCM est requis" })
    .max(50, { message: "Le numéro RCCM ne peut pas dépasser 50 caractères" }),
  
  dfe_number: z.string()
    .trim()
    .min(1, { message: "Le compte contribuables est requis" })
    .max(50, { message: "Le compte contribuables ne peut pas dépasser 50 caractères" }),
  
  legal_form: z.enum([
    'SA',
    'SARL',
    'SAS',
    'SASU',
    'EI',
    'GIE',
    'Autre'
  ]).optional().nullable(),
  
  company_size: z.enum([
    'TPE',
    'PME',
    'ETI',
    'Grande entreprise'
  ]).optional().nullable(),
  
  creation_date: z.string()
    .optional()
    .nullable(),
  
  headquarters_location: z.string()
    .trim()
    .min(1, { message: "Le siège social est requis" })
    .max(500, { message: "L'adresse ne peut pas dépasser 500 caractères" }),
  
  postal_address: z.string()
    .trim()
    .max(500, { message: "L'adresse postale ne peut pas dépasser 500 caractères" })
    .optional()
    .nullable(),
  
  city: z.string()
    .trim()
    .max(100, { message: "La ville ne peut pas dépasser 100 caractères" })
    .optional()
    .nullable(),
  
  phone: z.string()
    .trim()
    .max(50, { message: "Le téléphone ne peut pas dépasser 50 caractères" })
    .optional()
    .nullable(),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" })
    .optional()
    .nullable()
    .or(z.literal('')),
  
  website: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .max(500, { message: "L'URL ne peut pas dépasser 500 caractères" })
    .optional()
    .nullable()
    .or(z.literal('')),
  
  legal_representative_name: z.string()
    .trim()
    .max(200, { message: "Le nom ne peut pas dépasser 200 caractères" })
    .optional()
    .nullable(),
  
  legal_representative_gender: z.enum(['Homme', 'Femme'])
    .optional()
    .nullable(),
  
  legal_representative_phone: z.string()
    .trim()
    .max(50, { message: "Le téléphone ne peut pas dépasser 50 caractères" })
    .optional()
    .nullable(),
  
  legal_representative_email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" })
    .optional()
    .nullable()
    .or(z.literal('')),
  
  export_manager_name: z.string()
    .trim()
    .max(200, { message: "Le nom ne peut pas dépasser 200 caractères" })
    .optional()
    .nullable(),
  
  export_manager_email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" })
    .optional()
    .nullable()
    .or(z.literal('')),
  
  export_manager_phone: z.string()
    .trim()
    .max(50, { message: "Le téléphone ne peut pas dépasser 50 caractères" })
    .optional()
    .nullable(),
  
  has_export_service: z.boolean()
    .optional()
    .default(false),
  
  activity_sector: z.string()
    .trim()
    .max(500, { message: "Le secteur ne peut pas dépasser 500 caractères" })
    .optional()
    .nullable(),
  
  products_services: z.string()
    .trim()
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" })
    .optional()
    .nullable(),
  
  exported_products: z.string()
    .trim()
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" })
    .optional()
    .nullable(),
  
  target_export_markets: z.array(z.string())
    .optional()
    .nullable(),
  
  current_export_markets: z.array(z.string())
    .optional()
    .nullable(),
  
  certifications: z.array(z.string())
    .optional()
    .nullable(),
  
  annual_turnover: z.number()
    .nonnegative({ message: "Le chiffre d'affaires doit être positif" })
    .optional()
    .nullable(),
  
  commercial_events_participation: z.enum([
    'Jamais',
    'Foires',
    'Salons'
  ]).optional().default('Jamais'),
  
  support_needed: z.enum([
    'Financier',
    'Non financier',
    'Les deux'
  ]).optional().nullable(),
  
  accompaniment_status: z.string()
    .trim()
    .max(500, { message: "Le statut ne peut pas dépasser 500 caractères" })
    .optional()
    .nullable(),
  
  aciex_interaction_history: z.string()
    .trim()
    .max(5000, { message: "L'historique ne peut pas dépasser 5000 caractères" })
    .optional()
    .nullable(),
  
  direction_id: z.string()
    .uuid({ message: "ID de direction invalide" })
    .optional()
    .nullable(),
  
  created_by: z.string()
    .uuid({ message: "ID créateur invalide" })
    .optional()
    .nullable(),
});

export type CompanyValidationData = z.infer<typeof companySchema>;
