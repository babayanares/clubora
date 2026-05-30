# USER_PROFILE_FLOW.md

> Feature flow document for the Profile Setup feature — viewing and editing a user's own profile.

---

## Feature Goal

Allow authenticated users to view and update their profile: name, bio, and location. Also shows a list of clubs they've joined so the profile page serves as a lightweight personal dashboard.

---

## Business Purpose

A profile page gives users an identity on the platform. Bio and location help others understand who they are when viewing club membership lists. Profile data also enables future features like interest-based recommendations and public profiles.

---

## User Workflow

**View own profile:**
1. Logged-in user navigates to `/profile`
2. Their name, email, bio, location, and joined clubs are displayed

**Edit profile:**
1. User clicks "Edit Profile"
2. Name, bio, and location fields become editable
3. User updates one or more fields and clicks "Save"
4. Profile re-renders with new values

---

## Frontend Responsibilities

- `Profile.jsx` — display and edit user info; list joined clubs
- On mount, read `userId` from stored user object in localStorage
- Call `GET /api/users/:id` to fetch full profile data
- Guard route: redirect to `/login` if not logged in
- Show name, email (read-only), bio (optional), location (optional)
- "Edit Profile" toggles editable mode for name, bio, location
- On save, call `PATCH /api/users/:id` with updated fields
- Show success/error feedback after saving
- List joined clubs with links to each club's detail page
- Empty state when user has no memberships

---

## Backend Responsibilities

- `GET /api/users/:id` — return user profile with their club memberships
- `PATCH /api/users/:id` — update name, bio, and/or location
- Both routes require authentication (`requireAuth` middleware)
- Users can only view/edit their own profile — return 403 for other user IDs

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
    bio: true,
    location: true,
    createdAt: true,
    memberships: {
      include: {
        club: {
          select: { id: true, name: true, category: true, visibility: true }
        }
      },
      orderBy: { joinedAt: 'desc' }
    }
  }
})
```

**Update profile:**
```
prisma.user.update({
  where: { id },
  data: { name, bio, location },
  select: { id: true, name: true, email: true, bio: true, location: true }
})
```

---

## Schema Changes Required

Add two optional fields to the `User` model:
- `bio String?` — short personal description
- `location String?` — city or region

These require a new migration: `add_bio_location_to_user`.

---

## Validation Rules

| Field    | Rules                                         |
|----------|-----------------------------------------------|
| name     | Required. Min 2 chars. Max 100 chars. Trim whitespace. |
| bio      | Optional. Max 300 chars.                      |
| location | Optional. Max 100 chars.                      |

Email and password changes are out of scope for MVP.

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
    "bio": "Photographer and weekend hiker.",
    "location": "Los Angeles, CA",
    "createdAt": "2026-05-25T20:00:00.000Z",
    "memberships": [
      {
        "joinedAt": "2026-05-26T10:00:00.000Z",
        "role": "admin",
        "club": {
          "id": 1,
          "name": "Photography Club",
          "category": "Creative",
          "visibility": "public"
        }
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
  "name": "Alex R.",
  "bio": "Photographer, hiker, coffee enthusiast.",
  "location": "San Francisco, CA"
}
```

Success (200):
```json
{
  "user": {
    "id": 1,
    "name": "Alex R.",
    "email": "alex@example.com",
    "bio": "Photographer, hiker, coffee enthusiast.",
    "location": "San Francisco, CA"
  }
}
```

---

## Error Handling

| Scenario                       | HTTP Status | Error Message                          |
|--------------------------------|-------------|----------------------------------------|
| Not authenticated              | 401         | `"You must be logged in"`              |
| Trying to view another user    | 403         | `"Not authorized"`                     |
| User not found                 | 404         | `"User not found"`                     |
| Name is empty / whitespace     | 400         | `"Name is required"`                   |
| Name too short (< 2 chars)     | 400         | `"Name must be at least 2 characters"` |
| Name too long (> 100 chars)    | 400         | `"Name cannot exceed 100 characters"`  |
| Bio too long (> 300 chars)     | 400         | `"Bio cannot exceed 300 characters"`   |
| Location too long (> 100 chars)| 400         | `"Location cannot exceed 100 characters"` |

---

## Success Flow

```
User navigates to /profile
→ Frontend reads user from localStorage
→ GET /api/users/:id
→ Display name, email, bio, location, joined clubs
→ User clicks "Edit Profile"
→ Fields become editable
→ User updates values, clicks "Save"
→ PATCH /api/users/:id
→ DB updated
→ Profile re-renders with new values
→ localStorage user object updated with new name
```

---

## Edge Cases

- User directly navigates to `/profile` — must be auth-guarded (redirect to `/login`)
- PATCH with no body fields — validate that at least name is present
- Name updated to only whitespace — trim and reject as empty
- User has no club memberships — show empty state with link to Explore
- Bio/location not provided in PATCH — treat as clearing those fields (set to null)

---

## QA Checklist

- [ ] Profile page shows correct name, email, bio, location
- [ ] Profile page shows list of joined clubs with links
- [ ] Empty state shown when user has no memberships
- [ ] Can update name, bio, and location successfully
- [ ] Cannot save with empty or whitespace-only name
- [ ] Cannot save name under 2 characters
- [ ] Cannot save name over 100 characters
- [ ] Bio over 300 chars is rejected
- [ ] Profile page redirects to /login if not authenticated
- [ ] Attempting to view another user's profile returns 403
- [ ] DB reflects updated values after save
- [ ] localStorage user object has new name after save

---

## Future Improvements

- Upload a profile photo
- Public profile view (other users can view your profile)
- View clubs owned vs. clubs joined separately
- Change password flow
- Delete account
- Interest selection (tracked separately — step 5 in implementation order)
