# 16 · Improvement playbook and interview answers

This file turns the code-evidenced findings in [14 · Improvements and technical debt](14-improvements-and-technical-debt.md) into implementation plans and interview responses. Recommendations are proposals; they are not claims that these changes have been made or that any particular original project decision was deliberate. Implement and verify changes before describing them as completed work.

## How to choose what to improve first

Prioritize in this order:

1. **Protect identity and user data**: socket authentication, authorization checks, OAuth token handling, upload access.
2. **Make changes safe to ship**: tests for security-sensitive behavior, CI, consistent error and validation behavior.
3. **Improve reliability**: durable file storage, dependency reproducibility, operational logging and recovery.
4. **Scale based on evidence**: profile queries and payloads, then address measured bottlenecks.

For each improvement, start with a small change that can be reviewed and tested. Define the acceptance criteria before implementation. Avoid claiming an architecture rewrite is needed unless a measured requirement justifies it.

## Recommended improvements

### 1. Authenticate Socket.IO connections and authorize every event

**Why this fits this codebase:** `frontend/src/services/socketService.js` connects and later emits `register_user` with a user ID. In `backend/utils/socket.js`, the server uses that supplied ID to join the user's personal room. The reviewed connection setup does not verify a JWT during the Socket.IO handshake. A client should not be trusted to name its identity.

**Implementation outline:**

1. Send the existing API token in Socket.IO's `auth` handshake field from `socketService.connect`.
2. Add Socket.IO connection middleware that verifies the JWT using the same secret and loads the current user; store the verified database ID on `socket.data.userId`.
3. Remove `register_user(userId)` as an identity mechanism. Join the private room using only the verified ID after authentication.
4. For every event, validate payload shape, derive the sender from `socket.data.userId`, and check relationship/job permissions server-side.
5. Add tests proving an unauthenticated client cannot register, join another user's room, send as another user, or read presence it is not allowed to see.
6. Ensure disconnect and reconnect update presence for all sockets belonging to the authenticated user, including multiple tabs.

**Pros:** Trustworthy server-side identity; fewer impersonation and room-access risks; aligns realtime trust with REST auth.

**Cons:** Token expiry/reconnect handling becomes explicit; socket auth tests and middleware add work; existing clients need updating together with the backend.

**Interview answer — “What would you improve first?”**

> “I’d start by authenticating Socket.IO at connection time. The REST API verifies JWTs, but the socket client currently registers a user ID in an event, so the server must not treat that client-supplied ID as proof of identity. I’d pass the bearer token in the handshake, verify it server-side, derive the user ID from the verified token, and authorize each room and event. I’d add negative tests for impersonation and unauthorized room access. The trade-off is more reconnect and expiry handling, but it closes a trust-boundary gap before scaling realtime traffic.”

**“Why wasn’t that implemented?”**

> “The current implementation demonstrates the realtime feature, but production-grade socket identity hardening and its tests were not completed in this repository. I shouldn’t present the current flow as secure. If continuing the project, I’d make this an early security task because the user ID is currently supplied by the client.”

### 2. Remove JWTs from URL parameters and reduce browser token exposure

**Evidence:** `backend/controllers/authController.js` redirects GitHub OAuth success with a JWT in the query string. `userController.sendTokenResponse` also includes the JWT in JSON; the frontend stores it in localStorage (`apiClient.js`).

**Implementation outline:**

1. For OAuth, create a short-lived, single-use authorization code stored server-side, then redirect with that code (or use a carefully configured secure cookie flow); exchange it over HTTPS for an authenticated session.
2. Add OAuth `state` verification (and PKCE where supported by the provider/client flow) to prevent login CSRF/code substitution.
3. Prefer an HTTP-only, Secure, appropriately SameSite cookie or an opaque server-side session over a long-lived JavaScript-readable token. If cookie auth is cross-site, explicitly design CSRF protection and origin checks.
4. Stop returning tokens in general JSON user payloads and remove query-token handling from `OAuthTokenHandler` after migration.
5. Test login, logout, expiry, cross-origin deployment settings, CSRF defenses, and token absence in URLs/logs.

**Pros:** Reduces token exposure to scripts, browser history, referrers and URL logging; gives a clearer revocation path with server sessions.

**Cons:** Cookie/session deployment needs careful CORS, SameSite and CSRF configuration; server-side sessions add storage/availability needs; rollout must handle old clients safely.

**Interview answer:**

