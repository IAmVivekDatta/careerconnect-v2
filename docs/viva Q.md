────────────────────────
1️⃣ PROJECT INITIALIZATION
────────────────────────

**Why MERN?**

- **Single language cognition:** JavaScript + TypeScript from browser to database eliminates context switching; onboarding juniors is faster and bug triage happens in one mental model.
- **Realtime-friendly:** Node’s event loop + MongoDB’s flexible docs make sockets, feeds, and chat inexpensive to prototype.
- **Ecosystem gravity:** Hiring pipelines, community tooling, and cloud-native templates overwhelmingly support MERN, so future contributors are easy to find.

**Why Node.js runtime?**

- Built on V8 JIT, giving near-native performance for JSON-heavy workloads.
- Non-blocking I/O means each request is like a call ticket dropped in an event queue; while Mongo waits, Node keeps serving other clients—perfect for networking platforms.
- Ships with npm, so dependency management + scripting stay uniform.

**Express vs bare Node HTTP**

- Express wraps the verbose `http.createServer` ceremony with routing, middleware chains, and error handling. Without it, every endpoint would manually parse URLs, headers, and payloads.
- Middleware pipeline = Lego bricks: logging, auth, rate limiting snap in/out without rewriting core handlers.

**MongoDB vs SQL**

- Document data mirrors how alumni profiles actually look—nested achievements, arrays of mentors—without rigid table migrations.
- Schema evolves iteratively; new fields roll out with zero downtime, crucial during hackathon-style feature sprints.
- Aggregation pipeline covers analytics, so we keep the tech stack lean.

**npm vs yarn**

- npm v9+ solved historical speed gaps; sticking with npm avoids Yarn/PNPM lockfile divergence on CI/CD and removes extra tooling training for contributors.

**package.json (key lines)**

| Field             | Why it matters                                                          |
| ----------------- | ----------------------------------------------------------------------- |
| `name`, `version` | Identify the package for tooling + semantic release hooks.              |
| `scripts`         | Declarative CLI entry points; `npm run dev` becomes canonical for docs. |
| `dependencies`    | Runtime libraries bundled into production build.                        |
| `devDependencies` | Tooling (TypeScript, Vitest, ESLint) stripped from prod images.         |
| `type`: `module`  | Enables ES Modules, aligning backend imports with frontend style.       |

**Scripts section rationale**

- `dev`: hot reload server/client; fosters rapid feedback.
- `build`: deterministic artifact for Netlify/Render; stops “works on my machine” by compiling ahead of deploy.
- `start`: production-only entry that runs compiled JS (no ts-node overhead).
- `lint`/`test`: guardrails invoked by CI; failing fast prevents broken merges.

**Environment variables**

- Keep secrets (JWT keys, DB URIs) out of Git; Twelve-Factor compliance.
- Flow: `.env` (local) → `dotenv` load → `process.env` usage → validated by `env.ts`.
- Interview hook: mention layered configs (`.env`, `.env.production`, deployment secrets) and the risk of hardcoding keys.

**Interview & Viva Q/A**

- _Q:_ “If Mongo is schema-less, why bother with TypeScript interfaces?”
  _A:_ TypeScript provides compile-time schema; Mongo handles runtime storage. Together they guard both ends—skip one and either devs break at compile-time or data corrupts silently.
- _Q:_ “Could you swap Express with Fastify mid-project?”
  _A:_ Technically yes, but middleware + router contracts shift. Express is battle-tested, so we prioritized stability over marginal perf gains.
- _Q:_ “Why not host React and Express in one repo/process?”
  _A:_ Separation gives independent deployments. A client-only bug shouldn’t redeploy the API.

────────────────────────
2️⃣ FRONTEND (REACT) — DEEP DIVE
────────────────────────

**What is React?**

- A declarative UI engine: you describe _state → UI_ mapping, React renders and re-renders as state changes, diffing via the virtual DOM.

