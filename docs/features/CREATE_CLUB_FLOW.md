# CREATE_CLUB_FLOW.md

> Feature flow document for creating a new club.
> **Last updated:** 2026-05-26 — updated to reflect actual implementation.

---

## Feature Goal

Allow authenticated users to create a club with a name, description, location, interests/tags, and visibility setting — then immediately see it on the Explore Clubs page.

---

## Business Purpose

Club creation is the core supply-side action in Clubora. Without clubs being created, there's nothing to explore or join. Every club starts here.

---

## User Workflow

1. User is logged in and navigates to `/clubs/new` (redirected to `/login` if not)
2. User fills in the form:
   - Club Name (required)
   - Description (optional)
   - Location (optional)
   - Interests/Tags (required — at least one)
   - Visibility (public or private, defaults to public)
3. User submits the form
4. Club is created in the database with the user as owner and admin member
5. User is redirected to `/explore` where the new club appears immediately

---

## Frontend Responsibilities

**File:** `frontend/src/pages/CreateClub.jsx`

- Redirect to `/login` on mount if not authenticated (checked via `localStorage`)
- Form fields: name, description, location, interests (tag input), visibility (select)
- Inline character counters for name (100 max) and description (500 max)
- Interest tag input: press Enter or comma to add a tag; click × to remove; quick-add suggestion chips
- Client-side validation before submission — errors shown per field
- Button disabled and shows "Creating club…" while request is in flight
- API error shown in a banner below the form if the request fails
- On success: navigate to `/explore`

---

## Backend Responsibilities

**Files:** `backend/src/routes/clubs.js`, `backend/src/controllers/clubs.js`

- `POST /api/clubs` — protected by `requireAuth` middleware
- Extract `userId` from the JWT token via `req.user.userId` — never from request body
- Validate: name required, 3–100 chars (trimmed); description ≤ 500 chars; at least one interest
- Parse interests: split by comma, trim each tag, filter empty strings, rejoin as comma string
- Sanitize visibility: only "public" or "private" accepted, defaults to "public"
- Create club row in DB
- Auto-create a Membership row for the owner with `role: 'admin'`
- Return 201 with the created club object

---

## Database Interactions

**Migration:** `20260526_add_location_interests_visibility_to_club`

```
prisma.club.create({
  data: {
    name,           // trimmed string
    description,    // optional string or null
    location,       // optional string or null
    interests,      // comma-joined string e.g. "photography,travel"
    visibility,     // "public" | "private"
    ownerId         // from JWT
  }
})

prisma.membership.create({
  data: {
    userId: ownerId,
    clubId: club.id,
    role: 'admin'
  }
})
```

**`GET /api/clubs`** returns only `visibility: 'public'` clubs, ordered newest first.

---

## Validation Rules

| Field       | Rules                                                          |
|-------------|----------------------------------------------------------------|
| name        | Required. Min 3 chars (after trim). Max 100 chars.            |
| description | Optional. Max 500 chars.                                       |
| location    | Optional. No length limit enforced (kept short by UX).        |
| interests   | Required. At least one non-empty tag after parsing.           |
| visibility  | Must be "public" or "private". Defaults to "public".         |

---

## API Endpoint

### POST /api/clubs

Headers: `Authorization: Bearer <jwt_token>`

Request:
```json
{
  "name": "Photography Club",
  "description": "A club for photo lovers.",
  "location": "New York, NY",
  "interests": "photography,travel,outdoors",
  "visibility": "public"
}
```

Success (201):
```json
{
  "club": {
    "id": 1,
    "name": "Photography Club",
    "description": "A club for photo lovers.",
    "location": "New York, NY",
    "interests": "photography,travel,outdoors",
    "visibility": "public",
    "ownerId": 1,
    "createdAt": "2026-05-26T19:36:00.000Z",
    "updatedAt": "2026-05-26T19:36:00.000Z"
  }
}
```

---

## Error Handling

| Scenario                    | HTTP Status | Error Message                                |
|-----------------------------|-------------|----------------------------------------------|
| No token                    | 401         | `"You must be logged in"`                    |
| Invalid/expired token       | 401         | `"Invalid or expired token"`                 |
| Name missing or blank       | 400         | `"Club name is required"`                    |
| Name too short              | 400         | `"Club name must be at least 3 characters"`  |
| Name too long               | 400         | `"Club name must be under 100 characters"`   |
| Description too long        | 400         | `"Description must be under 500 characters"` |
| No interests provided       | 400         | `"At least one interest is required"`        |
| Server error                | 500         | `"Something went wrong, please try again"`   |

---

## Success Flow

```
User fills form → clicks Create Club
→ Frontend validates: name not empty, min 3 chars, at least 1 interest
→ Button disables, shows "Creating club…"
→ POST /api/clubs with JWT in Authorization header
→ Backend verifies JWT via requireAuth middleware
→ Controller validates and trims all inputs
→ prisma.club.create(...)
→ prisma.membership.create(...) — owner auto-joined as admin
→ 201 { club: { ... } }
→ Frontend navigate('/explore')
→ Explore Clubs fetches updated list → new club visible
```

---

## Edge Cases (all handled)

- Whitespace-only name — trimmed before validation, rejected as empty
- Interests field left empty — rejected with clear message
- Interest tags with leading/trailing spaces — trimmed in `parseInterests()`
- Duplicate interest tags — prevented in frontend tag input
- `ownerId` sent in request body — ignored; server always uses JWT value
- User navigates to `/clubs/new` without auth — immediate redirect to `/login`
- Double-click on submit — button disabled after first click until response
- Visibility value not in allowed set — silently defaulted to "public"

---

## QA Checklist

**Positive tests:**
- [ ] Create club with name + interests only (description, location optional) → 201, appears on /explore
- [ ] Create club with all fields filled → 201, all fields visible on /explore card
- [ ] After creation, redirected to /explore page
- [ ] New club card shows name, description, location, interests, member count
- [ ] Creator appears as a member (member count = 1)

**Negative tests:**
- [ ] Submit with empty name → field error shown, no API call made
- [ ] Submit with name under 3 chars → field error shown
- [ ] Submit with no interests added → field error shown
- [ ] Navigate to /clubs/new without login → redirected to /login

**Validation tests:**
- [ ] Whitespace-only name rejected
- [ ] Name over 100 chars rejected (API + character counter in UI)
- [ ] Description over 500 chars rejected (API + character counter in UI)
- [ ] Extra fields in request body (e.g. ownerId) ignored by backend

**Database verification (via Prisma Studio):**
- [ ] Club row exists with correct name, interests, ownerId
- [ ] `visibility` defaults to "public" when not specified
- [ ] Membership row exists for owner with role "admin"

---

## Future Improvements

- Club image upload (cover photo)
- Predefined category selector
- Slug-based club URLs
- Invite-only clubs with an invite link
- Club tags as a separate searchable table (post-MVP)
