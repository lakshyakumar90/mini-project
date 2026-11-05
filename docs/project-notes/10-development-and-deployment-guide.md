# 10 · Development and deployment guide

## Prerequisites and installation

Use a current Node.js version compatible with Vite 6/React 19/Express 5; backend README recommends Node 18+. MongoDB is required at startup. Redis is attempted at localhost:6379 by default and has local fallback behavior; Cloudinary and SMTP are optional for corresponding features. The backend has a pnpm lockfile; frontend has no lockfile checked in. Use the package manager appropriate to each directory, then standardize/commit lockfiles as a project improvement.

```powershell
cd backend
pnpm install
Copy-Item .env.example .env
pnpm dev
```

In another shell:

```powershell
cd frontend
npm install
npm run dev
```

No actual env values are included here. Configure backend `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` are core; `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for OAuth; `REDIS_URI` or `REDIS_URL` for Redis; `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for cloud media; `API_BASE_URL` for local upload URLs; SMTP `EMAIL_USER`/`GMAIL_USER`, `EMAIL_PASS`/`GMAIL_APP_PASSWORD`, and optional `EMAIL_RECEIVER`. Frontend reads `VITE_API_URL` and `VITE_SOCKET_URL`; default API behavior differs among service modules (some default `/api`, others `http://localhost:3333/api`), so set a consistent value for local deployments. Do not use placeholder values as credentials.

## Commands available in manifests

| Directory | Command | Purpose |
|---|---|---|
| backend | `pnpm dev` / `pnpm start` | Both execute `node index.js`; no watch mode |
| backend | `pnpm test` | Placeholder exits nonzero; not an actual suite |
| frontend | `npm run dev` | Vite development server |
| frontend | `npm run build` | Vite production build |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run preview` | Preview built frontend |

No migration command exists. Mongo schema changes currently use Mongoose schema behavior; plan data migrations manually and safely. `fix_db.js` can change DB state and should only be used after reading its source and confirming target DB.

## Deployment evidence and caveats

Root `vercel.json` defines a Node builder and catch-all route for backend; `frontend/vercel.json` rewrites extensionless routes to SPA root. These configs do not prove a production deployment is active. Socket.IO needs a persistent compatible runtime; serverless request functions may not support durable connections as expected. Verify hosting limits and configure database/Redis/Cloudinary secrets in deployment environment, never source files. Local-disk uploads are not durable across ephemeral instances. Backend CORS currently allows any origin with credentials and should be restricted before production.

## Troubleshooting

- API exits: check `MONGO_URI`; database connection failure calls `process.exit(1)`.
- Auth fails: check consistent `JWT_SECRET`, frontend API URL and token handling.
- Socket not connecting: confirm `VITE_SOCKET_URL`, backend origin/path `/socket.io/`, proxy websocket support and Redis status.
- Images inaccessible locally: ensure `PORT` or `API_BASE_URL` matches URL construction and `/uploads` is served.
- OAuth redirect errors: configure GitHub callback URL and `FRONTEND_URL`; no env template entries for OAuth currently.
- Backend dev does not reload: this is plain `node`, no watcher.
