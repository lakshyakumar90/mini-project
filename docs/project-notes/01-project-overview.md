# 01 · Project overview

## Product and architecture

DevConnect is a full-stack developer community/networking app. The frontend is an SPA in `frontend/`; the API and Socket.IO server are in `backend/`. The root repository does not contain a root package.json or workspace configuration. Treat the two directories as separately installed/deployed apps, not as packages orchestrated by a monorepo build system.

The Express server (`backend/index.js`) mounts REST routers under `/api`, connects Mongoose, serves local `/uploads`, creates an HTTP server, and attaches Socket.IO. MongoDB stores the durable entities; Redis is used for Socket.IO cross-process broadcasts and presence. External calls go to GitHub, Cloudinary, and SMTP via Nodemailer. Vercel config exists for a Node API deployment and a frontend SPA rewrite, but no deployment pipeline or confirmed environment topology is present.

## Major implemented capabilities

- Email/password registration and login in `backend/controllers/userController.js`; GitHub OAuth and profile sync in `authController.js`.
- Profile edits, developer discovery/search, profile and post image uploads.
- Connection request lifecycle and persisted notification records.
- Post feed, creation, likes, comments, deletion, and cursor pagination.
- Job listing creation/search, applications with resume/documents, and application status.
- Persisted messages and Socket.IO message/presence/typing/read/delivery events.
- Contact form email submission.

## Runtime boundaries

Frontend routing and authentication UI state live in Redux. `apiClient.js` stores a bearer token in localStorage and adds it to Axios requests; backend auth middleware also accepts an HTTP-only `jwt` cookie. REST authorization is enforced server-side, independently from `ProtectedRoute` UI gating. Socket event registration is separate and does not use the REST middleware: inspect `backend/utils/socket.js` before treating sockets as authenticated.

## Limits of the evidence

Package versions below are declared ranges; backend pnpm lockfile resolves newer patch/minor versions within those ranges. There is no TypeScript, schema migration system, formal service layer, automated test suite, CI workflow, or documented backup procedure. The application README overstates certain aspects: Redis is not a general cache, Better Auth is not observed in active auth flow, and deployment references conflict (Vercel config vs Render comments). See [quality](09-testing-and-code-quality.md) and [technical debt](14-improvements-and-technical-debt.md).
