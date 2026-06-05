# RECOMMENDATIONS_FLOW.md

> Feature flow document for Basic Recommendations — suggest clubs based on user interest overlap.

---

## Feature Goal

Surface clubs a user is likely to enjoy based on the interest tags they set on their profile. Recommendations appear on the Dashboard, below the user's own clubs — a nudge to discover and join more.

---

## Business Purpose

Recommendations close the loop between Interest Selection and Join Club. A user who sets interests but sees no suggestions gets no value from that data. Recommendations make interest tags feel meaningful and drive club discovery organically, without requiring users to search manually.

---

## User Workflow

1. Logged-in user with interests set navigates to `/dashboard`
2. A "Recommended for You" section appears below their clubs
3. Each card shows a club they haven't joined yet that shares at least one interest tag
4. Cards are sorted by match count (most overlap first), top 5 shown
5. If the user has no interests set → prompt to set interests on Profile
6. If no clubs match their interests → section is hidden

---

## Frontend Responsibilities

- All recommendation logic is **client-side** — no new API endpoint
- Dashboard fetches two sources in parallel:
  - `GET /api/users/:id` — user interests + existing memberships
  - `GET /api/clubs` — all public clubs with their interests
- Scoring:
  - Parse user interests into a lowercase Set
  - For each public club not already joined, count matching tags
  - Filter to clubs with score ≥ 1
  - Sort by score descending, take top 5
- If user has no interests: show prompt → "Add interests to your profile to get recommendations"
- If user has interests but no matches: section hidden silently
- Each recommendation card shows: club name, matching tags highlighted, member count, "View Club" link

---

## No Backend Changes Required

`GET /api/users/:id` already returns `interests` and `memberships`.
`GET /api/clubs` already returns `interests` and `_count.memberships`.

---

## Scoring Algorithm

```js
const userTags = new Set(user.interests.split(',').map(t => t.trim().toLowerCase()));
const memberClubIds = new Set(memberships.map(m => m.club.id));

const scored = clubs
  .filter(club => !memberClubIds.has(club.id))
  .map(club => {
    const clubTags = club.interests
      ? club.interests.split(',').map(t => t.trim().toLowerCase())
      : [];
    const matches = clubTags.filter(t => userTags.has(t));
    return { club, score: matches.length, matches };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
```

---

## Page Layout (Dashboard)

```
My Clubs   [Clubs I Own]   [Clubs I've Joined]

──────────────────────────────────────────
Recommended for You
──────────────────────────────────────────
[Card: Photography Club  •  2 matches: photography, travel  •  4 members]
[Card: Weekend Runners   •  1 match: fitness  •  2 members]
```

---

## Edge Cases

- User has no interests set → "Set interests on your profile to get recommendations" prompt
- All clubs already joined → no recommendations shown (section hidden)
- No clubs match → section hidden
- Club with no interests → excluded from recommendations
- User has interests but all matching clubs are private → no recommendations (only public clubs returned by GET /api/clubs)

---

## QA Checklist

- [ ] Recommendations section visible on Dashboard when user has interests + matching clubs
- [ ] Only clubs not already joined shown
- [ ] Sorted by match count (highest first)
- [ ] Max 5 recommendations shown
- [ ] Matching tags shown on each card
- [ ] Member count shown on each card
- [ ] Card links to /clubs/:id
- [ ] No interests set → prompt to add interests shown
- [ ] No matches → section hidden (no empty section title)
- [ ] After joining a recommended club, it no longer appears (on next visit)

---

## Future Improvements

- Real-time update: remove recommended club from list after joining
- Weight by recency (newer clubs ranked higher for equal score)
- "Not interested" dismiss button
- Recommendations based on clubs similar members have joined
