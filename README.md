# CareerConnect v2

CareerConnect v2 is a role-based career community platform for students, alumni, and admins. This repository is a TypeScript monorepo with a React client and an Express API.

## What Is Included Today

### Core Product Capabilities

- Authentication with email/password login, Google sign-in (`id_token` flow), JWT session handling, and role-based routing.
- Student/alumni profiles with editable details, skills, education, experience, and upload support via Cloudinary-backed endpoint.
- Social feed with post creation, edit/delete, likes, comments, and real-time feed updates.
- Opportunities module with listing, detail view, create/update/delete, apply action, and admin approval/rejection.
- Alumni discovery via recommendation and directory endpoints.
- Training module with recommendations, saved trainings, full admin CRUD, and dashboard carousel actions.
- Connections workflow with overview, request, accept/decline, cancel, and remove.
- Achievements with leaderboard, badges, endorsements, and quest progress toggles.
- Messaging with conversations, message history, read state, unread counters, and notification APIs.
- Admin console for users, posts, opportunities, reports, achievements awarding, and feedback moderation.
- Public landing APIs for platform metrics and published reviews/suggestions.

### UI/UX Highlights

- Public marketing shell with live metrics and published community feedback.
- Multi-theme client system (including light/dark mode) persisted in local storage.
- Realtime socket layer for feed and messaging summaries.
- Trending training cards include updated enrollment flow and success popup messaging in the admin dashboard preview.

## Monorepo Layout

```text
careerconnect-v2/
  client/      # React + Vite + TypeScript app
  server/      # Express + TypeScript API
  docs/        # project docs and archived reports
  README.md
```

## Architecture Overview

### Client (`client/`)

- React 18 + Vite + TypeScript.
- Routing via React Router with `ProtectedRoute` and `AdminRoute` guards.
- Server state via TanStack Query.
- Local app/auth/theme state via Zustand (auth persistence key: `careerconnect-auth`).
- Axios singleton for API calls with token injection and automatic logout on `401`.
- Socket provider built on `socket.io-client` for live feed and unread updates.

### Server (`server/`)

- Express app in `src/server.ts`, startup in `src/index.ts`.
- MongoDB integration through Mongoose.
- JWT auth middleware + admin middleware.
- Security middleware: `helmet`, CORS, global rate limiter, request logging.
- Central error handler in `src/middlewares/errorHandler.ts`.
- API mounted under `/api/*`.

## Tech Stack

| Layer           | Technologies                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Frontend        | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Zustand, React Hook Form, Yup, socket.io-client |
| Backend         | Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs, express-validator, helmet, express-rate-limit, morgan, socket.io  |
| Storage & Media | MongoDB, Cloudinary                                                                                                      |
| Testing         | Vitest + Testing Library (client), Jest + Supertest (server)                                                             |
| Tooling         | ESLint, TypeScript, tsx                                                                                                  |

## API Modules (Current)

All server routes are mounted in `server/src/server.ts` under `/api`.

| Base Path            | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `/api/auth`          | Register, login, logout, Google sign-in                            |
| `/api/users`         | Current user profile and user lookup/list                          |
| `/api/posts`         | Feed CRUD, likes, comments                                         |
| `/api/opportunities` | Opportunity CRUD, apply, approval flow hook                        |
| `/api/trainings`     | Recommendations, saved trainings, admin training CRUD              |
| `/api/alumni`        | Recommended alumni + public directory                              |
| `/api/connections`   | Connection overview/request/respond/remove                         |
| `/api/achievements`  | Leaderboard, badges, endorsements, quests                          |
| `/api/messaging`     | Conversations, messages, unread counts, notifications              |
| `/api/admin`         | Admin stats, moderation, role/user operations, feedback moderation |
| `/api/feedback`      | Public feedback submission and published feedback listing          |
| `/api/public`        | Public platform metrics for landing page                           |
| `/api/upload`        | File upload endpoint (Cloudinary-backed)                           |
| `/api/ping`          | Health check                                                       |

## Local Development

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Cloudinary account (for uploads)

### Install

```bash
npm install --prefix client
npm install --prefix server
```

### Run

```bash
# Terminal 1
npm run dev --prefix server

# Terminal 2
npm run dev --prefix client
```

- Client default: `http://localhost:5173`
- Server default: `http://localhost:4000`

### Build

```bash
npm run build --prefix client
npm run build --prefix server
```

## Environment Variables

### Server (`server/.env`)

Required/important keys used by current code:

```env
PORT=4000
MONGO_URI=mongodb+srv://...
# MONGODB_URI is also accepted as an alias

JWT_SECRET=replace_me
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173
# FRONTEND_URL is also accepted as an alias
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

GOOGLE_CLIENT_ID=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

ADMIN_SEED_EMAIL=admin@careerconnect.local
ADMIN_SEED_PASS=StrongPass123!
```

Notes:

- `MONGO_URI`/`MONGODB_URI` must be set for DB connection.
- `JWT_SECRET` defaults to an insecure placeholder if omitted; set a real value in all environments.
- Google sign-in route verifies Google `id_token` with Google's tokeninfo endpoint.
- Uploads require Cloudinary name/key/secret variables.

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=...
```

Notes:

- If `VITE_API_URL` is omitted, the client falls back to a hosted API URL configured in `client/src/lib/axios.ts`.

## NPM Scripts

### Client (`client/package.json`)

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test`

### Server (`server/package.json`)

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`
- `npm run test`
- `npm run test:int`
- `npm run seed`
- `npm run seed:users`
- `npm run seed:opps`

## Seeding

Admin seeding script:

```bash
npm run seed --prefix server
```

Optional demo seeds:

```bash
npm run seed:users --prefix server
npm run seed:opps --prefix server
```

Additional seed utilities are available in `server/scripts/` and can be run with `tsx` when needed.

## Testing

```bash
# Client tests
npm run test --prefix client

# Server tests
npm run test --prefix server
npm run test:int --prefix server
```

Current integration suites include auth, posts, and opportunities coverage in `server/__tests__/`.

## Deployment Notes

Typical deployment split:

- Client on Netlify/Vercel static hosting.
- Server on Render/Railway/Node host.
- MongoDB Atlas for production database.

Production server start command:

```bash
npm run build --prefix server
npm start --prefix server
```

Health check endpoint: `/api/ping`

## Known Gaps / Implementation Notes

- The current auth implementation is JWT-only for sessions; refresh-token endpoints are not exposed in `authRoutes`.
- Admin "General Settings" form UI exists but is not wired to a persistence endpoint yet.
- Upload route currently does not enforce auth middleware by default; enforce this before exposing in stricter environments.

## Roadmap (Next)

- Expand automated test coverage across messaging, achievements, connections, and feedback moderation.
- Add stronger upload authorization and storage constraints.
- Add richer analytics/report exports for admins.
- Continue UI polish for mobile responsiveness and accessibility.

## Contributing

1. Create a feature branch.
2. Keep changes scoped and type-safe.
3. Run lint, tests, and builds for affected packages.
4. Open a PR with a concise change summary and validation notes.

## License

MIT (add `LICENSE` file if not yet present).
