import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import type { Booking, CafeSettings } from '../src/types';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

const SMTP_CONFIG_FILE = path.join(process.cwd(), 'data', 'smtp-config.json');

export function loadSmtpConfig(): SmtpConfig | null {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const raw = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        host: data.host || 'smtp.gmail.com',
        port: Number(data.port) || 465,
        secure: data.secure !== false,
        user: (data.user || '').trim(),
        pass: (data.pass || '').replace(/\s+/g, '') // remove any spaces in Google app password
      };
    }
  } catch (err) {
    console.error('Failed to read SMTP config file:', err);
  }
  return null;
}

export function saveSmtpConfig(config: SmtpConfig) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify({
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user.trim(),
      pass: config.pass.replace(/\s+/g, '')
    }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save SMTP config:', err);
  }
}

function getTransporter() {
  const config = loadSmtpConfig();
  if (!config || !config.user || !config.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

/**
 * Verify SMTP credentials against mail server
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string; user?: string }> {
  const config = loadSmtpConfig();
  if (!config || !config.user || !config.pass) {
    return { success: false, message: 'SMTP credentials not configured on server.' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, message: 'Could not initialize mail transporter.' };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `SMTP connection established successfully with ${config.host} (${config.user}).`,
      user: config.user
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `SMTP verification failed: ${errMsg}`
    };
  }
}

/**
 * Send customer booking confirmation email via real Gmail SMTP
 */
export async function sendCustomerConfirmationEmail(booking: Booking, settings?: CafeSettings): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  const config = loadSmtpConfig();

  if (!transporter || !config) {
    console.warn('SMTP transporter not configured, skipping SMTP email dispatch.');
    return { success: false, error: 'SMTP not configured on server.' };
  }

  const senderName = 'English Cafe London';
  const fromAddress = `"${senderName}" <${config.user}>`;
  const subject = `English Cafe – Your Reservation Confirmation [${booking.bookingId}]`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>English Cafe Reservation Confirmation</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; background-color: #FDFBF7; color: #2C221E; margin: 0; padding: 24px; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E8E2D2; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    
    <!-- Header -->
    <div style="background-color: #1B3B2B; padding: 32px 24px; text-align: center; color: #FDFBF7;">
      <h1 style="margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 1px; color: #FDFBF7;">ENGLISH CAFE</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #D8C7A5; letter-spacing: 2px; text-transform: uppercase;">14 Royal Crescent · Mayfair · London</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 20px; color: #1B3B2B; margin-top: 0;">Reservation Confirmed</h2>
      <p style="font-size: 15px; color: #4A3B32;">Dear ${booking.customerName},</p>
      <p style="font-size: 14px; color: #4A3B32;">Thank you for reserving a table at English Cafe. We look forward to welcoming you for authentic British hospitality, artisan breakfast, and afternoon tea.</p>

      <!-- Reservation Details Table -->
      <div style="background-color: #F7F4EB; border: 1px solid #E8E2D2; border-radius: 6px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E; width: 40%;"><strong>Booking Reference:</strong></td>
            <td style="padding: 6px 0; color: #1B3B2B; font-family: monospace; font-weight: bold; font-size: 15px;">${booking.bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E;"><strong>Date:</strong></td>
            <td style="padding: 6px 0; color: #2C221E; font-weight: 600;">${booking.bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E;"><strong>Time:</strong></td>
            <td style="padding: 6px 0; color: #2C221E; font-weight: 600;">${booking.startTime} – ${booking.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E;"><strong>Party Size:</strong></td>
            <td style="padding: 6px 0; color: #2C221E;">${booking.guestCount} Guest${booking.guestCount > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E;"><strong>Assigned Table(s):</strong></td>
            <td style="padding: 6px 0; color: #1B3B2B; font-weight: bold;">${booking.assignedTableIds.join(', ')}</td>
          </tr>
          ${booking.specialRequests ? `
          <tr>
            <td style="padding: 6px 0; color: #7A6A5E;"><strong>Special Requests:</strong></td>
            <td style="padding: 6px 0; color: #2C221E; font-style: italic;">${booking.specialRequests}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Guest Guidance -->
      <div style="font-size: 13px; color: #5A4B42; line-height: 1.6; border-left: 3px solid #1B3B2B; padding-left: 14px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0;"><strong>Arrival Information:</strong></p>
        <p style="margin: 0;">Tables are held for 15 minutes past your reserved time. If your arrival is delayed or your plans change, please notify us by telephone or through the online portal.</p>
      </div>

      <p style="font-size: 13px; color: #7A6A5E; margin-top: 24px;">
        Warm regards,<br>
        <strong>The Maitre D' & Team</strong><br>
        English Cafe London
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #F7F4EB; border-top: 1px solid #E8E2D2; padding: 20px; text-align: center; font-size: 12px; color: #7A6A5E;">
      <p style="margin: 0 0 4px 0;"><strong>English Cafe</strong> · 14 Royal Crescent, Mayfair, London W1J 7PT</p>
      <p style="margin: 0;">Telephone: +44 20 7946 0912 · Email: ${config.user}</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: booking.customerEmail,
      subject,
      html: htmlBody
    });

    console.log(`Confirmation email dispatched to ${booking.customerEmail} (Message ID: ${info.messageId})`);

    // Also send an admin notification copy to raihanasihamm@gmail.com
    await transporter.sendMail({
      from: fromAddress,
      to: config.user,
      subject: `[Admin Alert] New Reservation Confirmed – ${booking.bookingId} (${booking.customerName})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1B3B2B;">New Reservation Booked</h2>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Guest:</strong> ${booking.customerName} (${booking.customerEmail}, ${booking.customerPhone})</p>
          <p><strong>Date & Time:</strong> ${booking.bookingDate} at ${booking.startTime} (${booking.guestCount} guests)</p>
          <p><strong>Table(s):</strong> ${booking.assignedTableIds.join(', ')}</p>
          <p><strong>Requests:</strong> ${booking.specialRequests || 'None'}</p>
        </div>
      `
    }).catch(e => console.warn('Admin notification send error:', e));

    return { success: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send customer confirmation email via SMTP:', errMsg);
    return { success: false, error: errMsg };
  }
}
