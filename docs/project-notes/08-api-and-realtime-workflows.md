# 08 · API and realtime workflows

## REST route inventory

All paths below are prefixed by `backend/index.js`. “Protected” means router-level `protect`, with noted public exceptions.

| Prefix | Methods and path | Access |
|---|---|---|
| `/api/users` | POST `/register`, `/login`; GET `/logout`; GET/PUT `/profile`; POST `/upload/avatar`, `/upload/cover`; GET `/feed`, `/search`, `/:id` | First three public; remaining protected; auth/search rate limited |
| `/api/auth` | GET `/github`, `/github/callback`; POST `/sync-github` | First two public; sync protected |
| `/api/posts` | GET `/feed`, `/:id`; POST `/upload/image`, `/`, `/:id/like`, `/:id/comment`; DELETE `/:id`, `/:id/comment/:commentId` | Protected; create rate limited |
| `/api/connections` | POST `/request/:userId`, `/accept/:userId`, `/reject/:userId`; GET `/requests`, `/sent`, `/`; DELETE `/:userId` | Protected; request rate limited |
| `/api/jobs` | GET `/`, `/:id`; POST `/`, `/:id/apply`; PUT `/:id/application/:applicationId/status`; DELETE `/:id` | Protected; create/apply rate limited |
| `/api/messages` | GET `/conversations/list`, `/:userId`; POST `/:userId` | Protected |
| `/api/notifications` | GET `/`; PUT `/read-all`, `/:id/read`; DELETE `/:id` | Protected |
| `/api/contact` | POST `/` | Public |
| health | GET `/health`, `/api/health` | Public; basic process uptime response |

Route declarations in source are the final authority; older backend README endpoint examples do not match route shapes.

## Request lifecycle

```mermaid
sequenceDiagram
  participant UI as React page/thunk
  participant S as frontend service/Axios
  participant R as Express router
  participant A as protect middleware
  participant C as controller
  participant M as Mongoose
  participant DB as MongoDB
  UI->>S: dispatch action / call service
  S->>S: add Bearer token; credentials; 30s timeout
  S->>R: HTTP JSON request
  R->>A: verify cookie/header JWT and load User
  A->>M: User.findById
  M->>DB: query
  DB-->>A: user record
  A->>C: req.user + request
  C->>M: feature query/update/populate
  M->>DB: read/write
  DB-->>M: result
  M-->>C: document(s)
  C-->>S: JSON/status
  S-->>UI: data or error; 401 clears token
```

## Realtime event families

Socket.IO server attaches to same HTTP server and uses `/socket.io/`; client uses websocket then polling fallback, credentials and reconnect attempts (up to 20). Event families in `utils/socket.js`/`socketService.js`: `register_user`, `join_chat`, `get_users_status`, `user_status_change`, `typing_start/stop`, `send_message`, `receive_message`, `message_sent`, `message_error`, `message_delivered`, `message_status_update`, `mark_messages_read`, `messages_read`, `notification`, `disconnect`.

Redis adapter supports room/event fanout across backend processes; Redis hash `user_presence` stores status, with local Map fallback. No event versioning/schema or durable queue is present. Socket.IO reconnect is configured client side; offline events rely on Mongo REST/history, not a durable message broker.

```mermaid
sequenceDiagram
  participant C as ChatPage/client
  participant S as Socket.IO server
  participant R as Redis adapter/presence
  participant D as MongoDB Chat
  C->>S: connect; register_user(userId)
  S->>R: mark online / join user room
  C->>S: send_message(sender, receiver, content)
  S->>S: validate connection/applicant relationship
  S->>D: persist embedded message
  D-->>S: saved message
  S-->>C: receive_message + message_sent
  S-->>R: fanout to recipient room across nodes
  C->>S: message_delivered / mark_messages_read
  S->>D: update message status
  S-->>C: message_status_update / messages_read
```

Socket workflow shown at a conceptual level; event handler details and security caveat are in [security](07-authentication-and-security.md). Do not assume all socket events authenticate the claimed user.
