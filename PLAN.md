# PLAN — Lost & Found Inventory

**Purpose:** Staff log found items, look them up, and record when an item is claimed and returned to its owner.
**Stack:** NestJS 11 + GraphQL (Apollo, code-first) + TypeORM, React + Vite + TS + Apollo Client + React Router, MySQL 8.4 in Docker, JWT, npm workspaces; Jest (api), Vitest + RTL (web).
Assumptions: staff are the only users (no public portal, no sign-up); one role; ports db 3307, api 3000, web 5173.

## Workflows & Screens
- **W1 Log item:** S0 login → S1 dashboard → S3 "Log item" → fill form → save → S4 detail (UNCLAIMED) → S2 list shows it.
- **W2 Return item:** S2 list → search/filter → S4 detail → "Record claim" (owner name + contact) → CLAIMED → "Mark returned" → RETURNED.
- S0 `/login` (public; redirects to `/` if logged in) · S1 `/` dashboard: counts by status + 5 latest items 🔒
- S2 `/items` list: search box + status filter 🔒 · S3 `/items/new` log form 🔒 · S4 `/items/:id` detail + claim/return actions 🔒
- 🔒 = protected: no token → redirect to `/login`; an UNAUTHENTICATED API error clears the token and redirects.

## Rules
- Status: `UNCLAIMED → CLAIMED` (claimItem), `CLAIMED → UNCLAIMED` (releaseClaim), `CLAIMED → RETURNED` (returnItem). RETURNED is final.
  Any other transition → `BAD_USER_INPUT` "Cannot <action> an item that is <STATUS>". Logic lives in one pure function.
- claimItem sets ownerName, ownerContact, claimedAt; releaseClaim clears them; returnItem sets returnedAt.
- Validation (class-validator, mirrored in forms): name 2–100 chars; description ≤ 500, optional; category is an enum;
  locationFound 2–100; foundAt required, not in the future; ownerName 2–100; ownerContact 5–100; login email valid, password required.
- Search matches name, description or locationFound (case-insensitive). Lists sort by foundAt desc.
- Seed (runs on API start when `users` is empty): demo login **staff@lostfound.test / Password123!** (bcrypt);
  8 items: 4 UNCLAIMED, 2 CLAIMED, 2 RETURNED across categories. Migrations run on start; no `synchronize`.

## Contract
```graphql
scalar DateTime
enum ItemStatus { UNCLAIMED CLAIMED RETURNED }
enum ItemCategory { ELECTRONICS WALLET BAG CLOTHING KEYS DOCUMENTS OTHER }

type User { id: ID!  email: String!  name: String! }           type AuthPayload { accessToken: String!  user: User! }
type Item {
  id: ID!  name: String!  description: String  category: ItemCategory!  locationFound: String!
  foundAt: DateTime!  status: ItemStatus!  ownerName: String  ownerContact: String
  claimedAt: DateTime  returnedAt: DateTime  loggedBy: User!  createdAt: DateTime!
}
type ItemStats { total: Int!  unclaimed: Int!  claimed: Int!  returned: Int! }

input CreateItemInput { name: String!  description: String  category: ItemCategory!  locationFound: String!  foundAt: DateTime! }
input ClaimItemInput { ownerName: String!  ownerContact: String! }

type Query {
  health: String!                          # public, returns "ok"
  me: User!
  items(status: ItemStatus, search: String, limit: Int): [Item!]!
  item(id: ID!): Item!                      # NOT_FOUND if missing
  itemStats: ItemStats!
}
type Mutation {
  login(email: String!, password: String!): AuthPayload!   # UNAUTHENTICATED "Invalid email or password"
  createItem(input: CreateItemInput!): Item!               # status UNCLAIMED, loggedBy = current user
  claimItem(id: ID!, input: ClaimItemInput!): Item!
  releaseClaim(id: ID!): Item!
  returnItem(id: ID!): Item!
}
```
Auth: everything except `login` and `health` needs `Authorization: Bearer <JWT>` (HS256, 8h, payload `{ sub, email }`). Endpoint `http://localhost:3000/graphql`.

