import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN');
if (!ALLOWED_ORIGIN) {
  console.warn('ALLOWED_ORIGIN is not set — CORS will reject requests without a configured origin.');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN || 'https://abbxntdwuvduagjtlyri.supabase.co',
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

    // Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized - No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Invalid token or user not found:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      console.error('User is not admin:', user.id);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin user authenticated:', user.email);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    console.log('Fetching real market data from AI...')

    // Calculer les dates pour les opportunités (1 à 6 mois dans le futur)
    const now = new Date()
    const minDeadline = new Date(now)
    minDeadline.setMonth(now.getMonth() + 1) // 1 mois minimum
    const maxDeadline = new Date(now)
    maxDeadline.setMonth(now.getMonth() + 6) // 6 mois maximum

    // Fermer automatiquement les opportunités expirées
    console.log('Closing expired opportunities...')
    const { error: updateError } = await supabaseClient
      .from('export_opportunities')
      .update({ status: 'FERMÉ' })
      .lt('deadline', now.toISOString().split('T')[0])
      .neq('status', 'FERMÉ')
    
    if (updateError) {
      console.error('Error closing expired opportunities:', updateError)
    } else {
      console.log('Expired opportunities marked as closed')
    }

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
          .insert({
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
          })

        if (error) {
          console.error('Error inserting market:', error)
        } else {
          console.log(`Market inserted: ${market.country} - ${market.sector}`)
        }
      }
    }

    // Générer des opportunités d'export en utilisant des sources réelles de marché
    const opportunitiesPrompt = `Tu es un expert en commerce international et développement des PME africaines. Génère 5 opportunités d'export RÉELLES et ACTUELLES (2025-2026) pour les PME africaines, en t'inspirant des principales plateformes d'export internationales:

    SOURCES DE RÉFÉRENCE (à utiliser comme inspiration):
    
    📊 PLATEFORMES INSTITUTIONNELLES:
    - ITC Trade Map (trademap.org): statistiques commerce international 220 pays
    - Global Trade Helpdesk (globaltradehelpdesk.org): réglementations et opportunités par pays
    - ITC Market Analysis Tools (intracen.org): Export Potential Map, Market Access Map
    - WITS World Bank (wits.worldbank.org): données tarifaires et commerciales
    - OEC (oec.world): flux commerciaux et prédictions
    
    🏢 PLATEFORMES B2B MONDIALES:
    - Alibaba.com: 200M+ acheteurs, demandes d'approvisionnement
    - Global Sources (globalsources.com): produits innovants, salons virtuels
    - TradeKey.com: 9M+ importateurs, appels d'offres en temps réel
    - eWorldTrade.com: demandes B2B internationales
    - DHgate.com: opportunités pour petites quantités
    
    🇪🇺 PLATEFORMES EUROPÉENNES:
    - Europages.fr: 3M entreprises européennes, appels d'offres
    - ThomasNet.com: marché industriel nord-américain
    - Kompass.com: opportunités B2B internationales
    
    🌍 PLATEFORMES AFRICAINES:
    - African Export-Import Bank (afreximbank.com): opportunités intra-africaines
    - Trade Africa (tradeafrica.com): commerce intra-continental
    - African Union Platform: ZLECAf opportunités
    
    📢 APPELS D'OFFRES:
    - TendersInfo.com: appels d'offres internationaux en temps réel
    - DgMarket.com: procurement global
    - UNDB Online: opportunités Nations Unies
    
    Format JSON strict:
    {
      "opportunities": [
        {
          "title": "titre professionnel et précis de l'opportunité (ex: 'Exportation de Mangues Séchées Bio vers l'Allemagne')",
          "sector": "secteur spécifique (Agroalimentaire, Textile, Cosmétique, Artisanat, Mobilier, Agriculture, Technologie, etc.)",
          "destination_country": "pays de destination précis",
          "destination_city": "ville commerciale majeure (ex: Hambourg, Paris, Dubaï, Lagos)",
          "region": "Europe" ou "Afrique" ou "ZLECAf" ou "Asie" ou "Moyen-Orient" ou "Amérique du Nord" ou "Amérique du Sud",
          "estimated_value": montant réaliste en CFA (entre 50000 et 300000),
          "currency": "CFA",
          "deadline": "YYYY-MM-DD" (entre ${minDeadline.toISOString().split('T')[0]} et ${maxDeadline.toISOString().split('T')[0]}, dates réalistes dans le futur),
          "volume": "quantité/volume détaillé et réaliste (ex: '10 tonnes métriques', '5000 mètres linéaires')",
          "description": "description détaillée professionnelle: contexte du marché, type d'acheteur (importateur, distributeur, fabricant), usage prévu, potentiel de partenariat long terme",
          "requirements": ["exigence concrète 1 (ex: 'Certification biologique européenne (EU Organic)')", "exigence 2 (ex: 'Capacité de production de 5 tonnes/mois')", "exigence 3 si pertinente"],
          "status": "URGENT" (deadline < 60 jours) ou "NOUVEAU" (nouvelles opportunités) ou "RECOMMANDÉ" (opportunités à fort potentiel),
          "compatibility_score": nombre entre 75 et 95
        }
      ]
    }
    
    SECTEURS PRIORITAIRES ET PRODUITS PHARES:
    - Agroalimentaire: cacao transformé, café de spécialité, fruits séchés bio (mangue, ananas), noix de cajou, huile de palme durable, miel bio, épices
    - Cosmétiques: beurre de karité bio, huiles essentielles, savons naturels, produits capillaires afro
    - Textile: tissus wax authentiques, coton biologique, vêtements traditionnels modernes, teintures naturelles
    - Artisanat: mobilier en bois exotique, maroquinerie artisanale, bijoux traditionnels, objets décoratifs, vannerie
    - Agriculture: produits transformés, graines oléagineuses, produits de rente
    
    MARCHÉS CIBLES PRIORITAIRES:
    - Europe: Allemagne, France, Belgique, Pays-Bas (bio, équitable, premium)
    - ZLECAf: Nigeria, Ghana, Sénégal, Kenya (commerce intra-africain)
    - Moyen-Orient: Émirats Arabes Unis, Arabie Saoudite (halal, premium)
    - Asie: Chine, Inde, Malaisie (matières premières, ingrédients)
    - Amérique du Nord: USA, Canada (produits ethniques, bio)
    
    IMPORTANT: 
    - Crée des opportunités RÉALISTES basées sur de vraies tendances du marché international 2025
    - Utilise des valeurs monétaires cohérentes avec le marché
    - Inclus des exigences concrètes et réalisables
    - Varie les régions, secteurs et types d'opportunités
    - Privilégie les opportunités à fort impact pour les PME africaines`

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
