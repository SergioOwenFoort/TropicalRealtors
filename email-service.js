const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const port = 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Email templates
const emailTemplates = {
  passwordReset: {
    subject: 'Wachtwoord Resetten - Bonaire Makelaars',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wachtwoord Resetten - Bonaire Makelaars</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .email-body { background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
          .logo { text-align: center; margin-bottom: 32px; }
          .logo h1 { color: #2563eb; margin: 0; font-size: 28px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .button:hover { background-color: #1d4ed8; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #6b7280; font-size: 12px; }
          .warning { color: #dc2626; background-color: #fee2e2; padding: 16px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-body">
            
            <div class="logo">
              <h1>Bonaire Makelaars</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 16px;">Wachtwoord Resetten</h2>
            
            <p style="color: #374151; margin-bottom: 16px;">
              Beste ${data.userName || 'gebruiker'},
            </p>
            
            <p style="color: #374151; margin-bottom: 24px;">
              U heeft een verzoek gedaan om uw wachtwoord te resetten voor uw Bonaire Makelaars account.
              Klik op de onderstaande knop om verder te gaan met het resetten van uw wachtwoord.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.resetUrl}" class="button">
                Wachtwoord Resetten
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              Als de knop niet werkt, kopieer en plak deze link in uw browser:<br>
              <a href="${data.resetUrl}" style="color: #2563eb; word-break: break-all;">
                ${data.resetUrl}
              </a>
            </p>

            <div class="warning">
              <strong>⚠️ Belangrijk:</strong> Deze link is slechts beperkte tijd geldig. 
              Als u geen wachtwoord reset heeft aangevraagd, kunt u deze email negeren.
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                © 2025 Bonaire Makelaars - Alle rechten voorbehouden<br>
                Voor vragen kunt u contact opnemen via: beheer@bonairemakelaars.com
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `
  },

  adminNotification: {
    subject: (data) => `Wachtwoord Reset Verzoek - ${data.userEmail}`,
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin: Wachtwoord Reset Verzoek</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .email-body { background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
          .logo { text-align: center; margin-bottom: 32px; }
          .logo h1 { color: #dc2626; margin: 0; font-size: 28px; }
          .info-box { background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .button:hover { background-color: #b91c1c; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-body">
            
            <div class="logo">
              <h1>🛡️ Admin Dashboard</h1>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">Bonaire Makelaars</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 16px;">Wachtwoord Reset Verzoek</h2>
            
            <p style="color: #374151; margin-bottom: 16px;">
              Een gebruiker heeft een wachtwoord reset aangevraagd via het systeem.
            </p>
            
            <div class="info-box">
              <h3 style="margin: 0 0 8px 0; color: #374151;">Gebruikersgegevens:</h3>
              <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${data.userEmail}</p>
              <p style="margin: 8px 0 0 0; color: #374151;"><strong>Gewenst wachtwoord:</strong> ${data.newPassword}</p>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Tijd:</strong> ${data.timestamp || new Date().toLocaleString('nl-NL')}</p>
            </div>
            
            <p style="color: #374151; margin-bottom: 24px;">
              Log in op het admin dashboard om het wachtwoord van deze gebruiker te wijzigen.
              <strong>Vergeet niet om de gebruiker te informeren nadat het wachtwoord is gewijzigd.</strong>
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="http://localhost:5174/admin" class="button">
                Open Admin Dashboard
              </a>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                Bonaire Makelaars Admin Systeem<br>
                © 2025 Bonaire Makelaars - Alle rechten voorbehouden
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// API Routes
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, templateKey, data, customSubject } = req.body;

    if (!to || !templateKey || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, templateKey, data' 
      });
    }

    const template = emailTemplates[templateKey];
    if (!template) {
      return res.status(400).json({ 
        error: `Template '${templateKey}' not found` 
      });
    }

    const subject = customSubject || 
      (typeof template.subject === 'function' ? template.subject(data) : template.subject);
    
    const html = template.getHtml(data);

    const result = await resend.emails.send({
      from: 'Bonaire Makelaars <beheer@bonairemakelaars.com>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    });

    console.log('Email sent successfully:', result);
    res.json({ success: true, id: result.id });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Bonaire Makelaars Email Service'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Email service running on http://localhost:${port}`);
  console.log(`📧 Ready to send emails via Resend API`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

module.exports = app;
