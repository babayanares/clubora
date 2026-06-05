# PRIVATE_CLUBS_IN_EXPLORE_TESTS.md

> Testing considerations for showing private clubs in the Explore page.

---

## Scope

Covers the updated `GET /api/clubs` (now returns all clubs) and the private club card rendering in `ExploreClubs.jsx`.

---

## API Tests

**GET /api/clubs — private clubs included:**
```bash
curl -s http://localhost:5000/api/clubs | jq '[.clubs[] | {name, visibility}]'
# Expected: both public and private clubs in the array
```

**Private club fields returned:**
```bash
curl -s http://localhost:5000/api/clubs | jq '[.clubs[] | select(.visibility == "private")]'
# Expected: private clubs present with name, visibility, interests, _count
```

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Explore page loads | Both public and private clubs visible | |
| Public club card | Full details — name, description, location, tags, count | |
| Private club card | Name + 🔒 Private badge + tags + count only | |
| Private club card — description hidden | Not rendered even if present | |
| Private club card — location hidden | Not rendered | |
| Private club card is clickable | Links to /clubs/:id | |
| /clubs/:id for private club | "Request to Join" button shown | |
| Search "secret" (private club name) | Private club appears in results | |
| Interest filter matching private club | Private club shown | |
| Search + interest filter | Private clubs included in combined filter | |

---

## Regression: Existing Explore Behaviour

- [ ] Public clubs still show description (2-line clamp)
- [ ] Public clubs still show location chip
- [ ] Member count still correct (approved only)
- [ ] Search still works for public clubs
- [ ] Interest filter still works for public clubs
- [ ] Empty state still shown when no clubs

---

## Edge Cases

| Scenario | Expected |
|----------|----------|
| All clubs are private | Page shows all as private cards, no empty state |
| Private club has no interests | Tags section not shown on card |
| Private club has no description | No empty description space shown |