> “I’d remove the OAuth JWT from the redirect URL first because URLs are copied into browser history and can appear in logs or referrers. I’d replace it with a one-time code exchange or a secure cookie session, add and validate OAuth state, and design CSRF controls for cookie-authenticated requests. The current frontend also stores a token in localStorage, which is convenient across origins but readable by same-origin JavaScript. The right replacement depends on deployment origins, so I’d verify the cookie and CSRF model end to end rather than changing storage in isolation.”

**“Why wasn’t it implemented?”**

> “The repository uses a simpler token handoff that supports its current frontend/API arrangement. I can explain that mechanism, but I wouldn’t defend query-string tokens as a final production design. Changing auth safely affects backend, frontend, CORS, OAuth callback configuration and session behavior, so it should be implemented as one tested migration rather than a partial cleanup.”

### 3. Restrict CORS and add explicit request validation

**Evidence:** `backend/index.js` and `backend/utils/socket.js` accept every origin while enabling credentials. Controllers often read `req.body` directly; Mongoose validation exists but is not a substitute for request-level schemas.

**Implementation outline:**

1. Define the allowed frontend origins per environment and reject other origins for both HTTP and Socket.IO.
2. Introduce request schemas for authentication, profile updates, posts, jobs, comments and event payloads. Validate length, enum, format and allowed fields before controller logic.
3. Avoid mass assignment: explicitly map permitted body fields to model updates rather than passing arbitrary objects.
4. Standardize validation error responses and add tests for malformed, oversized and unexpected fields plus allowed/disallowed origins.
5. Keep database schema validation too; request validation and persistence validation protect different boundaries.

**Pros:** Reduces cross-origin exposure and inconsistent input handling; clearer errors; less accidental field mutation.

**Cons:** Additional schemas and maintenance; environment-specific origin setup can break legitimate preview deployments if not managed; duplicating schema rules needs discipline.

**Interview answer:**

> “I’d replace the current allow-all credentialed CORS callback with an environment-specific origin allowlist shared by HTTP and Socket.IO. I’d also validate request bodies at the API boundary and whitelist fields before updates. Mongoose validation still matters, but it should not be the only input contract because controllers need predictable, user-friendly errors and protection from unintended fields.”

**“Why wasn’t it implemented?”**

> “The current permissive setup simplifies connecting separately hosted frontend and backend environments. That convenience should be tightened before production. The repository doesn’t show a documented environment matrix or API validation layer, so I’d first establish valid origins and request contracts, then enforce them with tests to avoid breaking real deployment flows.”

### 4. Protect uploaded documents and move production files to durable storage

**Evidence:** `backend/middleware/upload.js` allows a local disk fallback and exposes `/uploads` as static content in `backend/index.js`. Job application resumes/documents use this uploader. Extension and declared MIME checks exist, but those do not prove file contents are safe. A local documents URL may be publicly accessible.

**Implementation outline:**

1. Separate public images from private resumes/documents. Do not serve private files through the general static `/uploads` route.
2. Store files in durable object storage or a deliberately configured private Cloudinary bucket; save object keys/metadata, not only public URLs.
3. Serve documents through an authenticated, authorized download endpoint or short-lived signed URL; verify that only the applicant and listing owner can access them.
4. Validate file signatures/content, normalize filenames, enforce per-user quotas and size/type limits, and add malware scanning if the threat model requires it.
5. Define retention/deletion behavior when a job/application/account is removed; test unauthorized access and malicious file cases.

**Pros:** Durable across deploys/instances; limits accidental exposure of sensitive applicant documents; better scaling and lifecycle control.

**Cons:** Object storage credentials, permissions, costs and signed URL behavior add complexity; content scanning adds latency/operations; local dev needs a safe emulator or test adapter.

**Interview answer:**

> “I’d separate public profile/post images from private application documents. The current upload middleware has a local disk fallback and the server statically serves uploads, which is convenient but not durable on ephemeral hosts and is not an access-control boundary for resumes. I’d move private files to object storage, store keys, authorize downloads, and issue short-lived links. Then I’d add content validation, quotas and retention rules. This is a user privacy and reliability improvement, not just a storage optimization.”

**“Why wasn’t it implemented?”**

> “The current fallback keeps uploads easy to run locally and demonstrates the feature without requiring cloud credentials. Private document access and production durability need deployment-specific storage policy, which is not fully represented in the repository configuration. I’d avoid pretending local/static storage is production-ready and make the change before real applicant documents are handled.”

