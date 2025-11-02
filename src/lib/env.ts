import { z } from 'zod';

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string()
    .url({ message: "VITE_SUPABASE_URL doit être une URL valide" })
    .startsWith('https://', { message: "VITE_SUPABASE_URL doit utiliser HTTPS" }),
  
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string()
    .min(1, { message: "VITE_SUPABASE_PUBLISHABLE_KEY est requis" })
    .startsWith('eyJ', { message: "VITE_SUPABASE_PUBLISHABLE_KEY doit être un JWT valide" }),
  
  VITE_SUPABASE_PROJECT_ID: z.string()
    .min(1, { message: "VITE_SUPABASE_PROJECT_ID est requis" })
    .regex(/^[a-z0-9]+$/, { message: "VITE_SUPABASE_PROJECT_ID doit contenir uniquement des lettres minuscules et chiffres" }),
});

// Type inféré depuis le schéma
export type Env = z.infer<typeof envSchema>;

// Fonction de validation
export function validateEnv(): Env {
  try {
    return envSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      console.error('❌ Erreur de configuration des variables d\'environnement:\n', errorMessages);
      throw new Error(
        'Configuration des variables d\'environnement invalide. ' +
        'Vérifiez votre fichier .env et assurez-vous que toutes les variables requises sont définies correctement.'
      );
    }
    throw error;
  }
}

// Validation au démarrage de l'application
export const env = validateEnv();
