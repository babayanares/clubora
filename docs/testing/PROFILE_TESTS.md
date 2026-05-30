# PROFILE_TESTS.md

> Testing considerations and QA checklist for the Profile Setup feature.
>
> Feature: View and edit own profile (name, bio, location) + view joined clubs.

---

## Scope

Covers `GET /api/users/:id` and `PATCH /api/users/:id`, plus the `Profile.jsx` frontend page.

---

## API Tests

### GET /api/users/:id

**Happy path:**
```bash
# Assumes user ID 1 exists and token is valid
curl -s http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 200, user object with memberships array
```

**No token:**
```bash
curl -s http://localhost:5000/api/users/1
# Expected: 401 — "You must be logged in"
```

**Wrong user ID (another user's profile):**
```bash
curl -s http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer <token_for_user_1>" | jq .
# Expected: 403 — "Not authorized"
```

**Non-existent user:**
```bash
curl -s http://localhost:5000/api/users/9999 \
  -H "Authorization: Bearer <own_token>" | jq .
# Expected: 404 — "User not found"
```

**Non-numeric ID:**
```bash
curl -s http://localhost:5000/api/users/abc \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 400 — invalid ID
```

---

### PATCH /api/users/:id

**Happy path — update all fields:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex R.","bio":"Updated bio.","location":"SF"}' | jq .
# Expected: 200, updated user object
```

**Update name only:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name"}' | jq .
# Expected: 200
```

**Clear bio and location:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","bio":"","location":""}' | jq .
# Expected: 200, bio and location null/empty
```

**Empty name:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | jq .
# Expected: 400 — "Name is required"
```

**Name too short:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"A"}' | jq .
# Expected: 400 — "Name must be at least 2 characters"
```

**Bio too long (301 chars):**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alex\",\"bio\":\"$(python3 -c 'print(\"a\"*301)')\"}" | jq .
# Expected: 400 — "Bio cannot exceed 300 characters"
```

**Unauthorized (no token):**
```bash
curl -s -X PATCH http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex"}' | jq .
# Expected: 401
```

**Editing another user's profile:**
```bash
curl -s -X PATCH http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer <token_for_user_1>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked"}' | jq .
# Expected: 403 — "Not authorized"
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Navigate to /profile logged out | Redirects to /login | |
| Navigate to /profile logged in | Loads profile data | |
| Name, email displayed correctly | Matches stored user data | |
| Bio shows "—" or empty state when not set | Graceful fallback | |
| Location shows "—" or empty state when not set | Graceful fallback | |
| Click Edit Profile | Fields become editable | |
| Save with valid inputs | Success feedback shown | |
| Save with empty name | Error message shown, not saved | |
| Save with 1-char name | Error message shown, not saved | |
| Cancel edit | Fields revert to original values | |
| Joined clubs list shown | Cards/links render correctly | |
| Club name links to /clubs/:id | Navigation works | |
| No clubs joined | Empty state message shown | |
| Network error on load | Error message shown, not crash | |
| Network error on save | Error message shown, fields not cleared | |

---

## Edge Cases from EDGE_CASES.md (applicable here)

| Scenario | Expected |
|----------|----------|
| Update name to only whitespace | 400 — name is required |
| Fetch profile for non-existent user ID | 404 — user not found |
| User has no club memberships | 200 — memberships is empty `[]`, empty state shown |
| User tries to edit another user's profile | 403 — forbidden |

---

## DB Verification

After a successful PATCH, verify in the database:
```bash
# From project root — check updated values persisted
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.user.findUnique({ where: { id: 1 }, select: { name: true, bio: true, location: true } })
  .then(u => { console.log(u); prisma.\$disconnect(); });
"
```
