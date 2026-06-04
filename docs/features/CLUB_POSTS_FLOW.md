# CLUB_POSTS_FLOW.md

> Feature flow document for Club Posts — members post discussions inside a club and view a chronological feed.

---

## Feature Goal

Give club members a space to post text discussions inside a club. Posts appear in a feed on the club detail page, newest first. This is the first content layer of Clubora — without it, clubs are empty containers.

---

## Business Purpose

Clubs without content are dead. Posts give members a reason to return, a way to communicate, and something for new visitors to evaluate before joining. A club feed is the social proof that a club is active.

---

## User Workflow

**Viewing the feed (anyone):**
1. User navigates to `/clubs/:id`
2. Below the club info, a Posts section shows existing posts (newest first)
3. Each post shows: author name, content, and relative timestamp
4. If no posts exist, an empty state is shown

**Creating a post (members only):**
1. Logged-in member sees a post form above the feed
2. User types content and clicks "Post"
3. New post appears at the top of the feed immediately
4. Non-members see a "Join to post" prompt instead of the form

---

## Frontend Responsibilities

- Extend `ClubDetails.jsx` with a Posts section below the existing club info
- `GET /api/clubs/:id/posts` — fetch on mount, show feed
- Post form visible only to members (role: member or admin)
- Non-members: show "Join this club to post" message
- Not logged in: show "Log in to post"
- On submit: POST to `/api/clubs/:id/posts`, prepend new post to feed
- Disable submit button while posting, re-enable on completion
- Show inline error if post fails
- Relative timestamps (e.g. "2 minutes ago", "3 days ago")

---

## Backend Responsibilities

- `POST /api/clubs/:id/posts` — auth required, user must be a member or owner
- `GET /api/clubs/:id/posts` — public, newest first, includes author name
- New `Post` model in schema

---

## Schema Changes

New model added to `schema.prisma`:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId  Int
  clubId    Int
  author    User @relation(fields: [authorId], references: [id])
  club      Club @relation(fields: [clubId], references: [id])
}
```

Add `posts Post[]` to both `User` and `Club` models.

Migration name: `add_post_model`

---

## Validation Rules

| Field   | Rules                                      |
|---------|--------------------------------------------|
| content | Required. Min 1 char (after trim). Max 1000 chars. |

---

## API Endpoints

### GET /api/clubs/:id/posts

Public — no auth required.

Success (200):
```json
{
  "posts": [
    {
      "id": 5,
      "content": "Welcome everyone to the club!",
      "createdAt": "2026-06-01T10:00:00.000Z",
      "author": { "id": 1, "name": "Alex Rivera" }
    }
  ]
}
```

### POST /api/clubs/:id/posts

Headers: `Authorization: Bearer <token>`

Request:
```json
{ "content": "Excited to join this club!" }
```

Success (201):
```json
{
  "post": {
    "id": 6,
    "content": "Excited to join this club!",
    "createdAt": "2026-06-01T10:05:00.000Z",
    "author": { "id": 3, "name": "Test User" }
  }
}
```

---

## Error Handling

| Scenario                  | HTTP | Error Message                              |
|---------------------------|------|--------------------------------------------|
| Not authenticated         | 401  | `"You must be logged in"`                  |
| Not a club member         | 403  | `"You must be a member to post"`           |
| Club not found            | 404  | `"Club not found"`                         |
| Invalid club ID           | 400  | `"Invalid club ID"`                        |
| Content empty / missing   | 400  | `"Post content is required"`               |
| Content too long          | 400  | `"Post content cannot exceed 1000 characters"` |

---

## Success Flow

```
Member views /clubs/:id
→ GET /api/clubs/:id/posts
→ Feed renders (newest first)
→ Member types in post form and clicks "Post"
→ POST /api/clubs/:id/posts
→ 201 response with new post
→ New post prepended to feed
→ Form cleared
```

---

## Edge Cases

- Club has no posts → empty state: "No posts yet. Be the first to post!"
- Non-member viewing → feed visible, form replaced with join prompt
- Post with only whitespace → trim and reject as empty
- Very long post (> 1000 chars) → rejected with 400
- User posts then leaves club → their posts remain (author name still shown)

---

## QA Checklist

- [ ] GET /api/clubs/:id/posts returns posts newest first
- [ ] POST creates post, returns 201 with author info
- [ ] Non-member POST returns 403
- [ ] Empty content returns 400
- [ ] Content > 1000 chars returns 400
- [ ] Posts section visible on club detail page
- [ ] Post form shown to members only
- [ ] Non-member sees "Join to post" prompt
- [ ] New post appears at top of feed after submit
- [ ] Form clears after successful post
- [ ] Empty state shown when no posts exist
- [ ] Relative timestamps display correctly

---

## Future Improvements

- Delete own post
- Edit post
- Like / react to posts
- Threaded replies
- Pagination / infinite scroll for large feeds
