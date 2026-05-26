# TEST_STRATEGY.md

> **Why this file exists:** Defines *how* testing is approached on this project — what we test, when, and with what tools. Without this, testing becomes ad-hoc and inconsistent.
>
> **When to update:** When the testing approach changes, a new testing layer is added, or after a major bug reaches production.
>
> **How it helps:** Gives QA and developers a shared framework. Also useful for explaining the testing approach to collaborators or in a portfolio.

---

## Testing Philosophy

This is an MVP built by a small team using AI-assisted development. The testing approach is:

- **Practical over perfect** — manual testing first, automation added incrementally
- **Flow-based** — test complete user journeys, not just individual functions
- **Document everything** — even manual tests should be written down as checklists
- **Edge cases matter** — happy paths aren't enough; think about what users will break

---

## Testing Layers

### 1. Manual Testing (primary, now)

All features are manually tested against real browser + backend behavior.
Checklists live in `/docs/testing/`.

When to run:
- After implementing any new feature
- Before committing major changes
- When fixing a bug (verify fix + regression)

### 2. API Testing (curl / Postman)

Backend routes are tested directly with HTTP requests.
Expected responses documented in `API_TEST_NOTES.md`.

When to run:
- After any backend route change
- When debugging unexpected frontend behavior

### 3. Automated Unit Tests (future)

Not yet implemented. Candidates for automation:
- Input validation logic
- Auth token generation/verification
- Prisma query helpers

### 4. Integration / E2E Tests (future)

Not yet implemented. Candidates:
- Full auth flow (register → login → access protected route)
- Club creation flow (form → API → DB → confirm in list)

---

## What We Test Per Feature

Every feature should be tested across three layers:

| Layer      | What to check                                     |
|------------|---------------------------------------------------|
| Frontend   | Form validation, loading states, error messages, navigation |
| Backend    | API response structure, status codes, error handling |
| Database   | Row created/updated correctly, constraints respected |

---

## Test Documentation

| File                                           | Purpose                              |
|------------------------------------------------|--------------------------------------|
| [TEST_FIXTURES.md](./testing/TEST_FIXTURES.md) | Reusable test data payloads          |
| [EDGE_CASES.md](./testing/EDGE_CASES.md)       | Known tricky scenarios to test       |
| [CREATE_CLUB_TESTS.md](./testing/CREATE_CLUB_TESTS.md) | Tests specific to club creation |
| [API_TEST_NOTES.md](./testing/API_TEST_NOTES.md) | API testing approach and examples  |
| [REGRESSION_CHECKLIST.md](./testing/REGRESSION_CHECKLIST.md) | Pre-commit regression checks |

---

## Bug Reporting Process

When you find a bug:
1. Add it to [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) with a short description and impact level
2. Reproduce it consistently before fixing
3. Fix, then verify the fix works
4. Mark the issue resolved with the date
5. Add a regression test to the relevant checklist

---

## Definition of "Tested"

A feature is considered tested when:
- [ ] Happy path works in browser
- [ ] API returns correct response (200/201 with expected body)
- [ ] Error cases return correct status codes (400, 401, 404, etc.)
- [ ] Invalid input is rejected with a clear message
- [ ] Database reflects the expected state after the operation
- [ ] No console errors in browser dev tools
