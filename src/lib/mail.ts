import nodemailer from 'nodemailer';

export async function createMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP Configuration is missing! Check your Vercel Environment Variables.');
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
