import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface EventSource {
  id: string;
  name: string;
  url: string;
  type: string;
  priority: number;
  searchPaths: string[];
  eventTypes: string[];
  coverage: string;
}

interface ScrapedEvent {
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  source: string;
  source_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting event scraping process');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Configuration des sources (nationales et internationales)
    const sources: EventSource[] = [
      // Sources nationales (Côte d'Ivoire)
      {
        id: 'gov-commerce',
        name: 'Ministère du Commerce et de l\'Industrie',
        url: 'https://www.commerce.gouv.ci',
        type: 'officiel',
        priority: 1,
        searchPaths: ['/publications/sous-categorie/49', '/agenda-evenementiel'],
        eventTypes: ['foire', 'salon', 'conference', 'forum'],
        coverage: 'national'
      },
      {
        id: 'cci-ci',
        name: 'Chambre de Commerce et d\'Industrie de Côte d\'Ivoire',
        url: 'https://www.cci.ci',
        type: 'institutionnel',
        priority: 1,
        searchPaths: ['/foires-en-cote-divoire', '/agenda', '/evenements'],
        eventTypes: ['foire', 'salon', 'formation', 'atelier'],
        coverage: 'national'
      },
      
      // Sources internationales - Afrique
      {
        id: 'eventseye-africa',
        name: 'EventsEye - Afrique',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 2,
        searchPaths: [
          '/fairs/c1_salons_afrique.html',
          '/fairs/c0_salons_senegal.html',
          '/fairs/c0_salons_ghana.html',
          '/fairs/c0_salons_nigeria.html',
          '/fairs/c0_salons_kenya.html',
          '/fairs/c0_salons_maroc.html',
          '/fairs/c0_salons_afrique-du-sud.html'
        ],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'afrique'
      },
      
      // Sources internationales - Europe
      {
        id: 'eventseye-europe',
        name: 'EventsEye - Europe',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 2,
        searchPaths: [
          '/fairs/c1_salons_europe.html',
          '/fairs/c0_salons_france.html',
          '/fairs/c0_salons_allemagne.html',
          '/fairs/c0_salons_italie.html',
          '/fairs/c0_salons_espagne.html'
        ],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'europe'
      },
      
      // Sources internationales - Asie et Moyen-Orient
      {
        id: 'eventseye-asia',
        name: 'EventsEye - Asie & Moyen-Orient',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 2,
        searchPaths: [
          '/fairs/c1_salons_asie.html',
          '/fairs/c0_salons_chine.html',
          '/fairs/c0_salons_emirats-arabes-unis.html',
          '/fairs/c0_salons_arabie-saoudite.html',
          '/fairs/c0_salons_inde.html'
        ],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'asie'
      },
      
      // Sources internationales - Amériques
      {
        id: 'eventseye-americas',
        name: 'EventsEye - Amériques',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 2,
        searchPaths: [
          '/fairs/c1_salons_amerique-du-nord.html',
          '/fairs/c0_salons_etats-unis.html',
          '/fairs/c1_salons_amerique-du-sud.html',
          '/fairs/c0_salons_bresil.html'
        ],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'ameriques'
      },
      
      // Source globale Côte d'Ivoire
      {
        id: 'eventseye-ci',
        name: 'EventsEye - Côte d\'Ivoire',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 1,
        searchPaths: ['/fairs/c0_salons_cote-d-ivoire.html'],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'national'
      }
    ];

    const scrapedEvents: ScrapedEvent[] = [];
    const errors: string[] = [];

    // Scraper chaque source
    for (const source of sources) {
      if (source.priority <= 2) {
        try {
          console.log(`📡 Scraping: ${source.name}`);
          
          for (const path of source.searchPaths) {
            try {
              const fullUrl = `${source.url}${path}`;
              console.log(`  → Fetching: ${fullUrl}`);
              
              const response = await fetch(fullUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                signal: AbortSignal.timeout(10000), // 10s timeout
              });

              if (!response.ok) {
                console.warn(`  ⚠️ HTTP ${response.status} for ${fullUrl}`);
                continue;
              }

              const html = await response.text();
              
              // Extraction intelligente avec IA
              console.log('  🤖 Analyzing with AI...');
              const events = await extractEventsWithAI(html, source, fullUrl);
              scrapedEvents.push(...events);
              
              console.log(`  ✅ Found ${events.length} events`);
              
              // Rate limiting
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (pathError) {
              const errMsg = pathError instanceof Error ? pathError.message : String(pathError);
              console.error(`  ❌ Error scraping path ${path}:`, pathError);
              errors.push(`${source.name}${path}: ${errMsg}`);
            }
          }
        } catch (sourceError) {
          const errMsg = sourceError instanceof Error ? sourceError.message : String(sourceError);
          console.error(`❌ Error scraping ${source.name}:`, sourceError);
          errors.push(`${source.name}: ${errMsg}`);
        }
      }
    }

