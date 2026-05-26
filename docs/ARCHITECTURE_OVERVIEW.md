# ARCHITECTURE_OVERVIEW.md

> **Why this file exists:** Explains how Clubora is built — the layers, the data flow, and why decisions were made. Written for a PM or QA reader who wants to understand the system without reading code.
>
> **When to update:** When a major architectural change is made — new layer, new service, new database, changed communication pattern.
>
> **How it helps:** Prevents confusion about "where does X live?" and helps onboard new contributors quickly.

---

## The Big Picture

Clubora is a **three-layer web application**:

```
Browser (React)
      ↓  HTTP requests
   API (Express)
      ↓  Prisma ORM
  Database (SQLite)
```

Each layer has a clear job. They don't do each other's job.

---

## Layer 1: Frontend (React)

**Location:** `/frontend/src/`

**Job:** Show the UI. Collect user input. Call the API.

**What it does:**
- Renders pages and components in the browser
- Manages navigation between pages (React Router)
- Sends HTTP requests to the backend API (Axios)
- Displays data returned from the API
- Shows loading states and error messages

**What it does NOT do:**
- Talk to the database directly
- Store sensitive data (passwords, secrets)
- Implement business logic (e.g. "can this user join this club?")

**Key folders:**
```
frontend/src/
├── pages/         One file per route (Landing, Login, Dashboard, etc.)
├── components/    Shared UI pieces (Navbar, buttons, etc.)
└── api/           Axios client — one place for all API calls
```

**How routing works:**
React Router maps URLs to page components. Example:
- `/` → `Landing.jsx`
- `/explore` → `ExploreClubs.jsx`
- `/clubs/:id` → `ClubDetails.jsx`

---

## Layer 2: Backend (Express API)

**Location:** `/backend/src/`

**Job:** Handle requests, run business logic, talk to the database.

**What it does:**
- Receives HTTP requests from the frontend
- Validates the request data
- Runs business logic (auth checks, permission checks, etc.)
- Queries the database via Prisma
- Returns a structured JSON response

**What it does NOT do:**
- Render HTML or JSX
- Store files on disk (yet)

**Key folders:**
```
backend/src/
├── index.js        App entry point — starts the server
├── routes/         Route definitions (which URL does what)
├── controllers/    Business logic for each route (future)
└── middleware/     Shared request processing (auth, logging, etc.)
```

**How a request flows through the backend:**
```
Request arrives
      ↓
Middleware (CORS, JSON parsing, auth check)
      ↓
Route handler (/api/clubs → clubs.js)
      ↓
Controller (validate input, run logic)
      ↓
Prisma query (read/write database)
      ↓
JSON response sent back
```

**API base URL:** `http://localhost:5000/api`

---

## Layer 3: Database (SQLite + Prisma)

**Location:** `database/dev.db`, schema at `backend/prisma/schema.prisma`

**Job:** Persist all application data.

**What it does:**
- Stores Users, Clubs, and Memberships
- Enforces data constraints (unique emails, unique memberships)
- Handles relationships between entities

**What Prisma does:**
Prisma is an ORM (Object-Relational Mapper). It translates JavaScript function calls into SQL queries, so we never write raw SQL.

```js
// Instead of: SELECT * FROM clubs WHERE id = 1
await prisma.club.findUnique({ where: { id: 1 } })
```

**Why SQLite for now:**
SQLite stores the entire database in a single file. It's perfect for development and small MVPs because there's nothing to install or configure. The plan is to migrate to PostgreSQL for production.

---

## Data Flow: Full Example

**User clicks "Explore Clubs"**

```
1. Browser navigates to /explore
2. ExploreClubs.jsx renders
3. useEffect runs: api.get('/clubs')
4. Axios sends: GET http://localhost:5000/api/clubs
5. Express receives request
6. clubs.js route handler runs
7. Prisma: prisma.club.findMany()
8. SQLite returns rows
9. Express sends: { clubs: [...] }
10. Axios receives response
11. React updates state: setClubs(res.data.clubs)
12. Page re-renders with club list
```

---

## Environment Configuration

| Variable      | Where set        | Purpose                        |
|---------------|------------------|--------------------------------|
| PORT          | backend/.env     | Express server port (5000)     |
| DATABASE_URL  | backend/.env     | Path to SQLite file            |
| JWT_SECRET    | backend/.env     | Secret for signing auth tokens |
| CLIENT_URL    | backend/.env     | Allowed CORS origin            |
| VITE_API_URL  | frontend/.env    | API base URL for Axios client  |

---

## Architecture Decisions

| Decision                  | Reason                                                    |
|---------------------------|-----------------------------------------------------------|
| React + Vite              | Fast development server, modern tooling, small bundle     |
| Express 5                 | Simple, well-understood, minimal boilerplate              |
| SQLite (initial)          | Zero-config, file-based — perfect for MVP development     |
| Prisma ORM                | Type-safe queries, readable schema, easy migrations       |
| Separate frontend/backend | Clear separation of concerns, can deploy independently    |
| Plain CSS (no framework)  | Keeps it simple and learnable; can add Tailwind later     |

---

## What Comes Next (Architecture)

As the project grows, these layers may be added:
- **Auth middleware** — JWT verification on protected routes
- **Services layer** — Extract business logic out of route handlers
- **PostgreSQL** — Replace SQLite when deploying for real users
- **Environment-specific configs** — dev / staging / production
