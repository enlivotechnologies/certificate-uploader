# Deploying to Vercel (Single Deployment)

This project has been restructured to support a **Unified Deployment** on Vercel. Both the React frontend and the Express backend (via Serverless Functions) live in this single repository and deploy together.

## How it works
1.  **Frontend**: Vite app at the root (`src`, `public`, `index.html`).
2.  **Backend**: `api/index.js` acts as the serverless entry point for your Express app (living in `server-lib`).
3.  **PDF Generation**: Uses `puppeteer-core` and `@sparticuz/chromium` optimized for Vercel's serverless environment (50MB limit compliant).

## Deployment Steps

1.  **Push to GitHub**.
2.  **Import Project in Vercel**.
    *   **Root Directory**: Leave as `./` (Project Root).
    *   **Framework Preset**: Vite (Vercel should auto-detect).
    *   **Build Command**: `vite build` (Default).
    *   **Output Directory**: `dist` (Default).

3.  **Environment Variables (in Vercel)**:
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: For emails.
    *   `VITE_API_BASE_URL`: Set this to `/api` (or empty string, since it's same-domain now).
        *   *Actually, since it's same-domain, you can just use `/api`.*
    *   `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true` (Optional, saves build time).

4.  **Deploy**.

## Local Development

To run both frontend and backend locally:

```bash
npm install
npm run dev
```
*   Frontend: `http://localhost:5173`
*   Backend: `http://localhost:5001` (vial `npm run dev:server`)

The frontend is configured to proxy `/api` requests to port 5001 locally.