**Why components?**

- Components encapsulate markup + behavior; they’re the “functions” of UI. Splitting ensures reuse (buttons, cards) and isolates bugs.

**Atomic Design rationale**

```
Atom: Button → single responsibility (click action)
Molecule: FormControl → composes Button + Input
Organism: LoginSection → arranges molecules with logic
Page: LoginPage → wires organisms to routing + data
```

Skipping this leads to 500-line monolith components where one change breaks unrelated UI.

**Why JSX?**

- JSX is syntactic sugar letting us write HTML-like code inside JS while retaining full JS power (conditions, loops). It compiles to `React.createElement`, so tooling can analyze trees.

**Virtual DOM motivation**

- Avoids direct DOM thrash. React batches updates and diffs the virtual representation vs the real DOM, minimizing costly browser operations.

**Hooks over classes**

- Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) offer composable logic reuse. Classes made lifecycle sharing painful; hooks let us abstract socket hydration into custom hooks.

**Props vs State**

- Props = external inputs, immutable within the component.
- State = internal data the component owns; changing it triggers re-render.
- Interview tip: mention lifting state up to avoid duplication and using `useReducer` when state transitions are complex.

**Folder structure defense**

| Folder        | Why                                                             |
| ------------- | --------------------------------------------------------------- |
| `components/` | Houses atoms→organisms; ensures design consistency.             |
| `pages/`      | Route-level containers orchestrating data fetch + layout.       |
| `hooks/`      | Share logic (e.g., socket lifecycle) without repeating effects. |
| `lib/`        | Axios instance, utilities so networking lives in one place.     |
| `store/`      | Zustand slices keep global UI/auth state explicit.              |
| `providers/`  | React contexts (Theme, Socket) mounted once in `main.tsx`.      |
| `types/`      | Shared TypeScript defs; fosters contract alignment with server. |

**Naming convention**

- PascalCase for components, camelCase for hooks, `use` prefix for hook discovery.

**Axios vs Fetch**

- Axios gives interceptors (token injection, 401 logout), automatic JSON parsing, and request cancellation. With fetch, we’d reimplement that per call.

**State management choice (Zustand)**

- Lightweight, minimal boilerplate, great for auth + theme toggles; React Query handles server cache, so Redux would be overkill.

**Performance & mistakes**

- Use `React.memo` or `useMemo` to avoid rerenders on heavy organisms.
- Mistakes: mutating state directly, forgetting dependency arrays, coupling API calls outside hooks (breaking SSR/HMR logic).

**Interview prompts**

- _Q:_ “Why not store JWT in Context instead of Zustand?”
  _A:_ Context re-renders every consumer on any change; Zustand updates are more granular and persist automatically.
- _Q:_ “What if we keep all code in `App.tsx`?”
  _A:_ Merge conflicts explode, readability plummets, and performance tuning (memoization, lazy loading) becomes impossible.

────────────────────────
3️⃣ BACKEND (NODE + EXPRESS)
────────────────────────

**Express internals**

- A thin layer over Node’s HTTP module: it registers route handlers in a stack and iterates through middleware arrays until one matches.

**Middleware**

- Functions with `(req, res, next)` signature. They act like airport checkpoints—passport control (auth), customs (validation), security (rate limits) before boarding (controller).

**Why MVC / layered**

- Controller handles HTTP translation, Service enforces business logic, Repository (Mongoose) handles persistence. This separation keeps unit tests targeted and prevents massive god functions.

**REST preference**

- Aligns with browser/HTTP caching, predictable verbs, and client compatibility. GraphQL wasn’t chosen because our data shape is mostly REST-friendly lists.

**HTTP verbs**

- GET read-only, POST create, PUT/PATCH update, DELETE remove. Interviewers expect you to mention idempotency.

**Auth vs AuthZ**

- Authentication = “Who are you?” Authorization = “What can you do?” Admin dashboards rely on both.

