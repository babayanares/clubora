# EXPLORE_CLUBS_FLOW.md

> Feature flow document for browsing and discovering clubs.
> **Last updated:** 2026-05-27 — updated to reflect actual implementation.

---

## Feature Goal

Allow any visitor (logged in or not) to browse all public clubs, see a rich summary card for each, and navigate to a club's full detail page.

---

## Business Purpose

The Explore page is the discovery mechanism. It drives the demand side — people join clubs they find here. A useful Explore page is what turns a new visitor into a registered user.

---

## User Workflow

1. User navigates to `/explore`
2. All public clubs are fetched from the API and displayed as cards
3. Each card shows: name, description (truncated), location, member count, interest tags
4. User clicks a card → navigates to `/clubs/:id`
5. If no clubs exist, an empty state with a "Create the first one" CTA is shown

---

## Frontend Responsibilities

**File:** `frontend/src/pages/ExploreClubs.jsx`

- Call `GET /api/clubs` on mount via `useEffect`
- Show loading state (`Loading clubs…`) while fetching
- Show error message if fetch fails
- Show empty state with create CTA if no clubs returned
- Render clubs in a responsive grid
- Each card shows: name, description (2-line clamp), location, member count, interest tags
- Each card links to `/clubs/:id`
- Page header includes a `+ Create Club` button (links to `/clubs/new`)
- Page accessible without login

---

## Backend Responsibilities

**File:** `backend/src/controllers/clubs.js` — `getClubs`

- `GET /api/clubs` — public, no auth required
- Returns only `visibility: 'public'` clubs
- Ordered by `createdAt` descending (newest first)
- Includes member count via `_count.memberships`
- Returns: `id, name, description, category, location, interests, visibility, createdAt, ownerId, _count`

---

## Database Interactions

```js
prisma.club.findMany({
  where: { visibility: 'public' },
  orderBy: { createdAt: 'desc' },
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
    _count: { select: { memberships: true } },
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

Success (200):
```json
{
  "clubs": [
    {
      "id": 1,
      "name": "Photography Club",
      "description": "For photo lovers.",
      "location": "New York, NY",
      "interests": "photography,travel",
      "visibility": "public",
      "createdAt": "2026-05-26T19:36:00.000Z",
      "ownerId": 1,
      "_count": { "memberships": 1 }
    }
  ]
}
```

Empty (200): `{ "clubs": [] }`

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
→ ExploreClubs.jsx mounts, loading = true
→ api.get('/clubs')
→ GET /api/clubs → prisma.club.findMany(...)
→ { clubs: [...] }
→ setClubs(data.clubs), loading = false
→ Cards render in responsive grid
→ User clicks card → navigate to /clubs/:id
```

---

## Edge Cases

| Scenario                              | Behaviour                                      | Status |
|---------------------------------------|------------------------------------------------|--------|
| No clubs in DB                        | Empty state with create CTA shown              | ✅     |
| API fails / server down               | Error message shown, not a blank page          | ✅     |
| Loading takes time                    | "Loading clubs…" shown during fetch            | ✅     |
| Club has no description               | Description line not rendered on card          | ✅     |
| Club has no location                  | Location chip not rendered                     | ✅     |
| Private clubs in DB                   | Not returned by API (filtered server-side)     | ✅     |
| Large number of clubs (pagination)    | Not yet handled — post-MVP improvement         | 📋     |

---

## QA Checklist

- [x] Clubs grid renders when clubs exist in DB
- [x] Empty state shown when no clubs exist
- [x] Loading state shown while fetching
- [x] Error message shown if API fails
- [x] Each club card links correctly to `/clubs/:id`
- [x] Page accessible without login
- [x] Most recently created clubs appear first
- [x] Member count shown correctly on each card
- [x] Interests render as individual tags on each card
- [x] Location shown with pin icon when present
- [x] Private clubs not visible

---

## Future Improvements

- Search by club name (text input)
- Filter by interest/category
- Pagination or infinite scroll
- Club cover image on card
- "Featured" or trending clubs section
