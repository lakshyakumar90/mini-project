# 11 · Interview questions and answers

Answers are based on current code, not claimed personal historical rationale. Speak the simple answer first; use deep dive if asked. Relevant symbols are named so you can point to the implementation.

## Project pitch

**Q: Tell me about DevConnect.**

**Simple (45 seconds):** DevConnect is a developer networking app built as a React SPA and Node/Express API. Users create profiles, discover and connect with developers, share posts, browse job/collaboration listings, and message in real time. MongoDB/Mongoose stores users and product records; JWT protects REST routes; Socket.IO carries chat and presence events, with Redis supporting cross-instance event distribution. The two apps live in one repository but have separate manifests and deployment configs.

**Deep dive:** Frontend entry is `frontend/src/main.jsx` and routes/state are in `App.jsx`/Redux. Backend starts at `backend/index.js`, mounts feature routers, and attaches Socket.IO. Models are User, Post, Connection, Chat, Job and Notification. Email/password and GitHub OAuth are separate flows. There is no evidence of automated tests or CI, so I would call that out as an ownership priority.

**Follow-ups:** Hardest part? The dual REST/realtime message path and consistency/security boundaries. Improve first? Socket identity authorization, automated controller/API tests, and token exposure. Whiteboard: browser → REST/socket → Express/controller/Mongoose → MongoDB and Redis fanout.

## Architecture and tech choices

**Q: Why this architecture and why a monorepo?**

**Simple:** It is a small modular monolith with separate browser and API applications. Keeping both in one repository makes coordinated changes visible, while independent manifests let each build separately. It is not a configured workspace monorepo: there is no root package manager, shared package or task runner.

**Deep dive:** REST handles CRUD and Socket.IO handles live events; both share backend models and process. Frontend owns presentation and Redux state; backend owns auth, persistence and validation. This keeps runtime concerns clear but leaves JSON/event contracts untyped and deployment orchestration manual. A workspace/generated contract makes sense when drift is a recurring issue.

**Q: Why MongoDB/Mongoose instead of PostgreSQL?**

**Simple:** The implementation uses nested records such as comments, chat messages and job applications, which map naturally to MongoDB documents. Mongoose adds schema validation, references and hooks. A relational database would be stronger for cross-entity constraints and reporting, so the current choice trades enforced relationships for flexible document-oriented records.

**Deep dive:** The schema embeds Post comments, Chat messages and Job applications; User references are ObjectIds. Indexes target feed ordering, participants, job filters and notification retrieval. Arrays can grow without bound, references do not enforce foreign keys, and transaction use was not found. PostgreSQL plus migrations is preferable if relational consistency, joins or analytics dominate. This is a retrospective justification, not a verified original decision.

**Q: Why Express?**

**Simple:** Express provides familiar routing and middleware with little framework ceremony. The backend uses routers, auth/upload/rate middleware and controller functions. Fastify or Nest could add stronger structure or different performance characteristics, but there is no benchmark or current scale evidence that justifies migration.

**Deep dive:** The app is a modular monolith, yet controllers currently mix HTTP and business logic. Add validation schemas and consistent error handling before changing framework. Express 5's async behavior should be understood, but controllers still catch many failures themselves.

**Q: Why Redux Toolkit?**

**Simple:** Several screens share auth, feed, posts, jobs, connections, notifications, chat and presence, so a central store keeps updates coordinated. For isolated UI state, components still use React state. Context or local state would be lighter for a smaller app; a server-cache library could help if cache invalidation becomes a concrete problem.

**Deep dive:** `store.js` combines nine slices; async thunks call service modules. Serializable checks are disabled, so nonserializable values can pass unnoticed. Avoid duplicating server data across slices and add selectors/tests as state complexity grows.

**Q: Why Socket.IO instead of polling or raw WebSockets?**

**Simple:** Chat needs two-way events, typing and presence. Socket.IO provides rooms, reconnect behavior and polling fallback; implementing all of that over raw WebSockets would create more protocol code. Polling or SSE would be simpler for infrequent server-only updates.

**Deep dive:** `socketService` reconnects up to 20 times and emits registration/join events; server persists messages and emits status updates. Redis adapter supports cross-node fanout. It does not solve authorization or durable delivery automatically; message history remains in Mongo. Validate identity at handshake and define idempotency/order semantics.

**Q: Why JWT and bcrypt rather than managed authentication?**

**Simple:** The app signs a 30-day JWT after bcrypt password verification. Middleware accepts cookie or Bearer token and reloads the user. This is self-managed and portable, but revocation, rotation, secure browser storage and OAuth hardening remain application responsibilities. Better Auth is declared but I did not find it in the active flow.

**Deep dive:** Password pre-save uses bcrypt cost 12. Login/register return the token in JSON as well as setting a cookie, and the frontend persists it in localStorage; scripts running in the origin can read it. OAuth also places a token in the redirect query. There is no visible refresh or token blacklist. Opaque server-side sessions or a managed provider would improve central revocation and reduce code ownership, with infrastructure/provider trade-offs.

**Q: Why Multer/Cloudinary?**

