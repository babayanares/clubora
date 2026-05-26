# DEVELOPMENT_RULES.md

> **Why this file exists:** Governance for how Clubora is built. These rules prevent scope creep, inconsistent patterns, and technical debt. They apply to human and AI-generated code equally.
>
> **When to update:** When a rule is proven wrong, a new pattern is adopted, or the project meaningfully grows in scope.
>
> **How it helps:** Every contributor (or AI session) can read this and understand how to build correctly for this project. Think of it as the project's constitution.

---

## Architecture Rules

- Frontend and backend responsibilities are strictly separated — the frontend displays data, the backend manages data.
- The frontend must **never** access the database directly.
- All business logic (validation, permissions, data transformation) lives in the **backend**.
- All database interactions go through **Prisma** — no raw SQL unless absolutely necessary.
- Keep folder structure clean: routes stay in `routes/`, shared logic goes in `middleware/` or `controllers/`.
- The API is the only communication channel between frontend and backend.

---

## Feature Development Rules

Every new feature must have, before implementation begins:
- A clear **business purpose** (why does this exist? what user problem does it solve?)
- A **frontend plan** (which page, what form fields, what does the user see?)
- A **backend plan** (which API endpoint, what method, what does it accept?)
- **Validation rules** defined (what input is valid? what's rejected?)
- **Database interaction** described (what gets created/updated/read/deleted?)
- A stub in `FEATURES.md` marking the feature as "in progress"

Every feature must have a matching doc in `/docs/features/` before it's marked done.

---

## MVP Scope Rules

- Avoid adding complexity that isn't required by the current feature.
- No advanced features unless explicitly discussed and approved.
- Build **one complete flow at a time** — finish end-to-end before starting the next.
- Prefer boring, readable solutions over clever ones.
- If a feature takes more than a few hours to implement, break it into smaller steps.
- Post-MVP ideas belong in `FEATURES.md` under "Post-MVP", not in the code.

---

## Frontend Rules

- Every form must validate input **before** submitting to the API.
- Every API call must have a **loading state** (disable button, show spinner or message).
- Every API call must handle **errors** and display a message to the user — never fail silently.
- Pages should be **readable and focused** — one page does one job.
- Extract UI that appears in two or more places into a component in `/components/`.
- Do not store sensitive data (passwords, tokens) in component state — use appropriate storage.
- Protect routes that require authentication — unauthenticated users get redirected to `/login`.

---

## Backend Rules

- Every route must return a **consistent JSON response structure**:
  - Success: `{ data: ... }` or `{ message: "..." }`
  - Error: `{ error: "Human-readable message" }`
- Every route must return the **correct HTTP status code**:
  - 200 — success (GET, PATCH)
  - 201 — created (POST)
  - 400 — bad request (validation failure)
  - 401 — unauthorized (not logged in)
  - 403 — forbidden (logged in but not allowed)
  - 404 — not found
  - 500 — unexpected server error
- Validate **all** incoming request data before processing it.
- Never trust the client — re-verify permissions on every protected route.
- Separate route definitions (`routes/`) from business logic (`controllers/`).
- Add a global error handler to catch unhandled errors and prevent crashes.

---

## Database Rules

- Always use **Prisma migrations** to change the schema — never modify the DB file directly.
- Every migration must have a **descriptive name** (`npx prisma migrate dev --name add_bio_to_user`).
- Document every schema change in `DB_SCHEMA_NOTES.md`.
- Use **meaningful model and field names** — they should be self-explanatory.
- Passwords must be **hashed** (bcrypt) before storing in the database. Always.
- Enforce uniqueness constraints in the schema (e.g. unique email, unique user+club membership).
- Do not store calculated or derived data — compute it from existing fields at query time.

---

## QA & Testing Rules

- Every feature requires **manual testing** before it's considered done.
- The definition of done checklist (below) must pass before marking a feature complete.
- Every edge case must be **documented** — either it's handled, or it's a known issue.
- Update the **regression checklist** after any feature that touches auth, clubs, or DB persistence.
- Test the full stack together: frontend form → API call → DB state — not just in isolation.
- Bugs must be logged in `KNOWN_ISSUES.md` before being fixed.

---

## AI-Assisted Development Rules

- Always share **relevant context** at the start of an AI session (current project state, what you're building, what already exists).
- Explicitly ask for **simple solutions** — AI will default to adding features unless told not to.
- Review all AI-generated code against these rules before accepting it.
- If generated code introduces a pattern that doesn't match this project, ask AI to refactor it to match.
- Prefer **maintainability over cleverness** — if you can't explain the code in a sentence, it's too complex.
- When requirements are unclear, clarify them **before** asking AI to implement — bad requirements produce bad code fast.
- Document significant AI-assisted decisions in `AI_WORKFLOW_NOTES.md`.

---

## Documentation Rules

- Update `FEATURES.md` whenever a feature status changes.
- Update `KNOWN_ISSUES.md` when a bug is found or fixed.
- Update `DB_SCHEMA_NOTES.md` after every migration.
- Feature flow docs (`/docs/features/`) must reflect the actual implementation, not the original plan.
- If a decision is made during implementation that differs from the doc, **update the doc**.
- The README must always have working run instructions.

---

## Definition of Done

A feature is **done** when all of these are true:

- [ ] Feature is implemented and works in the browser
- [ ] Input validation is in place (frontend + backend)
- [ ] API returns correct status codes and response structure
- [ ] Database reflects the expected state after the operation
- [ ] Error cases are handled and shown to the user
- [ ] No unhandled console errors in the browser
- [ ] No unhandled server crashes for bad input
- [ ] Manual test completed (happy path + at least one error case)
- [ ] Feature doc in `/docs/features/` is updated
- [ ] `FEATURES.md` status updated to ✅
- [ ] Any new issues added to `KNOWN_ISSUES.md`

---

## Implementation Workflow

Every feature follows this sequence:

```
1. Requirements
   └── What does this feature do? Who uses it? What can go wrong?

2. Documentation
   └── Write or update the feature doc in /docs/features/

3. Backend first
   └── Implement the API route → test with curl or Postman

4. Frontend second
   └── Wire the page/form to the tested API

5. Testing
   └── Run through the manual test checklist

6. Review
   └── Check against Definition of Done

7. Commit
   └── Clear commit message describing what was built
```

Do not skip steps. Do not implement frontend before the API works.
