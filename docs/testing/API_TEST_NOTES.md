# API_TEST_NOTES.md

> **Why this file exists:** Documents how to test the Clubora API manually — the approach, expected response shapes, and common error patterns. Useful before Postman collections or automated tests exist.
>
> **When to update:** When new routes are added or response structure changes.
>
> **How to use:** Reference this when testing any backend route from curl, Postman, or a frontend network tab.

---

## API Testing Approach

For MVP, API testing is **manual and incremental**:

1. Test each route immediately after implementing it
2. Use curl in the terminal for quick checks
3. Use the browser Network tab to inspect real frontend requests
4. Log issues in `KNOWN_ISSUES.md` if behavior is wrong
5. Automated API tests (Jest + Supertest) are a future addition

**Base URL:** `http://localhost:5000/api`

---

## Standard Response Structure

Every API response should follow this shape:

**Success:**
```json
{
  "data": { ... }
}
```
or for actions:
```json
{
  "message": "Club created successfully",
  "club": { ... }
}
```

**Error:**
```json
{
  "error": "Human-readable error message"
}
```

Never return raw Prisma error objects or stack traces to the client.

---

## HTTP Status Codes Used

| Code | When to use                                              |
|------|----------------------------------------------------------|
| 200  | Successful GET or PATCH                                  |
| 201  | Successful POST (resource created)                       |
| 400  | Validation failure (bad input from client)               |
| 401  | Not authenticated (no token or invalid token)            |
| 403  | Authenticated but not allowed (wrong user/owner)         |
| 404  | Resource not found                                       |
| 409  | Conflict (duplicate email, already a member)             |
| 500  | Unexpected server error                                  |

---

## Route Reference

### Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{ "status": "ok", "timestamp": "..." }` — 200

---

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Rivera","email":"alex@example.com","password":"securepassword"}'
```
Expected: `{ "token": "...", "user": { "id": 1, "name": "...", "email": "..." } }` — 201

---

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"securepassword"}'
```
Expected: `{ "token": "...", "user": { ... } }` — 200

---

### Get All Clubs
```bash
curl http://localhost:5000/api/clubs
```
Expected: `{ "clubs": [ ... ] }` — 200 (empty array is fine)

---

### Get Single Club
```bash
curl http://localhost:5000/api/clubs/1
```
Expected: `{ "club": { "id": 1, "name": "...", ... } }` — 200
Not found: `{ "error": "Club not found" }` — 404

---

### Create Club (auth required)
```bash
curl -X POST http://localhost:5000/api/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Photography Club","description":"For photographers","category":"Creative"}'
```
Expected: `{ "club": { "id": 3, "name": "Photography Club", ... } }` — 201
No token: `{ "error": "You must be logged in" }` — 401

---

### Get User Profile (auth required)
```bash
curl http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: `{ "user": { "id": 1, "name": "...", "email": "...", "memberships": [...] } }` — 200

---

## Validation Error Response Examples

**Missing required field:**
```json
{
  "error": "Club name is required"
}
```

**Field too short:**
```json
{
  "error": "Club name must be at least 3 characters"
}
```

**Invalid email:**
```json
{
  "error": "Invalid email address"
}
```

**Duplicate email:**
```json
{
  "error": "Email is already in use"
}
```

---

## Error Testing Checklist

For each route, test these error scenarios:

- [ ] Missing required fields → 400
- [ ] Invalid format (email, etc.) → 400
- [ ] Accessing protected route without token → 401
- [ ] Accessing protected route with bad/expired token → 401
- [ ] Resource not found → 404
- [ ] Duplicate unique field → 409
- [ ] Completely empty request body → 400 or 422

---

## Tips for API Testing

- Use `| jq .` at the end of curl commands for pretty-printed JSON output (requires jq installed)
- Save your JWT token in a shell variable: `TOKEN="eyJ..."` then use `$TOKEN` in subsequent curl calls
- Check the Express server terminal for error logs when something returns 500
- Use `prisma studio` to visually confirm DB state after create/update operations