### 5. Add automated tests and continuous integration

**Evidence:** no automated test files or CI workflow were found; `backend`'s test script is a placeholder that exits with an error. `test-cloudinary.js` is a manual external-service diagnostic.

**Implementation outline:**

1. Add test scripts and a repeatable isolated MongoDB test environment.
2. Start with API tests for registration/login, protected routes, ownership, connection state transitions, post mutations, job applications/status and file-access rules.
3. Add Socket.IO integration tests after socket authentication is fixed: allowed message, denied message, read/delivery state, disconnect/reconnect.
4. Add component/E2E tests for auth restoration and key user journeys when UI behavior is stable.
5. Add CI to install from lockfiles, lint and build the frontend, run backend/API tests, and report failures. Keep secrets out of CI; mock GitHub, SMTP and media calls except for intentional integration tests.
6. Add coverage reporting as a trend, not as a substitute for meaningful authorization assertions.

**Pros:** Catches regressions, provides evidence for security changes, makes onboarding and refactoring safer.

**Cons:** Setup and maintenance cost; integration tests can be slow/flaky if external services are not isolated; coverage numbers can reward quantity over meaningful cases.

**Interview answer:**

> “The biggest delivery-quality gap is that this repository has no automated test suite or CI; the backend test command is still a placeholder. I’d add API tests around authentication and authorization first, because those boundaries protect user data, then socket and end-to-end flows. I’d run those in CI with a disposable database and mocked external services. The trade-off is initial setup and maintenance, but it makes later security and data-model changes much safer.”

**“Why wasn’t it implemented?”**

> “The repository is a feature-focused implementation and its current scripts show testing infrastructure was not completed. I won’t claim tests pass. I’d prioritize a small, high-value suite around the highest-risk paths rather than trying to add broad superficial coverage all at once.”

### 6. Make message persistence bounded and retries idempotent

**Evidence:** `Chat` embeds all messages in a MongoDB document. A pre-save hook suppresses a message when sender/text match within two seconds. This can suppress a legitimate repeat and is not a reliable retry key.

**Implementation outline:**

1. Give each client send a stable idempotency key and persist it with a unique constraint so a retry returns the original result.
2. Add tests for simultaneous sends, network retries and identical legitimate messages.
3. Measure document sizes and message write latency. If histories can grow substantially, move messages into a separate collection indexed by conversation and time, and keep a bounded conversation summary/last message.
4. Define ordering, retention, pagination and read/delivery status semantics; update both REST and socket paths to share one message service.
5. If using multiple documents in one operation, identify where transaction support is required and configure/test a replica set accordingly.

**Pros:** Correct retry behavior, smaller bounded documents, easier history pagination and independent retention.

**Cons:** More queries and data model complexity; conversation/message consistency must be handled; schema migration of existing embedded messages is needed.

**Interview answer:**

> “I’d replace the current same-text-within-two-seconds duplicate heuristic with an idempotency key generated by the client and enforced by persistence. That preserves two intentional repeated messages while making network retries safe. I’d also measure embedded chat document growth; if it becomes significant, I’d move messages to their own collection and paginate by conversation and timestamp. I wouldn’t normalize preemptively without data, but unbounded message arrays are a known scaling limit.”

**“Why wasn’t it implemented?”**

> “Embedding keeps the initial chat model straightforward, and the current hook was a lightweight attempt to reduce duplicate writes. It is not a correctness guarantee. I’d first add tests and idempotency, then migrate to a separate message collection when observed document size or write contention justifies the additional complexity.”

### 7. Reproducible dependencies and consistent developer setup

**Evidence:** a backend pnpm lockfile exists, frontend has no lockfile in the inspected tree, and no root workspace/scripts exist. The backend `dev` command does not watch files.

**Implementation outline:**

1. Choose and document a supported Node.js version and package manager per app or adopt a root workspace.
2. Generate and commit the frontend lockfile using the selected manager; keep manifests and lockfiles in sync.
3. Add root scripts for install, lint, build and test only if they genuinely coordinate app tasks; avoid misleading scripts.
4. Add a developer environment document with required versus optional services and safe local defaults.
5. Add dependency update/audit policy and review unused packages through import evidence before removing them.

**Pros:** Predictable installs, easier onboarding and CI, clearer ownership of optional external services.

**Cons:** Lockfiles create merge churn; workspace conversion changes install layout; choosing one package manager may inconvenience existing contributors.

