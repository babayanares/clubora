# SEARCH_FILTER_FLOW.md

> Feature flow document for Search & Filtering on the Explore Clubs page.

---

## Feature Goal

Let users find relevant clubs quickly by searching by name and filtering by interest tags — without leaving the Explore page or waiting for extra network requests.

---

## Business Purpose

Explore currently shows all clubs in creation order. As the club count grows, this becomes unusable. Search and filtering turn Explore from a list into a discovery tool — users can find clubs that match what they care about, which directly drives joins and engagement.

---

## User Workflow

1. User navigates to `/explore`
2. All public clubs load as before
3. User types in the search bar — clubs filter instantly by name
4. User clicks an interest tag chip — clubs filter to those with that interest
5. Multiple filters stack (name AND interest)
6. A result count is shown ("Showing X of Y clubs")
7. An active filter chip shows the current interest filter with × to clear
8. "Clear filters" resets everything to the full list

---

## Frontend Responsibilities

- All filtering is **client-side** — no new API calls needed
- The existing `GET /api/clubs` already returns all the data required
- `ExploreClubs.jsx` — add search bar, interest filter chips, active filter display, result count
- Search: case-insensitive match on club name (and optionally description)
- Interest filter: collected from all clubs' interest tags; clicking one filters to clubs containing that tag
- Filters stack: a club must match both the search term AND the selected interest (if any)
- Empty filter result state: "No clubs match your search" with a "Clear filters" button

---

## No Backend Changes Required

The existing `GET /api/clubs` response already includes `interests`, `name`, `description`, `location`, and `_count`. All filtering happens in the browser.

---

## UI Components

```
[ 🔍 Search clubs by name…          ]   [× clear]

Interest filters:
[ photography ] [ hiking ] [ tech ] [ music ] [ gaming ] …

Showing 3 of 8 clubs   [× photography]

[ Club Card ] [ Club Card ] [ Club Card ]
```

- Search input: debounced or instant (instant for MVP)
- Interest chips: derived from all unique tags across all clubs
- Active filter chip: shows selected interest with × to remove
- Result count: hidden when no filters are active
- Clear button: resets both search and interest filter

---

## Filtering Logic

```js
filtered = clubs
  .filter(club => club.name.toLowerCase().includes(search.toLowerCase()))
  .filter(club => !activeInterest || club.interests?.split(',')
    .map(t => t.trim().toLowerCase())
    .includes(activeInterest.toLowerCase()))
```

---

## Edge Cases

- Search term with no matches → "No clubs match your search"
- Interest filter with no matches → same empty state
- Club with no interests → excluded from interest filter results if a filter is active
- Search cleared → full list returns
- Interest deselected (click again) → full list returns

---

## QA Checklist

- [ ] Search bar filters clubs by name in real time
- [ ] Search is case-insensitive
- [ ] Interest chips derived from all clubs' tags
- [ ] Clicking an interest chip filters clubs to those with that tag
- [ ] Clicking the same chip again deselects (toggles off)
- [ ] Search + interest filter stack correctly
- [ ] Result count shown when filters active
- [ ] Active interest shown as removable chip
- [ ] Clear filters button resets both search and interest
- [ ] Empty state shown when no clubs match
- [ ] All existing club cards still link to /clubs/:id correctly
- [ ] No regressions on the base Explore page layout

---

## Future Improvements

- Backend search + pagination for large club counts
- Filter by location
- Filter by visibility (public/private)
- Sort by: newest, most members, alphabetical
- Multi-tag interest filter (select multiple at once)
