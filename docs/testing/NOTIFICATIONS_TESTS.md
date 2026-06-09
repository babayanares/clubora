# NOTIFICATIONS_TESTS.md

> Testing for Join Request Notifications — bell icon, popup, approve/reject sync.

---

## Scope

Covers GET /api/notifications, PATCH /api/notifications/read-all, notification creation inside joinClub/approveRequest/rejectRequest, NotificationBell component, and context sync with ClubDetails.

---

## API Tests

### GET /api/notifications

**No notifications (fresh user):**
```bash
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>" | jq .
# Expected: { notifications: [], unreadCount: 0 }
```

**After requesting to join private club:**
```bash
# Requester requests to join
curl -s -X POST http://localhost:5000/api/clubs/<private_id>/join \
  -H "Authorization: Bearer <requester_token>" | jq .

# Owner fetches notifications
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <owner_token>" | jq .
# Expected: { notifications: [{ type: 'join_request', read: false, fromUserName: '...' }], unreadCount: 1 }
```

**No token (expect 401):**
```bash
curl -s http://localhost:5000/api/notifications | jq .error
# Expected: "You must be logged in"
```

### PATCH /api/notifications/read-all

```bash
curl -s -X PATCH http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer <token>" | jq .
# Expected: { message: "Notifications marked as read" }

# Verify — fetch again
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>" | jq .unreadCount
# Expected: 0
```

### Notification created on approval

```bash
# Owner approves
curl -s -X PATCH http://localhost:5000/api/clubs/<id>/requests/<userId>/approve \
  -H "Authorization: Bearer <owner_token>" | jq .

# Requester fetches notifications
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <requester_token>" | jq .
# Expected: { notifications: [{ type: 'request_approved', clubName: '...' }], unreadCount: 1 }
```

### Notification created on rejection

```bash
# Owner rejects
curl -s -X DELETE http://localhost:5000/api/clubs/<id>/requests/<userId>/reject \
  -H "Authorization: Bearer <owner_token>" | jq .

# Requester fetches notifications
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <requester_token>" | jq .
# Expected: { notifications: [{ type: 'request_rejected', clubName: '...' }], unreadCount: 1 }
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Not logged in | Bell not shown in navbar | |
| Logged in, no notifications | Bell shown, no badge | |
| Logged in, unread notifications | Bell shown with red badge count | |
| Click bell | Popup opens, all notifications shown | |
| Bell opened | All marked read, badge disappears | |
| join_request notification in popup | Shows requester name, club name, Approve + Reject buttons | |
| Click Approve in popup | Membership approved, notification converts to "You accepted X to join Y" (no buttons), requester notified | |
| Click Reject in popup | Membership deleted, notification converts to "You rejected X's request to join Y" (no buttons), requester notified | |
| Reopen bell after approve/reject | History record still present (persisted in DB with updated type) | |
| request_approved notification | Green "approved" message shown | |
| request_rejected notification | Muted "not approved" message shown | |
| No notifications | Empty state shown in popup | |
| Acting from club detail page | Bell unread count updates | |
| Acting from bell popup | Club detail join requests no longer shows on next visit | |

---

## Sync Regression Tests

- [ ] Club detail Join Requests section still works independently
- [ ] Approving from club detail creates request_approved notification for requester
- [ ] Rejecting from club detail creates request_rejected notification for requester
- [ ] Public club joins do NOT create any notifications

---

## DB Verification

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, 'database/dev.db') });
const prisma = new PrismaClient({ adapter });
prisma.notification.findMany({
  orderBy: { createdAt: 'desc' },
  select: { id: true, type: true, read: true, userId: true, fromUserName: true, clubName: true }
}).then(ns => { console.log(ns); prisma.\$disconnect(); });
"
```