**JWT rationale**

- Stateless, no server session store, easier scaling with multiple API pods. Short-lived tokens reduce risk; refresh tokens issued via secure endpoints.

**Password hashing (bcrypt)**

- Adds salt + cost factor; if DB leaks, raw passwords stay safe. `bcrypt.compare` prevents timing attacks.

**Centralized error handling**

- One middleware catches thrown errors, shapes consistent JSON, and logs stack traces; otherwise every controller duplicates try/catch.

**Security concerns**

- SQL Injection replaced by NoSQL injection (guard with parameterized queries/validation).
- XSS mitigated through frontend sanitization + React’s auto-escaping.
- CORS configured to permit only trusted origins.

**Backend folder structure**

| Folder         | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `controllers/` | HTTP entry points, minimal logic.               |
| `services/`    | Business workflows (e.g., connection requests). |
| `models/`      | Mongoose schemas + statics.                     |
| `routes/`      | Express routers per domain.                     |
| `middlewares/` | Auth, admin, error handlers.                    |
| `config/`      | Env + DB initialization.                        |
| `utils/`       | helpers (Cloudinary, token helpers).            |

**Interview traps**

- _Q:_ “If middleware order changes, what breaks?”
  _A:_ Auth must run after body parsing but before controllers; misordering leads to `req.body` undefined or skipped auth checks.
- _Scenario:_ “API spike hits 10k req/s—what bottlenecks?”
  _A:_ Mongo connections saturate; solution = connection pooling + caching layer.

────────────────────────
4️⃣ DATABASE (MONGODB)
────────────────────────

**Mongo internals**

- Stores BSON documents on disk, uses WiredTiger engine with compression + journaling. Document store = flexible JSON-like rows.

**Collections vs Documents**

- Collection = table equivalent; documents = individual JSON objects with their own schema (or lack thereof). This best matches our varying user profiles.

**Schema design choices**

- `User` holds base info; achievements embedded because they’re always read with the profile. Messages reference conversation IDs to avoid duplicating text.

**Why Mongoose?**

- Gives schemas, middleware hooks, validation, and TypeScript typings; raw Mongo driver would mean manual schema enforcement everywhere.

**Indexes**

- `email` unique index for login, compound index on `opportunities` (status + tags) for filtering. Without them, query latency balloons as collections grow.

**Relationships: embed vs reference**

- Embed when data is tightly coupled and read together (achievements). Reference when data is large/mutable (messages, posts) to avoid document bloat.

**Transactions**

- Needed when multi-document atomicity matters (e.g., transferring credits). Not default here, but mention Mongo’s session-based transactions as scale requirement emerges.

**Common schema mistakes**

- Unbounded arrays causing document size >16MB.
- Forgetting to set default timestamps, making analytics painful.

────────────────────────
5️⃣ FULL STACK CONNECTION
────────────────────────

**Lifecycle: button click → DB response**

```
User clicks “Connect”
	↓ onClick handler triggers React state + calls `api.post`
Axios attaches JWT header via interceptor
	↓ request crosses CORS boundary (preflight if needed)
Express router receives → auth middleware validates token
	↓ controller delegates to service
Service writes/reads Mongo via Mongoose
	↓ response serialized as JSON
Axios resolves promise → React Query/Zustand update
	↓ UI re-renders to show new connection state
```

**CORS rationale**

- Browsers block cross-origin requests by default; CORS headers explicitly allow trusted origins, stopping malicious sites from hijacking tokens.

**API security best practices**

- HTTPS everywhere, rate limiting, input validation, logging suspicious activity, and revoking tokens on role changes.

────────────────────────
6️⃣ TESTING
────────────────────────

**Why test?**

- Proves contracts still hold during refactors, documents behavior, and instills confidence before deploys.

**Types of tests**

