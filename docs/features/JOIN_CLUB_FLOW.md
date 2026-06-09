# JOIN_CLUB_FLOW.md

> Feature flow document for the Join Club feature — a user becomes a member of a public club.

---

## Feature Goal

Allow authenticated users to join any public club from its detail page with a single click. Membership is the foundation for future features: My Clubs, club posts, and personalized recommendations.

---

## Business Purpose

Without join/leave, the platform has no social graph. A user can discover clubs but can't attach to them. Joining is the core social action of Clubora — everything that makes the platform valuable (community, content, recommendations) depends on memberships existing.

---

## User Workflow

1. User navigates to a club's detail page (`/clubs/:id`)
2. The page shows the club's current member count
3. If the user is logged in and not yet a member, a "Join Club" button is visible
4. User clicks "Join Club"
5. Request is sent to `POST /api/clubs/:id/join`
6. On success: button changes to "Joined ✓", member count increments by 1
7. If the user is the club owner, the button is replaced with "You own this club" (no join action)
8. If the user is already a member, the button shows "Joined ✓" (disabled)
9. If the user is not logged in, the button shows "Log in to Join" (links to /login)

---

## Frontend Responsibilities

- `ClubDetails.jsx` — add join button with correct state based on auth + membership
- Determine membership state from club data returned by GET /clubs/:id:
  - `club.memberships` will include `{ userId, role }` for all members
  - Compare against `getUser().id` from localStorage to determine `isMember` / `isOwner`
- Button states:
  - **Not logged in:** "Log in to Join" → navigates to `/login`
  - **Logged in, public club, not member:** "Join Club" → calls join endpoint
  - **Logged in, is member (role: member):** "Joined ✓" (disabled, success style)
  - **Logged in, is owner (role: admin):** "You own this club" (disabled, neutral style)
- On successful join: update local club state (increment member count, add self to memberships)
- Disable button and show loading text while request is in flight
- Show inline error if join fails

---

## Backend Responsibilities

- `POST /api/clubs/:id/join` — auth required; creates a Membership record
- `GET /api/clubs/:id` — updated to include `memberships: [{ userId, role }]` so frontend can determine state without a second request
- Private clubs cannot be joined directly — return 403

---

## Database Interactions

**Join club:**
```
prisma.membership.create({
  data: { userId: req.user.userId, clubId: id, role: 'member' }
})
```

**Check membership (unique constraint):**
The `Membership` model already has `@@unique([userId, clubId])` — duplicate join attempts will throw a Prisma unique constraint error, caught and returned as 409.

**Updated GET /clubs/:id:**
```
prisma.club.findUnique({
  where: { id },
  include: {
    owner: { select: { id: true, name: true } },
    memberships: { select: { userId: true, role: true } },
    _count: { select: { memberships: true } },
  }
})
```

---

## Validation Rules

| Scenario                    | Behavior                                      |
|-----------------------------|-----------------------------------------------|
| Club does not exist         | 404 — Club not found                          |
| Club is private             | 403 — This club is private                    |
| User is already a member    | 409 — You are already a member of this club   |
| User is not authenticated   | 401 — You must be logged in                   |
| Invalid club ID (non-int)   | 400 — Invalid club ID                         |

---

## API Endpoints

### POST /api/clubs/:id/join

Headers: `Authorization: Bearer <token>`

Success (201):
```json
{
  "membership": {
    "userId": 3,
    "clubId": 1,
    "role": "member",
    "joinedAt": "2026-05-31T10:00:00.000Z"
  },
  "memberCount": 5
}
```

### GET /api/clubs/:id (updated)

Now includes `memberships` array:
```json
{
  "club": {
    "id": 1,
    "name": "Photography Club",
    "memberships": [
      { "userId": 1, "role": "admin" },
      { "userId": 3, "role": "member" }
    ],
    "_count": { "memberships": 2 },
    ...
  }
}
```

---

## Error Handling

| Scenario                    | HTTP | Error Message                              |
|-----------------------------|------|--------------------------------------------|
| Not authenticated           | 401  | `"You must be logged in"`                  |
| Non-numeric club ID         | 400  | `"Invalid club ID"`                        |
| Club not found              | 404  | `"Club not found"`                         |
| Club is private             | 403  | `"This club is private"`                   |
| Already a member            | 409  | `"You are already a member of this club"`  |

---

## Success Flow

```
User views /clubs/:id (not a member)
→ "Join Club" button visible
→ User clicks Join Club
→ POST /api/clubs/:id/join (with Bearer token)
→ 201 response with membership + memberCount
→ Button changes to "Joined ✓"
→ Member count increments on page (no reload)
→ Club owner receives new_member notification in bell
```

---

## Edge Cases

- Owner tries to join their own club — they already have admin membership from club creation, so returns 409
- User joins then navigates away and returns — page re-fetches and shows "Joined ✓"
- Private club — button is hidden or shows "Private club" label (no join action)
- Double-click on join button — button disabled during request, prevents duplicate call
- Network failure during join — show inline error, reset button to "Join Club"

---

## QA Checklist

- [ ] Join button visible for logged-in, non-member on public club
- [ ] Join button hidden / replaced for non-logged-in users
- [ ] Join button shows "You own this club" for club owner
- [ ] Join button shows "Joined ✓" for existing member
- [ ] Successful join increments member count without page reload
- [ ] Button disabled during request (no double-submit)
- [ ] 409 handled gracefully (shows error, does not crash)
- [ ] Private club returns 403 — no join button shown
- [ ] Joining without token returns 401
- [ ] Invalid club ID returns 400

---

## Future Improvements

- Leave club action (step 8 in implementation order)
- Member list shown on club detail page
