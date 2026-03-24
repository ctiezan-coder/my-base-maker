import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EXTERNAL_SUPABASE_URL = Deno.env.get('EXTERNAL_SUPABASE_URL') || ''
const EXTERNAL_ANON_KEY = Deno.env.get('EXTERNAL_ANON_KEY') || ''

async function getExternalJWT(): Promise<string> {
  const email = Deno.env.get('EXTERNAL_AUTH_EMAIL')
  const password = Deno.env.get('EXTERNAL_AUTH_PASSWORD')
  
  if (!email || !password) {
    throw new Error('EXTERNAL_AUTH_EMAIL ou EXTERNAL_AUTH_PASSWORD non configurés')
  }

  const response = await fetch(`${EXTERNAL_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EXTERNAL_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Authentification externe échouée: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

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

    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await localSupabase.auth.getClaims(token)
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

    // Step 1: Authenticate on external project
    console.log('Authenticating on external project...')
    const externalJWT = await getExternalJWT()
    console.log('External authentication successful')

    // Step 2: Call admin-operations endpoint
    console.log('Calling external admin-operations endpoint...')
    const response = await fetch(
      `${EXTERNAL_SUPABASE_URL}/functions/v1/admin-operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${externalJWT}`,
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
    const participants = externalData?.data || []
    console.log(`Received ${participants.length} participants from external API`)

    // Step 3: Create a default training for imported participants if needed
    let localTrainingId: string | null = null

    if (directionId) {
      const today = new Date().toISOString().split('T')[0]
      const trainingTitle = `Import participants externes - ${today}`

      const { data: existingTraining } = await localSupabase
        .from('trainings')
        .select('id')
        .eq('title', trainingTitle)
        .eq('direction_id', directionId)
        .maybeSingle()

      if (existingTraining) {
        localTrainingId = existingTraining.id
      } else {
        const { data: newTraining, error: insertError } = await localSupabase
          .from('trainings')
          .insert({
            title: trainingTitle,
            description: `Participants importés depuis le site public le ${today}`,
            training_type: 'Formation',
            start_date: today,
            end_date: today,
            location: 'Import externe',
            max_participants: participants.length,
            created_by: userId,
            direction_id: directionId,
          } as any)
          .select('id')
          .single()

        if (insertError) {
          console.error('Error creating training:', insertError)
          return new Response(
            JSON.stringify({ error: 'Erreur création formation: ' + insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        localTrainingId = newTraining.id
      }
    }

    // Step 4: Import participants as training registrations
    let participantsImported = 0
    let participantsUpdated = 0
    let participantsSkipped = 0

    for (const participant of participants) {
      if (!participant.email) {
        participantsSkipped++
        continue
      }

      if (!localTrainingId) {
        participantsSkipped++
        continue
      }

      const secteurs = (participant.participant_secteurs || [])
        .map((ps: any) => ps?.secteurs?.nom)
        .filter(Boolean)
        .join(', ')

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
        participant_position: participant.nom_entreprise || 'Non spécifié',
        attended: false,
        status: 'Confirmée',
        registration_date: participant.created_at || new Date().toISOString(),
      }

      if (existingReg) {
        const { error: updateError } = await localSupabase
          .from('training_registrations')
          .update(regData as any)
          .eq('id', existingReg.id)

        if (!updateError) participantsUpdated++
        else {
          console.error('Reg update error:', updateError)
          participantsSkipped++
        }
      } else {
        const { error: regError } = await localSupabase
          .from('training_registrations')
          .insert(regData as any)

        if (!regError) participantsImported++
        else {
          console.error('Reg insert error:', regError)
          participantsSkipped++
        }
      }
    }

    // Update participant count
    if (localTrainingId) {
      await localSupabase
        .from('trainings')
        .update({ current_participants: participantsImported + participantsUpdated } as any)
        .eq('id', localTrainingId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: participants.length,
        participantsImported,
        participantsUpdated,
        participantsSkipped,
        trainingId: localTrainingId,
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
