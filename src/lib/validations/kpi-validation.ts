import { z } from 'zod';

export const kpiSchema = z.object({
  kpi_name: z.string()
    .trim()
    .min(1, { message: "Le nom du KPI est requis" })
    .max(200, { message: "Le nom ne peut pas dépasser 200 caractères" }),
  
  kpi_value: z.number({
    required_error: "La valeur du KPI est requise",
    invalid_type_error: "La valeur doit être un nombre"
  }),
  
  period: z.string()
    .min(1, { message: "La période est requise" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format de date invalide (YYYY-MM-DD)" }),
  
  target_value: z.number({
    invalid_type_error: "La valeur cible doit être un nombre"
  }).optional().nullable(),
  
  unit: z.string()
    .trim()
    .max(50, { message: "L'unité ne peut pas dépasser 50 caractères" })
    .optional()
    .nullable(),
  
  notes: z.string()
    .trim()
    .max(1000, { message: "Les notes ne peuvent pas dépasser 1000 caractères" })
    .optional()
    .nullable(),
  
  direction_id: z.string()
    .uuid({ message: "ID de direction invalide" }),
  
  created_by: z.string()
    .uuid({ message: "ID créateur invalide" })
    .optional()
    .nullable(),
});

export type KpiValidationData = z.infer<typeof kpiSchema>;
