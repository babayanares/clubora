# JOIN_APPROVAL_FLOW.md

> Feature flow document for Join Approval Flow — private club gating via owner-approved join requests.

---

## Feature Goal

When a user tries to join a private club, instead of a hard 403 block, they submit a join request. The club owner sees pending requests and can approve or reject each one. Approved users become members; rejected requests are removed.

---

## Business Purpose

Private clubs are currently un-joinable — users get a 403 and see no path forward. Without an approval flow, the `visibility: 'private'` feature is useless for real communities. This closes the loop: private clubs can grow, just with owner oversight.

---

## User Workflows

**Requesting to join a private club:**
1. User views a private club's detail page
2. Instead of "🔒 Private Club" badge, they see a "Request to Join" button
3. User clicks "Request to Join" → POST /api/clubs/:id/join
4. Button changes to "Request Pending ⏳" (disabled)
5. User cannot post in the club until approved

**Owner approving/rejecting requests:**
1. Owner views their private club's detail page
2. A "Join Requests" section appears showing pending members (name + actions)
3. Owner clicks "Approve" → PATCH /api/clubs/:id/requests/:userId/approve
4. User becomes a full member; card removed from requests list, count increments
5. Owner clicks "Reject" → DELETE /api/clubs/:id/requests/:userId/reject
6. Request removed; user returns to "Request to Join" state on next visit

---

## Schema Changes

Add `status` field to `Membership`:

```prisma
model Membership {
  status    String   @default("approved")
  // rest unchanged
}
```

- `"approved"` — active member (all existing memberships, public club joins)
- `"pending"` — awaiting owner approval (private club join requests)

Migration name: `add_status_to_membership`

**Impact on existing code:** All membership counts must filter by `status: "approved"` to exclude pending requests from member counts.

---

## Frontend Responsibilities

**ClubDetails.jsx — join button states (updated):**
- Private club, not logged in → "Log in to Join"
- Private club, no membership → "Request to Join" button
- Private club, `status: pending` → "Request Pending ⏳" (disabled)
- Private club, `status: approved` → "Leave Club" button (same as public)
- Public club → unchanged

**ClubDetails.jsx — owner view (private club only):**
- "Join Requests (N)" section below club info
- Each row: requester name + "Approve" / "Reject" buttons
- Approve: update count, remove from requests list
- Reject: remove from requests list

**GET /clubs/:id response updated:**
- `memberships` now includes `status` and `user: { id, name }`
- Frontend uses this to: find own membership status; show owner the pending requests list

---

## Backend Responsibilities

- Add `status` to Membership model, migrate
- Update `joinClub`: private clubs create `status: "pending"` instead of 403
- Update `getClub`: include `status` and `user.name` in memberships
- Update all membership counts to filter `status: "approved"` only
- Add `approveRequest`: PATCH /api/clubs/:id/requests/:userId
- Add `rejectRequest`: DELETE /api/clubs/:id/requests/:userId
- Both owner-only

---

## API Endpoints

### POST /api/clubs/:id/join (updated)

Private club now returns 202 (pending) instead of 403:
```json
{
  "membership": { "userId": 3, "clubId": 2, "role": "member", "status": "pending" },
  "pending": true
}
```

### PATCH /api/clubs/:id/requests/:userId/approve

Headers: `Authorization: Bearer <owner_token>`

Success (200):
```json
{ "membership": { "userId": 3, "status": "approved" }, "memberCount": 4 }
```

### DELETE /api/clubs/:id/requests/:userId/reject

Headers: `Authorization: Bearer <owner_token>`

Success (200):
```json
{ "message": "Request rejected" }
```

---

## Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Not authenticated | 401 | `"You must be logged in"` |
| Not the owner (approve/reject) | 403 | `"Only the club owner can do this"` |
| No pending request found | 404 | `"Join request not found"` |
| Already a member (join) | 409 | `"You are already a member of this club"` |

---

## Member Count Impact

All places returning member counts must filter `status: "approved"`:
- `getClubs` — `_count.memberships` where `status: approved`
- `getClub` — same
- `joinClub` — `membership.count` where `status: approved`
- `leaveClub` — same
- `getProfile` — `_count.memberships` in club select

---

## QA Checklist

- [ ] Private club shows "Request to Join" button (not "🔒 Private Club")
- [ ] After requesting: button shows "Request Pending ⏳"
- [ ] Pending requests do NOT count toward member count
- [ ] Owner sees "Join Requests" section on private club page
- [ ] Owner can approve — user becomes member, count increments
- [ ] Owner can reject — request disappears
- [ ] POST /clubs/:id/join on private club returns 202 + pending: true
- [ ] PATCH approve returns 200 + updated memberCount
- [ ] DELETE reject returns 200
- [ ] Non-owner approve/reject returns 403
- [ ] Public club join flow unchanged

---

## Future Improvements

- Email/in-app notification to owner on new join request
- Email/in-app notification to requester on approval/rejection
- Request message ("I want to join because…")
- Bulk approve/reject
