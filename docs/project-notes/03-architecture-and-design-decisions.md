# 03 · Architecture and design decisions

## System shape

The observed architecture is a browser SPA, JSON REST API, and Socket.IO realtime server sharing one Node backend process and MongoDB models. This is a modular monolith, not a microservice system. UI and API deployable directories share Git history but have separate package manifests. Their only shared contract is JSON/event payloads; there is no generated API schema or shared typed package.

[System architecture diagram](diagrams/system-architecture.mmd)

## Decision register (retrospective)

| Problem | Existing choice | Benefit | Cost / scaling boundary | Revisit when |
|---|---|---|---|---|
| UI and server need independent build/runtime | Separate `frontend` and `backend` directories | Independent dependency sets and deployment configs | API contract duplication; no root task orchestration | Shared workspace scripts or generated types become valuable |
| Product entities include nested dynamic content | MongoDB/Mongoose documents | Rapid schema iteration, embedded comments/messages/applications | Embedded arrays grow; references lack enforced foreign keys; migrations/integrity are manual | Need reporting, joins, strict relational constraints or large unbounded histories |
| Browser needs both CRUD and bidirectional events | REST plus Socket.IO | Simple resource operations plus low-latency live updates | Duplicated message paths/payload logic; socket auth/scale consistency need care | Realtime use is removed or must be separated for independent scaling |
| Token based identity across API requests | JWT plus cookie/header fallback | Works across browser clients and cookie constraints | Browser localStorage token is XSS-readable; JWT invalidation/rotation absent | Need centralized session revocation or stronger browser threat model |
| Uploads should survive local development without cloud keys | Cloudinary storage with local fallback | Convenient media transformation and local iteration | Local disk ephemeral across instances; external service configuration and media policy | Production guarantees or private document access required |

No historical decision log or commit history was examined/presented, so these are reasoned explanations, not claims about original intent.

## Repository and dependency architecture

`frontend/src/pages` composes `components`, dispatches Redux thunks, which call `services`; `apiClient.js` centralizes HTTP auth. Backend route modules bind paths/middleware to controllers, controllers use Mongoose models and notification/socket utilities. Models reference User by ObjectId. `backend/utils/socket.js` has its own persistence logic alongside `messageController.js` REST operations, a potential duplicated business boundary.

No explicit domain/service layer exists; controllers contain business logic. There is no enforced package boundary tool or API contract generator. Frontend `jsconfig.json` alias configuration and Vite alias must stay aligned.

## Library boundaries

| Area | Current solution | Native/from scratch | Alternative | Recommendation |
|---|---|---|---|---|
| HTTP | Express routes/middleware | Node `http` router/body parser/error pipeline | Fastify, Nest | Keep Express while product size is modest; add validation/error conventions |
| DB | Mongoose schema/query/populate | Mongo driver plus manual validation/serialization | Prisma/SQL, Mongo driver | Keep ODM if document model remains; bound embedded arrays and test query patterns |
| Auth | bcryptjs/JWT/custom middleware | Cryptography/cookie/session infrastructure by hand | Opaque sessions, managed auth | Never write password hashing; prioritize token leak mitigation and revocation plan |
| Realtime | Socket.IO | WebSocket protocol, reconnect, rooms, heartbeat | SSE, native WS | Keep for duplex chat; authenticate event identity and validate room access |
| Upload | Multer/Cloudinary adapter | Multipart parser, storage, URLs, transforms | S3-compatible object storage | Keep parser; choose durable storage for production and validate file contents |
| State | Redux Toolkit | Context/reducer/useState | Zustand, query cache | Keep where cross-page coordination is real; consider server cache/query library only for concrete need |
| Rate limiting | express-rate-limit | Per-route counters | Redis/gateway limits | Use shared store if horizontally scaled |

## Monorepo status

This is one repository containing two apps. It is not a pnpm/npm/yarn workspace: only `backend/pnpm-lock.yaml` exists, frontend has no lockfile in the tree, and there are no root scripts or task cache. Internal code is not imported across the two apps. Upside: coordinated source changes; downside: duplicate install/deploy processes and no shared API types. A workspace (pnpm, for example) is justified if standardizing installs/CI and sharing contracts becomes a recurring problem, not merely because both apps are in one Git repository.
