/**
 * Email sending via Nodemailer (Gmail SMTP).
 */
import fs from 'fs/promises';
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { validateEmailConfig } from '../config/env.js';
import log from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  validateEmailConfig();
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
  return transporter;
}

const DEFAULT_SUBJECT = 'Your Certificate of Participation';
const DEFAULT_BODY = `Dear Participant,

Please find attached your Certificate of Participation.

Thank you for your participation.

Best regards, Enlivo Technologies
`;

/**
 * Send email with PDF attachment.
 * @param {string} to - Recipient email
 * @param {string} pdfPath - Absolute path to PDF file
 * @param {string} [recipientName] - Optional name for greeting
 * @returns {Promise<void>}
 */
export async function sendCertificateEmail(to, pdfPath, recipientName = 'Participant') {
  const transport = getTransporter();
  const mailOptions = {
    from: env.smtp.user,
    to,
    subject: DEFAULT_SUBJECT,
    text: DEFAULT_BODY.replace('Participant', recipientName),
    attachments: [
      {
        filename: 'certificate.pdf',
        content: await fs.readFile(pdfPath),
      },
    ],
  };
  await transport.sendMail(mailOptions);
  log.success('Email sent', { to, attachment: pdfPath });
}
