import nodemailer from 'nodemailer';

console.log('🔧 Initializing Mail Transport...');
console.log('SMTP Host:', process.env.SMTP_HOST ? '✅ Set' : '❌ MISSING');
console.log('SMTP Port:', process.env.SMTP_PORT ? '✅ Set' : '❌ MISSING');
console.log('SMTP User:', process.env.SMTP_USER ? '✅ Set' : '❌ MISSING');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ CRITICAL: SMTP Environment Variables are not fully configured!');
}

export const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
