// Email template configurations for different types
export interface EmailTemplate {
  subject: string | ((data: any) => string);
  html: (data: any) => string;
}

// You can easily customize these templates
export const emailTemplates = {
  passwordReset: {
    subject: 'Wachtwoord Resetten - Bonaire Makelaars',
    html: (data: { email: string; resetUrl: string; userName?: string }) => `
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
    subject: (data: { userEmail: string }) => `Wachtwoord Reset Verzoek - ${data.userEmail}`,
    html: (data: { userEmail: string; newPassword: string; timestamp?: string }) => `
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
              <a href="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174'}/admin" class="button">
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
  },

  // You can add more templates here:
  welcomeEmail: {
    subject: 'Welkom bij Bonaire Makelaars',
    html: (data: { userName: string; email: string }) => `
      <!-- Welcome email template -->
      <h1>Welkom ${data.userName}!</h1>
      <p>Bedankt voor het registreren bij Bonaire Makelaars.</p>
    `
  },

  propertyAlert: {
    subject: (data: { propertyTitle: string }) => `Nieuwe woning: ${data.propertyTitle}`,
    html: (data: { propertyTitle: string; propertyUrl: string; price: string }) => `
      <!-- Property alert template -->
      <h1>Nieuwe woning beschikbaar!</h1>
      <h2>${data.propertyTitle}</h2>
      <p>Prijs: ${data.price}</p>
      <a href="${data.propertyUrl}">Bekijk woning</a>
    `
  }
};

// Email service configuration
export const emailConfig = {
  apiUrl: '/api/send-email', // Now uses same port as frontend
  healthUrl: '/api/health'
};

// Email sending utility (now uses backend service)
export async function sendEmail(
  to: string | string[],
  templateKey: string,
  data: any,
  customSubject?: string
) {
  const response = await fetch(emailConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      templateKey,
      data,
      customSubject
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Email service error:', errorData);
    throw new Error(`Email service fout: ${response.status} - ${errorData.error || response.statusText}`);
  }

  return await response.json();
}
