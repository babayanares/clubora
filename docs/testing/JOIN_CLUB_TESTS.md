# JOIN_CLUB_TESTS.md

> Testing considerations and QA checklist for the Join Club feature.
>
> Feature: POST /api/clubs/:id/join + join button on ClubDetails page.

---

## Scope

Covers `POST /api/clubs/:id/join`, the updated `GET /api/clubs/:id` (now includes memberships), and the join button UI on `ClubDetails.jsx`.

---

## API Tests

### POST /api/clubs/:id/join

**Happy path — join a public club:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 201 — membership object + memberCount
```

**Already a member:**
```bash
# Run the same join request twice
curl -s -X POST http://localhost:5000/api/clubs/1/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 409 — "You are already a member of this club"
```

**No token:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/join | jq .
# Expected: 401 — "You must be logged in"
```

**Club does not exist:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/9999/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 404 — "Club not found"
```

**Non-numeric club ID:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/abc/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 400 — "Invalid club ID"
```

**Private club:**
```bash
# Assumes club ID 2 is private
curl -s -X POST http://localhost:5000/api/clubs/2/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 403 — "This club is private"
```

---

### GET /api/clubs/:id (updated)

**Verify memberships array included:**
```bash
curl -s http://localhost:5000/api/clubs/1 | jq '.club.memberships'
# Expected: array of { userId, role } objects
```

**Verify member count still correct:**
```bash
curl -s http://localhost:5000/api/clubs/1 | jq '.club._count.memberships'
# Expected: integer matching memberships array length
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Not logged in, public club | "Log in to Join" shown | |
| Logged in, not a member, public club | "Join Club" button shown | |
| Logged in, is owner (admin role) | "You own this club" shown (disabled) | |
| Logged in, already a member | "Joined ✓" shown (disabled) | |
| Click "Join Club" | Button shows loading state | |
| Successful join | Member count increments, button → "Joined ✓" | |
| Network error on join | Error message shown, button resets | |
| Double-click join | Only one request sent (button disabled) | |
| Private club | No join button — "Private Club" label shown | |

---

## Regression: ClubDetails

The GET /clubs/:id response now includes `memberships`. Verify existing UI still renders:

- [ ] Club name, visibility badge still correct
- [ ] Owner name still shown
- [ ] Interest tags still shown
- [ ] Member count matches `_count.memberships`
- [ ] Back link still works

---

## Edge Cases from EDGE_CASES.md

| Scenario | Expected |
|----------|----------|
| User joins a club they're already a member of | 409 — handled gracefully |
| Owner tries to join own club | 409 (already admin member from creation) |
| View a club with ID that doesn't exist | 404 — club not found |
| View a club with non-numeric ID | 400 — invalid ID |

---

## DB Verification

After a successful join, confirm the Membership row exists:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.membership.findMany({ where: { clubId: 1 }, select: { userId: true, role: true, joinedAt: true } })
  .then(ms => { console.log(ms); prisma.\$disconnect(); });
"
```
