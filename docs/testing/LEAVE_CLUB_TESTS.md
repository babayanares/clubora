# LEAVE_CLUB_TESTS.md

> Testing considerations and QA checklist for the Leave Club feature.
>
> Feature: DELETE /api/clubs/:id/leave + leave button on ClubDetails page.

---

## Scope

Covers `DELETE /api/clubs/:id/leave` and the leave button UI on `ClubDetails.jsx`.

---

## API Tests

### DELETE /api/clubs/:id/leave

**Happy path — leave a club:**
```bash
# First join, then leave
curl -s -X POST http://localhost:5000/api/clubs/1/join \
  -H "Authorization: Bearer <token>"

curl -s -X DELETE http://localhost:5000/api/clubs/1/leave \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 200 — { memberCount: <n> }
```

**Not a member:**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/1/leave \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 404 — "You are not a member of this club"
```

**Owner tries to leave:**
```bash
# Use token of club owner
curl -s -X DELETE http://localhost:5000/api/clubs/1/leave \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: 403 — "Club owners cannot leave their own club"
```

**No token:**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/1/leave | jq .
# Expected: 401 — "You must be logged in"
```

**Club not found:**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/9999/leave \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 404 — "Club not found"
```

**Invalid club ID:**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/abc/leave \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 400 — "Invalid club ID"
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Member views club detail | "Leave Club" button shown | |
| First click on "Leave Club" | Button text → "Confirm Leave?" (danger style) | |
| Second click on "Confirm Leave?" | Leave request sent | |
| Successful leave | Button → "Join Club", count decrements | |
| Button disabled during request | No double-submit possible | |
| Network error on leave | Error shown, confirmation resets | |
| Owner views club detail | "You own this club" — no leave button | |
| Non-member views club detail | "Join Club" — no leave button | |
| Leave then rejoin | Works correctly, count increments again | |

---

## Regression: Join flow

Verify join still works after leave route is added:

- [ ] Join Club still works (POST /clubs/:id/join)
- [ ] After leaving and rejoining, "Joined ✓" / "Leave Club" state is correct

---

## DB Verification

After leaving, confirm the Membership row is deleted:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.membership.findMany({ where: { clubId: 1 }, select: { userId: true, role: true } })
  .then(ms => { console.log(ms); prisma.\$disconnect(); });
"
```
