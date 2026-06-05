# CLUB_OWNER_CONTROLS_FLOW.md

> Feature flow document for Club Owner Controls — edit and delete a club.

---

## Feature Goal

Give club owners the ability to update their club's details and permanently delete a club they own. These are the two fundamental management actions that complete the club lifecycle.

---

## Business Purpose

Without edit/delete, clubs are immutable after creation. Owners can't fix typos, update descriptions, or remove test clubs. These controls are table stakes for any platform that lets users create content.

---

## User Workflows

**Edit Club:**
1. Owner navigates to their club's detail page (`/clubs/:id`)
2. Owner sees "Edit Club" button (only shown to owners)
3. Clicking navigates to `/clubs/:id/edit` — a pre-filled form
4. Owner updates name, description, location, interests, or visibility
5. On save → PATCH `/api/clubs/:id` → redirected back to `/clubs/:id`

**Delete Club:**
1. Owner is on the club detail page
2. Owner clicks "Delete Club" button
3. Two-step inline confirmation: "Confirm Delete?" appears
4. On confirm → DELETE `/api/clubs/:id` → redirected to `/dashboard`
5. Club, all its memberships, and all its posts are deleted

---

## Frontend Responsibilities

- `EditClub.jsx` — new page at `/clubs/:id/edit`
  - On mount: fetch club data (GET /clubs/:id), pre-fill the form
  - Auth guard: redirect to /login if not logged in
  - Owner guard: redirect to /clubs/:id if logged-in user is not the owner
  - Same fields and validation as CreateClub: name, description, location, interests, visibility
  - On save: PATCH /api/clubs/:id → navigate to /clubs/:id
  - Shows loading state while fetching club data

- `ClubDetails.jsx` — add owner action row below the join button area
  - "Edit Club" button → navigates to `/clubs/:id/edit`
  - "Delete Club" → two-step inline confirm (same pattern as Leave Club)
  - Buttons only shown when `isOwner === true`

- `App.jsx` — add route `/clubs/:id/edit` → `EditClub`

---

## Backend Responsibilities

- `PATCH /api/clubs/:id` — auth required, owner only
  - Same validation as create (name 3-100, description ≤500, interests required)
  - Returns updated club
- `DELETE /api/clubs/:id` — auth required, owner only
  - Deletes posts, memberships, then club (manual cascade order)
  - Returns `{ message: 'Club deleted' }`

---

## Validation Rules (Edit)

| Field       | Rules                                               |
|-------------|-----------------------------------------------------|
| name        | Required. 3–100 chars.                              |
| description | Optional. Max 500 chars.                            |
| location    | Optional. Max 100 chars.                            |
| interests   | Required. At least one tag.                         |
| visibility  | `public` or `private`                               |

---

## API Endpoints

### PATCH /api/clubs/:id

Headers: `Authorization: Bearer <token>`

Request: same shape as POST /api/clubs
```json
{ "name": "Updated Name", "description": "New desc", "interests": "photography,travel" }
```

Success (200):
```json
{ "club": { "id": 1, "name": "Updated Name", ... } }
```

### DELETE /api/clubs/:id

Headers: `Authorization: Bearer <token>`

Success (200):
```json
{ "message": "Club deleted" }
```

---

## Error Handling

| Scenario               | HTTP | Message                              |
|------------------------|------|--------------------------------------|
| Not authenticated      | 401  | `"You must be logged in"`            |
| Not the owner          | 403  | `"Only the club owner can do this"`  |
| Club not found         | 404  | `"Club not found"`                   |
| Invalid club ID        | 400  | `"Invalid club ID"`                  |
| Name too short         | 400  | `"Club name must be at least 3 characters"` |
| No interests           | 400  | `"At least one interest is required"` |

---

## Delete Cascade Order

```
1. prisma.post.deleteMany({ where: { clubId } })
2. prisma.membership.deleteMany({ where: { clubId } })
3. prisma.club.delete({ where: { id: clubId } })
```

---

## QA Checklist

- [ ] Edit Club page loads pre-filled with existing club data
- [ ] Non-owner accessing /clubs/:id/edit is redirected
- [ ] Can update name, description, location, interests, visibility
- [ ] Validation errors shown for invalid inputs
- [ ] After save: redirected to club detail page with updated data
- [ ] Delete button shows two-step confirmation
- [ ] After delete: redirected to /dashboard, club gone
- [ ] Non-owner PATCH returns 403
- [ ] Non-owner DELETE returns 403
- [ ] Delete removes all posts and memberships from DB
- [ ] Edit/Delete buttons only visible to owner on ClubDetails

---

## Future Improvements

- Transfer club ownership to another member
- Archive instead of delete (soft delete)
- Edit club image/banner
- Manage member list (remove members)
