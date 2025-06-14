
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SendOTPRequest {
  phone: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);

    if (!requestBody) {
      return new Response(
        JSON.stringify({ error: 'Request body is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone, otp }: SendOTPRequest = JSON.parse(requestBody);
    
    console.log('Parsed data - Phone:', phone, 'OTP:', otp);

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    console.log('Twilio config check:', {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasFromNumber: !!fromNumber,
    });

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean and format phone number
    let cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    
    // Handle different phone number formats
    if (cleanPhone.length === 10) {
      // Assume it's an Indian number without country code
      cleanPhone = `+91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      // Indian number with country code but no +
      cleanPhone = `+${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      // US number
      cleanPhone = `+${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      // Default to Indian number
      cleanPhone = `+91${cleanPhone}`;
    }

    console.log('Formatted phone number:', cleanPhone);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const body = new URLSearchParams({
      From: fromNumber,
      To: cleanPhone,
      Body: `Your WashCart verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
    });

    console.log('Sending SMS to:', cleanPhone);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    console.log('Twilio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', errorText);
      
      // Parse Twilio error for better user feedback
      let userMessage = 'Failed to send SMS';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          if (errorData.message.includes('not a valid phone number')) {
            userMessage = 'Invalid phone number format';
          } else if (errorData.message.includes('Unverified numbers')) {
            userMessage = 'Phone number not verified with Twilio';
          }
        }
      } catch (e) {
        // Use default message if parsing fails
      }

      return new Response(
        JSON.stringify({ error: userMessage, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioResponse = await response.json();
    console.log('SMS sent successfully:', twilioResponse.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResponse.sid,
        to: cleanPhone 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