**Interview answer:**

> “I’d standardize the runtime and lockfiles first. The backend has a pnpm lockfile, while the frontend has no lockfile in the inspected repository, so two developers can resolve different dependency versions. I’d document the package manager and Node version, commit the frontend lockfile, and add only useful root scripts. I’d consider a workspace if coordinated commands or shared API types become a repeated need.”

### 8. Add observability and operational recovery

**Evidence:** health endpoints report status and process uptime, but logging is mostly console output; no structured logger, request IDs, metrics, error tracking, backup or restore procedure was found.

**Implementation outline:**

1. Define health vs readiness: readiness should report whether required dependencies are available; liveness should indicate process health without causing restart loops.
2. Add structured logs with request/socket correlation IDs, redacting tokens, credentials, personal content and uploaded file data.
3. Measure API latency/error rate, Mongo query latency, active sockets, Redis availability, upload failures and email/GitHub failures.
4. Configure alerting to actionable thresholds and test the alert path.
5. Document managed DB backups and perform a restore exercise; backup existence without a verified restore is insufficient.

**Pros:** Faster incident diagnosis and recovery; distinguishes application failures from dependency outages.

**Cons:** Additional cost and data-governance concerns; instrumentation can add noise or leak sensitive data if poorly configured.

**Interview answer:**

> “I’d improve observability beyond the current uptime endpoints and console messages. I’d add structured, redacted request logs and metrics for API latency, database errors, Redis/socket counts and external-service failures, then establish tested database restore procedures. I’d keep sensitive tokens and user content out of telemetry. The trade-off is cost and operational overhead, so I’d start with the signals tied to user impact.”

## Interview answer: “What improvements do you see, and why didn’t you implement them?”

Use this truthful structure:

1. **Acknowledge evidence:** “The current repository has X; I verified that in file Y.”
2. **Choose one or two improvements:** prioritize security and testability rather than listing every trendy tool.
3. **Explain how:** give the first concrete implementation steps and how you would verify them.
4. **State trade-offs:** mention complexity, migration or operational cost.
5. **Explain scope without inventing history:** “It was outside the implementation completed in this repository / was not completed in the available project scope.” Do not say you evaluated or rejected an option unless you can substantiate that.
6. **Own the gap:** distinguish prototype completeness from production readiness and say what you would do next.

### Sample 60-second response

> “The first improvement I’d make is socket authentication. The REST routes verify JWTs, but the socket client currently registers a user ID through an event, so the server should derive identity from a verified handshake token instead. I’d then add tests for impersonation and room access. The second improvement is protecting job application documents: uploads can use local disk and the server serves an uploads directory, so I’d move private documents to durable object storage and authorize downloads. I didn’t complete those production-hardening steps in this repository, and I wouldn’t describe them as already solved. They add implementation and deployment work, but they address concrete identity and privacy risks. I’d also add tests around those changes before expanding features.”

## Pros and cons of improving versus leaving as-is

| Improvement | Main benefit | Main cost / risk | Suggested order |
|---|---|---|---|
| Socket authentication | Prevents client-claimed identity | Coordinated client/server update and reconnect handling | First |
| Safer token flow | Reduces token leakage and improves revocation options | Auth migration, cookie/CSRF/CORS complexity | First |
| Upload privacy/durability | Protects resumes and survives deployment changes | Storage policy, permissions, cost | First if real documents are used |
| Validation/CORS | Narrows API input and browser trust | Schema/origin maintenance | Early |
| Tests/CI | Regression evidence and safer iteration | Setup/maintenance, service isolation | Early, alongside security changes |
| Idempotent normalized messages | Correct retries and bounded history | More data model/query/migration complexity | After usage measurement; idempotency early |
| Shared rate limiting | Consistent limits across replicas | Redis dependency and operational complexity | Before horizontal scaling |
| Observability/backups | Faster diagnosis and recovery | Cost and sensitive-data handling | Before production growth |
| TypeScript/workspace/cache/queue/microservices | Can solve specific maintainability or throughput issues | Migration and ongoing complexity | Only after a concrete need is demonstrated |

## Completion criteria for a real improvement

Before saying an improvement is done in an interview, be ready to state: files changed, behavior before/after, security/data assumptions, tests run and observed result, deployment/environment changes, migration/rollback plan, and remaining limitations. If it is only a proposal, say “I would implement…” rather than “I implemented…”.
