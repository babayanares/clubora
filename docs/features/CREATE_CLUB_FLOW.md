# CREATE_CLUB_FLOW.md

> Feature flow document for creating a new club.

---

## Feature Goal

Allow authenticated users to create a new club with a name, description, and category — making it discoverable by other users on the Explore page.

---

## Business Purpose

Club creation is the core supply-side action in Clubora. Without clubs being created, there's nothing to explore or join. Every club starts here.

---

## User Workflow

1. User is logged in and navigates to `/clubs/new`
2. User fills in the club name (required), description (optional), and category (optional)
3. User submits the form
4. A new club is created in the database with the user as owner
5. User is redirected to the newly created club's detail page (`/clubs/:id`)

---

## Frontend Responsibilities

- `CreateClub.jsx` — form with name, description, category fields
- Block form submission if name is empty
- Show loading state while form submits
- Show error message if creation fails
- On success, redirect to `/clubs/:id` of the new club
- This page should only be accessible to logged-in users

---

## Backend Responsibilities

- `POST /api/clubs` — create a new club
- Require authentication (JWT must be present and valid)
- Extract `userId` from the JWT token — do not trust the client to send it
- Validate required fields
- Create the club in the database
- Optionally auto-create a Membership row for the owner (so they appear as a member)

---

## Database Interactions

```
1. prisma.club.create({
     data: {
       name,
       description,
       category,
       ownerId: userId  // from JWT
     }
   })

2. (Optional) prisma.membership.create({
     data: {
       userId,
       clubId: newClub.id,
       role: 'admin'
     }
   })
```

---

## Validation Rules

| Field       | Rules                                              |
|-------------|----------------------------------------------------|
| name        | Required. Min 3 chars. Max 100 chars.              |
| description | Optional. Max 500 chars.                           |
| category    | Optional. Max 50 chars.                            |

---

## API Endpoints

### POST /api/clubs

Headers:
```
Authorization: Bearer <jwt_token>
```

Request:
```json
{
  "name": "Photography Club",
  "description": "A club for photography enthusiasts of all levels.",
  "category": "Creative"
}
```

Success (201):
```json
{
  "club": {
    "id": 3,
    "name": "Photography Club",
    "description": "A club for photography enthusiasts of all levels.",
    "category": "Creative",
    "ownerId": 1,
    "createdAt": "2026-05-25T20:00:00.000Z"
  }
}
```

---

## Error Handling

| Scenario                 | HTTP Status | Error Message                       |
|--------------------------|-------------|-------------------------------------|
| Not authenticated        | 401         | `"You must be logged in"`           |
| Club name missing        | 400         | `"Club name is required"`           |
| Name too short           | 400         | `"Club name must be at least 3 characters"` |
| Name too long            | 400         | `"Club name must be under 100 characters"` |
| Server error             | 500         | `"Something went wrong, try again"` |

---

## Success Flow

```
User fills form and clicks Create
→ Frontend validates name is not empty
→ POST /api/clubs with JWT header
→ Backend verifies JWT
→ Backend validates input
→ prisma.club.create(...)
→ Return { club: { id, name, ... } }
→ Frontend redirects to /clubs/:id
```

---

## Edge Cases

- User submits form with only whitespace in the name field — trim before validation
- User navigates directly to `/clubs/new` without being logged in — redirect to `/login`
- User submits form twice quickly — prevent double submission (disable button on submit)
- Very long club name — enforce max length server-side
- Description with special characters (HTML, emojis) — handle safely, don't inject into DOM unsanitized

---

## QA Checklist

**Positive tests:**
- [ ] Can create a club with only a name (description and category optional)
- [ ] Can create a club with all three fields filled
- [ ] After creation, redirected to the correct `/clubs/:id` page
- [ ] New club appears on the Explore Clubs page

**Negative tests:**
- [ ] Cannot create a club without a name
- [ ] Cannot create a club with a name under 3 characters
- [ ] Cannot access `/clubs/new` without being logged in

**Validation tests:**
- [ ] Whitespace-only name is rejected
- [ ] Name over 100 chars is rejected
- [ ] Description over 500 chars is rejected

**Database verification:**
- [ ] Club row exists in DB with correct `ownerId`
- [ ] Membership row created for owner (if implemented)

---

## Future Improvements

- Club image upload (cover photo)
- Category selector (predefined list vs. free text)
- Slug-based URLs (`/clubs/photography-club` instead of `/clubs/3`)
- Club visibility setting (public / invite-only / private)
- Club tags for more granular discovery
