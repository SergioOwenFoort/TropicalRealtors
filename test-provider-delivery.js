// Test email delivery to different providers
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo');

async function testMultipleProviders() {
    const testEmails = [
        'test@gmail.com',
        'test@outlook.com', 
        'test@yahoo.com',
        's.foort@bonairemakelaars.com' // Original recipient
    ];

    console.log('Testing email delivery to different providers...\n');

    for (const email of testEmails) {
        try {
            console.log(`Testing: ${email}`);
            
            const { data, error } = await resend.emails.send({
                from: 'beheer@bonairemakelaars.com',
                to: [email],
                subject: 'Test Email - Provider Check',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Email Delivery Test</h2>
                        <p>This is a test email to check delivery to different email providers.</p>
                        <p><strong>Recipient:</strong> ${email}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        <p><em>If you receive this email, delivery is working for your provider.</em></p>
                    </div>
                `
            });

            if (error) {
                console.log(`❌ Error for ${email}:`, error);
            } else {
                console.log(`✅ Sent to ${email}, ID: ${data.id}`);
            }
            
            // Small delay between sends
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (err) {
            console.log(`❌ Exception for ${email}:`, err.message);
        }
        
        console.log('---');
    }
    
    console.log('\nNote: Check your Resend dashboard for delivery status of each email.');
    console.log('If some providers work and others don\'t, it indicates provider-specific blocking.');
}

// Run the test
testMultipleProviders().catch(console.error);
