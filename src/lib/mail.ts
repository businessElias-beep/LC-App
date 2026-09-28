import nodemailer from 'nodemailer';

export const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // This is critical for many SMTP servers to work on Vercel/Linux
    rejectUnauthorized: false
  }
});
