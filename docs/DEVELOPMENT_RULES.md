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

## Feature Request & Requirements Process

Every feature must pass through this flow before a single line of implementation code is written:

```
Idea
↓
Feature Request       — what is it and why does it matter?
↓
Requirements Doc      — write or update the feature doc in /docs/features/
↓
Testing Considerations — define edge cases and QA notes upfront
↓
Implementation        — backend first, then frontend
↓
Validation            — manual test against the requirements doc
↓
Commit                — clear message, all checklist items passed
```

**Why this order matters:** Requirements written after the fact describe what was built, not what was needed. Writing them first surfaces gaps before they become bugs.

---

### Requirements Document Rules

Every feature must have a matching document in `/docs/features/` that is written **before implementation starts** and updated if anything changes during implementation.

Each requirements doc must define:

- **Business purpose** — why does this feature exist? what user problem does it solve?
- **User workflow** — step-by-step: what does the user do?
- **Frontend responsibilities** — which page, what form fields, what states to handle
- **Backend responsibilities** — which endpoint, what method, what it validates and returns
- **DB interactions** — what gets created, updated, read, or deleted
- **Validation rules** — what input is valid, what is rejected, and with what error
- **Edge cases** — what can go wrong? what unusual inputs should be handled?
- **QA / testing considerations** — happy path, error scenarios, regression risk

If any of these sections are missing, the feature is not ready to implement.

---

### AI-Assisted Workflow Rules

When using AI to implement a feature:

- Share the relevant feature doc with the AI at the start of the session — don't rely on the AI inferring requirements from scratch.
- Ask the AI to review the requirements doc and flag any gaps **before** writing code.
- If the AI suggests something that isn't in the requirements, evaluate it against MVP scope rules before accepting it.
- After implementation, compare the output against the requirements doc — if they diverge, either update the doc or update the code.

---

### Post-Implementation Rules

After a feature is implemented:

- Update the feature doc to reflect how it was actually built (if it changed during implementation).
- Add any new edge cases discovered during development to `EDGE_CASES.md`.
- Update `REGRESSION_CHECKLIST.md` if the feature touches auth, clubs, DB persistence, or navigation.
- Update `FEATURES.md` status from 🔧 to ✅.

---

### Feature Implementation Checklist

Use this before marking any feature ready to commit:

- [ ] Requirements documented in `/docs/features/`
- [ ] Architecture reviewed — fits existing patterns, no unnecessary new layers
- [ ] Validation rules defined and implemented (frontend + backend)
- [ ] Edge cases reviewed against `EDGE_CASES.md`
- [ ] Testing notes added to the feature doc or `/docs/testing/`
- [ ] Implementation completed (backend route + frontend wired up)
- [ ] Manually tested: happy path + at least two error cases
- [ ] Documentation updated to reflect actual implementation
- [ ] `FEATURES.md` status updated
- [ ] Ready to commit

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

Every feature follows this sequence. Do not skip steps.

```
1. Idea
   └── Capture what the feature is and why it's needed

2. Feature Request
   └── Add a stub to FEATURES.md — name, purpose, status: 📋

3. Requirements Doc
   └── Write /docs/features/<FEATURE>_FLOW.md
       Must cover: user workflow, frontend, backend, DB, validation, edge cases, QA

4. Testing Considerations
   └── Review EDGE_CASES.md for anything relevant
       Add QA checklist to the feature doc before touching code

5. Implementation
   a. Backend first — implement the route, test with curl or Postman
   b. Frontend second — wire the page/form to the tested API

6. Validation
   └── Run through the feature doc's QA checklist manually
       Verify DB state, API responses, and UI behavior together

7. Commit
   └── Clear commit message describing what was built
       All Definition of Done items checked
```

Do not implement frontend before the backend API is tested. Do not commit before the QA checklist passes.
