# 15 · Glossary and quick revision

| Term | Project meaning |
|---|---|
| SPA | Single-page React frontend served with Vite build. |
| REST | HTTP JSON endpoints mounted under `/api`. |
| JWT | Signed bearer token used by custom auth middleware; 30-day expiry. |
| Middleware | Express function that runs before route/controller, e.g. `protect`, upload, rate limiter. |
| Mongoose | MongoDB object modeling library providing schemas, validation, hooks and queries. |
| Embedded document | Nested record stored within a parent document; used for comments/messages/applications. |
| ObjectId reference | Identifier pointing to another collection; logical relation, not enforced foreign key. |
| Cursor pagination | Continue a sorted query from a record identifier rather than a growing numeric offset. |
| Socket.IO room | Server-managed group for event delivery to sockets; membership must be authorized. |
| Redis adapter | Pub/sub bridge that shares Socket.IO room broadcasts between server processes. |
| Presence | Online/offline/last seen state in Redis hash with local fallback. |
| Idempotency key | Stable operation identifier used to make retries safe; not currently implemented for messages. |
| Retrospective rationale | Technical explanation that fits the current choice, not proof of original decision-making. |

## One-minute review

- React/Vite UI → Axios/Redux → Express REST + Socket.IO → Mongoose/MongoDB.
- Redis is for socket scaling/presence, not general response caching.
- Auth is custom bcrypt + JWT with cookie/Bearer support; Better Auth is only declared.
- GitHub OAuth is custom controller logic; callback currently places JWT in URL.
- Media uses Cloudinary or local Multer fallback; local storage is not production durable.
- Six Mongo models; Chat messages and Job applications are embedded.
- Two apps share Git root but no workspace/CI. Automated tests absent.
- Best whiteboard caveats: socket identity, unbounded arrays, no transactions/migrations, broad CORS.

## Coverage report

Inspected: root listing/README/config; all backend model, route and middleware files, app entry/config and controllers by exported handler inventory; frontend manifests, Vite/ESLint/editor config, app/router/auth/API/socket/state entrypoints and page/component/service inventory. High-detail walkthroughs focused on auth, feeds/posts, connections, jobs and chat. Full line-by-line review of every visual component was not needed for architecture and is not claimed.

Technologies identified: JavaScript/Node, React, Vite, React Router, Redux Toolkit, Axios, Tailwind, Radix, Express, MongoDB/Mongoose, JWT, bcryptjs, Socket.IO, Redis/ioredis adapter, Multer/Cloudinary, Nodemailer, GitHub APIs/OAuth, express-rate-limit, validator, Vercel configs.

Major capabilities documented: auth/OAuth, profiles/discovery, connections, posts/feed, jobs/applications, messaging/presence, notifications, contact form, uploads. Diagrams created: system, repository, frontend, backend, ER, authentication, request, realtime, deployment and three feature flows. Interview Q&A includes project pitch, stack, architecture, security, data, operations, scenarios and senior follow-ups.

Uncertain/not evidenced: original technology decisions, actual production hosting topology and Vercel realtime support, deployed env values, backup/recovery, test coverage, production traffic, full controller authorization audit, exact dependency runtime usage for every declared package. External official docs were not needed to establish implementation facts; version-specific claims are kept to manifest declarations and source usage.
