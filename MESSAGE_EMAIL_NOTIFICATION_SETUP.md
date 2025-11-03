# Message Email Notification Setup Guide

## Overview
When a user sends a message through the platform, an automatic email notification is sent to the recipient using `no_reply@tropicalrealtors.com` as the sender address.

## How It Works

1. **User sends message** → PropertyContact or VacationPropertyContact form
2. **MessageService.sendMessage()** → Saves message to Supabase database
3. **Netlify Function triggered** → `send-message-notification.ts` is called
4. **Email sent via SMTP** → Using nodemailer with your email provider

## Features

✅ **Professional email design** with gradient header and styled content  
✅ **Shows full message content** including property details  
✅ **Viewing request info** (if applicable) with date/time  
✅ **Call-to-action button** to view message on platform  
✅ **Sender displayed as** `no_reply@tropicalrealtors.com`  
✅ **Fire-and-forget** - doesn't block message sending if email fails  

## Setup Instructions

### 1. Configure SMTP Settings in Netlify

You need to add SMTP credentials to your Netlify environment variables:

**Go to:** Netlify Dashboard → Your Site → Site settings → Environment variables

**Add these variables:**

```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 2. SMTP Provider Options

#### Option A: Use Your Domain Email Provider
If your domain registrar/hosting provides email, use their SMTP settings.

**Common settings:**
- **Port 587** for TLS/STARTTLS (recommended)
- **Port 465** for SSL
- **Port 25** for unencrypted (not recommended)

#### Option B: Gmail (Free - Personal Use)
**Settings:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

⚠️ **Important:** You need to create an [App Password](https://myaccount.google.com/apppasswords) for Gmail, not your regular password.

#### Option C: SendGrid (Free - 100 emails/day)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Use these settings:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option D: Mailgun (Free - 5000 emails/month)
1. Sign up at [Mailgun](https://mailgun.com)
2. Verify your domain or use sandbox
3. Get SMTP credentials from dashboard

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

#### Option E: AWS SES (Very Cheap)
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### 3. Set Up `no_reply@tropicalrealtors.com`

**Important:** The email will show as coming from `no_reply@tropicalrealtors.com`, but it's sent through your SMTP provider.

**Two options:**

#### Option A: Create the Email Address (Recommended)
1. Go to your domain email provider
2. Create `no_reply@tropicalrealtors.com` mailbox
3. Set up forwarding to your main email (optional)
4. Use these credentials in SMTP settings

#### Option B: Use SPF/DKIM Records (Advanced)
If your SMTP provider supports it, add SPF/DKIM records to authorize sending from `no_reply@tropicalrealtors.com` even if the mailbox doesn't exist.

**Example SPF record:**
```
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

### 4. Test the Setup

#### Local Testing:
1. Add SMTP credentials to `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

2. Run `npm run dev`
3. Send a test message through the platform
4. Check recipient's email inbox

#### Production Testing:
1. Deploy to Netlify with environment variables set
2. Send a test message
3. Check logs: Netlify Dashboard → Functions → send-message-notification

### 5. Email Template Preview

The recipient receives a beautifully formatted email with:

**Header:**
- Gradient blue/cyan banner
- "Tropical Realtors" branding
- "Nieuw bericht ontvangen" subtitle

**Content:**
- Property name and details
- Sender name (NOT email for privacy)
- Subject line
- Full message content
- Viewing request details (if applicable)

**Call-to-Action:**
- "Bekijk bericht" button linking to `/berichten`

**Footer:**
- Disclaimer text
- Copyright notice

## Files Modified

### New Files:
1. `netlify/functions/send-message-notification.ts` - Netlify Function for sending emails

### Modified Files:
1. `src/services/messageService.ts` - Added email notification call after message creation
2. `package.json` - Added nodemailer dependency

## Environment Variables Summary

### Required:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

### Optional:
```env
URL=https://tropicalrealtors.com  # Used in email links
```

## Troubleshooting

### Email not sending?
1. **Check Netlify Function logs**:
   - Netlify Dashboard → Functions → send-message-notification
   - Look for error messages

2. **Verify SMTP credentials**:
   - Test with a simple SMTP client
   - Make sure credentials are correct

3. **Check spam folder**:
   - Emails from new domains often go to spam initially

4. **Verify environment variables**:
   - Make sure they're set in Netlify (not just .env)
   - No typos in variable names

### Emails go to spam?
1. **Set up SPF record** for your domain
2. **Set up DKIM** if your provider supports it
3. **Use a verified domain** instead of no-reply
4. **Warm up your sending reputation** by starting slow

### Port 587 blocked?
- Try port 465 (SSL) or 25
- Some networks block outgoing SMTP
- Use a different SMTP provider

## Security Notes

⚠️ **Never commit SMTP credentials to git!**
- Use `.env` for local development
- Use Netlify environment variables for production
- Add `.env` to `.gitignore`

⚠️ **SMTP_PASS is sensitive!**
- Use app-specific passwords when possible
- Rotate credentials periodically
- Limit SMTP user permissions

## Cost Estimates

| Provider | Free Tier | Cost After |
|----------|-----------|------------|
| Gmail | 500/day | Not for commercial |
| SendGrid | 100/day | $15/month for 40k |
| Mailgun | 5000/month | $35/month for 50k |
| AWS SES | 62,000/month | $0.10 per 1000 |

## Next Steps

1. ✅ Choose an SMTP provider
2. ✅ Add environment variables to Netlify
3. ✅ Create `no_reply@tropicalrealtors.com` email (optional but recommended)
4. ✅ Deploy to Netlify
5. ✅ Send a test message
6. ✅ Check recipient's inbox
7. ✅ Monitor Netlify Function logs

## Support

If emails aren't working:
1. Check Netlify Function logs for errors
2. Verify SMTP credentials are correct
3. Test SMTP connection with a simple client
4. Check spam folder
5. Review provider-specific documentation

The system is designed to fail gracefully - if email sending fails, the message is still saved to the database and users can see it in their inbox on the platform.
