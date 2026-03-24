import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const deleteUserSchema = z.object({
  userId: z.string().uuid()
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const token = authHeader.replace('Bearer ', '')

    // Verify the user making the request is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError) {
      console.error('Error checking role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!roles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get and validate the user ID to delete
    const body = await req.json()
    const validated = deleteUserSchema.parse(body)
    const { userId } = validated

    // Before deleting the user, reassign all their created data to NULL
    // This preserves data integrity while removing user attribution
    
    console.log('Reassigning user data for user:', userId)
    
    // List of tables with created_by or similar columns
    const tablesToUpdate = [
      { table: 'companies', column: 'created_by' },
      { table: 'documents', column: 'uploaded_by' },
      { table: 'events', column: 'created_by' },
      { table: 'trainings', column: 'created_by' },
      { table: 'partnerships', column: 'created_by' },
      { table: 'projects', column: 'created_by' },
      { table: 'business_connections', column: 'created_by' },
      { table: 'export_opportunities', column: 'created_by' },
      { table: 'imputations', column: 'created_by' },
      { table: 'kpi_tracking', column: 'created_by' },
      { table: 'media_content', column: 'created_by' },
      { table: 'opportunity_applications', column: 'created_by' },
      { table: 'event_participants', column: 'created_by' },
      { table: 'project_tracking', column: 'created_by' },
      { table: 'folders', column: 'created_by' },
    ]

    // Update all tables to set created_by to NULL
    for (const { table, column } of tablesToUpdate) {
      const { error: updateError } = await supabaseClient
        .from(table)
        .update({ [column]: null })
        .eq(column, userId)
      
      if (updateError) {
        console.error(`Error updating ${table}.${column}:`, updateError)
        // Continue even if one update fails
      } else {
        console.log(`Updated ${table}.${column} to NULL`)
      }
    }

    // Also handle tasks table which has both created_by and assigned_to
    const { error: tasksCreatedError } = await supabaseClient
      .from('tasks')
      .update({ created_by: null })
      .eq('created_by', userId)
    
    if (tasksCreatedError) {
      console.error('Error updating tasks.created_by:', tasksCreatedError)
    }

    const { error: tasksAssignedError } = await supabaseClient
      .from('tasks')
      .update({ assigned_to: null })
      .eq('assigned_to', userId)
    
    if (tasksAssignedError) {
      console.error('Error updating tasks.assigned_to:', tasksAssignedError)
    }

    console.log('Data reassignment complete, proceeding with user deletion')

    // Now delete the user
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Une erreur est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
