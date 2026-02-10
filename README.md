# Certificate Automation Platform

A web-based system that generates and emails certificates using a **single Canva-exported PNG as a static background** with the participant name overlaid. Supports single entry and bulk CSV upload.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **PDF:** Puppeteer (HTML → PDF)  
- **Email:** Nodemailer (Gmail SMTP)  
- **Uploads:** Multer  
- **Bulk:** CSV parsing  

## Prerequisites

- Node.js 18+
- Gmail account (with [App Password](https://support.google.com/accounts/answer/185833) if 2FA is enabled)

## Setup

### 1. Clone and install

```bash
cd certificate-uploader
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Backend environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set:

- `SMTP_USER` – your Gmail address  
- `SMTP_PASS` – Gmail [App Password](https://myaccount.google.com/apppasswords) (not your normal password). If it has spaces, use quotes: `SMTP_PASS="xxxx xxxx xxxx xxxx"`  
- `PORT` – optional (default 5001; avoids macOS AirPlay on 5000)  
- `CERTIFICATE_WIDTH`, `CERTIFICATE_HEIGHT` – optional; must match your Canva PNG (default 1200×800)

**Certificate background:** Place your Canva-exported design in `server/assets/certificate-bg.png`. Dimensions in `.env` should match this image.  

### 3. Run locally

**Option A – Run both client and server (from project root):**

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5001 (API at `/api/*`)  

**Option B – Run separately:**

```bash
# Terminal 1 – backend
npm run dev:server

# Terminal 2 – frontend
npm run dev:client
```

**Troubleshooting:** If you see `EADDRINUSE: port already in use`, either set `PORT=5002` (or another free port) in `server/.env` and the same port in `client/vite.config.js` proxy target, or stop the process using that port (on macOS, port 5000 is often used by AirPlay Receiver).

## Usage

1. Place your Canva-exported certificate image at **`server/assets/certificate-bg.png`** (dimensions in `.env` should match).  
2. Open http://localhost:3000  
3. **Single Certificate:** Enter participant name and email, then click “Generate & Email Certificate”.  
4. **Bulk Upload:** Upload a CSV with columns `name` and `email`. Click “Generate & Email Certificates”.  

### Sample CSV

See `server/sample-participants.csv`:

```csv
name,email
John Doe,john.doe@example.com
Jane Smith,jane.smith@example.com
```

## API

- `POST /api/generate-certificate` – JSON: `{ "name", "email" }`  
- `POST /api/bulk-generate` – FormData: `file` (CSV)  
- `GET /api/health` – Health check  

## Project structure

See [STRUCTURE.md](./STRUCTURE.md) for folder layout and env vars.

## Certificate design

- **No dynamic design:** One fixed certificate is designed in Canva and exported as PNG.  
- **Storage:** `server/assets/certificate-bg.png` (do not edit in code).  
- **Template:** `server/templates/certificate.html` uses this image as a full-size CSS background and overlays only the participant **name** (hardcoded position in CSS). Placeholder `{{NAME}}` is replaced server-side.  
- **Dimensions:** Set `CERTIFICATE_WIDTH` and `CERTIFICATE_HEIGHT` in `server/.env` to match your Canva export.

## Production

- Build frontend: `npm run build` (output in `client/dist`)  
- Serve backend: `npm start` (runs `server/src/index.js`)  
- In production, serve `client/dist` with Express or a static host and point the client to your API base URL (update `client/src/api/client.js` if needed).  

## License

MIT
