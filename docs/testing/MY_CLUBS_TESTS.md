# MY_CLUBS_TESTS.md

> Testing considerations and QA checklist for the My Clubs (Dashboard) feature.
>
> Feature: Dashboard page showing clubs the user owns or has joined, via GET /api/users/:id.

---

## Scope

Covers the updated `GET /api/users/:id` (now includes club `_count`) and the `Dashboard.jsx` frontend page.

---

## API Tests

### GET /api/users/:id — club member count included

```bash
# Verify _count.memberships appears on each club in memberships
curl -s http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" | jq '.user.memberships[].club._count'
# Expected: { memberships: <number> } for each club
```

**Owned clubs (role: admin):**
```bash
curl -s http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" | jq '[.user.memberships[] | select(.role == "admin") | .club.name]'
# Expected: array of club names the user owns
```

**Joined clubs (role: member):**
```bash
curl -s http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer <token>" | jq '[.user.memberships[] | select(.role == "member") | .club.name]'
# Expected: array of club names the user joined
```

**User with no memberships:**
```bash
# Register a fresh user, then GET their profile
curl -s http://localhost:5000/api/users/<new_id> \
  -H "Authorization: Bearer <new_token>" | jq '.user.memberships'
# Expected: []
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Navigate to /dashboard not logged in | Redirects to /login | |
| Navigate to /dashboard logged in | Loads correctly | |
| "Clubs I Own" section visible | Cards shown for role: admin clubs | |
| "Clubs I've Joined" section visible | Cards shown for role: member clubs | |
| Each card shows club name | Correct | |
| Each card shows visibility badge | Public / Private label | |
| Each card shows member count | Matches DB | |
| Each card links to /clubs/:id | Navigation works | |
| No owned clubs | Empty state + Create Club CTA | |
| No joined clubs | Empty state + Explore CTA | |
| Loading state shown | Spinner/message while fetching | |
| API error | Error message shown, no crash | |

---

## Regression: Profile page

The `GET /api/users/:id` response now includes `_count` on clubs. Verify the Profile page still renders correctly and doesn't break on the extra field.

- [ ] Profile page loads without errors
- [ ] Joined clubs list still renders
- [ ] No console errors

---

## DB Verification

After joining club 1, verify membership exists and count is correct:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.membership.findMany({
  where: { userId: 1 },
  include: { club: { select: { name: true } } }
}).then(ms => { console.log(ms); prisma.\$disconnect(); });
"
```
