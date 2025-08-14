import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const port = 3001;

// Initialize Resend
const resend = new Resend('re_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email service is running' });
});

// Password reset email endpoint
app.post('/send-reset-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`Sending password reset email to: ${email}`);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's verified domain for testing
      to: email,
      subject: 'Wachtwoord resetten - Bonaire Makelaars',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Bonaire Makelaars</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 16px;">Wachtwoord resetten</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
              U heeft een verzoek gedaan om uw wachtwoord te resetten voor uw Bonaire Makelaars account.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
              We hebben uw verzoek ontvangen om uw wachtwoord te resetten. Omdat u uw wachtwoord bent vergeten, 
              kunt u niet direct inloggen. Volg deze stappen:
            </p>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>📋 Instructies voor wachtwoord reset:</strong><br><br>
                <strong>Optie 1: Vraag hulp aan beheerder</strong><br>
                • Neem contact op met de website beheerder<br>
                • Vraag om uw wachtwoord te resetten<br>
                • U krijgt dan een nieuw tijdelijk wachtwoord<br><br>
                
                <strong>Optie 2: Probeer zich te herinneren</strong><br>
                • Probeer verschillende wachtwoorden die u gebruikt<br>
                • Controleer uw wachtwoord manager<br>
                • Klik hieronder om naar de inlogpagina te gaan
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="http://localhost:5173/auth/forgot-password-reset?email=${encodeURIComponent(email)}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Nieuw wachtwoord instellen
              </a>
            </div>
            
            <div style="text-align: center; margin: 16px 0;">
              <a href="http://localhost:5173/auth/login" 
                 style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                Probeer in te loggen
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              Als de knoppen niet werken, kopieer en plak deze links in uw browser:<br>
              <strong>Nieuw wachtwoord:</strong> <a href="http://localhost:5173/auth/forgot-password-reset?email=${encodeURIComponent(email)}" style="color: #2563eb; word-break: break-all;">
                http://localhost:5173/auth/forgot-password-reset?email=${encodeURIComponent(email)}
              </a><br>
              <strong>Inloggen:</strong> <a href="http://localhost:5173/auth/login" style="color: #2563eb; word-break: break-all;">
                http://localhost:5173/auth/login
              </a>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                Als u geen wachtwoord reset heeft aangevraagd, kunt u deze email negeren.<br>
                © 2025 Bonaire Makelaars - Alle rechten voorbehouden
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    }

    console.log('Email sent successfully:', data);
    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`✅ Email service running on http://localhost:${port}`);
  console.log(`📧 Ready to send password reset emails`);
});
