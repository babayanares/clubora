# ADMIN_PANEL_TESTS.md

> Testing for Step 14: Basic Admin Panel — platform stats, club management, user overview.

---

## Scope

Covers `GET /api/admin/stats`, `GET /api/admin/clubs`, `DELETE /api/admin/clubs/:id`, `GET /api/admin/users`, the AdminPanel page, and Navbar admin link visibility.

---

## API Tests

### GET /api/admin/stats

**Happy path (admin token):**
```bash
curl -s http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <admin_token>" | jq .
# Expected: { stats: { userCount, clubCount, postCount, membershipCount } }
```

**No token (expect 401):**
```bash
curl -s http://localhost:5000/api/admin/stats | jq .error
# Expected: "You must be logged in"
```

**Non-admin token (expect 403):**
```bash
curl -s http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <regular_user_token>" | jq .error
# Expected: "Admin access required"
```

---

### GET /api/admin/clubs

**Happy path:**
```bash
curl -s http://localhost:5000/api/admin/clubs \
  -H "Authorization: Bearer <admin_token>" | jq '.clubs | length'
# Expected: total club count
```

**Non-admin (expect 403):**
```bash
curl -s http://localhost:5000/api/admin/clubs \
  -H "Authorization: Bearer <regular_user_token>" | jq .error
# Expected: "Admin access required"
```

---

### DELETE /api/admin/clubs/:id

**Happy path:**
```bash
curl -s -X DELETE http://localhost:5000/api/admin/clubs/<id> \
  -H "Authorization: Bearer <admin_token>" | jq .
# Expected: { message: "Club deleted" }
```

**Non-existent club (expect 404):**
```bash
curl -s -X DELETE http://localhost:5000/api/admin/clubs/99999 \
  -H "Authorization: Bearer <admin_token>" | jq .error
# Expected: "Club not found"
```

**Non-numeric ID (expect 400):**
```bash
curl -s -X DELETE http://localhost:5000/api/admin/clubs/abc \
  -H "Authorization: Bearer <admin_token>" | jq .error
# Expected: "Invalid club ID"
```

**Non-admin (expect 403):**
```bash
curl -s -X DELETE http://localhost:5000/api/admin/clubs/<id> \
  -H "Authorization: Bearer <regular_user_token>" | jq .error
# Expected: "Admin access required"
```

---

### GET /api/admin/users

**Happy path:**
```bash
curl -s http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin_token>" | jq '.users[] | {name, email, role}'
# Expected: all users with role field
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Visit `/admin` when not logged in | Redirected to `/login` | |
| Visit `/admin` as regular user | Redirected to `/dashboard` | |
| Visit `/admin` as admin | Admin panel shown with stats and tables | |
| Stat cards show correct counts | All 4 stats match DB | |
| All clubs shown in clubs table | Names, owners, visibility, counts correct | |
| All users shown in users table | Name, email, role badge, counts correct | |
| Admin has "admin" role badge (purple) | Distinct from "user" badge (green) | |
| Delete first click | Shows "Confirm Delete?" text | |
| Delete confirm click | Club removed from table, club count decrements | |
| Deleted club no longer in Explore | Correct cascade delete | |
| Admin link visible in Navbar | Only shown for admin role | |
| Admin link not visible for regular user | Absent from Navbar | |
| Admin logs out and logs back in | Fresh token contains role, Admin link re-appears | |

---

## Regression Tests

- [ ] Regular users cannot access any `/api/admin/*` routes (403)
- [ ] Existing club creation, join, leave flows unaffected
- [ ] Auth login/register responses now include `role` field
- [ ] Non-admin users: `role` field is `"user"` in login response
- [ ] Admin user: `role` field is `"admin"` in login response
