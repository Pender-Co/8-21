// Import serve function from Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔵 Edge Function called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('🔵 Request body:', body);
    
    const { email, name, role, companyName, token } = body;

    if (!email || !role || !companyName || !token) {
      console.error('🔴 Missing required fields:', { email: !!email, role: !!role, companyName: !!companyName, token: !!token });
      throw new Error('Missing required fields: email, role, companyName, or token');
    }

    const SENDGRID_API_KEY = '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';
    const FROM_EMAIL = 'pendercomain@gmail.com';

    const inviteUrl = `https://papaya-puppy-dabed1.netlify.app/accept-invite?token=${token}`;
    console.log('🔵 Generated invite URL:', inviteUrl);
    console.log('🔵 Token being used:', token);
    console.log('🔵 Invite URL:', inviteUrl);
    
    const emailData = {
      personalizations: [
        {
          to: [{ email, name: name || email.split('@')[0] }],
          subject: `You've been invited to join ${companyName} on TradoHQ`
        }
      ],
      from: {
        email: FROM_EMAIL,
        name: 'TradoHQ'
      },
      content: [
        {
          type: 'text/html',
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>You've been invited to join ${companyName}</title>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">TradoHQ</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Outdoor Service Management</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #2E7D32; margin-top: 0; font-size: 24px;">You've been invited to join ${companyName}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  You've been invited to join <strong>${companyName}</strong> as a <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong> on TradoHQ, 
                  the leading platform for outdoor service professionals.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #2E7D32; margin-top: 0; font-size: 18px;">What you'll get:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Real-time job scheduling and updates</li>
                    <li style="margin-bottom: 8px;">GPS tracking and route optimization</li>
                    <li style="margin-bottom: 8px;">Mobile app for easy job management</li>
                    <li style="margin-bottom: 8px;">Team communication tools</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" 
                     style="background: #2E7D32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                    Accept Invitation
                  </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⏰ This invitation expires in 7 days.</strong> Please accept it soon to join your team.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you can't click the button above, copy and paste this link into your browser:<br>
                  <a href="${inviteUrl}" style="color: #2E7D32; word-break: break-all;">${inviteUrl}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 0;">
                  Need help? Contact us at <a href="mailto:support@tradohq.com" style="color: #2E7D32;">support@tradohq.com</a>
                </p>
              </div>
            </body>
            </html>
          `
        }
      ]
    };

    console.log('🔵 Sending email to SendGrid...');
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔴 SendGrid error:', errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    console.log('🟢 Email sent successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Invite email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('🔴 Error in send-invite function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send invite email',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});