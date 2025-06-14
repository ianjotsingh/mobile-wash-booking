
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      company_name,
      owner_name,
      email,
      phone,
      description,
      experience,
      has_mechanic,
      services,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      user_id
    } = await req.json()

    console.log('Registering company with data:', {
      company_name,
      owner_name,
      email,
      phone,
      has_mechanic,
      services,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      user_id
    })

    // Insert company data
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .insert({
        company_name,
        owner_name,
        email,
        phone,
        description,
        experience,
        has_mechanic: has_mechanic || false,
        services: services || [],
        address,
        city,
        state,
        zip_code,
        latitude: latitude || null,
        longitude: longitude || null,
        user_id,
        status: 'pending'
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company registration error:', companyError)
      throw companyError
    }

    console.log('Company registered successfully:', company)

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_id: company.id,
        message: 'Company registered successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Registration function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Company registration failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