- Unit: isolate functions (e.g., `formatOpportunity`).
- Integration: Express + Mongo memory server verifying endpoints.
- E2E: Browser automation (Playwright/Cypress) clicking through flows.

**Tools**

- Vitest for frontend (fast, TS aware).
- Jest + Supertest for backend.

**Interview expectations**

- Know how to mock DB calls, use in-memory Mongo for integration, and assert HTTP status codes.

**Common mistakes**

- Relying only on manual testing, ignoring negative cases, or not resetting stores between tests leading to flaky suites.

────────────────────────
7️⃣ DEPLOYMENT & PRODUCTION
────────────────────────

**Local vs Production**

- Local uses hot reloaders, debug logging, and `.env`. Production uses compiled assets, minified code, and environment secrets from the platform.

**Build process**

- Client: Vite → Rollup builds hashed static files.
- Server: `tsc` outputs JS to `dist`, run via `node dist/index.js`.

**Hosting choices**

- Netlify (or Vercel) for static frontend with global CDN.
- Render/Fly/Heroku for Node API with attached Mongo Atlas cluster.

**Environment variables in prod**

- Injected via platform dashboards or secrets managers; never baked into image.

**CI/CD**

- GitHub Actions triggers lint/test/build on every PR, deploys on main merges. Prevents “it compiles locally but not in prod.”

**Scaling basics**

- Likely pain first: Mongo connection saturation, WebSocket fan-out; mitigation via Redis pub/sub and horizontal pods with load balancer.

**Monitoring/logs**

- Without logs (Winston, Datadog), diagnosing production issues is guesswork. Structured logs + health checks keep SLA credible.

────────────────────────
8️⃣ COMMANDS & TOOLS
────────────────────────

| Command                       | Internal mechanics                                                        | Failure mode when misused                           |
| ----------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| `npm install`                 | Reads package.json, resolves semver tree, writes node_modules + lockfile. | Missing lock leads to prod drift.                   |
| `npm run dev --prefix client` | Invokes Vite dev server; ESBuild compiles TSX in-memory.                  | Using in prod exposes debug endpoints.              |
| `npm run dev --prefix server` | tsx/ts-node compiles TS on fly; nodemon restarts on change.               | Heavy in prod, eats memory.                         |
| `npm run build`               | Runs TypeScript compiler/ Vite bundler to produce artifacts.              | Skipping build means deploy serves untranspiled TS. |
| `npm start --prefix server`   | Runs Node on compiled JS.                                                 | If dist missing, app crashes.                       |
| `concurrently`                | (If used) runs client + server dev servers in one terminal for DX.        | Without quoting commands, Windows shells break.     |

────────────────────────
9️⃣ RAPID FIRE INTERVIEW ROUND
────────────────────────

