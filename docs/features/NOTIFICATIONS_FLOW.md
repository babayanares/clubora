# NOTIFICATIONS_FLOW.md

> Feature flow document for Join Request Notifications — bell icon + popup for the private club join approval workflow.

---

## Feature Goal

Notify club owners when someone requests to join their private club, and notify requesters when their request is approved or rejected. Both notifications appear as a bell icon in the navbar with an unread badge count. Clicking the bell opens a popup where owners can act on requests directly.

---

## Business Purpose

The Join Approval Flow (Step 13) requires the owner to discover new requests. Currently, they must navigate to each private club's detail page to see pending requests — there is no proactive signal. Without a notification, most owners will never see new requests. This feature closes the loop: request submitted → owner notified → action taken → requester notified of outcome.

---

## Notification Types

| Type | Recipient | Triggered by | Content |
|------|-----------|--------------|---------|
| `new_member` | Club owner | User joins a public club | "[Name] joined [Club]" — informational, no buttons |
| `join_request` | Club owner | User requests to join a private club | "[Name] wants to join [Club]" — shows Approve / Reject buttons |
| `join_request_owner_approved` | Club owner | Owner approves the request (converted from `join_request`) | "You accepted [Name] to join [Club]" — history record, no buttons |
| `join_request_owner_rejected` | Club owner | Owner rejects the request (converted from `join_request`) | "You rejected [Name]'s request to join [Club]" — history record, no buttons |
| `request_approved` | Requester | Owner approves their request | "Your request to join [Club] was approved!" |
| `request_rejected` | Requester | Owner rejects their request | "Your request to join [Club] was not approved." |

---

## User Workflows

**Owner receives join request notification:**
1. User requests to join owner's private club
2. Owner's bell icon shows a red badge with count
3. Owner clicks bell → popup opens showing "[Name] wants to join [Club]" with Approve / Reject buttons
4. Owner clicks Approve or Reject → action taken via same API endpoints as club detail page
5. Notification marked as read; popup updates; club detail join requests section syncs

**Requester receives response notification:**
1. Owner approves or rejects (from bell popup or club detail page)
2. Requester's bell shows a badge
3. Requester clicks bell → sees "Your request to join [Club] was approved/rejected"
4. On click: notification marked read, badge decrements

---

## Frontend Responsibilities

**`context/NotificationContext.jsx`** — shared state
- Holds `notifications[]` and `unreadCount`
- Exposes `refresh()`, `markRead(id)`, `markAllRead()`
- Both `NotificationBell` and `ClubDetails` consume this context
- Fetches from `GET /api/notifications` on mount (when logged in)

**`components/NotificationBell.jsx`** — navbar bell
- Bell icon (🔔) with red badge showing unread count
- Click → toggle popup open/closed; mark all as read on open
- Popup lists notifications newest first:
  - `new_member`: "[Name] joined [Club]" (neutral, no buttons)
  - `join_request`: "[Name] wants to join [Club]" + Approve / Reject buttons
  - `join_request_owner_approved`: "You accepted [Name] to join [Club]" (green, no buttons — history)
  - `join_request_owner_rejected`: "You rejected [Name]'s request to join [Club]" (muted, no buttons — history)
  - `request_approved`: "Your request to join [Club] was approved ✓" (green)
  - `request_rejected`: "Your request to join [Club] was not approved." (muted)
- Approve/Reject in popup call the same `/api/clubs/:id/requests/:userId/approve|reject` endpoints
- After action: notification converts to a history record in-place (no buttons), context refreshed

**`Navbar.jsx`** — add `NotificationBell` for logged-in users

**`ClubDetails.jsx`** — consume `NotificationContext`
- Pending requests list reads from context (merged with club data) so approvals from the bell popup are immediately reflected
- When owner acts from club detail page, context is refreshed

**`App.jsx`** — wrap app in `NotificationContext.Provider`

---

## Backend Responsibilities

