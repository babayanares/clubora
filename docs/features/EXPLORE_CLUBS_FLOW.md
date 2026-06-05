# EXPLORE_CLUBS_FLOW.md

> Feature flow document for browsing and discovering clubs.
> **Last updated:** 2026-06-05 — updated to include private clubs with limited info.

---

## Feature Goal

Allow any visitor (logged in or not) to browse ALL clubs — both public and private. Public clubs show full details. Private clubs show limited info with a lock icon so users can request to join.

---

## Business Purpose

The Explore page is the discovery mechanism. It drives the demand side — people join clubs they find here. Previously, private clubs were completely invisible, which meant:
1. Users couldn't find private clubs to request access
2. The Join Approval Flow (Step 13) was only reachable via a direct URL — unusable in practice

Showing private clubs in Explore (with limited info) closes this gap without compromising privacy — description is hidden, but the club's existence, name, interests, and member count are visible enough to decide whether to request access.

---

## User Workflow

1. User navigates to `/explore`
2. All clubs (public AND private) are fetched and displayed as cards
3. **Public clubs:** full card — name, description, location, member count, interest tags
4. **Private clubs:** limited card — name, 🔒 Private badge, member count, interest tags (no description, no location)
5. User clicks any card → navigates to `/clubs/:id`
   - Public clubs: shows Join Club button
   - Private clubs: shows Request to Join button
6. If no clubs exist, an empty state is shown

---

## Frontend Responsibilities

**File:** `frontend/src/pages/ExploreClubs.jsx`

- Call `GET /api/clubs` on mount — now returns all clubs
- Render public clubs as before (full details)
- Render private clubs with:
  - 🔒 Private label/badge visible on the card
  - Name shown
  - Interest tags shown
  - Member count shown
  - **No description rendered** (hide it even if present in API response)
  - **No location rendered**
  - Slightly muted card style to visually distinguish from public clubs
  - Card still links to `/clubs/:id`
- Search and interest filters still work across all clubs (public + private)

---

## Backend Responsibilities

**File:** `backend/src/controllers/clubs.js` — `getClubs`

- `GET /api/clubs` — public, no auth required
- Returns **all** clubs (remove the `where: { visibility: 'public' }` filter)
- Order by `createdAt` descending (newest first)
- Returns same fields as before — frontend controls what is displayed per visibility

---

## Database Interactions

```js
prisma.club.findMany({
  orderBy: { createdAt: 'desc' },   // removed: where: { visibility: 'public' }
  select: {
    id: true,
    name: true,
    description: true,
    category: true,
    location: true,
    interests: true,
    visibility: true,
    createdAt: true,
    ownerId: true,
    _count: { select: { memberships: { where: { status: 'approved' } } } },
  },
})
```

---

## Validation Rules

No input validation — this is a read-only public endpoint.

---

## API Endpoint

### GET /api/clubs

No headers required.

Success (200) — now includes private clubs:
```json
{
  "clubs": [
    {
      "id": 1,
      "name": "Photography Club",
      "description": "For photo lovers.",
      "visibility": "public",
      "_count": { "memberships": 3 }
    },
    {
      "id": 7,
      "name": "Secret Club",
      "description": "Members only content.",
      "visibility": "private",
      "_count": { "memberships": 1 }
    }
  ]
}
```

Note: Description is returned for private clubs but intentionally not rendered by the frontend.

---

## Error Handling

| Scenario       | Frontend behaviour                                  |
|----------------|-----------------------------------------------------|
| DB error       | 500 from API → "Failed to load clubs" message shown |
| Network error  | Catch block → same error message                    |

---

## Success Flow

```
User navigates to /explore
→ GET /api/clubs (all clubs, no visibility filter)
→ Public club cards: full details
→ Private club cards: name + lock badge + interests + count
→ User clicks private card → /clubs/:id
→ ClubDetails shows "Request to Join" button
→ Owner receives request, can approve
```

---

## Edge Cases

| Scenario | Behaviour | Status |
|----------|-----------|--------|
| No clubs in DB | Empty state with create CTA shown | ✅ |
| API fails / server down | Error message shown | ✅ |
| Loading takes time | "Loading clubs…" shown | ✅ |
| Club has no description | Description line not rendered | ✅ |
| Club has no location | Location chip not rendered | ✅ |
| Private club in list | Shows with lock badge, no description/location | ✅ |
| Private club clicked | Navigates to /clubs/:id showing Request to Join | ✅ |
| Search on private club name | Private clubs included in search results | ✅ |
| Interest filter with private clubs | Private clubs included if they match | ✅ |
| Large number of clubs (pagination) | Not yet handled — post-MVP | 📋 |

---

## QA Checklist

- [x] Public clubs show full details (description, location, tags)
- [x] Private clubs show limited info (name, lock badge, count, tags only)
- [x] Private clubs link to /clubs/:id
- [x] /clubs/:id shows "Request to Join" for private clubs
- [x] Empty state shown when no clubs exist
- [x] Loading state shown while fetching
- [x] Error message shown if API fails
- [x] Search includes private clubs by name
- [x] Interest filter includes matching private clubs
- [x] Member count reflects approved members only

---

## Future Improvements

- Pagination or infinite scroll for large club lists
- Club cover image on card
- "Featured" or trending clubs section
- Sort options (newest, most members, alphabetical)
