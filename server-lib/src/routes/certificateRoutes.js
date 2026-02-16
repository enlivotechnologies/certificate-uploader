/**
 * Certificate API routes: single generate and bulk generate.
 */
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { uploadBulk } from '../middleware/upload.js';
import { generateCertificate, deleteTempFile } from '../services/certificateService.js';
import { sendCertificateEmail } from '../services/emailService.js';
import { parseCSVFile } from '../utils/csvParser.js';
import log from '../utils/logger.js';

const router = Router();

/**
 * POST /generate-certificate
 * Body: { name, email }
 * Generates PDF, responds immediately; email is sent in background for faster UX.
 */
router.post('/generate-certificate', async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'name and email are required',
    });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  let pdfPath = null;

  try {
    const { pdfPath: generatedPath } = await generateCertificate({
      name: trimmedName,
      email: trimmedEmail,
    });
    pdfPath = generatedPath;

    // Respond immediately; send email in background so user sees fast success
    res.json({ success: true, message: 'Certificate generated and emailed successfully.' });

    sendCertificateEmail(trimmedEmail, pdfPath, trimmedName)
      .then(() => {
        log.success('Single certificate emailed', { email: trimmedEmail, name: trimmedName });
      })
      .catch((err) => {
        log.failure('Single certificate email', err?.message || String(err), { email: trimmedEmail });
      })
      .finally(() => {
        if (pdfPath) deleteTempFile(pdfPath);
      });
  } catch (err) {
    const msg = err && typeof err.message === 'string' ? err.message : 'Failed to generate or send certificate';
    log.failure('Single certificate', msg, { email: trimmedEmail, name: trimmedName });
    res.status(500).json({ success: false, message: msg });
    if (pdfPath) await deleteTempFile(pdfPath);
  }
});

/**
 * POST /bulk-generate
 * Multipart: single file (CSV)
 * Parses CSV, loops through rows, generates + emails each certificate; returns summary.
 */
router.post('/bulk-generate', uploadBulk, async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Use field name "file" and upload a CSV.',
    });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname ?? '').toLowerCase();
  if (ext !== '.csv') {
    await fs.unlink(filePath).catch(() => {});
    return res.status(400).json({
      success: false,
      message: 'Only CSV files are supported for bulk upload.',
    });
  }

  let participants = [];
  try {
    participants = await parseCSVFile(filePath);
  } catch (err) {
    log.error('Bulk parse error', err);
    await fs.unlink(filePath).catch(() => {});
    return res.status(400).json({
      success: false,
      message: 'Failed to parse file: ' + (err.message || 'Invalid CSV'),
    });
  }

  // Delete uploaded file after parsing
  await fs.unlink(filePath).catch(() => {});

  if (participants.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid participants found in file. Expected columns: name, email',
    });
  }

  const results = { success: [], failure: [] };

  for (const p of participants) {
    let pdfPath = null;
    try {
      const { pdfPath: generatedPath } = await generateCertificate({
        name: p.name || 'Participant',
        email: p.email,
      });
      pdfPath = generatedPath;
      await sendCertificateEmail(p.email, pdfPath, p.name || 'Participant');
      results.success.push({ email: p.email, name: p.name });
      log.success('Bulk certificate sent', { email: p.email });
    } catch (err) {
      results.failure.push({ email: p.email, name: p.name, reason: err.message });
      log.failure('Bulk certificate', err.message, { email: p.email });
    } finally {
      if (pdfPath) await deleteTempFile(pdfPath);
    }
  }

  log.info('Bulk generate completed', {
    total: participants.length,
    success: results.success.length,
    failure: results.failure.length,
  });

  res.json({
    success: true,
    message: `Processed ${participants.length} participants.`,
    total: participants.length,
    succeeded: results.success.length,
    failed: results.failure.length,
    results: { success: results.success, failure: results.failure },
  });
});

export default router;
