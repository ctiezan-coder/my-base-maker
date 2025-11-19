import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Configuration des sources (basée sur le JSON fourni)
    const sources: EventSource[] = [
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
      {
        id: 'eventseye',
        name: 'EventsEye International',
        url: 'https://www.eventseye.com',
        type: 'commercial',
        priority: 2,
        searchPaths: ['/fairs/c0_salons_cote-d-ivoire.html'],
        eventTypes: ['foire', 'salon', 'exposition'],
        coverage: 'international'
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
              
              // Extraction basique avec regex (en production, utiliser un parser HTML)
              const events = extractEventsFromHTML(html, source);
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

// Fonction d'extraction basique (à améliorer selon la structure HTML réelle)
function extractEventsFromHTML(html: string, source: EventSource): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  
  // Patterns de recherche basiques pour dates et titres
  const datePattern = /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi;
  const titlePattern = /<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi;
  
  let titleMatch;
  const titles: string[] = [];
  while ((titleMatch = titlePattern.exec(html)) !== null) {
    const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    if (title.length > 10 && title.length < 200) {
      titles.push(title);
    }
  }

  let dateMatch;
  const dates: string[] = [];
  while ((dateMatch = datePattern.exec(html)) !== null) {
    const monthMap: { [key: string]: string } = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };
    const day = dateMatch[1].padStart(2, '0');
    const month = monthMap[dateMatch[2].toLowerCase()];
    const year = dateMatch[3];
    dates.push(`${year}-${month}-${day}`);
  }

  // Combiner titres et dates (approximatif)
  const maxEvents = Math.min(titles.length, dates.length);
  for (let i = 0; i < maxEvents; i++) {
    // Filtrer les mots-clés d'événements
    const title = titles[i];
    const hasEventKeyword = source.eventTypes.some(type => 
      title.toLowerCase().includes(type.toLowerCase()) ||
      title.toLowerCase().includes('salon') ||
      title.toLowerCase().includes('foire') ||
      title.toLowerCase().includes('forum') ||
      title.toLowerCase().includes('conférence')
    );

    if (hasEventKeyword) {
      events.push({
        title: title,
        event_type: source.eventTypes[0] || 'Autre',
        start_date: dates[i],
        end_date: dates[i], // Même date par défaut
        location: 'Abidjan, Côte d\'Ivoire', // Par défaut
        description: `Événement collecté depuis ${source.name}`,
        source: source.name,
        source_url: source.url,
      });
    }
  }

  return events;
}
