# Lost & Found Inventory

Staff log found items, look them up, and record when an item is claimed and returned to its owner.

NestJS + GraphQL + TypeORM API, React + Vite + Apollo Client web app, MySQL 8.4, all runnable with one Docker command.

## Run it

Requires Docker (with Compose v2).

```bash
git clone <this repo> && cd umpisa-exam
docker compose up --build
```

Open **http://localhost:5173** and log in with the demo account:

| Email                  | Password       |
| ---------------------- | -------------- |
| `staff@lostfound.test` | `Password123!` |

On start the API runs the database migrations and, when the `users` table is empty, seeds the demo user and 8 items
(4 unclaimed, 2 claimed, 2 returned). You don't need a `.env` file or any database steps.

| Service | URL                           | Notes                                                |
| ------- | ----------------------------- | ---------------------------------------------------- |
| web     | http://localhost:5173         | Static build served by nginx                         |
| api     | http://localhost:3000/graphql | GraphQL endpoint; `{ health }` is public             |
| db      | `localhost:3307`              | MySQL, user/password/database `lostfound` (dev only) |

Stop with `docker compose down`. Add `-v` to delete the database volume so the next start seeds from scratch.

## What you can do

- **Log an item:** Dashboard → _Log item_ → fill in name, category, where and when it was found → the item opens as
  UNCLAIMED and shows up in the list.
- **Return an item:** Items → search or filter by status → open an item → _Record claim_ (owner name and contact) →
  CLAIMED → _Mark returned_ → RETURNED. A claim can be released back to UNCLAIMED. RETURNED is final.

Screens: `/login`, `/` dashboard (counts by status and the 5 latest items), `/items` list (search and status filter),
`/items/new` log form, `/items/:id` detail with claim and return actions. Every screen except login needs a session;
logged-out visitors are sent to `/login`.

## Local development

Requires Node.js 22.12 or newer.

```bash
docker compose up -d db   # MySQL only, on port 3307
npm install
npm run dev:api           # http://localhost:3000/graphql (watch mode)
npm run dev:web           # http://localhost:5173
```

Stop the `api` and `web` containers first if they're running, since they use the same ports.

Configuration has safe local defaults, so `.env` files are optional. See [api/.env.example](api/.env.example) and
[web/.env.example](web/.env.example) for the variables. The JWT secret default is for development only.

### Scripts (from the repo root)

| Command                                                               | What it does                             |
| --------------------------------------------------------------------- | ---------------------------------------- |
| `npm run dev:api` / `npm run dev:web`                                 | Start one app in watch mode              |
| `npm run build`                                                       | Build both apps                          |
| `npm run lint`                                                        | ESLint in both apps, then Prettier check |
| `npm test`                                                            | Unit tests in both apps                  |
| `npm run format`                                                      | Prettier write                           |
| `npm run migration:generate -w api -- src/database/migrations/<Name>` | Generate a migration from entity changes |

Add `-w api` or `-w web` to `build`, `lint` or `test` to run it for one app.

## Architecture

```
docker-compose.yml   db (mysql:8.4) + api + web; the api waits for a healthy db
package.json         npm workspaces: api, web (one lockfile)
api/                 NestJS 11, GraphQL (Apollo, code-first), TypeORM
  src/auth           login mutation, JWT (HS256, 8h), global guard; @Public() opts out
  src/users          User entity and lookup
  src/items          Item entity, resolver, service, DTO validation, status transitions
  src/database       TypeORM config, migrations, startup seeder
web/                 React 19, Vite, Apollo Client 4, React Router 7
  src/app            Apollo client (auth + error links), routes, config
  src/auth           session store, AuthProvider, ProtectedRoute, login page
  src/pages          dashboard, item list, log form, item detail + claim form
  src/components     layout, status badge, item table, form field, loading/empty/error states
  src/graphql        shared queries and mutations, types, error helpers
```

- **API:** every operation except `login` and `health` requires `Authorization: Bearer <token>`. Inputs are checked with
  class-validator; failures come back as `BAD_USER_INPUT` with per-field messages. Status changes go through one pure
  function, `transition(status, action)` in [api/src/items/item-status.ts](api/src/items/item-status.ts), which allows
  only UNCLAIMED → CLAIMED, CLAIMED → UNCLAIMED and CLAIMED → RETURNED.
- **Database:** schema changes are TypeORM migrations, run on start. `synchronize` is off.
- **Web:** the token is kept in `localStorage`. An `UNAUTHENTICATED` response clears it and the app returns to `/login`.
  Forms mirror the API's validation rules so errors show before submitting.
- **Docker:** both Dockerfiles build from the repo root so they can use the workspace lockfile. The web image bakes in
  `VITE_GRAPHQL_URL` (default `http://localhost:3000/graphql`) and serves the build with nginx, falling back to
  `index.html` for client-side routes.

The full GraphQL contract, business rules and task list are in [PLAN.md](PLAN.md).

## Tests

```bash
npm test            # both apps
npm test -w api     # Jest
npm test -w web     # Vitest + React Testing Library
```

- **api (Jest):** AuthService, the JWT guard, seeder idempotency, ItemsService (create, filter, search, stats, claim,
  release, return), every allowed and rejected status transition, DTO validation rules, config defaults.
- **web (Vitest + RTL, Apollo `MockedProvider`):** login page, ProtectedRoute redirects, session store, item form
  validation, item detail actions per status, dashboard, item list, debounced search.

Unit tests don't need the database.