    // Récupérer la direction par défaut (Direction Générale ou première direction)
    const { data: directions } = await supabase
      .from('directions')
      .select('id')
      .limit(1);
    
    const defaultDirectionId = directions?.[0]?.id;

    if (!defaultDirectionId) {
      throw new Error('No direction found in database');
    }

    // Insérer les événements dans la base de données (éviter les doublons)
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const event of scrapedEvents) {
      try {
        // Vérifier si l'événement existe déjà
        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('title', event.title)
          .eq('start_date', event.start_date)
          .maybeSingle();

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Insérer le nouvel événement
        const { error: insertError } = await supabase
          .from('events')
          .insert({
            title: event.title,
            event_type: event.event_type,
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location,
            description: event.description,
            direction_id: defaultDirectionId,
          });

        if (insertError) {
          console.error(`Error inserting event "${event.title}":`, insertError);
        } else {
          insertedCount++;
        }
      } catch (insertError) {
        console.error(`Error processing event "${event.title}":`, insertError);
      }
    }

    console.log(`\n✨ Scraping complete:`);
    console.log(`  - Total scraped: ${scrapedEvents.length}`);
    console.log(`  - Inserted: ${insertedCount}`);
    console.log(`  - Duplicates: ${duplicateCount}`);
    console.log(`  - Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalScraped: scrapedEvents.length,
          inserted: insertedCount,
          duplicates: duplicateCount,
          errors: errors.length,
        },
        events: scrapedEvents,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Extraction intelligente avec IA de Lovable
async function extractEventsWithAI(
  html: string, 
  source: EventSource,
  sourceUrl: string
): Promise<ScrapedEvent[]> {
  try {
    // Nettoyer le HTML pour ne garder que le texte pertinent
    const cleanText = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limiter la taille

    console.log(`  📝 Analyzing ${cleanText.length} characters with AI`);

    // Appeler l'IA Lovable pour extraire les événements
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en extraction d'informations sur des événements commerciaux internationaux (foires, salons, conférences). 
Extrait UNIQUEMENT les événements futurs avec leurs informations complètes.
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte supplémentaire.`
          },
          {
            role: 'user',
            content: `Analyse ce contenu web et extrait les événements. Source: ${source.name} (Couverture: ${source.coverage})

Contenu:
${cleanText}

Retourne un tableau JSON avec cette structure exacte:
[
  {
    "title": "Nom complet de l'événement",
    "event_type": "foire|salon|conférence|forum|atelier|formation|séminaire|webinaire|exposition|réunion|autre",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "location": "Ville, Pays",
    "description": "Description complète avec secteurs et informations clés"
  }
]

Règles IMPORTANTES:
- Maximum 10 événements
- Dates au format YYYY-MM-DD (si année seulement, utiliser 01-01)
- Uniquement événements futurs (2025 et après)
- Location COMPLÈTE avec ville ET pays (ex: "Paris, France", "Lagos, Nigeria", "Dubaï, EAU")
- Description avec secteurs d'activité et public cible
- Si informations manquantes, estimer intelligemment selon le contexte
- Si pas d'événements trouvés, retourner []`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('  ❌ AI API Error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '[]';
    
    console.log('  🤖 AI Response:', aiResponse.substring(0, 200));

    // Parser la réponse JSON
    let extractedEvents: any[] = [];
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      extractedEvents = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('  ⚠️ Failed to parse AI response as JSON:', parseError);
      return [];
    }

    // Valider et formater les événements
    const validEvents: ScrapedEvent[] = [];
    for (const event of extractedEvents) {
      if (event.title && event.start_date) {
        validEvents.push({
          title: event.title.substring(0, 200),
          event_type: event.event_type || source.eventTypes[0] || 'Autre',
          start_date: event.start_date,
          end_date: event.end_date || event.start_date,
          location: event.location || 'Abidjan, Côte d\'Ivoire',
          description: event.description || `Événement collecté depuis ${source.name}`,
          source: source.name,
          source_url: sourceUrl,
        });
      }
    }

    console.log(`  ✨ Extracted ${validEvents.length} valid events with AI`);
    return validEvents;

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('  ❌ AI extraction error:', errMsg);
    return [];
  }
}
