# CLUB_DETAILS_FLOW.md

> Feature flow document for viewing a single club's full details.
> **Status:** TODO → implementation follows this doc.

---

## Feature Goal

Give any visitor a full view of a single club — its name, description, location, interests, member count, owner, and visibility — after clicking a club card on the Explore page.

---

## Business Purpose

The club detail page is the conversion point. A user lands here from Explore, reads what the club is about, and decides whether to join. Without this page, Explore is a dead end — cards link nowhere useful.

---

## User Workflow

1. User is on `/explore` and clicks a club card
2. Browser navigates to `/clubs/:id`
3. Page fetches the club from `GET /api/clubs/:id`
4. Full club details are displayed
5. User can navigate back to Explore via a back link

---

## Frontend Responsibilities

**File:** `frontend/src/pages/ClubDetails.jsx`

- Read `id` from URL params via `useParams()`
- On mount, call `GET /api/clubs/:id`
- Show loading state while fetching
- Show 404 message if club is not found (API returns 404)
- Show generic error message if request fails
- Render:
  - Club name (page heading)
  - Visibility badge (Public / Private)
  - Description (if present)
  - Location with pin icon (if present)
  - Interests as tags (if present)
  - Member count
  - Owner name
  - Created date (formatted as readable string)
- Back link to `/explore`

---

## Backend Responsibilities

**File:** `backend/src/controllers/clubs.js` — `getClub` function

Already implemented. Behaviour:
- `GET /api/clubs/:id`
- No authentication required — public endpoint
- Parse `id` as integer — return 400 if not a valid number
- Query Prisma for club with owner name and membership count
- Return 404 if club not found
- Return 200 with full club object

---

## Database Interactions

Already implemented:

```js
prisma.club.findUnique({
  where: { id },
  include: {
    owner: { select: { id: true, name: true } },
    _count: { select: { memberships: true } },
  },
})
```

Returns: all club fields + `owner.name` + `_count.memberships`

---

## Validation Rules

Backend (already implemented):

| Input | Rule                                         |
|-------|----------------------------------------------|
| id    | Must parse as a valid integer — 400 if not   |
| id    | Club must exist — 404 if not found           |

No frontend form — this is a read-only page.

---

## API Endpoint

### GET /api/clubs/:id

No auth required.

Success (200):
```json
{
  "club": {
    "id": 1,
    "name": "Photography Club",
    "description": "For photo lovers.",
    "category": null,
    "location": "New York, NY",
    "interests": "photography,travel,outdoors",
    "visibility": "public",
    "imageUrl": null,
    "createdAt": "2026-05-26T19:36:00.000Z",
    "updatedAt": "2026-05-26T19:36:00.000Z",
    "ownerId": 1,
    "owner": { "id": 1, "name": "Alex Rivera" },
    "_count": { "memberships": 1 }
  }
}
```

Not found (404):
```json
{ "error": "Club not found" }
```

Invalid ID (400):
```json
{ "error": "Invalid club ID" }
```

---

## Error Handling

| Scenario                          | Frontend behaviour                             |
|-----------------------------------|------------------------------------------------|
| Club not found (404)              | Show "Club not found" message + back to Explore link |
| Invalid ID in URL (`/clubs/abc`)  | API returns 400 → show generic error message   |
| Network error / server down       | Show "Failed to load club" + back link         |
| Loading in progress               | Show loading indicator                         |

---

## Success Flow

```
User clicks club card on /explore
→ Navigate to /clubs/:id
→ ClubDetails.jsx mounts
→ useEffect: api.get('/clubs/:id')
→ GET /api/clubs/1
→ prisma.club.findUnique({ where: { id: 1 }, include: owner, _count })
→ Return { club: { ... } }
→ setClub(data.club)
→ Page renders with all club details
```

---

## Edge Cases (all handled at backend level)

- Non-numeric ID in URL (`/clubs/abc`) → 400 from backend, frontend shows error
- ID that doesn't exist (`/clubs/9999`) → 404, frontend shows "Club not found"
- Club with no description → description section not rendered
- Club with no location → location line not rendered
- Club with no interests → interests section not rendered
- Very long club name → wraps in heading, no overflow

---

## QA Checklist

**Positive tests:**
- [ ] Clicking a club card on `/explore` navigates to `/clubs/:id`
- [ ] Club name, description, location, interests all display correctly
- [ ] Member count shows correct number
- [ ] Owner name is shown
- [ ] Created date is shown in a readable format
- [ ] Interests render as individual tags
- [ ] Back link navigates to `/explore`

**Negative tests:**
- [ ] Visiting `/clubs/9999` (non-existent) shows "Club not found" message
- [ ] Visiting `/clubs/abc` (invalid ID) shows error message, not crash
- [ ] If API is down, shows error message with a back link

**Rendering edge cases:**
- [ ] Club with no description renders without a broken empty section
- [ ] Club with no location renders without the location line
- [ ] Club with no interests renders without the tags section
- [ ] Long club name wraps cleanly

---

## Future Improvements

- Join / Leave Club button (step 6 in backlog)
- Members list (who has joined)
- Club posts / discussion feed (step 9)
- Edit Club button visible to owner only
- Share link / copy URL button
