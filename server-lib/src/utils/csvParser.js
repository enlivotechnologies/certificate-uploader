/**
 * Parse CSV for bulk certificate generation. Expects columns: name, email (or similar).
 */
import fs from 'fs/promises';

const UTF8_BOM = '\uFEFF';

/**
 * Parse a CSV string into rows of objects using first row as headers.
 * @param {string} csvContent - Raw CSV string
 * @returns {Array<{ name: string, email: string }>}
 */
export function parseCSV(csvContent) {
  const normalized = csvContent.replace(UTF8_BOM, '').trim();
  const lines = normalized.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0] ?? '';
  const headers = headerLine.split(',').map((h) => (h ?? '').trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? String(values[idx]).trim() : '';
    });
    const name = row.name || row.participant_name || row.participant || row.full_name || '';
    const email = row.email || row.email_address || row.mail || '';
    if (name || email) rows.push({ name, email });
  }
  return rows;
}

/**
 * Simple CSV line parser (handles quoted fields).
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Read file from path and parse as CSV.
 * @param {string} filePath - Absolute path to CSV
 */
export async function parseCSVFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseCSV(content);
}