## Tasks
- [x] **T1 Scaffold** (`/`, `api/`, `web/`): root npm workspaces, `docker-compose.yml` (mysql:8.4), Nest GraphQL app, Vite React TS app, ESLint/Prettier, Jest/Vitest, `.env.example`, config with safe defaults.
  Check: `docker compose up -d db && npm install && npm run build && npm run lint && npm test` all pass.
- [x] **T2 API auth + seed** (`api/src/auth`, `api/src/users`, `api/src/database`): User entity + migration, bcrypt, login, `me`, global GQL JWT guard with `@Public()`, seeder. Unit tests: AuthService, seeder idempotency.
  Check: `login` with demo creds returns a token; `me` without it → UNAUTHENTICATED.
- [x] **T3 API items** (`api/src/items`): Item entity + migration, createItem, items (filter/search/limit), item, itemStats, DTO validation, seed items. Unit tests: ItemsService, DTO rules.
  Check: `npm test -w api` passes; createItem then `items(search:)` returns it.
- [x] **T4 API status transitions** (`api/src/items`): pure `transition(status, action)`, claimItem/releaseClaim/returnItem. Unit tests: every allowed and rejected transition.
  Check: returnItem on UNCLAIMED → BAD_USER_INPUT; claim → return succeeds.
- [x] **T5 Web shell + login** (`web/src/app`, `web/src/auth`, `web/src/components`): Apollo client + auth link, AuthProvider (localStorage token), ProtectedRoute, layout/nav with logout, S0 login form.
  Check: `npm run build -w web`; demo login lands on `/`; visiting `/items` logged out → `/login`.
- [x] **T6 Web dashboard + list** (`web/src/pages`): S1 stats cards + latest items, S2 list with debounced search and status filter, shared StatusBadge.
  Check: seeded counts 4/2/2 show on S1; filtering S2 to RETURNED shows 2 rows.
- [x] **T7 Web log form + detail** (`web/src/pages`): S3 form with client validation and error display, S4 detail with claim form, release, return buttons shown per status.
  Check: M1 and M2 pass by hand.
- [x] **T8 Web component tests** (`web/src`): Vitest + RTL with Apollo MockedProvider for LoginPage, ProtectedRoute, ItemForm validation, ItemDetail actions per status.
  Check: `npm test -w web` passes.
- [x] **T9 README + fresh-clone run** (`/`, `api/Dockerfile`, `web/Dockerfile`): compose services db+api+web, README (setup, demo login, scripts, architecture, tests).
  Check: M3 passes.

## Checks
- **M1 (W1):** log in as demo → Log item (name "Blue umbrella", OTHER, "Lobby", today) → detail shows UNCLAIMED → S2 search "umbrella" finds it → S1 unclaimed = 5. Future foundAt or 1-char name shows a field error.
- **M2 (W2):** S2 filter UNCLAIMED → open item → Record claim ("Ana Cruz", "ana@mail.com") → CLAIMED with owner shown → Mark returned → RETURNED, returnedAt shown, no action buttons.
- **M3 (fresh clone):** `git clone` into an empty dir → `docker compose up --build` → open `http://localhost:5173` → demo login works, seeded items listed. No manual `.env` or DB steps.

## Exam requirements
| Requirement | Where it is met |
|---|---|
| Login page | S0 `/login`, JWT `login` mutation (T2, T5) |
| 2 workflows | W1 log item, W2 claim → return (M1, M2) |
| 4 screens besides login | S1 dashboard, S2 list, S3 log form, S4 detail (T6, T7) |
| Runs out of the box | `docker compose up --build`, migrations + seed on start, config defaults (T9, M3) |
| Unit tests | Jest in `api/` (T2–T4), Vitest + RTL in `web/` (T8) |
| README | Root `README.md` (T9) |
