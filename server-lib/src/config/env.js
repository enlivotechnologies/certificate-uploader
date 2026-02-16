/**
 * Environment configuration.
 * Load and validate required env vars; defaults for optional ones.
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: typeof process.env.SMTP_USER === 'string' ? process.env.SMTP_USER.trim() : undefined,
    pass: typeof process.env.SMTP_PASS === 'string' ? process.env.SMTP_PASS.trim().replace(/\s+/g, '') : undefined,
  },
  paths: {
    templates: path.join(__dirname, '../../templates'),
    temp: process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../temp'),
    assets: path.join(__dirname, '../../assets'),
  },
  // Certificate dimensions must match the Canva-exported PNG (default 1200×800)
  certificateWidth: parseInt(process.env.CERTIFICATE_WIDTH || '1200', 10),
  certificateHeight: parseInt(process.env.CERTIFICATE_HEIGHT || '800', 10),
};

/** Validate that email is configured when sending is required */
export function validateEmailConfig() {
  if (!env.smtp.user || !env.smtp.pass) {
    throw new Error(
      'SMTP_USER and SMTP_PASS must be set in server/.env for sending emails.'
    );
  }
}

export default env;
