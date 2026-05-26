# CREATE_CLUB_TESTS.md

> **Why this file exists:** A dedicated test document for the Create Club feature — one of the core flows of the MVP. Covers positive, negative, and edge-case scenarios across all three layers.
>
> **When to update:** After the feature is implemented, or when validation rules change.
>
> **How to use:** Run through this checklist after any change to the Create Club flow.

---

## Feature Summary

**Route:** `/clubs/new`
**API:** `POST /api/clubs`
**Auth required:** Yes (JWT token)
**DB action:** Creates a row in the `Club` table

---

## Positive Tests (should succeed)

### P1 — Create club with all fields

**Input:**
```json
{
  "name": "Photography Club",
  "description": "A club for photographers of all levels.",
  "category": "Creative"
}
```
**Expected:** 201 response, club created in DB, redirect to `/clubs/:id`

---

### P2 — Create club with name only

**Input:**
```json
{
  "name": "Running Club"
}
```
**Expected:** 201 response, club created, description and category are null

---

### P3 — Name at minimum length (3 chars)

**Input:**
```json
{
  "name": "Art"
}
```
**Expected:** 201 — 3 chars is valid

---

### P4 — Name at maximum length (100 chars)

**Input:** Name exactly 100 characters long
**Expected:** 201 — 100 chars is valid

---

### P5 — Description at maximum length (500 chars)

**Input:** Valid name + description exactly 500 characters
**Expected:** 201 — 500 chars is valid

---

## Negative Tests (should fail)

### N1 — No auth token

**Headers:** None (no Authorization header)
**Input:** `{ "name": "Unauthorized Club" }`
**Expected:** 401 — You must be logged in

---

### N2 — Missing club name

**Input:**
```json
{
  "description": "A club with no name"
}
```
**Expected:** 400 — Club name is required

---

### N3 — Empty string name

**Input:**
```json
{
  "name": ""
}
```
**Expected:** 400 — Club name is required

---

### N4 — Name under minimum length

**Input:**
```json
{
  "name": "AB"
}
```
**Expected:** 400 — Club name must be at least 3 characters

---

### N5 — Name over maximum length

**Input:** Name with 101+ characters
**Expected:** 400 — Club name must be under 100 characters

---

### N6 — Description over maximum length

**Input:** Valid name + description with 501+ characters
**Expected:** 400 — Description is too long

---

## Validation Tests

### V1 — Whitespace-only name

**Input:**
```json
{
  "name": "     "
}
```
**Expected:** 400 — Club name is required (trim before validate)

---

### V2 — Name with special characters

**Input:**
```json
{
  "name": "Alex's Book Club & Friends!"
}
```
**Expected:** 201 — Special characters in names should be allowed

---

### V3 — Unknown extra fields

**Input:**
```json
{
  "name": "Valid Club",
  "isAdmin": true,
  "ownerId": 999
}
```
**Expected:** 201 — Extra fields ignored. `ownerId` should come from the JWT, not the request body.

---

## Frontend Checks

- [ ] Submit button is disabled while request is in flight
- [ ] Submit button is re-enabled after response (success or error)
- [ ] Error message is shown when name field is empty (client-side validation)
- [ ] Error from API (e.g. 401) is shown to the user, not swallowed
- [ ] On success, user is redirected to `/clubs/:id` of the new club
- [ ] Page is not accessible to logged-out users (should redirect to `/login`)
- [ ] Form fields are cleared if user navigates back and creates again

---

## Backend Checks

- [ ] Route is protected by auth middleware
- [ ] `ownerId` is taken from JWT, not from request body
- [ ] Name trimming happens before validation
- [ ] All validation errors return 400 with a descriptive message
- [ ] Successful create returns 201 with the full club object
- [ ] Response does not include sensitive fields (e.g. owner's password)

---

## Database Verification

After a successful POST /api/clubs:
- [ ] Row exists in `Club` table with correct `name`, `description`, `category`
- [ ] `ownerId` matches the logged-in user's ID
- [ ] `createdAt` and `updatedAt` are populated
- [ ] Membership row exists for owner (if auto-join is implemented)

Can verify using Prisma Studio:
```bash
cd backend && npx prisma studio
```

---

## Regression Considerations

This feature touches:
- JWT auth middleware (shared with all protected routes)
- `Club` table (affects Explore Clubs page and Club Details page)
- Membership table (if owner is auto-joined)

After any change to Create Club, also verify:
- [ ] Explore Clubs still shows all clubs
- [ ] Club Details page loads for the newly created club
- [ ] Login/Register still works (auth middleware unchanged)
