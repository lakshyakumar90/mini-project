# 09 · Testing and code quality

## What exists

No automated test files, test framework/configuration, component-test setup, database fixtures, or CI workflow were found. `backend/package.json` has a placeholder `test` script that prints “Error: no test specified” and exits 1. `backend/test-cloudinary.js` is a manual integration diagnostic, not a deterministic automated test. `fix_db.js` is a manual DB utility, not a test.

Frontend scripts: `dev`, `build`, `lint`, `preview`. ESLint uses core JS recommended plus React Hooks and Fast Refresh plugins. No `typecheck` script because this is JavaScript; no formatter script detected. Backend has `start` and `dev` (both plain Node, no nodemon). Test commands were not run, so no pass claim is made.

## Gaps and recommended test layers

1. Unit tests for schema hooks/validation, pagination helpers, authorization checks, and reducers.
2. Controller/API tests with isolated MongoDB fixture DB for registration, ownership boundaries, duplicate connection requests, comments and job applications.
3. Socket tests for identity, permission, reconnect and read/delivery state.
4. Component tests for protected routes, forms, loading/error/empty states.
5. End-to-end journeys: signup/login → profile → connection → post/chat → job apply.
6. CI: install both app dependency sets reproducibly, lint frontend, build frontend, run backend tests and dependency/security checks.

Add tests around access control and socket identity first because they protect user data. Keep external GitHub, SMTP and Cloudinary calls behind adapters so tests can stub them. Use disposable test DB and never point test suites at production. Seed data through explicit test fixtures, not manual `fix_db.js`.
