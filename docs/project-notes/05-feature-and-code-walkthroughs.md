# 05 · Feature and code walkthroughs

All feature flows are inferred from routes, controllers, services and pages. The repository contains no automated feature tests.

## Account and profile

Email/password starts at `SignupPage.jsx`/`LoginPage.jsx` → auth Redux thunks in `store/slices/authSlice.js` → `userService.js` → Axios `createApi` → `POST /api/users/register|login`. `User` schema validates email, hashes modified passwords with bcrypt cost 12, and controller signs 30-day JWT. Subsequent profile calls include bearer token; `protect` loads User and attaches `req.user`. `App.jsx` restores current user and `ProtectedRoute` gates pages. The browser token is localStorage backed. GitHub OAuth is a distinct route `/api/auth/github` → callback → GitHub exchange/profile/repo calls → account upsert → redirect with JWT query parameter, handled by `OAuthTokenHandler` in App.

## Developer connections

`DashboardPage`, `ConnectionsPage`, and `RequestsPage` call `connectionService` and Redux `connectionSlice`. `/api/connections` routes protect all operations. `connectionController` validates duplicate/self requests and persists `Connection`; it calls `notifyUser` on request/accept. Recipient approval updates status. Unique index is ordered requester/recipient, so reverse-direction duplicates are not prevented by that index alone. See [connections diagram](diagrams/feature-workflows/connections.mmd).

## Posts/feed

`FeedPage` dispatches `fetchPosts` on tab/tag changes and on cursor-based load-more. `postSlice` calls `postService`; API `GET /api/posts/feed` is protected, filters/sorts/paginates in `postController`, populates author details, and returns posts plus cursor metadata. `CreatePostModal` submits content/tags/snippet/type and optional image via Multer. Like/comment operations modify embedded arrays; controller creates notifications. Owner checks gate post/comment deletion. See [post flow](diagrams/feature-workflows/posts.mmd).

## Jobs and applications

`JobsPage`, `CreateJobModal`, `JobCard`, `ApplyJobModal` use `jobSlice` and `jobService`. Protected `/api/jobs` list filters and cursor paginates. Create uses authenticated `req.user`; apply accepts resume and up to five additional docs (10 MB each) through `uploadDocument.fields`, then embeds application in Job; status updates are posted to `/api/jobs/:id/application/:applicationId/status`. See [job flow](diagrams/feature-workflows/jobs.mmd). Review controller authorization carefully before relying on status updates as employer-only; code must verify owner/applicant explicitly.

## Chat

`ChatPage` uses REST for history/conversation list and Socket.IO for live message sending, typing, presence, read and delivery events. `socketService` attaches Redux listeners, optimistic IDs, reconnect settings and status actions. Both `messageController` and `utils/socket.js` contain send/persistence paths. Chat documents embed messages; a pre-save hook drops same sender/text messages within two seconds. This is heuristic duplicate suppression, not idempotency. Security caveat: client emits `register_user` with a claimed user ID; socket connection identity enforcement is not apparent in reviewed setup.

## Notifications

Controller helpers create `Notification` records and emit Socket.IO `notification`; frontend notification service fetches/marks/deletes records and socket service inserts realtime notifications into Redux. Ownership filters in notification operations are important; see controller. Sources include connections, post interactions, jobs/messages where invoked.

## Contact form and external calls

`LandingPage` contact form calls `contactService` → public `POST /api/contact` → `contactController` → Nodemailer SMTP. GitHub OAuth/profile sync calls GitHub HTTP APIs directly using Node fetch. Errors are mostly translated locally to JSON or redirect codes; there is no centralized error middleware or request correlation logging.

## Walkthrough checklist

For any feature, follow: page/component → Redux slice/thunk → service → Axios/socket client → route/middleware → controller/event handler → model → response/emitted event → reducer/UI. The dedicated references are [API/realtime](08-api-and-realtime-workflows.md), [DB](06-database-and-data-models.md), and [security](07-authentication-and-security.md).
