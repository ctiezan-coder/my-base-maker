import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// External Supabase project (attendee-flow-master)
const EXTERNAL_SUPABASE_URL = 'https://zztkvexbgvgttiwwfwjg.supabase.co'
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dGt2ZXhiZ3ZndHRpd3dmd2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjIwNjUsImV4cCI6MjA4ODA5ODA2NX0.ugrVeefPKHvsXTjcO_GLsKYNlbunBxjK-vX3O5FWg4E'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const localSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: claims, error: authError } = await localSupabase.auth.getClaims(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = claims.claims.sub

    // Fetch formations from external project
    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY)

    const { data: formations, error: fetchError } = await externalSupabase
      .from('formations')
      .select('*')
      .order('date_debut', { ascending: false })

    if (fetchError) {
      console.error('Error fetching external formations:', fetchError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des formations externes', details: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Also fetch inscriptions count per formation
    const { data: inscriptions } = await externalSupabase
      .from('inscriptions')
      .select('formation_id, statut')

    const inscriptionCounts: Record<string, number> = {}
    if (inscriptions) {
      for (const insc of inscriptions) {
        if (insc.statut === 'inscrit' || insc.statut === 'confirmé') {
          inscriptionCounts[insc.formation_id] = (inscriptionCounts[insc.formation_id] || 0) + 1
        }
      }
    }

    // Map external formations to local trainings format and upsert
    const { body } = await req.json().catch(() => ({ body: {} }))
    const directionId = body?.direction_id

    let imported = 0
    let updated = 0
    let skipped = 0

    for (const formation of formations || []) {
      // Check if already exists by title and start_date
      const { data: existing } = await localSupabase
        .from('trainings')
        .select('id, external_id')
        .eq('title', formation.titre)
        .maybeSingle()

      const trainingData = {
        title: formation.titre,
        description: `Thème: ${formation.theme}`,
        training_type: 'séminaire',
        start_date: formation.date_debut,
        end_date: formation.date_debut,
        location: formation.lieu || 'Non spécifié',
        max_participants: formation.places,
        status: formation.statut === 'active' ? 'planifiée' : formation.statut,
        created_by: userId,
        ...(directionId ? { direction_id: directionId } : {}),
        external_id: formation.id,
      }

      if (existing) {
        // Update
        const { error: updateError } = await localSupabase
          .from('trainings')
          .update(trainingData)
          .eq('id', existing.id)

        if (!updateError) updated++
        else skipped++
      } else {
        // Insert
        const { error: insertError } = await localSupabase
          .from('trainings')
          .insert(trainingData)

        if (!insertError) imported++
        else {
          console.error('Insert error:', insertError)
          skipped++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: formations?.length || 0,
        imported,
        updated,
        skipped,
        formations: formations?.map(f => ({
          id: f.id,
          titre: f.titre,
          theme: f.theme,
          date_debut: f.date_debut,
          lieu: f.lieu,
          places: f.places,
          inscrits: inscriptionCounts[f.id] || 0,
          places_restantes: f.places - (inscriptionCounts[f.id] || 0),
          image_url: f.image_url,
          statut: f.statut,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
