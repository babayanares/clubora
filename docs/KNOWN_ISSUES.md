# KNOWN_ISSUES.md

> **Why this file exists:** A living record of bugs, limitations, and rough edges. Writing issues down prevents them from getting lost or re-discovered later.
>
> **When to update:** Whenever a bug is found (add it) or fixed (mark it resolved). Do not delete resolved issues — keep them for reference.
>
> **How it helps:** Gives QA and devs a shared memory. Also useful for demonstrating project maturity to collaborators.

---

## Status Legend

| Symbol | Meaning          |
|--------|------------------|
| 🐛     | Open bug         |
| ⚠️     | Known limitation |
| ✅     | Resolved         |
| 🔍     | Under investigation |

---

## Open Issues

### Backend

| ID    | Status | Description                                                  | Impact  |
|-------|--------|--------------------------------------------------------------|---------|
| BE-01 | ⚠️     | Auth routes are stubbed — no real login/register logic yet   | High    |
| BE-02 | ⚠️     | No input validation on any route yet                         | High    |
| BE-03 | ⚠️     | No authentication middleware — all routes are public         | High    |
| BE-04 | ⚠️     | Passwords are not hashed (bcrypt not yet installed)          | Critical |
| BE-05 | ⚠️     | No error handling middleware — unhandled errors crash server  | Medium  |

### Frontend

| ID    | Status | Description                                                  | Impact  |
|-------|--------|--------------------------------------------------------------|---------|
| FE-01 | ⚠️     | Forms submit but don't call real API yet (console.log only)  | High    |
| FE-02 | ⚠️     | No loading states or error messages shown to user            | Medium  |
| FE-03 | ⚠️     | No protected routes — dashboard accessible without login     | High    |
| FE-04 | ⚠️     | Navbar shows all links regardless of auth state              | Low     |

### Database

| ID    | Status | Description                                                  | Impact  |
|-------|--------|--------------------------------------------------------------|---------|
| DB-01 | ⚠️     | SQLite not suitable for production / concurrent users        | Low (MVP only) |

---

## Resolved Issues

| ID    | Status | Description                                         | Resolved |
|-------|--------|-----------------------------------------------------|----------|
| DB-02 | ✅     | Prisma 7 `url` field in schema.prisma caused migration failure | 2026-05-25 |

---

## Notes on Prioritization

For MVP, the critical path is:
1. Fix BE-04 (password hashing) before any real user data is stored
2. Fix BE-03 (auth middleware) before protecting any routes
3. Fix FE-03 (protected routes) before shipping to anyone

BE-01 and FE-01 will resolve together when auth is implemented.
