# DB_SCHEMA_NOTES.md

> **Why this file exists:** The Prisma schema file shows *what* the database looks like, but not *why* decisions were made. This file captures reasoning, gotchas, and planned changes.
>
> **When to update:** After every schema change or migration. Document the reason for the change.
>
> **How it helps:** Prevents repeating past mistakes, explains tradeoffs, and gives a PM/QA reader context without reading Prisma syntax.

---

## Current Schema Summary

Schema file: `backend/prisma/schema.prisma`
Database: SQLite at `database/dev.db`

---

### User

```
User {
  id        Int       — auto-incremented primary key
  email     String    — unique, used for login
  name      String    — display name
  password  String    — hashed (bcrypt when implemented)
  createdAt DateTime
  updatedAt DateTime

  memberships Membership[]
  ownedClubs  Club[]
}
```

**Notes:**
- Password will be hashed with bcrypt before storage — never store plain text
- Email is the unique login identifier
- `name` is just a display name — not a username

---

### Club

```
Club {
  id          Int       — auto-incremented primary key
  name        String    — required, name of the club
  description String?   — optional description
  category    String?   — optional category label (e.g. "Sports", "Study")
  imageUrl    String?   — optional URL for club image
  createdAt   DateTime
  updatedAt   DateTime

  ownerId     Int       — foreign key to User
  owner       User
  memberships Membership[]
}
```

**Notes:**
- `ownerId` links to the user who created the club
- Categories are free-text for now — may become an enum or lookup table later
- `imageUrl` is optional — may switch to file upload later

---

### Membership

```
Membership {
  id       Int      — auto-incremented primary key
  role     String   — "member" (default) or "admin"
  joinedAt DateTime

  userId   Int      — foreign key to User
  clubId   Int      — foreign key to Club
  user     User
  club     Club

  @@unique([userId, clubId])   — a user can only join a club once
}
```

**Notes:**
- The `@@unique` constraint prevents duplicate membership rows
- `role` is free-text for now — could become an enum if roles expand
- Club owners are tracked in `Club.ownerId`, not necessarily as a Membership row

---

## Prisma 7 Notes

Prisma 7 changed how database URLs are configured:

- **Do NOT** put `url = env("DATABASE_URL")` inside `schema.prisma`
- The URL must live in `prisma.config.ts` under `datasource.url`
- The `schema.prisma` datasource block should only contain `provider`

```prisma
// Correct in Prisma 7
datasource db {
  provider = "sqlite"
}
```

This caused a failed migration attempt during initial setup — keep this in mind when upgrading or troubleshooting.

---

## Migration History

| Migration Name       | Date       | Description                  |
|----------------------|------------|------------------------------|
| 20260525_init        | 2026-05-25 | Initial schema: User, Club, Membership |

---

## Planned Schema Changes

| Change                        | Reason                                  | Status  |
|-------------------------------|-----------------------------------------|---------|
| Add `username` field to User  | Cleaner profile URLs (/u/username)      | 📋 Planned |
| Convert `category` to enum    | Prevent inconsistent category strings  | 📋 Planned |
| Add `bio` field to User       | Richer profiles                         | 📋 Planned |

---

## Relationships Diagram

```
User ─────────────────────── Club
 │   (owns, via ownerId)      │
 │                            │
 └──── Membership ────────────┘
       (userId + clubId, unique)
```

One User can:
- Own many Clubs
- Be a member of many Clubs (via Membership)

One Club can:
- Have one Owner
- Have many Members (via Membership)
