import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketData {
  country: string;
  region: string;
  sector: string;
  market_potential: string;
  growth_rate: number;
  market_size_billion: number;
  risk_level: string;
  demand_description: string;
  key_products: string[];
  requirements: string[];
}

interface OpportunityData {
  title: string;
  sector: string;
  destination_country: string;
  destination_city: string;
  region: string;
  estimated_value: number;
  currency: string;
  deadline: string;
  volume: string;
  description: string;
  requirements: string[];
  status: string;
  compatibility_score: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    console.log('Fetching real market data from AI...')

    // Générer des données de marchés potentiels
    const marketsPrompt = `Génère 5 marchés potentiels d'export africains réels et actuels (2025) avec des données précises.
    Format JSON strict:
    {
      "markets": [
        {
          "country": "nom du pays",
          "region": "Afrique" ou "ZLECAf" ou "Europe" ou "Asie",
          "sector": "secteur spécifique",
          "market_potential": "Très élevé" ou "Élevé" ou "Croissant",
          "growth_rate": nombre entre 5 et 25,
          "market_size_billion": nombre entre 0.5 et 50,
          "risk_level": "Faible" ou "Modéré" ou "Élevé",
          "demand_description": "description de la demande réelle actuelle",
          "key_products": ["produit1", "produit2", "produit3"],
          "requirements": ["exigence1", "exigence2"]
        }
      ]
    }
    
    Concentre-toi sur des secteurs porteurs comme: agroalimentaire, textile, technologie, énergie renouvelable, cosmétiques, artisanat.
    Utilise des données réelles de croissance économique 2024-2025.`

    const marketsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: marketsPrompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const marketsData = await marketsResponse.json()
    const marketsContent = JSON.parse(marketsData.choices[0].message.content)

    // Insérer les marchés potentiels
    if (marketsContent.markets) {
      for (const market of marketsContent.markets) {
        const { error } = await supabaseClient
          .from('potential_markets')
          .upsert({
            country: market.country,
            region: market.region,
            sector: market.sector,
            market_potential: market.market_potential,
            growth_rate: market.growth_rate,
            market_size_billion: market.market_size_billion,
            risk_level: market.risk_level,
            demand_description: market.demand_description,
            key_products: market.key_products,
            requirements: market.requirements,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'country,sector',
            ignoreDuplicates: false
          })

        if (error) {
          console.error('Error inserting market:', error)
        } else {
          console.log(`Market inserted: ${market.country} - ${market.sector}`)
        }
      }
    }

    // Générer des opportunités d'export
    const opportunitiesPrompt = `Génère 5 opportunités d'export réelles et actuelles (2025) pour des PME africaines.
    Format JSON strict:
    {
      "opportunities": [
        {
          "title": "titre de l'opportunité",
          "sector": "secteur",
          "destination_country": "pays de destination",
          "destination_city": "ville",
          "region": "Afrique" ou "ZLECAf" ou "Europe" ou "Asie" ou "Moyen-Orient",
          "estimated_value": nombre entre 10000 et 500000,
          "currency": "CFA",
          "deadline": "2025-XX-XX",
          "volume": "quantité estimée",
          "description": "description détaillée de l'opportunité",
          "requirements": ["exigence1", "exigence2", "exigence3"],
          "status": "NOUVEAU" ou "RECOMMANDÉ" ou "URGENT",
          "compatibility_score": nombre entre 70 et 95
        }
      ]
    }
    
    Inclus des opportunités variées et réalistes avec des échéances entre 1 et 6 mois.`

    const opportunitiesResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: opportunitiesPrompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const opportunitiesData = await opportunitiesResponse.json()
    const opportunitiesContent = JSON.parse(opportunitiesData.choices[0].message.content)

    // Insérer les opportunités
    if (opportunitiesContent.opportunities) {
      for (const opp of opportunitiesContent.opportunities) {
        const { error } = await supabaseClient
          .from('export_opportunities')
          .insert({
            title: opp.title,
            sector: opp.sector,
            destination_country: opp.destination_country,
            destination_city: opp.destination_city,
            region: opp.region,
            estimated_value: opp.estimated_value,
            currency: opp.currency,
            deadline: opp.deadline,
            volume: opp.volume,
            description: opp.description,
            requirements: opp.requirements,
            status: opp.status,
            compatibility_score: opp.compatibility_score,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error inserting opportunity:', error)
        } else {
          console.log(`Opportunity inserted: ${opp.title}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Market data updated successfully',
        markets_count: marketsContent.markets?.length || 0,
        opportunities_count: opportunitiesContent.opportunities?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating market data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
