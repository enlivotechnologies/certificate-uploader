# Certificate Automation Platform – Project Structure

```
certificate-uploader/
├── package.json                 # Root scripts: dev, dev:server, dev:client, build, start
├── README.md
├── STRUCTURE.md                 # This file
│
├── client/                      # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           # Proxy /api -> backend
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css            # Tailwind imports
│       ├── App.jsx
│       ├── api/
│       │   └── client.js        # API helpers (generate-certificate, bulk-generate)
│       └── components/
│           ├── Dashboard.jsx    # Header + tab navigation
│           ├── SingleCertificateForm.jsx
│           └── BulkUpload.jsx
│
└── server/                      # Node.js + Express backend
    ├── .env                     # Create from .env.example (SMTP, PORT, CERTIFICATE_*)
    ├── .env.example
    ├── package.json
    ├── sample-participants.csv  # Sample CSV (name, email)
    ├── assets/
    │   ├── README.md            # Instructions for certificate-bg.png
    │   └── certificate-bg.png  # Canva-exported PNG (you add this)
    ├── templates/
    │   └── certificate.html    # Background image + {{NAME}} overlay only
    ├── temp/                    # Generated at runtime (PDFs, uploads); gitignored
    └── src/
        ├── index.js             # Express app, CORS, routes, error handler
        ├── config/
        │   └── env.js           # Load .env, paths, SMTP config
        ├── middleware/
        │   └── upload.js        # Multer config for CSV uploads
        ├── routes/
        │   └── certificateRoutes.js  # POST /generate-certificate, POST /bulk-generate
        ├── services/
        │   ├── certificateService.js  # Template load, placeholder replace, Puppeteer PDF
        │   └── emailService.js        # Nodemailer send with PDF attachment
        └── utils/
            ├── logger.js        # Success/failure logging
            └── csvParser.js     # Parse CSV to { name, email }[]
```

## API Endpoints

| Method | Path                 | Description |
|--------|----------------------|-------------|
| GET    | /api/health          | Health check |
| POST   | /api/generate-certificate | JSON body: `{ name, email }` – generate one PDF (Canva bg + name) and email it |
| POST   | /api/bulk-generate   | Multipart form: `file` (CSV). Returns summary with success/failure lists |

## Environment (server/.env)

- `PORT` – Server port (default 5000)
- `NODE_ENV` – development | production
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – Gmail SMTP (use App Password if 2FA)
- `CERTIFICATE_WIDTH`, `CERTIFICATE_HEIGHT` – Match your Canva PNG (default 1200×800)

## Certificate (Canva background + name only)

- **Background:** Single PNG at `server/assets/certificate-bg.png` (Canva export; not edited in code).
- **Template:** `server/templates/certificate.html` – full-size background image + one overlaid text for the participant name (position hardcoded in CSS).
- **Placeholder:** `{{NAME}}` – replaced server-side. Dimensions `{{WIDTH}}`, `{{HEIGHT}}`, `{{BACKGROUND_IMAGE_URL}}` are injected by the backend.

## CSV Format (Bulk)

Header row: `name,email` (or similar: participant_name, email_address). First row after header is data.
