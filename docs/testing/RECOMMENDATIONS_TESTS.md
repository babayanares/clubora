# RECOMMENDATIONS_TESTS.md

> Testing considerations for Basic Recommendations on the Dashboard.
>
> All logic is client-side. No new API endpoints.

---

## Scope

Covers the recommendation scoring logic and the "Recommended for You" section in `Dashboard.jsx`.

---

## Scoring Logic Tests (manual)

| Scenario | Expected |
|----------|----------|
| User interests: "photography,travel" — Club interests: "photography,hiking" | Score 1 — shown |
| User interests: "photography,travel" — Club interests: "photography,travel" | Score 2 — ranked above score-1 clubs |
| User interests: "photography" — Club interests: "gaming,tech" | Score 0 — excluded |
| Club with no interests | Score 0 — excluded |
| Club user already joined | Excluded regardless of score |
| 6 matching clubs | Only top 5 shown |
| User has no interests | No recommendations — prompt shown |

---

## Frontend Checklist

| Scenario | Expected | Pass? |
|----------|----------|-------|
| User has interests + matching non-joined clubs | Recommendations section shown | |
| Recommendations sorted by match count | Highest score first | |
| Max 5 cards shown | No more than 5 | |
| Each card shows club name | Correct | |
| Each card shows matching tags | Only overlapping tags shown | |
| Each card shows member count | Correct | |
| Card links to /clubs/:id | Navigation works | |
| User has no interests | Prompt to set interests shown | |
| All clubs already joined | Section hidden | |
| No clubs match | Section hidden | |
| User not logged in | Redirected to /login (existing guard) | |

---

## Regression: Dashboard existing sections

- [ ] "Clubs I Own" section still renders correctly
- [ ] "Clubs I've Joined" section still renders correctly
- [ ] Empty states for each section still work
- [ ] "+ Create Club" button present

---

## Test Setup

To test with real data:
1. Set user interests to "photography,travel" on Profile page
2. Ensure Photography Club (interests: photography,travel) exists and user hasn't joined it
3. Navigate to Dashboard → Photography Club should appear in recommendations with score 2
