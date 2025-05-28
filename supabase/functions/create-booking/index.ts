
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

    const bookingData = await req.json()

    // Create the booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.user.id,
        service_id: bookingData.serviceId,
        company_id: bookingData.companyId,
        address: bookingData.address,
        city: bookingData.city,
        zip_code: bookingData.zipCode,
        special_instructions: bookingData.specialInstructions,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        car_type: bookingData.carType,
        car_color: bookingData.carColor,
        car_model: bookingData.carModel,
        additional_notes: bookingData.additionalNotes,
        total_amount: bookingData.totalAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ booking }),
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
