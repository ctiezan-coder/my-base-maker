import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXTERNAL_SUPABASE_URL = 'https://zztkvexbgvgttiwwfwjg.supabase.co'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    const userId = claims.claims.sub as string

    let directionId: string | null = null
    try {
      const body = await req.json()
      directionId = body?.direction_id || null
    } catch {
      // No body
    }

    // Connect to external project with service role key to bypass RLS
    const externalServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY')
    if (!externalServiceKey) {
      return new Response(JSON.stringify({ error: 'Clé de service externe non configurée' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, externalServiceKey)

    // Fetch formations
    const { data: formations, error: fetchError } = await externalSupabase
      .from('formations')
      .select('*')
      .order('date_debut', { ascending: false })

    if (fetchError) {
      console.error('Error fetching formations:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Fetched ${formations?.length || 0} formations`)

    // Fetch inscriptions with participant details
    const { data: inscriptions, error: inscError } = await externalSupabase
      .from('inscriptions')
      .select(`
        *,
        participants (
          id,
          nom_dirigeant,
          nom_entreprise,
          email,
          telephone
        )
      `)

    if (inscError) {
      console.error('Error fetching inscriptions:', inscError)
    }

    console.log(`Fetched ${inscriptions?.length || 0} inscriptions`)

    // Fetch presences
    const { data: presences } = await externalSupabase
      .from('presences')
      .select('inscription_id, present')

    const presenceMap: Record<string, boolean> = {}
    if (presences) {
      for (const p of presences) {
        presenceMap[p.inscription_id] = p.present
      }
    }

    // Group inscriptions by formation_id
    const inscriptionsByFormation: Record<string, any[]> = {}
    if (inscriptions) {
      for (const insc of inscriptions) {
        if (!inscriptionsByFormation[insc.formation_id]) {
          inscriptionsByFormation[insc.formation_id] = []
        }
        inscriptionsByFormation[insc.formation_id].push({
          ...insc,
          present: presenceMap[insc.id] || false,
        })
      }
    }

    let imported = 0
    let updated = 0
    let skipped = 0
    let participantsImported = 0
    let participantsUpdated = 0

    for (const formation of formations || []) {
      // Check if already imported by external_id
      const { data: existing } = await localSupabase
        .from('trainings')
        .select('id')
        .eq('external_id' as any, formation.id)
        .maybeSingle()

      const trainingData: Record<string, any> = {
        title: formation.titre,
        description: `Thème: ${formation.theme}${formation.duree ? ' | Durée: ' + formation.duree : ''}`,
        training_type: 'Formation',
        start_date: formation.date_debut,
        end_date: formation.date_debut,
        location: formation.lieu || 'Non spécifié',
        max_participants: formation.places,
        created_by: userId,
        external_id: formation.id,
      }

      if (directionId) {
        trainingData.direction_id = directionId
      }

      let localTrainingId: string | null = null

      if (existing) {
        const { error: updateError } = await localSupabase
          .from('trainings')
          .update(trainingData as any)
          .eq('id', existing.id)

        if (!updateError) {
          updated++
          localTrainingId = existing.id
        } else {
          console.error('Update error:', updateError)
          skipped++
        }
      } else {
        if (!directionId) {
          console.error('Cannot insert without direction_id')
          skipped++
          continue
        }
        const { data: inserted, error: insertError } = await localSupabase
          .from('trainings')
          .insert(trainingData as any)
          .select('id')
          .single()

        if (!insertError && inserted) {
          imported++
          localTrainingId = inserted.id
        } else {
          console.error('Insert error:', insertError)
          skipped++
        }
      }

      // Import participants for this formation
      if (localTrainingId && inscriptionsByFormation[formation.id]) {
        const participants = inscriptionsByFormation[formation.id]
        console.log(`Processing ${participants.length} participants for formation ${formation.titre}`)

        for (const insc of participants) {
          const participant = insc.participants
          if (!participant || !participant.email) continue

          // Check if participant already registered
          const { data: existingReg } = await localSupabase
            .from('training_registrations')
            .select('id')
            .eq('training_id', localTrainingId)
            .eq('participant_email', participant.email)
            .maybeSingle()

          const regData = {
            training_id: localTrainingId,
            participant_name: participant.nom_dirigeant || 'Inconnu',
            participant_email: participant.email,
            participant_phone: participant.telephone || null,
            participant_position: participant.nom_entreprise || 'Dirigeant',
            attended: insc.present || false,
            status: insc.statut === 'confirmé' ? 'Confirmée' : 'En attente',
            registration_date: insc.date_inscription || new Date().toISOString(),
          }

          if (existingReg) {
            const { error: updateRegError } = await localSupabase
              .from('training_registrations')
              .update(regData as any)
              .eq('id', existingReg.id)

            if (!updateRegError) participantsUpdated++
            else console.error('Reg update error:', updateRegError)
          } else {
            const { error: regError } = await localSupabase
              .from('training_registrations')
              .insert(regData as any)

            if (!regError) {
              participantsImported++
            } else {
              console.error('Reg insert error:', regError)
            }
          }
        }

        // Update current_participants count
        await localSupabase
          .from('trainings')
          .update({ current_participants: participants.length } as any)
          .eq('id', localTrainingId)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: formations?.length || 0,
        imported,
        updated,
        skipped,
        participantsImported,
        participantsUpdated,
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
