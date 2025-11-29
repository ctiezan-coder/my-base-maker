import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, directionId } = await req.json();

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`Creating admin user: ${email}`);

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingProfile && existingProfile.user_id) {
      // User exists in profiles, check if exists in auth
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingProfile.user_id);
      
      if (authUser.user) {
        // Update password
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          existingProfile.user_id,
          { password }
        );

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: `Mot de passe mis à jour pour ${email}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        direction_id: directionId,
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update or create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        email,
        full_name: fullName,
        direction_id: directionId,
        account_status: 'approved'
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: newUser.user.id, 
        role: 'admin' 
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
    }

    console.log(`Admin user created successfully: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Utilisateur admin créé: ${email}`,
        userId: newUser.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create admin user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
