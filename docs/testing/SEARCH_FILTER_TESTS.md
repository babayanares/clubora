# SEARCH_FILTER_TESTS.md

> Testing considerations for Search & Filtering on the Explore Clubs page.
>
> All filtering is client-side — no new API endpoints to test.

---

## Scope

Covers the search input and interest tag filter UI in `ExploreClubs.jsx`.
The existing `GET /api/clubs` API is unchanged.

---

## Filtering Logic Tests (manual)

| Action | Expected |
|--------|----------|
| Type "photo" in search | Only clubs with "photo" in name shown |
| Type "PHOTO" (uppercase) | Same result — case-insensitive |
| Type a name with no match | Empty state shown |
| Clear search | All clubs return |
| Click "photography" interest chip | Only clubs with photography tag shown |
| Click same chip again | Filter removed, all clubs return |
| Search "run" + click "fitness" | Only clubs matching both filters |
| Clear filters button | Both search and interest reset |

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| Page loads | All clubs shown, no filters active | |
| Search input present | Visible at top of page | |
| Interest chips shown | Derived from all club tags | |
| No duplicate interest chips | Each tag appears once | |
| Type in search | Clubs filter instantly | |
| Clear search with × | All clubs return | |
| Click interest chip | Clubs filter | |
| Active interest shown as chip | Visible with × | |
| Remove active interest chip | All clubs return | |
| Result count shown when filtering | "Showing X of Y clubs" | |
| No results match | Empty state with clear button | |
| Click club card | Still navigates to /clubs/:id | |

---

## Regression: Explore base behaviour

- [ ] Clubs grid layout unchanged
- [ ] Club cards show name, description, location, member count, tags
- [ ] "+ Create Club" button still present
- [ ] Loading and error states still work

---

## Test Scenarios Using Existing DB Data

Photography Club (id:1) — interests: photography (or similar)
Weekend Runners (id:2) — interests may include running/fitness

1. Search "photo" → should show Photography Club only
2. Search "xyz123" → no results, empty state shown
3. Click "photography" tag → Photography Club shown
4. Search "photo" + click "hiking" → likely no results (tests stacking)
