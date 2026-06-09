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
**Auth required:** Yes (JWT token in Authorization header)
**DB action:** Creates a row in the `Club` table + a `Membership` row for the owner (role: admin)
**Redirect on success:** `/explore`
**Status:** ✅ Implemented 2026-05-26

---

## Positive Tests (should succeed)

### P1 — Create club with all fields

**Input:**
```json
{
  "name": "Photography Club",
  "description": "A club for photographers of all levels.",
  "location": "New York, NY",
  "interests": "photography,travel,outdoors",
  "visibility": "public"
}
```
**Expected:** 201 response, club created in DB, redirect to `/explore`

---

### P2 — Create club with required fields only (name + one interest)

**Input:**
```json
{
  "name": "Running Club",
  "interests": "running"
}
```
**Expected:** 201 response, club created, description/location/category are null, visibility defaults to "public"

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
**Expected:** 400 — Description must be under 500 characters

---

### N7 — Location over maximum length

**Input:**
```json
{
  "name": "Valid Club",
  "interests": "test",
  "location": "<101-character string>"
}
```
**Expected:** 400 — Location must be under 100 characters

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
- [ ] On success, user is redirected to `/explore`
- [ ] Page is not accessible to logged-out users (should redirect to `/login`)
- [ ] Form fields are cleared if user navigates back and creates again

### Per-field onBlur validation

- [ ] Leave name empty → "Club name is required" shown immediately on blur
- [ ] Type "AB" in name then tab away → "Club name must be at least 3 characters" shown
- [ ] Type a 101-char name then tab away → "Club name must be under 100 characters" shown
- [ ] Type 501 chars in description then tab away → "Description must be under 500 characters" shown
- [ ] Type 101 chars in location then tab away → "Location must be under 100 characters" shown
- [ ] Start typing in a field with an existing error → error clears immediately
- [ ] Location field shows character counter (x/100)
- [ ] Location field enforces maxLength={100} (cannot type beyond 100 chars)

---

## Backend Checks

- [ ] Route is protected by auth middleware
- [ ] `ownerId` is taken from JWT, not from request body
- [ ] Name trimming happens before validation
- [ ] All validation errors return 400 with a descriptive message
- [ ] Location over 100 chars returns 400 — Location must be under 100 characters
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

## New Field Tests (2026-05-26)

### NF1 — No interests → 400

**Input:**
```json
{ "name": "Valid Name" }
```
**Expected:** 400 — At least one interest is required

---

### NF2 — Interests with whitespace — trimmed correctly

**Input:**
```json
{ "name": "Valid Name", "interests": "  photography , travel , " }
```
**Expected:** 201 — interests stored as `"photography,travel"` (trimmed, empty entries removed)

---

### NF3 — Visibility: private

**Input:**
```json
{ "name": "Secret Club", "interests": "private things", "visibility": "private" }
```
**Expected:** 201 — club created. Does NOT appear in `GET /api/clubs` (only public clubs returned).

---

### NF4 — Invalid visibility value → defaults to public

**Input:**
```json
{ "name": "Valid Club", "interests": "test", "visibility": "hidden" }
```
**Expected:** 201 — visibility silently set to "public"

---

### NF5 — Frontend: adding interests via suggestion chips

Open `/clubs/new`, click suggestion chips (Technology, Sports, etc.)
**Expected:** Tags appear in the tag area, no duplicates, can be removed with ×

---

### NF6 — Frontend: adding interests via keyboard

Type "photography" in the interest input, press Enter
**Expected:** Tag added to list, input cleared

---

### NF7 — Frontend: no interests added → validation error

Leave interests empty, click Create Club
**Expected:** Field error "Add at least one interest", no API call made

---

## Regression Considerations

This feature touches:
- JWT auth middleware (shared with all protected routes)
- `Club` table (affects Explore Clubs page)
- `Membership` table (owner auto-joined as admin)

After any change to Create Club, also verify:
- [ ] Explore Clubs still shows newly created clubs
- [ ] Member count on Explore Clubs card shows 1 for a freshly created club
- [ ] Login/Register still works (auth middleware unchanged)
- [ ] Private clubs do NOT appear on Explore Clubs page
