/**
 * Environment configuration.
 * Load and validate required env vars; defaults for optional ones.
 */
import dotenv from 'dotenv';
import fs from 'fs';
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
    templates: process.env.VERCEL 
      ? path.join(process.cwd(), 'server-lib/templates') 
      : path.join(__dirname, '../../templates'),
    temp: process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../temp'),
    assets: process.env.VERCEL 
      ? path.join(process.cwd(), 'server-lib/assets') 
      : path.join(__dirname, '../../assets'),
  },
  // Certificate dimensions must match the Canva-exported PNG (default 1200×800)
  certificateWidth: parseInt(process.env.CERTIFICATE_WIDTH || '1200', 10),
  certificateHeight: parseInt(process.env.CERTIFICATE_HEIGHT || '800', 10),
};

if (process.env.VERCEL) {
  try {
    console.log('Current working directory:', process.cwd());
    const libPath = path.join(process.cwd(), 'server-lib');
    if (fs.existsSync(libPath)) {
      console.log('server-lib contents:', fs.readdirSync(libPath));
      const assetPath = path.join(libPath, 'assets');
      if (fs.existsSync(assetPath)) {
          console.log('assets contents:', fs.readdirSync(assetPath));
      }
    } else {
      console.log('server-lib not found in CWD');
    }
  } catch (e) {
    console.error('Failed to list directories', e);
  }
}

/** Validate that email is configured when sending is required */
export function validateEmailConfig() {
  if (!env.smtp.user || !env.smtp.pass) {
    throw new Error(
      'SMTP_USER and SMTP_PASS must be set in server/.env for sending emails.'
    );
  }
}

export default env;
