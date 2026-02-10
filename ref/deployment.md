# CircuitMind AI - Deployment Reference

## Architecture Overview

CircuitMind AI is a two-process application:

1. **Frontend**: Vite-built SPA (React 19) -- static files served by any web server
2. **Backend**: Express 5 + better-sqlite3 server on port 3001

In development, Vite on port 3000 proxies `/api` requests to the backend on port 3001.

## Environment Variables

| Variable | Required | Where | Purpose |
|----------|----------|-------|---------|
| `GEMINI_API_KEY` | Yes | `.env.local` | Google Gemini AI API key |
| `PORT` | No | Server env | Backend port (default: 3001) |
| `NODE_ENV` | No | Server env | production/development |

### Setting Up .env.local

```bash
# Create from example (or manually)
echo "GEMINI_API_KEY=your-key-here" > .env.local
```

The Gemini API key is injected at build time via Vite's `define` config:
```javascript
'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```

Users can also set the key at runtime via Settings > API Key, which stores it in `localStorage.cm_gemini_api_key`.

## Development Setup

### Prerequisites

- Node.js (LTS recommended)
- npm

### Frontend

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server on port 3000
```

### Backend

```bash
cd server
npm install      # Install server dependencies
node --import tsx index.ts   # Start Express server on port 3001
```

Or use the install script:
```bash
bash scripts/install-server.sh
```

### Dev Proxy

Configured in `vite.config.ts`:
```javascript
server: {
  port: 3000,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

All `/api/*` requests from the frontend are proxied to the Express backend during development.

## Production Build

### Frontend Build

```bash
npm run build    # Vite production build
npm run preview  # Preview the production build locally
```

Output: `dist/` directory containing:
- `index.html` -- SPA entry point
- `assets/` -- Hashed JS/CSS chunks
- Static assets (icons, patterns, parts)

### Chunk Strategy

The build produces these vendor chunks (configured in `vite.config.ts`):
- `vendor-react`, `vendor-three`, `vendor-ai`, `vendor-ui`, `vendor-markdown`
- `vendor-collab`, `vendor-git`, `vendor-charts`, `vendor-i18n`
- `vendor-pdf`, `vendor-math`, `vendor-grid`, `vendor-zip`, `vendor-xml`
- `app-gemini`, `app-simulation`

Chunk size warning threshold: 400KB.

### Hosting the Frontend

The frontend is a standard SPA. Deploy the `dist/` directory to any static hosting:

- **Nginx/Apache**: Requires index.html fallback for SPA routing
- **Vercel/Netlify**: Auto-detects Vite, handles SPA routing
- **GitHub Pages**: Needs 404.html redirect hack or HashRouter

**Critical**: Configure the web server to serve `index.html` for all routes (SPA fallback), since React Router handles client-side routing.

Example nginx config:
```nginx
server {
    listen 80;
    root /var/www/circuitmind/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend Deployment

The Express server requires:
1. Node.js runtime
2. `better-sqlite3` native module (compiled for target platform)
3. Writable `server/data/` directory for SQLite database
4. Writable `server/uploads/` directory for file uploads

#### Systemd Service

A systemd service file is provided at `server/circuitmind.service`:

```ini
[Unit]
Description=CircuitMind AI Server
After=network.target

[Service]
Type=simple
User=wtyler
WorkingDirectory=/home/wtyler/circuitmind-ai/server
ExecStart=/usr/bin/node --import tsx index.ts
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Install:
```bash
sudo cp server/circuitmind.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now circuitmind
```

### Database

- **Engine**: better-sqlite3 (SQLite)
- **Location**: `server/data/circuitmind.db`
- **Schema**: Auto-created from `server/db/schema.sql` on first run
- **Mode**: WAL (Write-Ahead Logging) for concurrent reads
- **Backup**: Copy `server/data/circuitmind.db*` (db, db-shm, db-wal)

### File Uploads

Uploaded files (images, voice notes) are stored in `server/uploads/` and served at `/uploads/*`.

- Max file size: 50MB per file (multer config)
- Image uploads: max 5 per identify request
- Voice notes: max 1 per identify request

## Security Considerations

### Server Security Headers

Applied by `server/middleware/securityHeaders.ts`:

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(self), geolocation=(), payment=() |

### CORS

Currently open (`origin: true`) for development. Lock down to the specific frontend domain in production:

```typescript
// server/middleware/cors.ts
corsMiddleware = cors({
  origin: 'https://your-domain.com',
  // ...
});
```

### Zod Validation

All API request bodies and query params are validated with Zod schemas before processing. Invalid requests receive 400 responses with structured error details.

### Secret Management

- API keys stored in `.env.local` (gitignored)
- Pre-commit hook (gitleaks) scans for accidentally committed secrets
- `.gitleaks.toml` configuration at project root

## Health Monitoring

### Health Endpoint

```
GET /api/health
Response: { "status": "ok", "timestamp": "2026-02-10T..." }
```

### Graceful Shutdown

The server handles SIGTERM and SIGINT signals:
1. Stops accepting new connections
2. Closes the SQLite database
3. Exits cleanly
4. Force exits after 10 seconds if stuck
