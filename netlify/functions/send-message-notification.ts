import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface MessageNotificationData {
  recipient_email: string;
  recipient_name: string;
  sender_name: string;
  property_title: string;
  subject: string;
  message: string;
  viewing_date?: string | null;
  viewing_time?: string | null;
  viewing_notes?: string | null;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data: MessageNotificationData = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!data.recipient_email || !data.message || !data.sender_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Get SMTP credentials from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP credentials not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Email service not configured',
          message: 'SMTP credentials missing'
        }),
      };
    }

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');

    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Build email HTML
    const viewingSection = data.viewing_date
      ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 16px;">📅 Bezichtigingsverzoek</h3>
          <p style="margin: 5px 0;"><strong>Datum:</strong> ${data.viewing_date}${data.viewing_time ? ` om ${data.viewing_time}` : ''}</p>
          ${data.viewing_notes ? `<p style="margin: 5px 0;"><strong>Notities:</strong> ${data.viewing_notes}</p>` : ''}
        </div>
      `
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Tropical Realtors</h1>
            <p style="margin: 10px 0 0 0; color: #e0f2fe; font-size: 14px;">Nieuw bericht ontvangen</p>
          </div>
          
          <!-- Content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
              Beste ${data.recipient_name},
            </p>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
              Je hebt een nieuw bericht ontvangen via Tropical Realtors.
            </p>
            
            <!-- Property Info -->
            <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Eigendom</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">🏠 ${data.property_title}</p>
            </div>
            
            <!-- Message Details -->
            <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Van</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #111827;">👤 ${data.sender_name}</p>
              
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Onderwerp</p>
              <p style="margin: 0; font-size: 14px; color: #111827;">${data.subject}</p>
            </div>
            
            <!-- Viewing Request (if applicable) -->
            ${viewingSection}
            
            <!-- Message Content -->
            <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #2563eb; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Bericht</p>
              <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL || 'https://tropicalrealtors.com'}/berichten" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Bekijk bericht
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
              Log in op je account om te antwoorden op dit bericht.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 20px; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">
              Dit is een automatisch gegenereerd bericht van Tropical Realtors.
            </p>
            <p style="margin: 0;">
              © ${new Date().getFullYear()} Tropical Realtors. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const emailText = `
Tropical Realtors - Nieuw Bericht

Beste ${data.recipient_name},

Je hebt een nieuw bericht ontvangen via Tropical Realtors.

EIGENDOM: ${data.property_title}

VAN: ${data.sender_name}
ONDERWERP: ${data.subject}

${data.viewing_date ? `
BEZICHTIGINGSVERZOEK:
Datum: ${data.viewing_date}${data.viewing_time ? ` om ${data.viewing_time}` : ''}
${data.viewing_notes ? `Notities: ${data.viewing_notes}` : ''}
` : ''}

BERICHT:
${data.message}

Log in op je account om te antwoorden: ${process.env.URL || 'https://tropicalrealtors.com'}/berichten

---
Dit is een automatisch gegenereerd bericht van Tropical Realtors.
© ${new Date().getFullYear()} Tropical Realtors. Alle rechten voorbehouden.
    `.trim();

    // Send email
    console.log('Attempting to send email from:', `"Tropical Realtors" <no_reply@tropicalrealtors.com>`);
    console.log('Sending to:', data.recipient_email);
    console.log('Subject:', `Nieuw bericht: ${data.subject}`);
    
    const info = await transporter.sendMail({
      from: `"Tropical Realtors" <no_reply@tropicalrealtors.com>`,
      to: data.recipient_email,
      subject: `Nieuw bericht: ${data.subject}`,
      text: emailText,
      html: emailHtml,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email notification sent successfully',
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      }),
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
