# 14 · Improvements and technical debt

Evidence-based findings from source/config inspection; this is not a runtime penetration or load test.

| Priority | Issue | Evidence | Impact | Recommended fix |
|---|---|---|---|---|
| Critical | Socket identity appears client-claimed | `socket.js` receives `register_user` userId; client emits it; no handshake JWT verification observed | Potential user impersonation/unauthorized room events | Verify JWT in Socket.IO handshake; derive user ID server side; authorize each room/event |
| High | OAuth token returned in redirect query | `authController.githubCallback` redirects with `?token=` | Token can leak through browser history, referrers, logs | Use secure cookie or one-time exchange code; add OAuth state/PKCE and validate redirect origins |
| High | CORS allows every origin with credentials | `backend/index.js` callback accepts all origins | Unnecessarily broad credentialed cross-origin access | Explicit allowlist and test preflight/credential behavior |
| High | No automated tests/CI | no test files or workflow; backend test script placeholder | Regressions and access-control mistakes lack repeatable detection | API tests for auth/ownership first; add CI lint/build/test gates |
| High | Local upload fallback not durable; docs may be sensitive | `upload.js` writes local and static `/uploads` exposes path | Data loss across ephemeral deploys and possible public document exposure | Separate public media/private documents, object storage, signed access and retention policy |
| Medium | Unbounded embedded arrays | Chat.messages and Job.applications embedded; comments/likes also arrays | Document growth, write contention, 16 MB document ceiling risk | Bound/normalize high-growth entities and define retention |
| Medium | No shared API input validation or centralized errors | controllers parse request bodies directly; no error middleware found | Inconsistent error responses and malformed input handling | Add schema validation and error middleware; standardize response contract |
| Medium | Rate limiter storage likely process-local | default express-rate-limit config, no shared store | Limits inconsistent across replicas/restarts | Configure Redis store when horizontally deployed |
| Medium | Duplicate message mitigation is heuristic | Chat pre-save compares sender/text within 2 seconds | Legitimate repeated messages can be removed; retry duplicates still possible | Persist client idempotency key with unique constraint |
| Medium | Dependency manifests/lock state need alignment | backend package ranges differ from lock resolved versions; frontend lock absent | Non-reproducible installs and supply chain drift | Commit package manager lock per app, document supported Node version, automate audits |
| Medium | README claims diverge from code | Better Auth and caching claims not evidenced; docs mention missing frontend env template | Onboarding confusion | Keep docs generated/validated from implementation and revise stale READMEs |
| Low | Overlapping/legacy frontend modules | `pages/auth/*` alongside root LoginPage/SignupPage; `feedSlice` and `postSlice` | Dead code or divergent flows possible | Trace imports, remove only after confirming unused; clarify ownership |
| Low | Logging is ad hoc | console calls, no structured logger or correlation | Harder production diagnosis | Add request IDs and structured logs before scale |

## Roadmap

**Immediate:** verify and fix socket authentication/authorization; eliminate OAuth token query; restrict CORS; protect document access; add regression tests for access controls.

**Short term:** request validation/error conventions, lockfiles, environment reference, CI, object storage, shared rate-limit store, query performance measurements.

**Long term:** normalize high-growth chat/application records if data warrants; formal migration/backup/restore practices; observability and SLOs; consider API contract generation or workspace if contract drift emerges.

Optional enhancements (queue, cache, microservices, TypeScript conversion) are not automatically defects; introduce them only to address measured requirements.
