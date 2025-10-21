<!-- Copilot instructions for quick orientation in the CareerConnect v2 repo -->
# CareerConnect v2 — AI assistant guidance

Purpose: be minimally prescriptive and highly actionable. Use the pointers below to make safe, correct edits quickly.

Quick snapshot
- Monorepo: `client/` (React + Vite + TypeScript + Tailwind) and `server/` (Node + Express + TypeScript + Mongoose).
- Dev ports: client default 5173, server default 4000. API base path: `/api/*`.

Essential files to inspect first
- `client/src/lib/axios.ts` — central axios instance: reads token from `useAuthStore` and auto-logs out on 401.
- `client/src/store/useAuthStore.ts` — persistent Zustand auth store (localStorage key: `careerconnect-auth`).
- `client/src/routes/ProtectedRoute.tsx` & `client/src/routes/AdminRoute.tsx` — route guards used across `client/src/router.tsx`.
- `client/src/router.tsx` — router layout and route structure (public / protected / admin sections).
- `server/src/server.ts` & `server/src/index.ts` — express app wiring and bootstrap (connect DB then listen).
- `server/src/config/env.ts` — canonical env keys and runtime warnings for missing variables.
- `server/scripts/seedAdmin.ts` — seed script for creating the initial admin user (uses env `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASS`).

Common workflows & concrete commands
- Start both apps locally (from repo root):
  - Frontend dev: `npm run dev --prefix client` (Vite on 5173)
  - Backend dev: `npm run dev --prefix server` (tsx/ts-node watcher, server on 4000)
- Build & run production:
  - `npm run build --prefix client` then `npm run build --prefix server` and `node server/dist/index.js` (or `npm start --prefix server`).
- Seed admin (server must be able to reach Mongo): `npm run seed --prefix server`.
- Tests:
  - Frontend unit: `npm run test --prefix client` (Vitest)
  - Backend unit/int: `npm run test --prefix server` and `npm run test:int --prefix server` (Jest + Supertest)

Patterns & gotchas (project-specific)
- Auth flow: JWTs are returned by server (`/api/auth`) and consumed client-side via `useAuthStore`. The axios instance imports the store directly (`useAuthStore.getState().token`) — avoid introducing a duplicate token source.
- Persistent state: Zustand with `persist` is used for auth; clearing or renaming the localStorage key will break persisted sessions (`careerconnect-auth`).
- API structure: Server mounts routes under `/api/*` in `server/src/server.ts`. When adding routes, export a router in `server/src/routes/*` and add `app.use('/api/your', yourRouter)`.
- Error handling: `server/src/middlewares/errorHandler.ts` is the global error handler — return structured JSON errors to align with existing front-end expectations.
- File uploads: Cloudinary integration exists; follow the existing pattern in controllers (search `cloudinary` usage) instead of ad-hoc solutions.
- Rate limiting & security: server loads rate limiter and helmet early in middleware stack — keep security middleware order intact when modifying `server/src/server.ts`.

How to add a new backend endpoint (example)
1. Create `server/src/controllers/<feature>Controller.ts` and `server/src/routes/<feature>Routes.ts`.
2. Add model in `server/src/models` if needed.
3. Wire the route in `server/src/server.ts` with `app.use('/api/<feature>', featureRoutes)`.
4. Add client call using `client/src/lib/axios.ts` (import `api` and call `api.get('/<feature>')`).

How to add a new protected client page (example)
1. Add page component under `client/src/pages`.
2. Add route in `client/src/router.tsx` inside the ProtectedRoute section so auth guard is applied.
3. Use `useAuthStore` to read user/role if you need role-based UI.

CI / Merge expectations
- PRs should run lint + unit tests. See `client/package.json` and `server/package.json` scripts for commands.
- Respect TypeScript `tsconfig` boundaries and keep imports ESM-style (project `"type": "module"`).

If you are unsure
- Open the files listed under “Essential files” to confirm patterns before editing.
- For runtime values, check `server/src/config/env.ts` and `.env` examples in each package.

Feedback request: If any of the above assumptions are incorrect or you want more examples (e.g., testing patterns, database seeding details, or CI steps), tell me where to expand.
