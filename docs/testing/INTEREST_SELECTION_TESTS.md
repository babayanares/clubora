# INTEREST_SELECTION_TESTS.md

> Testing considerations and QA checklist for the Interest Selection feature.
>
> Feature: Users add/remove interest tags on their profile via PATCH /api/users/:id.

---

## Scope

Covers the `interests` field added to `PATCH /api/users/:id` and `GET /api/users/:id`, plus the tag input UI on `Profile.jsx`.

---

## API Tests

### GET /api/users/:id — interests included

```bash
# After setting interests, verify they come back in GET
curl -s http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer <token>" | jq .user.interests
# Expected: "photography,hiking,tech"
```

---

### PATCH /api/users/:id — set interests

```bash
# Set interests
curl -s -X PATCH http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","interests":"photography,hiking,tech"}' | jq .user.interests
# Expected: "photography,hiking,tech"
```

```bash
# Clear interests
curl -s -X PATCH http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","interests":""}' | jq .user.interests
# Expected: null
```

```bash
# 21 tags — expect 400
curl -s -X PATCH http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","interests":"a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u"}' | jq .error
# Expected: "You can add up to 20 interest tags"
```

```bash
# Tag over 50 chars — expect 400
LONG_TAG=$(python3 -c 'print("a"*51)')
curl -s -X PATCH http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"interests\":\"$LONG_TAG\"}" | jq .error
# Expected: "Each interest tag must be 50 characters or fewer"
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Profile view with interests set | Tags shown as chips | |
| Profile view with no interests | No interests section or empty state | |
| Edit mode — interests section renders | Tag input with existing tags pre-loaded | |
| Add tag via Enter | Tag appears in input | |
| Add tag via comma | Tag appears in input | |
| Click suggestion chip | Tag added to list | |
| Click × on a tag | Tag removed | |
| Duplicate tag entered | Deduplicated (only one appears) | |
| Mixed case tag (e.g. "Photography") | Saved as lowercase | |
| Save with interests | Persists to DB | |
| Save clears all interests | DB value is null | |
| TagInput in CreateClub still works | No regression | |

---

## Regression: CreateClub TagInput

Since `TagInput` is being extracted into a shared component, verify CreateClub still works:

- [ ] Tag input renders on Create Club form
- [ ] Tags can be added, removed, submitted
- [ ] Submitted club has correct interests in DB

---

## Edge Cases from EDGE_CASES.md

| Scenario | Expected |
|----------|----------|
| 21 tags submitted | 400 — too many tags |
| Tag with only whitespace | Trimmed to empty, not added |
| Empty interests string on PATCH | interests set to null |

---

## DB Verification

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.user.findUnique({ where: { id: 3 }, select: { interests: true } })
  .then(u => { console.log(u); prisma.\$disconnect(); });
"
```
