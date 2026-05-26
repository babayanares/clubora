# EXPLORE_CLUBS_FLOW.md

> Feature flow document for browsing and discovering clubs.

---

## Feature Goal

Allow any visitor (logged in or not) to browse all public clubs, see basic info about each club, and navigate to a club's detail page.

---

## Business Purpose

The Explore page is the discovery mechanism. It drives the demand side — people join clubs they find here. A useful Explore page is what turns a new visitor into a registered user.

---

## User Workflow

1. User navigates to `/explore`
2. A list of all clubs is fetched from the API and displayed
3. Each club shows its name, category, and brief description
4. User clicks a club to go to its detail page (`/clubs/:id`)

---

## Frontend Responsibilities

- `ExploreClubs.jsx` — fetch and render the list of clubs
- Call `GET /api/clubs` on page load (in `useEffect`)
- Show a loading state while fetching
- Show an empty state message if no clubs exist
- Show an error message if the fetch fails
- Each club in the list links to `/clubs/:id`

---

## Backend Responsibilities

- `GET /api/clubs` — return a list of all clubs
- No authentication required — this is a public endpoint
- Return club id, name, description, category, createdAt
- In the future: support query params for filtering and pagination

---

## Database Interactions

```
prisma.club.findMany({
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    name: true,
    description: true,
    category: true,
    createdAt: true,
    _count: { select: { memberships: true } }  // member count (future)
  }
})
```

---

## Validation Rules

No input validation required for this endpoint (it's a read-only list).

Future: validate query params if search/filter is added (e.g. category must be a known value).

---

## API Endpoints

### GET /api/clubs

No headers required (public endpoint).

Success (200):
```json
{
  "clubs": [
    {
      "id": 1,
      "name": "Photography Club",
      "description": "A club for photography enthusiasts.",
      "category": "Creative",
      "createdAt": "2026-05-25T20:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Running Club",
      "description": "Weekend runs for all fitness levels.",
      "category": "Sports",
      "createdAt": "2026-05-24T10:00:00.000Z"
    }
  ]
}
```

Empty state (200):
```json
{
  "clubs": []
}
```

---

## Error Handling

| Scenario          | HTTP Status | Error Message                       |
|-------------------|-------------|-------------------------------------|
| Database error    | 500         | `"Failed to load clubs"`            |

---

## Success Flow

```
User navigates to /explore
→ ExploreClubs.jsx mounts
→ useEffect: api.get('/clubs')
→ GET /api/clubs
→ prisma.club.findMany()
→ Return { clubs: [...] }
→ setClubs(data.clubs)
→ Clubs render as a list of links
```

---

## Edge Cases

- No clubs exist yet — show empty state with a "Create the first one!" prompt
- API is slow — show loading indicator so the user knows something is happening
- API fails — show an error message, not a blank page
- Large number of clubs — pagination will be needed eventually

---

## QA Checklist

- [ ] Clubs list renders when clubs exist in DB
- [ ] Empty state message shown when no clubs exist
- [ ] Loading state shown while fetching
- [ ] Error message shown if API fails
- [ ] Each club card links correctly to `/clubs/:id`
- [ ] Page accessible without being logged in
- [ ] Most recently created clubs appear first

---

## Future Improvements

- Search by club name (text input filters results)
- Filter by category (dropdown)
- Pagination or infinite scroll for large lists
- Club member count shown on each card
- Featured / trending clubs section
- Club cover image shown in the list
