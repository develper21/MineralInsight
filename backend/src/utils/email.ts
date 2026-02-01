import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    // Create transporter (using environment variables or default config)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"MineralInsight" <${process.env.SMTP_USER || 'noreply@mineralinsight.com'}>`,
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    // Don't throw error to avoid breaking the flow
    // In production, you might want to handle this differently
  }
};

export const sendPasswordResetEmail = async (to: string, resetToken: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const subject = 'Password Reset Request';
  const text = `
    You requested a password reset. Click the link below to reset your password:
    
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
  `;

  await sendEmail(to, subject, text);
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Welcome to MineralInsight';
  const text = `
    Welcome to MineralInsight, ${name}!
    
    Thank you for registering with our Critical Mineral Intelligence Platform.
    
    You can now access:
    - Real-time market intelligence
    - Risk assessment tools
    - Trade analytics
    - And much more!
    
    If you have any questions, please don't hesitate to contact us.
    
    Best regards,
    The MineralInsight Team
  `;

  await sendEmail(to, subject, text);
};
