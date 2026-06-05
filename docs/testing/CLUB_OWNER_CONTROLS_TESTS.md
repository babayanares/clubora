# CLUB_OWNER_CONTROLS_TESTS.md

> Testing for Club Owner Controls — PATCH and DELETE /api/clubs/:id.

---

## API Tests

### PATCH /api/clubs/:id

**Happy path:**
```bash
curl -s -X PATCH http://localhost:5000/api/clubs/1 \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Club","description":"New desc","interests":"photography,art"}' | jq .
# Expected: 200 — updated club object
```

**Non-owner (expect 403):**
```bash
curl -s -X PATCH http://localhost:5000/api/clubs/1 \
  -H "Authorization: Bearer <non_owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked"}' | jq .
# Expected: 403
```

**No token (expect 401):**
```bash
curl -s -X PATCH http://localhost:5000/api/clubs/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"No auth"}' | jq .
# Expected: 401
```

**Invalid name (expect 400):**
```bash
curl -s -X PATCH http://localhost:5000/api/clubs/1 \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"AB","interests":"art"}' | jq .error
# Expected: "Club name must be at least 3 characters"
```

---

### DELETE /api/clubs/:id

**Happy path:**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/4 \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: 200 — { message: "Club deleted" }
```

**Non-owner (expect 403):**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/1 \
  -H "Authorization: Bearer <non_owner_token>" | jq .
# Expected: 403
```

**Already deleted (expect 404):**
```bash
curl -s -X DELETE http://localhost:5000/api/clubs/4 \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: 404
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Owner visits /clubs/:id | Edit + Delete buttons shown | |
| Non-owner visits /clubs/:id | No edit/delete buttons | |
| Click "Edit Club" | Navigates to /clubs/:id/edit | |
| Edit form pre-filled | All fields show current values | |
| Non-owner visits /clubs/:id/edit | Redirected away | |
| Save valid edits | Redirected to club detail, data updated | |
| Save invalid name | Error shown | |
| Delete button first click | "Confirm Delete?" shown | |
| Delete button second click | Club deleted, navigate to /dashboard | |
| DB after delete | No club, memberships, or posts remain | |

---

## DB Verification After Delete

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
Promise.all([
  prisma.club.findUnique({ where: { id: 4 } }),
  prisma.membership.findMany({ where: { clubId: 4 } }),
  prisma.post.findMany({ where: { clubId: 4 } }),
]).then(([club, memberships, posts]) => {
  console.log({ club, memberships: memberships.length, posts: posts.length });
  prisma.\$disconnect();
});
"
# Expected: { club: null, memberships: 0, posts: 0 }
```
