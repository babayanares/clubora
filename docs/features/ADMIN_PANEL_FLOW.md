# ADMIN_PANEL_FLOW.md

> Feature flow document for Step 14: Basic Admin Panel — platform-level visibility and moderation.

---

## Business Purpose

As the platform grows, there must be a way to see its overall health and remove bad content without direct database access. The admin panel gives a designated superadmin user a single screen showing platform stats and the ability to delete any club. Without this, moderation requires a database client and knowledge of Prisma — not viable post-launch.

---

## User Workflow

1. Admin navigates to `/admin`
2. If not logged in → redirected to `/login`
3. If logged in but not admin → redirected to `/dashboard`
4. Admin sees four stat cards: total users, clubs, posts, active memberships
5. Admin sees a full clubs table: name, owner, visibility, member count, post count, delete button
6. Admin sees a full users table: name, email, role badge, clubs owned, clubs joined
7. Admin can delete any club (two-step confirm: "Delete" → "Confirm Delete?")
8. On delete: cascade removes all posts, memberships, then the club
9. Club disappears from the table immediately after deletion

---

## Frontend Responsibilities

**`pages/AdminPanel.jsx`** — new page at `/admin`
- On mount: read user from localStorage; if no user or `user.role !== 'admin'` → `navigate('/dashboard')`
- Fetch in parallel: `GET /api/admin/stats`, `GET /api/admin/clubs`, `GET /api/admin/users`
- Loading state while fetching; error state if any fetch fails
- Stat cards: Users, Clubs, Posts, Active Memberships
- Clubs table: Name, Owner, Visibility, Members, Posts, Delete action
- Users table: Name, Email, Role, Clubs Owned, Clubs Joined
- Delete: two-step inline confirm per row (same pattern as club owner delete)
- After delete: remove club from local state + decrement stats

**`components/Navbar.jsx`** — add Admin link
- Show "Admin" link only when `user?.role === 'admin'`

**`pages/App.jsx`** — add route
- `<Route path="/admin" element={<AdminPanel />} />`

---

## Backend Responsibilities

**New: `middleware/admin.js`**
- `requireAdmin` — checks `req.user.role === 'admin'`; returns 403 if not

**New: `controllers/admin.js`**
- `getStats` — parallel count queries for users, clubs, posts, approved memberships
- `getAdminClubs` — all clubs with owner info and counts
- `deleteAdminClub` — cascade delete (posts → memberships → club); same pattern as owner delete
- `getAdminUsers` — all users with role and counts

**New: `routes/admin.js`**
```
GET    /api/admin/stats       — platform stats
GET    /api/admin/clubs       — all clubs
DELETE /api/admin/clubs/:id   — delete any club
GET    /api/admin/users       — all users
```
All routes: `requireAuth` + `requireAdmin`

**Updated: `controllers/auth.js`**
- `makeToken` and both user response objects include `role`
- Allows Navbar and frontend guards to read role without extra API call

---

## DB Interactions

- **Migration**: add `role String @default("user")` to User model
- **Migration name**: `add_role_to_user`
- **Seed**: create admin user (`admin@clubora.com`, role: `"admin"`) via `prisma/seed.js`
- **Reads**: `user.count()`, `club.count()`, `post.count()`, `membership.count()`, `club.findMany()`, `user.findMany()`
- **Delete**: `post.deleteMany()` → `membership.deleteMany()` → `club.delete()`

---

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| `/admin` page only accessible to admin users | Frontend redirect + backend 403 |
| Admin role checked on every backend request | `requireAdmin` middleware via DB-sourced JWT claim |
| Delete target must exist | 404 if club not found |
| Non-numeric club ID | 400 — invalid ID |

---

## Edge Cases

| Scenario | Expected behavior |
|----------|-------------------|
| Non-admin visits `/admin` | Redirected to `/dashboard` |
| Unauthenticated user visits `/admin` | Redirected to `/login` (via 401 interceptor) |
| Admin deletes a club they also own | Works — same cascade delete |
| Admin deletes a club with no posts/members | Works — deleteMany with no rows is a no-op |
| Admin user has no clubs to show | Empty state shown in clubs table |
| Platform has no users other than admin | Only admin shown in users table |

---

## QA Checklist

- [ ] `/admin` redirects non-admin logged-in users to `/dashboard`
- [ ] `/admin` redirects unauthenticated users to `/login`
- [ ] Admin sees correct stat counts (users, clubs, posts, memberships)
- [ ] All clubs appear in the clubs table with correct owner and counts
- [ ] All users appear in the users table with correct role badge
- [ ] Delete first click shows "Confirm Delete?" (no immediate deletion)
- [ ] Delete confirm click removes the club from the table
- [ ] Deleted club no longer appears on Explore page
- [ ] Admin link visible in Navbar only when logged in as admin
- [ ] Admin link not visible for regular users
- [ ] `GET /api/admin/stats` returns 403 for non-admin token
- [ ] `DELETE /api/admin/clubs/:id` returns 403 for non-admin token
- [ ] `DELETE /api/admin/clubs/999` returns 404 for non-existent club
