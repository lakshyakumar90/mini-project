# 07 · Authentication and security

## Implemented authentication

Email/password is implemented in `userController.register/login`: User pre-save hashes with bcryptjs cost 12; login compares hash; controllers sign JWT with `JWT_SECRET`, 30-day expiry, set a cookie and include the token in the JSON response (`user.token`). `authMiddleware.protect` accepts `req.cookies.jwt` first, otherwise `Authorization: Bearer`, verifies signature, loads User and assigns `req.user`. Logout clears cookie. Frontend stores the returned JWT in localStorage and sends bearer token via `apiClient`; 401 clears token and raises `devconnect:unauthorized`. GitHub OAuth callback sets an HTTP-only secure SameSite=None cookie and also redirects with JWT in query string. Query-token exposure in browser history/referrer/logging is a risk.

```mermaid
sequenceDiagram
  participant Browser
  participant API as Express
  participant User as MongoDB User
  Browser->>API: POST /api/users/login
  API->>User: find email + password selection
  User-->>API: user/hash
  API->>API: bcrypt compare; sign JWT (30 days)
  API-->>Browser: JSON + jwt cookie/token response
  Browser->>API: protected request (cookie or Bearer)
  API->>API: jwt.verify
  API->>User: findById(decoded.id)
  User-->>API: current user
  API-->>Browser: route/controller response
```

Exact cookie flags on standard email login must be checked in `sendTokenResponse`; OAuth cookie flags are explicitly `httpOnly`, `secure`, `sameSite: none`. API CORS callback allows all origins while credentials are enabled; this broad policy should be restricted to known frontend origins in production. `FRONTEND_URL` drives redirects.

## Implemented controls and gaps

| Area | Evidence / status |
|---|---|
| Password storage | bcryptjs hashing and compare; never return selected password by default. |
| API auth | JWT signature/expiry verification and account existence check; broad auth covers route groups. |
| Authorization | Some owner/relationship checks exist in controllers; UI route guard is not server security. Audit every mutating endpoint. |
| Rate limiting | IP limiters for auth, connection request, search, post create and job create/apply. In-memory defaults do not share counts across replicas. |
| Input/schema validation | Mongoose required/enums/max and validator email/URL. No general request schema validator observed. |
| Upload | 10 MB per file; extension and declared MIME allowlists; local/cloud storage. MIME is client controlled, no malware scan or private-document authorization visible. |
| CORS | Credentials enabled, callback allows all origins. Restrict allowlist. |
| CSRF | Cookie auth exists; no CSRF token/origin validation found. Bearer header changes threat profile but cookie path remains. |
| XSS | React escapes ordinary text, but localStorage JWT is script-readable. Review any HTML rendering and external URLs. |
| Socket auth | Socket client claims user ID via event; no verified JWT handshake auth evident. Treat as high-priority identity/room authorization review. |
| Secrets | Values belong in env; do not commit. `.env.example` omits several referenced names. Never include actual credentials in notes. |
| Errors/observability | Console logging; no structured logger, tracing, error monitor or centralized error handler found. |

No dependency audit was run. A security review should inspect every controller's ownership checks, event identity, OAuth state/PKCE, token response handling, upload storage access, and brute-force policy. Better Auth is a manifest dependency but no active use found; do not describe it as the auth provider.
