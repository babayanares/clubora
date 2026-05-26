# USER_PROFILE_FLOW.md

> Feature flow document for viewing and editing a user profile.

---

## Feature Goal

Allow users to view their own profile, see the clubs they've joined, and update their display name.

---

## Business Purpose

A profile page gives users a sense of identity on the platform and shows their club activity. It also enables features like "view who joined this club" — profiles are the social glue.

---

## User Workflow

**View own profile:**
1. Logged-in user navigates to `/profile`
2. Their name, email, and joined clubs are displayed

**Edit profile:**
1. User clicks "Edit Profile"
2. Name field becomes editable
3. User updates their name and saves
4. Profile page reflects the new name

---

## Frontend Responsibilities

- `Profile.jsx` — display user info and joined clubs
- On mount, fetch profile data from `GET /api/users/:id` (using ID from stored token)
- Show name, email, list of joined clubs
- Provide an "Edit" button that reveals an editable name field
- On save, call `PATCH /api/users/:id` with updated name
- Show success/error feedback after saving
- This page is only accessible to logged-in users

---

## Backend Responsibilities

- `GET /api/users/:id` — return user profile with their clubs
- `PATCH /api/users/:id` — update user's name
- Both routes require authentication
- Users can only view/edit their own profile (for MVP)

---

## Database Interactions

**Get profile:**
```
prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    memberships: {
      include: { club: true }
    }
  }
})
```

**Update profile:**
```
prisma.user.update({
  where: { id },
  data: { name }
})
```

---

## Validation Rules

| Field | Rules                             |
|-------|-----------------------------------|
| name  | Required. Min 2 chars. Max 100 chars. |

Password change is out of scope for MVP.
Email change is out of scope for MVP.

---

## API Endpoints

### GET /api/users/:id

Headers: `Authorization: Bearer <token>`

Success (200):
```json
{
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "createdAt": "2026-05-25T20:00:00.000Z",
    "memberships": [
      {
        "club": {
          "id": 2,
          "name": "Photography Club",
          "category": "Creative"
        },
        "role": "member",
        "joinedAt": "2026-05-26T10:00:00.000Z"
      }
    ]
  }
}
```

### PATCH /api/users/:id

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "name": "Alex R."
}
```

Success (200):
```json
{
  "user": {
    "id": 1,
    "name": "Alex R.",
    "email": "alex@example.com"
  }
}
```

---

## Error Handling

| Scenario                       | HTTP Status | Error Message                    |
|--------------------------------|-------------|----------------------------------|
| Not authenticated              | 401         | `"You must be logged in"`        |
| Trying to view another user    | 403         | `"Not authorized"`               |
| User not found                 | 404         | `"User not found"`               |
| Name too short                 | 400         | `"Name must be at least 2 characters"` |
| Name missing                   | 400         | `"Name is required"`             |

---

## Success Flow

```
User navigates to /profile
→ Frontend reads userId from JWT
→ GET /api/users/:id
→ Display name, email, clubs
→ User clicks Edit
→ Name input becomes editable
→ User updates name, clicks Save
→ PATCH /api/users/:id
→ DB updated
→ Profile re-renders with new name
```

---

## Edge Cases

- User directly visits `/profile/:id` of another user — for MVP, show 403 or redirect to own profile
- Token contains a userId that no longer exists in DB — return 404
- User updates name to only whitespace — trim and reject
- User hasn't joined any clubs — show "You haven't joined any clubs yet" with a link to Explore

---

## QA Checklist

- [ ] Profile page shows correct name and email
- [ ] Profile page shows list of joined clubs
- [ ] Empty state shown when user has no memberships
- [ ] Can update name successfully
- [ ] Cannot save empty name
- [ ] Cannot save name under 2 characters
- [ ] Profile page inaccessible without login
- [ ] DB reflects updated name after save

---

## Future Improvements

- Upload a profile photo
- Add a bio / about section
- View clubs the user owns vs. clubs they've joined
- Public profile view (other users can see your profile)
- Change email or password
- Delete account
