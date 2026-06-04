# CLUB_POSTS_TESTS.md

> Testing considerations and QA checklist for the Club Posts feature.
>
> Feature: GET + POST /api/clubs/:id/posts, post feed on ClubDetails page.

---

## Scope

Covers `GET /api/clubs/:id/posts`, `POST /api/clubs/:id/posts`, and the posts feed UI on `ClubDetails.jsx`.

---

## API Tests

### GET /api/clubs/:id/posts

**Happy path — fetch posts:**
```bash
curl -s http://localhost:5000/api/clubs/1/posts | jq .
# Expected: 200 — { posts: [...] }
```

**Empty posts:**
```bash
# On a fresh club with no posts
curl -s http://localhost:5000/api/clubs/4/posts | jq .
# Expected: 200 — { posts: [] }
```

**Invalid club ID:**
```bash
curl -s http://localhost:5000/api/clubs/abc/posts | jq .
# Expected: 400 — "Invalid club ID"
```

**Club not found:**
```bash
curl -s http://localhost:5000/api/clubs/9999/posts | jq .
# Expected: 404 — "Club not found"
```

---

### POST /api/clubs/:id/posts

**Happy path — member posts:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/posts \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello everyone!"}' | jq .
# Expected: 201 — post with id, content, createdAt, author
```

**Non-member posts:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/posts \
  -H "Authorization: Bearer <non_member_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Can I post?"}' | jq .
# Expected: 403 — "You must be a member to post"
```

**Empty content:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/posts \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":""}' | jq .
# Expected: 400 — "Post content is required"
```

**Content over 1000 chars:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/posts \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"$(python3 -c 'print(\"a\"*1001)')\"}" | jq .
# Expected: 400 — "Post content cannot exceed 1000 characters"
```

**No token:**
```bash
curl -s -X POST http://localhost:5000/api/clubs/1/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello"}' | jq .
# Expected: 401 — "You must be logged in"
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Club with no posts | Empty state shown | |
| Club with posts | Feed shown, newest first | |
| Not logged in | Feed visible, "Log in to post" shown | |
| Logged in, not a member | Feed visible, "Join to post" prompt shown | |
| Logged in, is a member | Post form shown above feed | |
| Submit valid post | Post appears at top of feed, form clears | |
| Submit button disabled while posting | No double-submit | |
| Submit empty content | Error shown, not posted | |
| Post shows author name | Correct name displayed | |
| Post shows relative timestamp | "X minutes ago" style | |

---

## Regression: ClubDetails

Verify existing club detail UI still works after adding the posts section:

- [ ] Club name, description, meta still render
- [ ] Join/Leave button still works
- [ ] Member count still correct
- [ ] Interest tags still shown

---

## DB Verification

After creating a post, confirm it's in the database:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.post.findMany({ include: { author: { select: { name: true } } } })
  .then(posts => { console.log(posts); prisma.\$disconnect(); });
"
```
