// Password Reset Email Handler
// This should be deployed as a serverless function or API endpoint

const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Send password reset email
    const { data, error } = await resend.emails.send({
      from: 'Tropical Realtors <noreply@tropicalrealtors.com>',
      to: email,
      subject: 'Wachtwoord resetten - Tropical Realtors',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Tropical Realtors</h1>
          </div>
          
          <h2 style="color: #1f2937;">Wachtwoord resetten</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            U heeft een verzoek gedaan om uw wachtwoord te resetten voor uw Tropical Realtors account.
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            Klik op de onderstaande knop om uw wachtwoord te resetten:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.SITE_URL || 'http://localhost:5173'}/auth/forgot-password-reset?email=${encodeURIComponent(email)}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Nieuw wachtwoord instellen
            </a>
          </div>
          
          <div style="text-align: center; margin: 16px 0;">
            <a href="${process.env.SITE_URL || 'http://localhost:5173'}/auth/login" 
               style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              Probeer in te loggen
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            Omdat u uw wachtwoord bent vergeten, dient u contact op te nemen met de beheerder voor een nieuw wachtwoord. Gebruik de bovenstaande knop om uw verzoek door te sturen.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Als u geen wachtwoord reset heeft aangevraagd, kunt u deze email negeren.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Failed to send email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Password reset email sent:', data);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