1. Why MERN for realtime networking? → Shared language, event-driven servers, flexible schema.
2. What happens on `npm run dev`? → npm resolves script, starts Vite/ts-node, watchers reload.
3. Difference between `dependencies` and `devDependencies`? → Runtime vs build-time.
4. Why `.gitignore node_modules`? → Deterministic installs via package-lock, reduces repo size.
5. What if you store secrets in Git? → Rotate immediately; pipeline compromise risk.
6. Explain JSX compilation. → Babel/TypeScript transpile to `React.createElement` calls.
7. When use `useMemo`? → Cache expensive calculations between renders.
8. Why custom hooks? → Share logic w/o HOC nesting, keep components lean.
9. Props drilling solution? → Context or state store (Zustand) for shared state.
10. How to prevent React re-render storms? → Memoization, key props, slice state appropriately.
11. What does Axios interceptor do? → Modify requests/responses globally (token injection).
12. REST vs GraphQL? → REST simpler for uniform resources; GraphQL needed for complex querying but adds server/client complexity.
13. Express middleware order importance? → Sequence defines security; misplaced middleware can expose endpoints.
14. Controller vs service difference? → Controller handles HTTP; service handles business rules.
15. Purpose of Mongoose schema? → Enforce shape, add validation hooks, indexes.
16. Explain async/await in Node. → Syntactic sugar for Promises allows linear-looking async code.
17. What is CORS and why? → Browser security to block cross-origin requests unless allowed.
18. JWT vs sessions? → JWT stateless, easier horizontal scaling; sessions require shared store.
19. Why hash passwords? → Prevent plaintext exposure; bcrypt adds computational cost for attackers.
20. How do you invalidate JWTs? → Short TTL + blacklist/refresh tokens.
21. Typical HTTP status codes used? → 200, 201, 204, 400, 401, 403, 404, 409, 500.
22. Mongo vs SQL trade-off? → Flexibility vs strict relations; choose based on data consistency needs.
23. When embed documents? → Tight coupling, read with parent; else reference.
24. Index cost? → Faster reads, slower writes, more RAM.
25. How to handle schema evolution? → Add versioning, migration scripts, default values.
26. What is the event loop? → Node’s single-threaded request orchestrator handing off I/O to libuv.
27. Why lint? → Enforce style + catch bugs (unused vars, unsafe hooks) before runtime.
28. Unit vs integration test difference? → Scope (isolated function vs multiple modules).
29. How to deploy? → Build assets, upload to Netlify, push API to Render with env secrets.
30. CI/CD benefit? → Automates testing/deploy, reduces human error.
31. Scaling sockets? → Redis adapter + sticky sessions.
32. Security for uploads? → Validate mimetype, size, use signed URLs.
33. Prevent NoSQL injection? → Whitelist fields, use Mongoose validators.
34. Handle rate limiting? → express-rate-limit or Redis-based counters.
35. Logging best practice? → Structured logs with request IDs.
36. Why use `.env.example`? → Document required env keys for teammates.
37. How to share types between front/back? → Create shared DTO file or package.
38. React key prop importance? → Helps diffing; wrong keys cause flicker.
39. Why avoid anonymous functions in JSX loops? → Recreated each render, can hurt performance.
40. Purpose of `useEffect` cleanup? → Unsubscribe sockets/timers to avoid leaks.
41. Node cluster module? → Spawns worker processes for multi-core usage.
42. Why not global try/catch everywhere? → Centralized error middleware handles it; scattering leads to inconsistency.
43. How to secure Mongo URI? → Use env vars + IP whitelist/VPC peering.
44. Typescript `any` risks? → Opts out of safety, hides bugs.
45. When to use `useReducer`? → Complex state transitions needing explicit actions.
46. Purpose of service layer caching? → Lower DB hits, improve latency.
47. API versioning approach? → Route prefix (`/api/v1`) or header-based, ensures backwards compatibility.
48. Handling file uploads? → Multer middleware + Cloudinary helper.
49. How to share validation logic? → Zod/Yup schemas used both on client/server.
50. Deployment rollback strategy? → Keep previous artifact, support blue-green or versioned builds.

────────────────────────
🔟 COMMON CONFUSIONS & MYTH BUSTING
────────────────────────

- **“Why not do everything in one file?”**
  - Code rot accelerates, Git diff noise explodes, and performance tuning dies. Modular files map to team ownership and testability.

- **“Why React if HTML/CSS already work?”**
  - React manages stateful, interactive UIs with predictable diffing. Vanilla DOM manipulation doesn’t scale for realtime dashboards.

- **“Why backend at all?”**
  - Security ( JWT signing, hashing), business rules, and DB access belong server-side. Frontend-only apps expose secrets and trust the client too much.

- **“Why is this architecture industry standard?”**
  - Separation of concerns, independent scaling, clear contracts. Teams can own slices (frontend, backend, infra) without stepping on each other.

**Final reminder:** Treat every layer like a courtroom testimony—explain what it does, _why_ it exists, and what fails if it’s removed. Walking into interviews with that mindset makes your answers sound seasoned and battle-tested.
