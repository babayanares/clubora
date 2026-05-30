# KNOWN_ISSUES.md

> **Why this file exists:** A living record of bugs, limitations, and rough edges. Writing issues down prevents them from getting lost or re-discovered later.
>
> **When to update:** Whenever a bug is found (add it) or fixed (mark it resolved). Do not delete resolved issues — keep them for reference.
>
> **How it helps:** Gives QA and devs a shared memory. Also useful for demonstrating project maturity to collaborators.

---

## Status Legend

| Symbol | Meaning             |
|--------|---------------------|
| 🐛     | Open bug            |
| ⚠️     | Known limitation    |
| ✅     | Resolved            |
| 🔍     | Under investigation |

---

## Open Issues

### Database

| ID    | Status | Description                                                        | Impact       |
|-------|--------|--------------------------------------------------------------------|--------------|
| DB-01 | ⚠️     | SQLite not suitable for production / concurrent users              | Low (MVP only) |

---

## Resolved Issues

| ID    | Status | Description                                                              | Resolved   |
|-------|--------|--------------------------------------------------------------------------|------------|
| DB-02 | ✅     | Prisma 7 `url` field in schema.prisma caused migration failure           | 2026-05-25 |
| DB-03 | ✅     | Prisma 7 requires Driver Adapter — plain `new PrismaClient()` errors     | 2026-05-26 |
| BE-01 | ✅     | Auth routes were stubbed — register, login, JWT now implemented          | 2026-05-26 |
| BE-02 | ✅     | No input validation — all routes now validate required fields            | 2026-05-26 |
| BE-03 | ✅     | No auth middleware — `requireAuth` middleware now protects POST /clubs   | 2026-05-26 |
| BE-04 | ✅     | Passwords not hashed — bcrypt now used in register flow                  | 2026-05-26 |
| BE-05 | ✅     | No global error handler — added to `src/index.js`                        | 2026-05-26 |
| BE-06 | ✅     | Club Details route stub not wired — GET /clubs/:id fully implemented     | 2026-05-27 |
| FE-01 | ✅     | Forms not wired to API — Login, Register, CreateClub now call real API   | 2026-05-26 |
| FE-02 | ✅     | No loading/error states — all three forms now have them                  | 2026-05-26 |
| FE-03 | ✅     | Profile and Dashboard were stubs — Profile fully implemented             | 2026-05-28 |
| FE-04 | ✅     | Navbar showed all links regardless of auth — now auth-aware              | 2026-05-26 |

---

## Prisma 7 Notes (for future reference)

Two Prisma 7 breaking changes encountered during the Create Club implementation:

1. **`url` removed from `schema.prisma`** — The datasource `url` field must be in `prisma.config.ts` only. Remove `url = env("DATABASE_URL")` from the schema block.

2. **Driver Adapter required** — `prisma-client-js` in Prisma 7 uses a new client engine that requires a Driver Adapter. For SQLite, install `better-sqlite3` and `@prisma/adapter-better-sqlite3`, then pass the adapter to the constructor:
   ```js
   const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
   const adapter = new PrismaBetterSqlite3({ url: 'file:/absolute/path/to/dev.db' });
   const prisma = new PrismaClient({ adapter });
   ```
   The `url` must be an **absolute path** (not relative) prefixed with `file:`.
