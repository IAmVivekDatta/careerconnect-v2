# CareerConnect v2

Digital bridge between students, alumni, and opportunities. Production-ready MERN platform with dual-role access (students/alumni) and admin governance.

## Table of Contents
- [Project Overview](#project-overview)
- [Product Goals](#product-goals)
- [Personas](#personas)
- [Feature Matrix](#feature-matrix)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Environments](#environments)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)
- [Security Checklist](#security-checklist)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
CareerConnect v2 is a role-based community network where students can showcase achievements, connect with alumni, discover opportunities, and stay accountable through gamified progress. Alumni contribute mentorship, share jobs, and engage with the student community. Admins curate the ecosystem, moderate content, and view platform analytics.

## Product Goals
- Launch a reliable MERN platform connecting students and alumni with actionable opportunities.
- Achieve >60% profile completion for new users within 30 days through guided onboarding.
- Facilitate an average of 3+ meaningful connections per active user per month.
- Maintain <48 hour turnaround on admin job approvals and <200 ms median API latency.
- Earn post-onboarding NPS >6.5 via streamlined flows and responsive UI.

## Personas
- **Student**: Builds profile, applies for opportunities, connects with alumni mentors, tracks achievements.
- **Alumni**: Shares experience, posts opportunities, mentors students, maintains professional visibility.
- **Admin**: Oversees platform health, moderates content, manages users, monitors analytics.

## Feature Matrix
| Module | Capabilities |
| --- | --- |
| Authentication | JWT register/login/logout/refresh, Google OAuth 2.0, role-based guards, rate limiting, password reset email |
| Profiles | Resume upload (Cloudinary), portfolio links, education, experience, skills, badges, profile completion meter, hero section, editable sections |
| Connections | Send/accept/remove requests, mutual connections, block/unblock placeholder |
| Feed & Posts | Text/image posts, likes, comments with inline threads, share/repost, pagination (infinite scroll), admin override removal |
| Opportunities | CRUD with approval workflow, filters (type/company/keyword), apply with resume snapshot, saved jobs |
| Alumni Network | Skill-matching recommendations, alumni directory, browseable profiles, suggest connections |
| Training Opportunities | Skill-based course recommendations, save for later, provider integrations (Udemy, Coursera, DataCamp) |
| Achievements & Badges | Leaderboard with top performers, skill endorsements (peer-reviewed), badge gallery, points system, admin award flow |
| Messaging & Notifications | Inbox with conversations, real-time message sending, notification bell with unread count, notification center |
| Admin Portal | Login, dashboards (users by role, posts/day, active users 30d, open jobs), user moderation, job approvals, badge awards, stats card |
| Gamification | Points earned for endorsements, posts, comments; badges for milestones; leaderboard rankings |

## System Architecture
```
client/ (React + Vite + Tailwind)
  |- Atomic design components (atoms, molecules, organisms, layouts, pages)
  |- Zustand for UI state, TanStack Query for server cache
  |- Axios instance for API communication with interceptors
  |- ProtectedRoute and AdminRoute wrappers

server/ (Node + Express + TypeScript)
  |- Modular route/controller/service structure
  |- Mongoose models for User, Post, Opportunity, Achievement
  |- Auth, admin, and rate limiting middleware
  |- Cloudinary integration for uploads
  |- Seed script for initial admin user

services
  |- MongoDB Atlas cluster (indexes on email, createdAt, status)
  |- Optional Redis/Atlas for refresh token store (future)
```

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query, React Hook Form, Yup, React Router DOM.
- **Backend**: Node.js 18+, Express, TypeScript, Mongoose, JWT, bcrypt, Cloudinary SDK, express-validator, helmet, express-rate-limit, pino.
- **Database**: MongoDB Atlas (global cluster, TLS enforced).
- **Deployment**: Netlify (client), Render or Railway or Vercel (server), MongoDB Atlas.
- **Tooling**: ESLint, Prettier, Husky, lint-staged, Jest, Supertest, Vitest, React Testing Library, MSW, Cypress/Playwright (future).

## Monorepo Structure
```
careerconnect-v2/
  README.md
  docs/
    README.md
    archive/
  client/
  server/
    scripts/
  .github/
    workflows/
```

All legacy deployment reports and investigation notes are stored under `docs/archive/` to keep the repository root focused on active source code and documentation.

## Environments
| Stage | Domain | Notes |
| --- | --- | --- |
| Local | http://localhost:5173 (client), http://localhost:4000 (api) | Vite dev server + Express dev server |
| Staging | Netlify branch deploy, Render staging service | Protected with basic auth, used for QA |
| Production | Netlify primary site, Render production API | Auto deploy on main branch |

## Getting Started
1. Clone the repo and install dependencies.
   ```bash
   git clone https://github.com/<org>/careerconnect-v2.git
   cd careerconnect-v2
   npm install --prefix client
   npm install --prefix server
   ```
2. Duplicate `.env.example` files in `client/` and `server/` and populate secrets.
3. Seed the admin user once from the server root.
   ```bash
   cd server
   npm run seed
   ```
4. Run both apps locally.
   ```bash
   npm run dev --prefix client
   npm run dev --prefix server
   ```
5. Access the client at http://localhost:5173 and login with the seeded admin credentials.

## Environment Variables
### server/.env
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/careerconnect
JWT_SECRET=supersecret_jwt_key
JWT_REFRESH_SECRET=supersecret_refresh_key
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
FRONTEND_URL=https://your-netlify-site.netlify.app
ADMIN_SEED_EMAIL=admin@careerconnect.local
ADMIN_SEED_PASS=StrongPass123!
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
```

### client/.env
```
VITE_API_URL=https://api-careerconnect.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_SENTRY_DSN=
```

### Google Sign-In Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google+ API and Google Identity Services API.
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs".
5. Set application type to "Web application".
6. Add authorized origins: `http://localhost:5173` (for dev) and your production domain.
7. Add authorized redirect URIs: `https://your-api-domain.com/api/auth/google/callback` (if using redirect flow, but current implementation uses id_token).
8. Copy the Client ID and Client Secret.
9. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env`.
10. Set `VITE_GOOGLE_CLIENT_ID` in `client/.env`.
11. The client will load the Google Sign-In button automatically on the login page.

## Available Scripts
### client
- `npm run dev`: Start Vite dev server.
- `npm run build`: Build production bundle.
- `npm run preview`: Preview production build.
- `npm run lint`: ESLint check.
- `npm run test`: Vitest unit tests.

### server
- `npm run dev`: Start Express server with ts-node-dev.
- `npm run build`: Compile TypeScript to JavaScript in `dist/`.
- `npm start`: Run compiled server.
- `npm run lint`: ESLint check.
- `npm run test`: Jest unit tests.
- `npm run test:int`: Supertest integration suite.
- `npm run seed`: Execute `scripts/seedAdmin.ts` to ensure admin user exists.

## Testing Strategy
- **Backend unit tests**: Controllers/services with Jest, coverage target 80%.
- **Backend integration tests**: Supertest against in-memory Mongo for auth, posts, opportunities, admin approvals.
- **Frontend unit tests**: Vitest + RTL for core components, hooks, and route guards.
- **Frontend integration**: MSW-backed flows for auth and posting.
- **E2E (future)**: Cypress or Playwright covering auth, feed interactions, job application, admin approval.
- **CI Gate**: Lint + unit tests + build must pass before merge.

## QA Checklist (Manual Testing)
### Auth & Accounts
- [ ] Register new student account successfully
- [ ] Register new alumni account successfully
- [ ] Login with correct credentials
- [ ] Logout clears token and redirects to login
- [ ] Login fails with incorrect password
- [ ] Google Sign-In creates account or logs in existing user
- [ ] Admin login redirects to admin dashboard
- [ ] Non-admin users cannot access `/admin/*` routes

### Profile & Personalization
- [ ] View own profile with hero section showing name, role, bio
- [ ] Edit profile: update bio, add/remove skills
- [ ] Edit profile: add experience entry with title, company, dates, description
- [ ] Edit profile: add education entry with institution, degree, year
- [ ] Upload profile picture and resume
- [ ] Profile photo displays correctly in avatar
- [ ] View badges earned and total points
- [ ] See skill endorsements with endorser avatars
- [ ] Endorse a peer's skill on their profile
- [ ] Remove own endorsement for a skill

### Feed & Engagement
- [ ] Create new post with text content
- [ ] Create post with image attachment
- [ ] View feed with posts in reverse chronological order
- [ ] Like a post (heart icon fills, counter increments)
- [ ] Unlike a post (heart unfills, counter decrements)
- [ ] Comment on a post (appears inline immediately)
- [ ] Delete own comment (removed from comment thread)
- [ ] Share post (triggers native share or copies link)
- [ ] Pagination works when scrolling (load more posts)
- [ ] Edit own post (content updated)
- [ ] Delete own post (post removed from feed)

### Alumni & Training
- [ ] View Alumni Recommendations carousel on admin dashboard
- [ ] Click next/prev to browse alumni profiles
- [ ] See alumni skills, connection button, message button
- [ ] View Training Opportunities carousel on admin dashboard
- [ ] Browse trainings with provider logo, level badge, duration, price
- [ ] "Enroll Now" button opens external training link in new tab
- [ ] "Save for Later" saves training (no error)
- [ ] Saved trainings are retrievable from personal dashboard

### Achievements & Leaderboard
- [ ] View leaderboard (top 20 users by points)
- [ ] Leaderboard shows rank (🥇 🥈 🥉 for top 3), name, points, badge count
- [ ] Click on leaderboard entry navigates to that user's profile
- [ ] Badge gallery shows all earned badges on profile
- [ ] Hover badge displays tooltip with name and description
- [ ] Admin dashboard shows real-time stats (total users, active 30d, posts today, etc.)

### Messaging & Notifications
- [ ] Notification bell displays unread count badge
- [ ] Click notification bell shows dropdown with latest 5 notifications
- [ ] Notifications show actor name/avatar, content, timestamp
- [ ] View notification center (all notifications paginated)
- [ ] Mark notification as read (removes unread badge)
- [ ] Create conversation with another user
- [ ] Send message in conversation (appears immediately)
- [ ] View message thread in chronological order
- [ ] Receive unread message count in bell icon
- [ ] Older messages are loaded when scrolling up (pagination)

### Admin Features
- [ ] Admin dashboard displays stats cards (users, alumni, students, active 30d, posts, opportunities)
- [ ] Admin can view list of all users with role badges
- [ ] Admin can deactivate/reactivate a user
- [ ] Admin can change user role (student ↔ alumni)
- [ ] Admin can view list of pending jobs
- [ ] Admin can approve/reject a job listing
- [ ] Admin can award badges to users
- [ ] Admin can remove/moderate posts
- [ ] Admin can view and export user statistics (CSV export future)

### Cross-Browser & Responsive
- [ ] App responsive on mobile (375px width) - all layouts adapt
- [ ] App responsive on tablet (768px width)
- [ ] App responsive on desktop (1024px width and above)
- [ ] Touch interactions work on mobile (buttons, scrolling, modals)
- [ ] Chrome, Firefox, Safari all load app without console errors
- [ ] Navigation works on all breakpoints

### Performance & Stability
- [ ] Feed loads in <2 seconds on first visit
- [ ] Liking/commenting feels instant (no lag)
- [ ] Profile page loads profile data and badges
- [ ] No console errors or warnings on main pages
- [ ] No memory leaks on extended browsing
- [ ] Images load correctly (avatar, post images)

### Security
- [ ] Cannot access `/admin/*` without admin role
- [ ] Cannot access `/profile/edit` without authentication
- [ ] Tokens are stored securely (localStorage, HttpOnly when possible)
- [ ] CORS errors do not appear for localhost/Netlify/Render domains
- [ ] Rate limiting returns 429 after too many auth attempts
- [ ] Cannot modify other user's profile via PUT /users/me spoofing user ID
- [ ] Cannot approve own job listing (admin must approve)

## Deployment Guide
### Frontend (Netlify)
1. Connect the `client/` folder to Netlify (GitHub integration).
2. Build command: `npm run build`. Publish directory: `dist`.
3. Configure environment variables (e.g., `VITE_API_URL`).
4. Add `_redirects` file with `/* /index.html 200` for client-side routing.
5. Enable branch deploys and PR previews.

### Backend (Render / Railway / Vercel)
1. Connect the `server/` repo or subdirectory.
2. Install command: `npm install` (or `npm ci`).
3. Build command: `npm run build` (Render) or use `npm start` with ts-node for Railway.
4. Start command: `node dist/server.js`.
5. Configure environment variables (Mongo URI, secrets, Cloudinary, frontend URL).
6. Set up health check endpoint `/api/ping` and confirm CORS allows Netlify domain.
7. Enable auto-deploy on main branch.

### Database (MongoDB Atlas)
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a new project and cluster (choose the free tier M0).
3. Set up a database user with read/write access.
4. Whitelist IPs: For development, add `0.0.0.0/0` (allow all); for production, restrict to your server IPs.
5. Get the connection string from the "Connect" button (e.g., `mongodb+srv://username:password@cluster0.mongodb.net/careerconnect`).
6. Set `MONGO_URI` in `server/.env` to this string.
7. Optionally, set TTL indexes for notifications or other collections.
8. Monitor performance metrics and scale as needed.

## Security Checklist
- [ ] Enforce HTTPS for client and API.
- [ ] Store secrets in Netlify/Render environment settings (never commit `.env`).
- [ ] Hash passwords with bcrypt (salt rounds >= 10).
- [ ] Sanitize and validate all inputs (express-validator).
- [ ] Implement CORS whitelist for Netlify domains.
- [ ] Rate limit auth endpoints and track failed attempts.
- [ ] Add audit logging for admin operations.
- [ ] Regularly rotate JWT secrets and admin seed password.

## Roadmap
### Sprint 1 (MVP) ✅ COMPLETE
- ✅ Repo bootstrap (client + server).
- ✅ Auth with JWT and Google OAuth 2.0.
- ✅ Profile CRUD + resume upload + hero section.
- ✅ Feed posts CRUD + like/comment/share + pagination.
- ✅ Opportunities CRUD + apply + admin approval.
- ✅ Netlify + Render deployments live.

### Sprint 2 (Community & Engagement) ✅ COMPLETE
- ✅ Step 1: Admin Console Foundations - Real-time stats dashboard.
- ✅ Step 2: Alumni Recommendations - Skill-based matching, carousel UI.
- ✅ Step 3: Training Opportunities - Curated courses, save for later.
- ✅ Step 4: Feed Engagement Enhancements - Full like/comment/share CRUD.
- ✅ Step 5: Achievements & Badges - Endorsements, leaderboard, points.
- ✅ Step 6: Messaging & Notifications - Inbox, notification bell, real-time.
- ✅ Step 7: Profile Personalization Polish - Hero, editable skills/experience.

### Sprint 3 (Polish & Scale)
- [ ] Connection requests and mutual connections list.
- [ ] Advanced search and filters (skills, location, role).
- [ ] Automated testing (Cypress/Playwright) and CI pipeline.
- [ ] Optional AI resume scoring and match suggestions.
- [ ] Push notifications (web push API).
- [ ] Dark/light theme toggle.
- [ ] Accessibility audit (WCAG 2.1 AA compliance).

## Contributing
1. Fork repository and create feature branch (`git checkout -b feat/amazing-feature`).
2. Ensure linting and tests pass (`npm run lint && npm run test`).
3. Commit with Conventional Commit messages.
4. Push branch and open PR describing changes and testing performed.

## License
MIT License. See `LICENSE` (to be added) for details.
varshitha done 
Rishwith done