**Simple:** Multer parses multipart uploads, applies size/type filters, and stores in Cloudinary when configured or local disk otherwise. Cloudinary adds media delivery/transformation; local fallback helps development. Local disk is unsuitable for durable multi-instance production storage.

**Deep dive:** Current check examines extension and browser-supplied MIME, each file has a 10 MB limit, and documents can be attached to applications. There is no content scanning/private authorization evident. Object storage direct upload may be better at scale.

## Language and frontend

**Q: How does async work in the backend?** Async controller functions await Mongoose and external calls; the Node event loop can serve other I/O while waiting. Failures are caught in many controllers, but no common error middleware was found. Network timeouts/retries and bounded concurrency are still needed for slow services.

**Q: How is frontend auth restored?** `App.jsx` invokes `getCurrentUser`; Redux tracks `isAuthChecking` so `ProtectedRoute` shows loading, then renders or redirects. Axios adds the localStorage token; 401 clears it and emits an app event. UI route gating is convenience; backend `protect` is authoritative.

**Q: How do feed pages avoid loading everything?** `FeedPage` dispatches cursor-based fetches and appends pages; controller uses an ObjectId cursor and limit. Cursor pagination avoids offset growth but sort/filter consistency and cursor validation must be maintained. The code also has top/recent and tags.

## Backend, data and security

**Q: Trace a protected request.** Axios adds Authorization and credentials → Express router → `protect` verifies JWT and fetches User → controller runs query → Mongoose sends Mongo operation → JSON response → Redux updates UI. `apiClient` handles 401 by clearing token.

**Q: How are duplicate connections prevented?** Controller checks for existing relationships and schema has unique `(requester,recipient)` index. That index is directional, so reverse pair duplication needs explicit symmetric logic; concurrent requests should handle duplicate-key errors.

**Q: Is JWT fully stateless here?** No. Signature verification is local, but middleware fetches the user each request to reject deleted accounts. No revocation list or refresh rotation was found. So it has token portability but still incurs database lookup and limited immediate revocation.

**Q: What protects uploads?** Multer allows specific extensions/MIME and caps each file at 10 MB. These checks reduce accidental bad uploads but are not malware/content validation; user-supplied MIME is not trustworthy. Add content sniffing, authorization, quotas, scanning and durable private storage where appropriate.

**Q: How would you debug a slow query?** Capture query and request timing, inspect Mongo explain plan, check indexes, populated fields and returned payload size, then profile with realistic data. Current logging is mostly console; adding structured request IDs and query timing would improve evidence. Avoid claiming an index helps without measuring.

## Testing/deployment

**Q: What is your testing strategy?** No automated test suite was found. Backend test script is a failing placeholder, and manual Cloudinary script is an integration diagnostic. I would add API/authorization tests first, then socket and UI journeys, and wire them into CI. I cannot claim tests pass.

**Q: How is it deployed?** Vercel config defines a Node builder for backend and an SPA rewrite for frontend. That is configuration evidence, not proof of production topology. Socket.IO requires a runtime/proxy with persistent connection support; I would verify this before claiming the config fully deploys realtime behavior.

## Scenarios and senior-level follow-ups

**DB unavailable?** `connectDB` logs then exits on initial connect failure. There is no graceful degraded API mode; process supervisor/restart and monitoring are needed. In-flight failure behavior depends on Mongoose/network settings.

**100,000 users?** First measure. Add shared rate-limit storage, durable object storage, DB indexes/query profiling, pagination, socket authentication and horizontal socket adapter deployment. Partition message history rather than unbounded embedded arrays; add queue only if asynchronous workload exists.

**Two simultaneous writes?** Mongo atomicity applies at document level, but cross-document operations lack visible transactions. Use atomic update predicates/versioning and transactions where consistency spans docs; handle unique conflicts. Chat sends require client idempotency keys, not text/time heuristic.

**External API unavailable?** GitHub sync/callback catches some errors and returns redirects/status; no general retry/timeout strategy. Add bounded timeouts, clear user-facing failure, circuit breaker only if repeated outages justify it. Contact mail should be queued if delivery reliability becomes important.

**How prevent duplicate operations?** Current chat heuristic removes same text by same sender within two seconds; not robust. Add client-generated idempotency key persisted under unique constraint and make retries return prior result.

**Could an ORM guarantee efficient queries?** No. Mongoose validates and maps documents but does not prevent unbounded arrays, oversized populate, or poor index choices. Inspect generated Mongo operations/explain plans and add bounds/projections.

**What would you draw?** Architecture boxes; auth token paths; request sequence; ER model with explicit distinction between embedded and referenced records; socket message persistence/fanout plus Redis presence.

## Common mistakes to avoid

- Do not say Better Auth powers sign-in; source uses custom JWT/bcrypt and GitHub OAuth.
- Do not call Redis a generic cache; observed usage is adapter/presence.
- Do not claim CI, automated tests, backups, migrations, or production topology.
- Do not say every socket request is authenticated; code shows client-supplied registration ID.
- Label technology-choice arguments as retrospective, not personal historical evaluation.
