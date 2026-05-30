# CLUB_DETAILS_TESTS.md

> Test document for the Club Details page (`/clubs/:id`).
> **When to run:** After any change to `ClubDetails.jsx` or `GET /api/clubs/:id`.

---

## Feature Summary

**Route:** `/clubs/:id`
**API:** `GET /api/clubs/:id`
**Auth required:** No — public endpoint
**DB action:** Read only

---

## Positive Tests

### P1 — Load a club that exists

Navigate to `/clubs/1` (after creating a club).

**Expected:**
- Page renders without errors
- Club name shown as page heading
- Description shown (if set)
- Location shown with 📍 icon (if set)
- Interests shown as individual tags (if set)
- Member count shown correctly
- Owner name shown
- Created date shown in readable format
- Back link to `/explore` present

---

### P2 — Club with all optional fields populated

**Expected:** All sections (description, location, interests) visible.

---

### P3 — Club with only required fields (name + interests)

**Expected:**
- Name and interests show
- Description section not rendered (no empty box)
- Location line not rendered

---

### P4 — API response reflects correct member count

Create a club → visit its detail page.
**Expected:** Member count = 1 (owner auto-joined as admin).

---

## Negative Tests

### N1 — Club ID does not exist

Navigate to `/clubs/9999`.

**Expected:**
- "Club not found" message shown
- Back link to `/explore` shown
- No crash, no blank page

---

### N2 — Non-numeric ID in URL

Navigate to `/clubs/abc`.

**Expected:**
- API returns 400
- Error message shown to user
- No crash

---

### N3 — API is unreachable (server down)

Stop the backend server, navigate to `/clubs/1`.

**Expected:**
- "Failed to load club" error message shown
- Back link to `/explore` shown
- No crash

---

## Rendering Edge Cases

### E1 — Very long club name

**Expected:** Name wraps cleanly, no horizontal overflow.

---

### E2 — Description with multiple paragraphs or special characters

**Expected:** Rendered as plain text, no HTML injection.

---

### E3 — Many interest tags

**Expected:** Tags wrap to multiple lines, layout stays clean.

---

## API Tests (curl)

```bash
# Valid club (replace 1 with actual ID)
curl http://localhost:5000/api/clubs/1

# Non-existent club
curl http://localhost:5000/api/clubs/9999
# Expected: 404 { "error": "Club not found" }

# Non-numeric ID
curl http://localhost:5000/api/clubs/abc
# Expected: 400 { "error": "Invalid club ID" }
```

---

## Regression Considerations

After any change to Club Details, also verify:

- [ ] Explore Clubs page still loads and cards still link correctly
- [ ] Clicking a card still navigates to the correct `/clubs/:id`
- [ ] Create Club flow still redirects to `/explore` (not broken by this change)