**New: `controllers/notifications.js`**
- `GET /api/notifications` — auth required; returns current user's notifications ordered by newest first
- `PATCH /api/notifications/read-all` — marks all of current user's notifications as read

**Updated: `controllers/clubs.js`**
- `joinClub` — after creating membership, notify owner: `new_member` for public clubs, `join_request` for private clubs
- `approveRequest` — after approving, create `request_approved` notification for requester; convert owner's `join_request` to `join_request_owner_approved` (read: true)
- `rejectRequest` — after rejecting, create `request_rejected` notification for requester; convert owner's `join_request` to `join_request_owner_rejected` (read: true)

---

## Schema Changes

New model:

```prisma
model Notification {
  id           Int      @id @default(autoincrement())
  type         String   // 'join_request' | 'join_request_owner_approved' | 'join_request_owner_rejected' | 'request_approved' | 'request_rejected'
  read         Boolean  @default(false)
  createdAt    DateTime @default(now())

  userId       Int      // recipient
  clubId       Int
  clubName     String
  fromUserId   Int      // who triggered it
  fromUserName String

  user         User @relation(fields: [userId], references: [id])
}
```

Add `notifications Notification[]` to User model.

Migration name: `add_notification_model`

---

## API Endpoints

### GET /api/notifications

Headers: `Authorization: Bearer <token>`

Success (200):
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "join_request",
      "read": false,
      "createdAt": "2026-06-05T12:00:00.000Z",
      "clubId": 7,
      "clubName": "Secret Club",
      "fromUserId": 3,
      "fromUserName": "Test User"
    }
  ],
  "unreadCount": 1
}
```

### PATCH /api/notifications/read-all

Headers: `Authorization: Bearer <token>`

Success (200): `{ "message": "Notifications marked as read" }`

---

## Sync Design

`NotificationContext` is the source of truth for the bell popup. `ClubDetails` derives its pending requests from `club.memberships` (fetched from the API), not from the context. The sync works as follows:

- Owner acts from **bell popup** → API call made → context refreshes (`refresh()`) → bell updates. ClubDetails, if open, will reflect the change on next mount/fetch — not instant, but consistent.
- Owner acts from **club detail page** → API call made → `refresh()` called on context → bell unread count updates immediately.

This gives the best sync possible without WebSockets or a global state library.

---

## Validation Rules

- `new_member` notification is created when a user successfully joins a public club
- `join_request` notification is created when a user requests to join a private club
- No notification created if the user is already a member (409 is returned before notification logic)
- `read-all` only marks the authenticated user's own notifications

---

## Edge Cases

- Club deleted after notification created → notification still shows club name (stored as string), link navigates to 404
- Owner has many pending requests → all show in popup, scrollable
- User receives notification for a club they can no longer find → still shows, no crash
- Bell opened with 0 notifications → empty state message shown
- Notification created for approval/rejection from either bell or club detail → same result either way

---

## QA Checklist

- [ ] Bell badge shows unread count after someone joins a public club
- [ ] Owner sees new_member notification in popup: "[Name] joined [Club]" (no action buttons)
- [ ] Bell badge shows unread count after a join request is made
- [ ] Owner sees join_request notification in popup with requester name and club name
- [ ] Owner can Approve from bell popup — membership approved, notification converts to "You accepted X to join Y" (no buttons), requester notified
- [ ] Owner can Reject from bell popup — membership deleted, notification converts to "You rejected X's request to join Y" (no buttons), requester notified
- [ ] After acting from popup, club detail join requests section no longer shows the request on next load
- [ ] After acting from club detail page, bell unread count updates
- [ ] Requester sees request_approved notification in their bell after approval
- [ ] Requester sees request_rejected notification in their bell after rejection
- [ ] Bell badge disappears after opening popup (all marked read)
- [ ] Empty state shown when no notifications
- [ ] Notification bell only visible when logged in

---

## Future Improvements

- Real-time notifications via WebSocket
- Notification preferences (opt out of certain types)
- Email notification fallback
- Notification history page
- Per-notification mark as read (currently marks all on open)
