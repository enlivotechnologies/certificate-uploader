/**
 * API client for Certificate Automation backend.
 * Uses relative /api so Vite proxy forwards to Express.
 */
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === 'string' ? data.message : res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  /** POST /api/generate-certificate - single certificate */
  generateCertificate(body) {
    return request('/generate-certificate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** POST /api/bulk-generate - multipart form with file */
  bulkGenerate(formData) {
    return fetch(`${BASE}/bulk-generate`, {
      method: 'POST',
      headers: {},
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.message === 'string' ? data.message : res.statusText || 'Bulk generate failed';
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  },
};
