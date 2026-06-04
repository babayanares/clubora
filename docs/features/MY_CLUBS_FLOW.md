# MY_CLUBS_FLOW.md

> Feature flow document for My Clubs — a dedicated dashboard showing all clubs the user owns or has joined.

---

## Feature Goal

Give authenticated users a single page that shows every club they're connected to, split into "Clubs I Own" and "Clubs I've Joined." This is the user's personal hub — the starting point for managing their club activity.

---

## Business Purpose

Once a user can join clubs, they need somewhere to see them all. Without My Clubs, memberships exist in the database but are invisible to the user. This page closes the loop: join → see it here → return to it later. It also surfaces the user's owned clubs prominently, which encourages club management (edit/delete — future steps).

---

## User Workflow

1. Logged-in user clicks "Dashboard" in the navbar
2. The page loads their clubs, split into two sections:
   - **Clubs I Own** — clubs where their role is `admin`
   - **Clubs I've Joined** — clubs where their role is `member`
3. Each club card links to `/clubs/:id`
4. If a section is empty, a relevant empty state is shown
5. Page is auth-guarded — redirects to `/login` if not logged in

---

## Frontend Responsibilities

- `Dashboard.jsx` — fully implement using the existing `GET /api/users/:id` endpoint
- Read `userId` from localStorage via `getUser()`
- Split `memberships` array by role: `admin` → owned, `member` → joined
- Render two sections: "Clubs I Own" and "Clubs I've Joined"
- Each club card shows: name, category (if set), visibility badge, member count, "View Club" link
- Empty states:
  - No owned clubs → prompt to Create Club
  - No joined clubs → prompt to Explore
- Auth guard: redirect to `/login` on mount if not logged in
- No new API endpoint needed — reuses existing profile endpoint

---

## Backend Responsibilities

- No new route needed
- Update `GET /api/users/:id` to include `_count: { select: { memberships: true } }` in the club select so each club card can show member count

---

## API Endpoint (update to existing)

### GET /api/users/:id

Memberships now include club member count:
```json
{
  "user": {
    "memberships": [
      {
        "role": "admin",
        "joinedAt": "2026-05-25T20:00:00.000Z",
        "club": {
          "id": 1,
          "name": "Photography Club",
          "category": "Creative",
          "visibility": "public",
          "_count": { "memberships": 4 }
        }
      }
    ]
  }
}
```

---

## Page Layout

```
My Clubs                                      [+ Create Club]

Clubs I Own  (2)
[Card: Photography Club  •  Public  •  4 members  •  View →]
[Card: Weekend Runners   •  Public  •  2 members  •  View →]

Clubs I've Joined  (1)
[Card: Tech Meetup  •  Public  •  12 members  •  View →]
```

---

## Edge Cases

- User has no owned clubs → show "You haven't created any clubs yet" + Create Club button
- User has no joined clubs → show "You haven't joined any clubs yet" + Explore button
- User has neither → show both empty states
- Not logged in → redirect to `/login`

---

## QA Checklist

- [ ] Page redirects to /login if not authenticated
- [ ] "Clubs I Own" section shows clubs with role: admin
- [ ] "Clubs I've Joined" section shows clubs with role: member
- [ ] Each card links to `/clubs/:id`
- [ ] Member count shown on each card
- [ ] Empty state for no owned clubs — Create Club CTA shown
- [ ] Empty state for no joined clubs — Explore CTA shown
- [ ] After creating a club, it appears in "Clubs I Own" on next visit
- [ ] After joining a club, it appears in "Clubs I've Joined" on next visit

---

## Future Improvements

- Leave club action directly from the My Clubs card
- Show recent activity per club
- Sort clubs by last activity or join date
- Club management actions (edit/delete) for owned clubs
