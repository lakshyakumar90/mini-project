# 02 · Technology stack deep dive

Historical selection records were not found. Every rationale below is a **retrospective architectural justification**, not a verified decision made at project inception.

| Technology (declared) | Actual use and fit | Alternatives and trade-offs |
|---|---|---|
| JavaScript / Node.js | ES modules in Vite frontend, CommonJS backend; one language across UI and server. Async I/O fits API and sockets. | TypeScript could catch request/model shape mismatches; Python/Go could serve API too but add a language boundary. Current JS has fewer compile-time guarantees. |
| React 19 | Component UI in `frontend/src`; local state plus Redux for cross-page entities. | Vue/Angular/Svelte are viable; migration is not justified absent a React-specific issue. React ecosystem is broad; JSX and state coordination add concepts. |
| Vite 6 + React plugin | `frontend/vite.config.js` dev server/build, JSX transform and Tailwind Vite plugin. | Webpack/Next.js offer different integration/SSR; no SSR requirement is demonstrated. Vite is simple for an SPA but build and routing are client-side. |
| React Router DOM 7 | `App.jsx` defines routes and protected screens. | Framework routing (Next/Remix) adds server/data conventions; simple custom routing would lose nested/navigation features. |
| Redux Toolkit 2 / React Redux | `store/store.js` and nine slices hold auth, posts, feed, jobs, chat, connections, notifications, profile, presence. | Context/useState may suffice for smaller state; RTK offers predictable shared updates but creates boilerplate/state duplication risk. |
| Axios 1.9 | Shared `createApi()` installs bearer token and 401 handling. | `fetch` is native and sufficient but needs wrappers/interceptors built manually. Axios timeout/interceptors help consistency; localStorage token exposure to XSS remains. |
| Tailwind 4 + Radix UI + clsx/CVA/tailwind-merge | CSS utility classes and small accessible primitives in `components/ui`; Vite plugin. | CSS modules/design system/manual primitives reduce dependency but increase implementation work. Utility classes can become dense; Radix does not provide full product components. |
| Express 5 | `backend/index.js`, route modules, controller functions, middleware. | Fastify/Nest/Koa/native HTTP; Express is minimal and familiar, while larger frameworks impose structure or add throughput/features. No benchmark evidence. |
| MongoDB + Mongoose 8 | Six models; document data and embedded chat messages/comments/job applications. | PostgreSQL/Prisma offer relational constraints/joins; Mongo fits variable nested records but application must manage referential integrity and array growth. Raw driver removes ODM overhead but repeats mapping/validation. |
| JWT + bcryptjs | JWT 30-day signed in controller; bcrypt cost 12 in User pre-save; protect middleware loads account per request. | Opaque server sessions improve revocation; managed auth may reduce security ownership. JWT is stateless in signature but lookup is still done; no refresh/revocation scheme is evident. |
| Socket.IO + client | Chat, typing, presence, delivered/read statuses and notifications; websocket with polling fallback and reconnection. | SSE/polling fit server-to-client only or low frequency; raw WebSocket needs protocol/reconnect/rooms logic. Socket.IO handles event transport and reconnect; semantics remain app-owned. |
| Redis / ioredis / Socket.IO Redis adapter | Three clients; adapter enables cross-node room fanout, hash stores presence. | In-process map is simpler single-node fallback; managed pub/sub or another adapter possible. Redis dependency and eventual presence consistency add operations. Not used as app response cache. |
| Multer + Cloudinary | Multipart file parsing; Cloudinary storage if env configured, otherwise local disk. 10 MB caps and extension/MIME allowlists. | Object storage direct uploads or local-only storage; Cloudinary transformations offload media delivery but add vendor/network reliance. MIME checks are not content scanning. |
| Nodemailer | Contact form sends using configured SMTP transport. | Provider SDK or queued mail service; SMTP is portable, but credentials, delivery retries and spam controls are operational concerns. |
| express-rate-limit | Per-IP limits on auth, search, posts, jobs, connection request endpoints. | Gateway limits or Redis-backed store for shared limits. Default in-memory counters do not coordinate across instances. |
| validator | Email and URL validation in User schema. | Hand-written checks are error prone; validator is small but schema/application validation still must be coordinated. |
| GitHub OAuth/API | Controller builds OAuth authorize URL, exchanges code, fetches user/emails/repos, syncs public profiles. | Other identity providers or no OAuth; code owns state/CSRF and token handling. No `state` parameter is visible in implementation. |
| Vercel config | Root `vercel.json` builds API entry with `@vercel/node`; frontend rewrite routes extensionless paths to `/`. | Render/container platforms support long-running socket processes differently. Socket.IO compatibility with serverless lifecycle needs deployment verification. |

## Declared but not demonstrated as active

`better-auth` is declared in both manifests but source imports do not use it. Backend `bcryptjs`, Cloudinary, socket packages, etc. are active. Frontend `date-fns`, Prism, React Icons, many Radix primitives appear in dependencies; only imports establish concrete use (for example lucide-react is widely used). `@types/*` are dev dependencies although application code is JavaScript. There is no separate cache layer, queue, worker, logging/monitoring SDK, error-tracking SDK, or form-state/validation framework identified.

## Build-from-scratch trade-off

The project delegates HTTP routing, parsing, database mapping, socket framing/reconnect, password hashing, multipart handling, SMTP transport, and UI primitives to libraries. Replacing them means implementing request lifecycle, validation, safe serialization, browser protocol details, cryptographic password handling, upload limits, reconnect/backoff, accessibility, and regression coverage. Native implementations are reasonable for small adapters, not auth cryptography or transport protocols. See [from-scratch comparison](03-architecture-and-design-decisions.md#library-boundaries).
