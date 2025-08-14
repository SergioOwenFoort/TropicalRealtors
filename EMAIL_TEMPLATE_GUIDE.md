# Custom Email Templates Configuration

This file allows you to easily customize all email templates used in the Bonaire Makelaars application.

## How to Edit Templates

1. Open `src/utils/emailTemplates.ts`
2. Find the template you want to modify in the `emailTemplates` object
3. Edit the HTML content, subject lines, or styling
4. Save the file - changes will take effect immediately

## Available Templates

### 1. Password Reset Email (`passwordReset`)
- **Purpose**: Sent to users when they request a password reset
- **Customizable**: Subject, content, styling, button text
- **Variables**: `email`, `resetUrl`, `userName`

### 2. Admin Notification (`adminNotification`)
- **Purpose**: Sent to admin when a user requests password assistance
- **Customizable**: Subject, content, styling
- **Variables**: `userEmail`, `newPassword`, `timestamp`

### 3. Welcome Email (`welcomeEmail`)
- **Purpose**: Sent to new users after registration
- **Customizable**: Subject, content, styling
- **Variables**: `userName`, `email`

### 4. Property Alert (`propertyAlert`)
- **Purpose**: Sent to users about new properties matching their criteria
- **Customizable**: Subject, content, styling
- **Variables**: `propertyTitle`, `propertyUrl`, `price`

## Styling Guidelines

- Use inline CSS for best email client compatibility
- Colors: Primary blue (#2563eb), Red (#dc2626), Gray tones
- Font: Arial, sans-serif
- Maximum width: 600px
- Use responsive design principles

## Adding New Templates

1. Add a new entry to the `emailTemplates` object
2. Define the subject and html function
3. Use the `sendEmail()` function in your code with the new template key

## Example Usage

```typescript
import { sendEmail } from '../utils/emailTemplates';

// Send password reset email
await sendEmail(
  'user@example.com',
  'passwordReset',
  {
    email: 'user@example.com',
    resetUrl: 'https://example.com/reset?token=xyz',
    userName: 'John Doe'
  }
);

// Send admin notification
await sendEmail(
  'admin@bonairemakelaars.com',
  'adminNotification',
  {
    userEmail: 'user@example.com',
    newPassword: 'newpass123',
    timestamp: new Date().toLocaleString('nl-NL')
  }
);
```

## Email Configuration

Update the email configuration in `emailTemplates.ts`:
- `fromEmail`: The sender email address
- `adminEmail`: Admin email for notifications
- `apiKey`: Resend API key (set in .env file as VITE_RESEND_API_KEY)

## Testing Emails

You can test email templates by:
1. Using the password reset functionality
2. Creating test scripts
3. Using email testing tools like Resend's preview feature

## Troubleshooting

If emails are not sending:
1. Check the Resend API key in your .env file
2. Verify the domain is set up correctly in Resend
3. Check browser console for error messages
4. Ensure the email templates compile without TypeScript errors
