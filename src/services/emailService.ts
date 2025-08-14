import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export class EmailService {
  private static instance: EmailService;
  
  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send a custom email using Resend
   */
  async sendEmail({
    to,
    from = 'Bonaire Makelaars <noreply@bonairemakelaars.com>',
    subject,
    html,
  }: {
    to: string;
    from?: string;
    subject: string;
    html: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Failed to send email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export const emailService = EmailService.getInstance();
