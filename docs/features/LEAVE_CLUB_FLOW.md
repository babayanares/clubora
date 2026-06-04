# LEAVE_CLUB_FLOW.md

> Feature flow document for Leave Club — a member removes themselves from a club.

---

## Feature Goal

Allow a club member to leave a club they've previously joined. Owners cannot leave their own club — they must delete it instead.

---

## Business Purpose

Join without Leave creates a one-way door. Users need to be able to change their mind, reduce noise from clubs they're no longer active in, and manage their membership list. Leave is the natural complement to Join and completes the basic membership lifecycle.

---

## User Workflow

1. Member navigates to a club detail page they've joined
2. The "Joined ✓" badge is replaced with a "Leave Club" button
3. User clicks "Leave Club" — button changes to "Confirm Leave?" as a safety step
4. User clicks "Confirm Leave?" to confirm, or clicks elsewhere to cancel
5. Request sent to `DELETE /api/clubs/:id/leave`
6. On success: button reverts to "Join Club", member count decrements by 1
7. Club owners see "You own this club" — no leave action available

---

## Frontend Responsibilities

- `ClubDetails.jsx` — replace static "Joined ✓" badge with an interactive leave flow
- Two-step confirmation inline on the button (no modal):
  - First click: button text changes to "Confirm Leave?" (danger style)
  - Second click: executes the leave request
  - Any navigation or blur cancels the confirmation state
- On successful leave: update local state — remove self from memberships, decrement count
- Disable button during request (prevent double-submit)
- Show inline error if leave fails

---

## Backend Responsibilities

- `DELETE /api/clubs/:id/leave` — auth required
- Validates: club exists, user is a member, user is not the owner
- Deletes the Membership record
- Returns updated member count

---

## Database Interactions

**Leave club:**
```
prisma.membership.delete({
  where: { userId_clubId: { userId: req.user.userId, clubId: id } }
})
```

**Get updated count:**
```
prisma.membership.count({ where: { clubId: id } })
```

---

## Validation Rules

| Scenario                    | Behavior                                        |
|-----------------------------|-------------------------------------------------|
| Club does not exist         | 404 — Club not found                            |
| User is not a member        | 404 — You are not a member of this club         |
| User is the owner (admin)   | 403 — Club owners cannot leave their own club   |
| User is not authenticated   | 401 — You must be logged in                     |
| Invalid club ID (non-int)   | 400 — Invalid club ID                           |

---

## API Endpoint

### DELETE /api/clubs/:id/leave

Headers: `Authorization: Bearer <token>`

Success (200):
```json
{
  "memberCount": 3
}
```

---

## Error Handling

| Scenario              | HTTP | Error Message                                   |
|-----------------------|------|-------------------------------------------------|
| Not authenticated     | 401  | `"You must be logged in"`                       |
| Invalid club ID       | 400  | `"Invalid club ID"`                             |
| Club not found        | 404  | `"Club not found"`                              |
| Not a member          | 404  | `"You are not a member of this club"`           |
| User is owner         | 403  | `"Club owners cannot leave their own club"`     |

---

## Button State Flow

```
isMember = true
  → "Leave Club" button (neutral style)
  → click → confirmLeave = true
  → "Confirm Leave?" button (danger style)
  → click → DELETE /api/clubs/:id/leave
  → success → isMember = false, count--
  → button reverts to "Join Club"
```

---

## Edge Cases

- Owner tries to leave — blocked with 403; UI shows "You own this club" (no leave button)
- Double-click during request — button disabled while request is in flight
- Network failure — show inline error, reset confirmation state
- User navigates away and back — fresh fetch shows correct state

---

## QA Checklist

- [ ] Member sees "Leave Club" button on club detail page
- [ ] First click shows "Confirm Leave?" (two-step confirmation)
- [ ] Second click executes leave request
- [ ] After leaving: button changes to "Join Club"
- [ ] After leaving: member count decrements by 1
- [ ] Button disabled during request
- [ ] Owner does not see leave button
- [ ] Non-member does not see leave button
- [ ] 403 returned if owner attempts DELETE via API
- [ ] 404 returned if non-member attempts DELETE via API
- [ ] Leave then rejoin works correctly

---

## Future Improvements

- Leave from the My Clubs dashboard directly
- Owner can transfer ownership before leaving
- Notification to owner when a member leaves
