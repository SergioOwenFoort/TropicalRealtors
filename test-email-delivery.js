// Test email delivery directly with Resend API
import { Resend } from 'resend';

const resend = new Resend('re_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo');

async function testEmailDelivery() {
  console.log('🧪 Testing direct email delivery...');
  
  try {
    // Test 1: Simple email
    console.log('\n📧 Test 1: Simple text email');
    const result1 = await resend.emails.send({
      from: 'beheer@bonairemakelaars.com',
      to: 's.foort@bonairemakelaars.com',
      subject: 'Test Email - Simple Text',
      text: 'This is a simple test email to verify delivery.',
    });
    
    console.log('✅ Simple email result:', result1);
    
    // Test 2: HTML email with password reset template
    console.log('\n📧 Test 2: HTML password reset email');
    const resetUrl = 'http://localhost:5173/auth/update-password?token=test123&email=s.foort@bonairemakelaars.com';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wachtwoord Reset - Bonaire Makelaars</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Wachtwoord Reset Verzoek</h2>
          <p>Hallo,</p>
          <p>U heeft een verzoek ingediend om uw wachtwoord te resetten voor uw Bonaire Makelaars account.</p>
          <p>Klik op de onderstaande knop om uw wachtwoord te resetten:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Wachtwoord Resetten
            </a>
          </div>
          <p>Als de knop niet werkt, kopieer en plak deze link in uw browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>Deze link is 1 uur geldig.</strong></p>
          <p>Als u dit verzoek niet heeft ingediend, kunt u deze email negeren.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Met vriendelijke groet,<br>
            Het Bonaire Makelaars Team
          </p>
        </div>
      </body>
      </html>
    `;
    
    const result2 = await resend.emails.send({
      from: 'beheer@bonairemakelaars.com',
      to: 's.foort@bonairemakelaars.com',
      subject: 'Wachtwoord Reset - Bonaire Makelaars (TEST)',
      html: htmlContent,
    });
    
    console.log('✅ HTML email result:', result2);
    
    // Test 3: Check delivery status for recent emails
    console.log('\n🔍 Test 3: Checking recent email delivery status...');
    
    // List recent emails to check delivery status
    const recentEmails = await resend.emails.list({ limit: 5 });
    console.log('📬 Recent emails:', recentEmails);
    
    // Check status of specific email IDs from logs
    const emailIds = ['b5e501cb-7175-4342-9420-995899aa47cc', '0be798db-4b0a-438c-b1d9-f3b0f76778ac'];
    
    for (const emailId of emailIds) {
      try {
        const emailStatus = await resend.emails.get(emailId);
        console.log(`📧 Email ${emailId} status:`, emailStatus);
      } catch (error) {
        console.log(`⚠️ Could not get status for email ${emailId}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Email delivery test failed:', error);
    
    if (error.message.includes('API key')) {
      console.log('🔑 API Key issue - check if the Resend API key is valid');
    } else if (error.message.includes('domain')) {
      console.log('🌐 Domain issue - check if beheer@bonairemakelaars.com is verified in Resend');
    } else if (error.message.includes('rate limit')) {
      console.log('⏰ Rate limit - too many emails sent recently');
    }
  }
}

console.log('🚀 Starting email delivery test...');
testEmailDelivery();
