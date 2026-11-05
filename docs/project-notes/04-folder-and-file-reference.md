# 04 · Folder and file reference

Generated assets, `node_modules`, build outputs, caches, and binary uploads are excluded. Files named below were inventoried; this reference groups related repetitive modules while stating their per-file responsibility.

## Root

| Path | Responsibility |
|---|---|
| `README.md` | Project introduction/setup; some claims conflict with implementation (notably frontend env template and Better Auth). |
| `vercel.json` | Vercel Node builder for `backend/index.js`, catch-all API destination. |
| `.gitignore` | Exclusion policy. |
| `backend/`, `frontend/` | Independent applications sharing repository; no root manifest/workspace. |

## Backend

| Path(s) | Responsibility and main symbols |
|---|---|
| `backend/index.js` | Loads dotenv; Express app, proxy trust, CORS/JSON/cookie/static middleware, health endpoints, mounts routers, initializes Socket.IO, listens on `PORT`. |
| `backend/package.json`, `backend/pnpm-lock.yaml` | CommonJS package, scripts and resolved dependency graph. `dev` is plain `node index.js`, no autoreload. |
| `backend/.env.example` | Names PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL and SMTP variables; OAuth/Redis/Cloudinary/API URL variables are referenced in code but omitted here. |
| `backend/config/database.js` | `connectDB()`, calls `mongoose.connect(MONGO_URI)` and exits on connection failure. |
| `backend/config/redis.js` | Creates Redis main/pub/sub ioredis clients, retries and lazy connection; exports clients. |
| `backend/config/cloudinary.js` | Configures Cloudinary when three credential variables exist. |
| `backend/models/{User,Post,Connection,Chat,Job,Notification}.js` | Mongoose schemas, validators, indexes, password hooks and embedded records; see [data model](06-database-and-data-models.md). |
| `backend/routes/*Routes.js` | Express routers: auth, connection, contact, job, message, notification, post, user. Route methods and protection are listed in [API guide](08-api-and-realtime-workflows.md). |
| `backend/controllers/authController.js` | GitHub OAuth authorize/callback/profile sync. Email/password auth actually lives in `userController.js`. |
| `backend/controllers/userController.js` | register/login/logout, own/public profiles, updates, uploads, developer feed/search. |
| `backend/controllers/postController.js` | feed, create/read/delete, like/comment operations and image upload result. |
| `backend/controllers/connectionController.js` | request/accept/reject/list/remove connection operations. |
| `backend/controllers/jobController.js` | listing CRUD, search/cursor, applications/documents/status. |
| `backend/controllers/messageController.js` | REST conversation/message history and send path; emits socket updates. |
| `backend/controllers/notificationController.js` | `notifyUser`, notification list/read/delete. |
| `backend/controllers/contactController.js` | validates contact payload and sends through Nodemailer SMTP. |
| `backend/middleware/authMiddleware.js` | `protect`: cookie or Bearer JWT verification, loads user to `req.user`. |
| `backend/middleware/rateLimiter.js` | Five in-memory rate limiter presets. |
| `backend/middleware/upload.js` | Multer storage selection, file filters/size limits, URL helpers. |
| `backend/utils/socket.js` | Socket.IO initialization, Redis adapter, room/presence/message/notification event logic. |
| `backend/fix_db.js` | One-off database repair script; inspect before running, not part of normal startup. |
| `backend/test-cloudinary.js` | Manual Cloudinary upload diagnostic; not an automated test. |
| `backend/README.md` | Backend setup notes; endpoint examples are stale/inaccurate in places. |
| `backend/dummy.txt` | Fixture-like text file; no runtime import observed. |
| `backend/uploads/**` | Local runtime user uploads, currently tracked/sample binaries; not source documentation. |

## Frontend

| Path(s) | Responsibility |
|---|---|
| `frontend/package.json` | Vite scripts and browser dependencies; no test script. |
| `frontend/vite.config.js` | React/Tailwind Vite plugins and `@` source alias. |
| `frontend/eslint.config.js` | ESLint JS, React Hooks and Fast Refresh rules. |
| `frontend/jsconfig.json` | Editor alias/type-resolution hints, JavaScript only. |
| `frontend/vercel.json` | SPA route rewrite. `frontend/index.html` is Vite document shell. |
| `frontend/src/main.jsx`, `App.jsx` | React mount/Redux provider and app routes/auth restoration/theme/OAuth handling. |
| `frontend/src/index.css` | Global styles/design tokens/Tailwind directives. |
| `frontend/src/pages/*.jsx` | Landing/auth/legal, dashboard, feed, jobs, discovery, profile, connections/requests, chat pages. `pages/auth/*` are legacy/duplicate auth page candidates. |
| `frontend/src/components/layout/*`, `layout.jsx`, `Navbar.jsx` | Navigation, sidebar and authenticated page shell. |
| `frontend/src/components/posts/*`, `jobs/*`, `notifications/*` | Feature UI: forms/cards/comments/apply/create and notification bell. |
| `frontend/src/components/ui/*` | Button/card/input/label/avatar/textarea/alert/scroll primitives plus skeleton and slide-over. |
| `frontend/src/components/ProtectedRoute.jsx`, `ErrorBoundary.jsx`, `LoadingSpinner.jsx`, `ThemeToggle.jsx` | Route gate, render error fallback, load state, theme UI. |
| `frontend/src/services/apiClient.js` | Axios factory, token storage, request Authorization and 401 event handling. |
| `frontend/src/services/*Service.js` | API wrappers for users, posts, connections, jobs, messages, notifications, contact; `socketService.js` wraps Socket.IO client. |
| `frontend/src/store/store.js`, `store/slices/*.js` | Configure Redux Toolkit store and feature state/thunks. Nine slices: auth, chat, connection, feed, job, notification, post, presence, user profile. |
| `frontend/src/hooks/useSwipeGesture.js` | Touch gesture hook. |
| `frontend/src/lib/utils.js` | Shared CSS utility composition. |
| `frontend/src/utils/redirectUtils.js` | Login redirect return URL helpers. |
| `frontend/public/*`, `src/assets/react.svg` | Static public/art assets, not runtime logic. |
| `frontend/README.md`, `components.json` | Vite starter README and UI generator configuration; not architecture authority. |

## Configuration omissions

No frontend `.env.example`, root package file, database migration directory, CI workflow, Dockerfile, test config, or deployment environment manifest was found. Backend uploads and `.env` are not generated artifacts but should be handled carefully in deployment/version control.
