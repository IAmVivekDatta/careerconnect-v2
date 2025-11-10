# CareerConnect — Progress Report
Checkpoint Save Date: October 20, 2025

Prepared by: Vivek Datta & Team (III B.Tech – CSE CIC)
Guide: Dr. P. Sudhakar

## Abstract
CareerConnect is a digital bridge between students, alumni, and career opportunities. The platform enables students to showcase talents, connect with alumni, and explore opportunities through a gamified, LinkedIn-style ecosystem. It uses React (frontend), Node.js + Express (backend), and MongoDB (database). Deployment targets are Netlify (frontend) and Render (backend).

## Project Snapshot
- MERN stack foundation scaffolded per PRD (React + Tailwind client, Node/Express API, MongoDB integrations prepared).
- Local dev dependencies installed in both `client/` and `server/`.
- Environment scaffolding delivered (`.env.example` templates and local `.env` samples).
- Admin seeding workflow implemented (`server/scripts/seedAdmin.ts`).

Status: Work paused before implementing Sprint 1 backend routes; server currently exits early because `env.ts` prefers `MONGO_URI`/`FRONTEND_URL` while some environments may provide `MONGODB_URI`/`CLIENT_URL`.
✅ Admin seed script implemented

✅ .env templates added

🚧 Backend routes to be implemented next

## Current Stage and Notes

- Discovery & PRD (Sprint 0): Complete — README and architecture locked.
- Sprint 1 (Core MVP Setup): Preparing — environment and skeletons in place; controllers/routes need implementation and integration testing.

Key implemented pieces
- Client: Vite + React + TypeScript + Tailwind + Zustand + TanStack Query. Route guards (`ProtectedRoute`, `AdminRoute`) and `useAuthStore` exist.
- Server: TypeScript + Express skeleton, Mongoose models (User/Post/Opportunity/Achievement), middleware (auth/admin/error), controllers stubs, and route registration in `server/src/server.ts`.

Outstanding Implementation List (selected)
- Implement auth endpoints: `POST /api/auth/register`, `POST /api/auth/login` (bcrypt hashing + JWT issuance + refresh if planned).
- Implement `GET /api/users/me` returning sanitized profile data.
- Flesh out `posts` and `opportunities` CRUD with validation and service layers.
- Add integration tests with Supertest; aim to get `npm run test:int` passing for core flows.

## Line-by-Line Continuation Guide (practical next steps)
1. Ensure `.env` alignment:
   - Option A (quick): Update `server/.env` to provide `MONGO_URI` and `FRONTEND_URL` matching `server/src/config/env.ts`.
   - Option B (recommended): Update `server/src/config/env.ts` to accept `MONGODB_URI` and `CLIENT_URL` as fallbacks (already partly implemented) and ensure no early exit.
2. Start backend for development:
```powershell
npm --prefix server run dev
```
3. Start frontend for development (in a separate shell):
```powershell
npm --prefix client run dev
```
4. Implement auth logic in `server/src/controllers/authController.ts` (register + login) using `bcryptjs` and `jsonwebtoken` helpers already present.
5. Wire `authRoutes` and add tests in `server/__tests__` (use Supertest to hit the running app or use `NODE_ENV=test` + in-memory mongo if available).
6. Point `client/.env` VITE_API_URL to your running backend (e.g., `http://localhost:4000/api`) and verify login flow; client uses `client/src/lib/axios.ts` which reads token from `useAuthStore`.

## Deployment Notes (concise)

### Frontend — Netlify
1. Build frontend: `npm --prefix client run build`.
2. Set Netlify publish directory to `client/dist`.
3. Add environment variable in Netlify: `VITE_API_URL` = `<your backend base>/api`.
4. Ensure `_redirects` is present in `client/public` for SPA routing (`/* /index.html 200`).

### Backend — Render / Railway
1. Connect the `server/` folder as a service.
2. Build: `npm --prefix server run build` (or use tsx/tsx-watch to run in dev-like mode).
3. Environment variables to set: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` (if used), `FRONTEND_URL`, `CLOUDINARY_URL`.
4. Expose a health endpoint: `/api/ping` exists; use it for health checks.

## Tech Stack Summary
| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs |
| Database | MongoDB Atlas |
| Deployment | Netlify (frontend), Render/Railway (backend) |

## Signatures

| Student Name | Regd. No. | Signature |
|---|---|---|
| P. Varshitha Srivani | 23BQ1A766 | __________ |
| P. Rishwith | 23BQ1A4770 | __________ |
| SK. Chandini | 23BQ1A4782 | __________ |
| T. Akhil Subash Kumar | 23BQ1A4792 | __________ |
| V. Vivek Datta | 23BQ1A7A6 | __________ |

Guide: Dr. P. Sudhakar

Date: 20-10-2025

---

If you'd like, I can (pick one):
- Patch `server/src/config/env.ts` to accept more environment variable name permutations (adds robustness).
- Implement `authController` register/login handlers and a basic `GET /api/users/me` endpoint with tests.
- Merge this document into the root `README.md` or produce a PDF-ready version.

Tell me which follow-up you prefer and I'll proceed. 🛠️
