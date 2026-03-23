import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EXTERNAL_SUPABASE_URL = 'https://zztkvexbgvgttiwwfwjg.supabase.co'
const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dGt2ZXhiZ3ZndHRpd3dmd2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjIwNjUsImV4cCI6MjA4ODA5ODA2NX0.ugrVeefPKHvsXTjcO_GLsKYNlbunBxjK-vX3O5FWg4E'

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

    // Call the external project's admin-operations edge function
    console.log('Calling external admin-operations endpoint...')
    const response = await fetch(
      `${EXTERNAL_SUPABASE_URL}/functions/v1/admin-operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EXTERNAL_ANON_KEY}`,
          'apikey': EXTERNAL_ANON_KEY,
        },
        body: JSON.stringify({ action: 'export_participants' }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('External API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `Erreur API externe: ${response.status} - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const externalData = await response.json()
    console.log('External data received:', JSON.stringify(externalData).substring(0, 500))

    // Extract formations and participants from the response
    const formations = externalData?.data?.formations || externalData?.formations || []
    const participants = externalData?.data?.participants || externalData?.participants || []
    const inscriptions = externalData?.data?.inscriptions || externalData?.inscriptions || []
    const presences = externalData?.data?.presences || externalData?.presences || []

    console.log(`Received: ${formations.length} formations, ${participants.length} participants, ${inscriptions.length} inscriptions, ${presences.length} presences`)

    // Build presence map
    const presenceMap: Record<string, boolean> = {}
    for (const p of presences) {
      presenceMap[p.inscription_id] = p.present
    }

    // Build participants map
    const participantsMap: Record<string, any> = {}
    for (const p of participants) {
      participantsMap[p.id] = p
    }

    // Group inscriptions by formation_id
    const inscriptionsByFormation: Record<string, any[]> = {}
    for (const insc of inscriptions) {
      if (!inscriptionsByFormation[insc.formation_id]) {
        inscriptionsByFormation[insc.formation_id] = []
      }
      inscriptionsByFormation[insc.formation_id].push({
        ...insc,
        participant: participantsMap[insc.participant_id],
        present: presenceMap[insc.id] || false,
      })
    }

    let imported = 0
    let updated = 0
    let skipped = 0
    let participantsImported = 0
    let participantsUpdated = 0

    for (const formation of formations) {
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
        const formationParticipants = inscriptionsByFormation[formation.id]
        console.log(`Processing ${formationParticipants.length} participants for formation ${formation.titre}`)

        for (const insc of formationParticipants) {
          const participant = insc.participant
          if (!participant || !participant.email) continue

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

        await localSupabase
          .from('trainings')
          .update({ current_participants: formationParticipants.length } as any)
          .eq('id', localTrainingId)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: formations.length,
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
