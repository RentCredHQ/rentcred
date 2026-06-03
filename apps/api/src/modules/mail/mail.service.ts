import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@rentcred.ng';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendPasswordReset(to: string, name: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: `RentCred <${this.fromEmail}>`,
        to,
        subject: 'Reset your RentCred password',
        html: `
          <div style="font-family: 'Geist', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111; font-family: 'JetBrains Mono', monospace;">RentCred</h2>
            <p>Hi ${name},</p>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #FF8400; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">RentCred — Tenant Verification Made Simple</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      // Don't throw — we never reveal if the email exists
    }
  }

  async sendEmailVerification(to: string, name: string, token: string) {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: `RentCred <${this.fromEmail}>`,
        to,
        subject: 'Verify your RentCred email',
        html: `
          <div style="font-family: 'Geist', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111; font-family: 'JetBrains Mono', monospace;">RentCred</h2>
            <p>Hi ${name},</p>
            <p>Welcome to RentCred! Please verify your email address:</p>
            <a href="${verifyUrl}" style="display: inline-block; background: #FF8400; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Verify Email
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">RentCred — Tenant Verification Made Simple</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendTenantInvite(to: string, tenantName: string, agentName: string, propertyAddress: string) {
    const registerUrl = `${this.frontendUrl}/auth/register?email=${encodeURIComponent(to)}&role=tenant`;

    try {
      await this.resend.emails.send({
        from: `RentCred <${this.fromEmail}>`,
        to,
        subject: `${agentName} has initiated a tenant verification for you`,
        html: `
          <div style="font-family: 'Geist', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111; font-family: 'JetBrains Mono', monospace;">RentCred</h2>
            <p>Hi ${tenantName},</p>
            <p><strong>${agentName}</strong> has submitted a tenant verification request on your behalf for the property at:</p>
            <div style="background: #f5f5f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-weight: 600; color: #111;">${propertyAddress}</p>
            </div>
            <p>To complete the verification process, please create your RentCred account and fill in your profile:</p>
            <a href="${registerUrl}" style="display: inline-block; background: #FF8400; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Complete Verification
            </a>
            <p style="color: #666; font-size: 14px;">This process typically takes 5-15 minutes. Your information is protected under NDPR guidelines.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">RentCred — Tenant Verification Made Simple</p>
          </div>
        `,
      });
      this.logger.log(`Tenant invite sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send tenant invite to ${to}`, error);
    }
  }

  async sendWelcome(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: `RentCred <${this.fromEmail}>`,
        to,
        subject: 'Welcome to RentCred!',
        html: `
          <div style="font-family: 'Geist', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111; font-family: 'JetBrains Mono', monospace;">RentCred</h2>
            <p>Hi ${name},</p>
            <p>Welcome to RentCred! Your account has been created successfully.</p>
            <p>You can now log in and start verifying tenants with confidence.</p>
            <a href="${this.frontendUrl}/login" style="display: inline-block; background: #FF8400; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Go to Dashboard
            </a>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">RentCred — Tenant Verification Made Simple</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }
}
