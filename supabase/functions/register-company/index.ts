
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const companyData = await req.json()

    // Create the company registration
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        user_id: user.user.id,
        company_name: companyData.companyName,
        owner_name: companyData.ownerName,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        city: companyData.city,
        zip_code: companyData.zipCode,
        description: companyData.description,
        experience: companyData.experience,
        services: companyData.services,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update user role to company
    await supabase
      .from('user_profiles')
      .update({ role: 'company' })
      .eq('user_id', user.user.id)

    return new Response(
      JSON.stringify({ company }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
