/**
 * Certificate generation: Canva PNG as static background, name overlay only.
 * Loads HTML template, replaces {{NAME}} and background image, generates PDF with Puppeteer.
 * Caches template + background image and reuses a single browser instance for speed.
 */
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import env from '../config/env.js';
import log from '../utils/logger.js';

const TEMPLATE_NAME = 'certificate.html';
const BACKGROUND_IMAGE_NAME = 'certificate-bg.png';

let cachedTemplate = null;
let cachedBackgroundDataUrl = null;
let browserInstance = null;

/**
 * Escape HTML to prevent injection.
 */
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Load certificate template from disk (cached after first load).
 */
async function loadTemplate() {
  if (cachedTemplate) return cachedTemplate;
  const templatePath = path.join(env.paths.templates, TEMPLATE_NAME);
  cachedTemplate = await fs.readFile(templatePath, 'utf-8');
  return cachedTemplate;
}

/**
 * Get background image as data URL (cached after first load).
 */
async function getBackgroundImageDataUrl() {
  if (cachedBackgroundDataUrl) return cachedBackgroundDataUrl;
  const imagePath = path.join(env.paths.assets, BACKGROUND_IMAGE_NAME);
  try {
    const buf = await fs.readFile(imagePath);
    const base64 = buf.toString('base64');
    cachedBackgroundDataUrl = `data:image/png;base64,${base64}`;
    return cachedBackgroundDataUrl;
  } catch (err) {
    log.error('Certificate background image not found', err);
    throw new Error(
      `Place certificate-bg.png in server/assets/. Path used: ${imagePath}`
    );
  }
}

/**
 * Get or create a shared Puppeteer browser (reused for all certificates).
 */
async function getBrowser() {
  if (browserInstance && browserInstance.connected) return browserInstance;
  browserInstance = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  return browserInstance;
}

/**
 * Replace placeholders in HTML. Only {{NAME}} is dynamic; dimensions and image URL are server-set.
 */
function replacePlaceholders(html, data) {
  const name = escapeHtml(data.name || 'Participant');
  const width = String(env.certificateWidth);
  const height = String(env.certificateHeight);
  const bgUrl = data.backgroundImageDataUrl || '';

  return html
    .replace(/\{\{NAME\}\}/g, name)
    .replace(/\{\{WIDTH\}\}/g, width)
    .replace(/\{\{HEIGHT\}\}/g, height)
    .replace(/\{\{BACKGROUND_IMAGE_URL\}\}/g, bgUrl);
}

/**
 * Ensure temp directory exists.
 */
async function ensureTempDir() {
  await fs.mkdir(env.paths.temp, { recursive: true });
}

/**
 * Generate PDF from HTML using shared browser. Dimensions match Canva design; printBackground enabled.
 * Uses 'load' instead of 'networkidle0' for faster render (no external resources in HTML).
 */
async function htmlToPdf(html, outputFileName) {
  await ensureTempDir();
  const outputPath = path.join(env.paths.temp, outputFileName);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'load' });
    await page.setViewport({
      width: env.certificateWidth,
      height: env.certificateHeight,
      deviceScaleFactor: 1,
    });
    await page.pdf({
      path: outputPath,
      width: `${env.certificateWidth}px`,
      height: `${env.certificateHeight}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    log.info('PDF generated', { path: outputPath });
    return outputPath;
  } finally {
    await page.close();
  }
}

/**
 * Generate certificate PDF for one participant (name only; background from Canva PNG).
 * @param {Object} data - { name, email } (email used by caller for sending)
 * @returns {Promise<{ pdfPath: string }>}
 */
export async function generateCertificate(data) {
  const html = await loadTemplate();
  const backgroundImageDataUrl = await getBackgroundImageDataUrl();
  const processedHtml = replacePlaceholders(html, {
    name: data.name,
    backgroundImageDataUrl,
  });

  const safeName = (data.name || 'cert').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30);
  const fileName = `certificate-${safeName}-${Date.now()}.pdf`;
  const pdfPath = await htmlToPdf(processedHtml, fileName);

  return { pdfPath };
}

/**
 * Delete a file safely (e.g. after email send).
 */
export async function deleteTempFile(filePath) {
  try {
    await fs.unlink(filePath);
    log.info('Temp file deleted', { path: filePath });
  } catch (err) {
    log.error('Failed to delete temp file', err);
  }
}

/**
 * Preload template and background image so first request is fast. Call at server startup.
 */
export async function preloadCertificateAssets() {
  await Promise.all([loadTemplate(), getBackgroundImageDataUrl()]);
  log.info('Certificate template and background cached');
}
