# JOIN_APPROVAL_TESTS.md

> Testing considerations for the Join Approval Flow — private club gating.

---

## Scope

Covers POST /clubs/:id/join (private), PATCH /clubs/:id/requests/:userId/approve,
DELETE /clubs/:id/requests/:userId/reject, and the ClubDetails join request UI.

---

## API Tests

### POST /api/clubs/:id/join — private club

```bash
# Request to join private club (expect 202 + pending: true)
curl -s -X POST http://localhost:5000/api/clubs/<private_id>/join \
  -H "Authorization: Bearer <token>" | jq .
# Expected: 202, membership.status: "pending", pending: true

# Already pending (expect 409)
curl -s -X POST http://localhost:5000/api/clubs/<private_id>/join \
  -H "Authorization: Bearer <token>" | jq .error
# Expected: "You are already a member of this club"
```

### PATCH /api/clubs/:id/requests/:userId/approve

```bash
curl -s -X PATCH http://localhost:5000/api/clubs/<id>/requests/<userId>/approve \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: 200 — { membership: { status: "approved" }, memberCount: N }

# Non-owner (expect 403)
curl -s -X PATCH http://localhost:5000/api/clubs/<id>/requests/<userId>/approve \
  -H "Authorization: Bearer <non_owner_token>" | jq .error
# Expected: 403

# Non-existent request (expect 404)
curl -s -X PATCH http://localhost:5000/api/clubs/<id>/requests/9999/approve \
  -H "Authorization: Bearer <owner_token>" | jq .error
# Expected: 404
```

### DELETE /api/clubs/:id/requests/:userId/reject

```bash
curl -s -X DELETE http://localhost:5000/api/clubs/<id>/requests/<userId>/reject \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: 200 — { message: "Request rejected" }

# Non-owner (expect 403)
curl -s -X DELETE http://localhost:5000/api/clubs/<id>/requests/<userId>/reject \
  -H "Authorization: Bearer <non_owner_token>" | jq .error
# Expected: 403
```

---

## Member Count Verification

```bash
# Pending members should NOT be counted
curl -s http://localhost:5000/api/clubs/<id> | jq '.club._count.memberships'
# Should only count approved members
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Private club, not logged in | "Log in to Join" shown | |
| Private club, no membership | "Request to Join" shown | |
| Click "Request to Join" | Sends POST /join, button → "Request Pending ⏳" | |
| Private club, status pending | "Request Pending ⏳" (disabled) shown | |
| Private club, status approved | "Leave Club" button shown | |
| Owner private club | "Join Requests" section visible | |
| Owner: pending requests listed with names | Correct | |
| Owner clicks Approve | Member count increments, row removed | |
| Owner clicks Reject | Row removed, no count change | |
| Public club join flow | Unchanged — still works | |

---

## Regression: Public Club Join

- [ ] Public club still joins immediately (status: approved)
- [ ] Member count on public clubs unchanged
- [ ] Leave club still works

---

## DB Verification

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.membership.findMany({
  where: { clubId: 1 },
  select: { userId: true, role: true, status: true }
}).then(ms => { console.log(ms); prisma.\$disconnect(); });
"
```
