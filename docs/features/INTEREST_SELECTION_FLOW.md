# INTEREST_SELECTION_FLOW.md

> Feature flow document for Interest Selection — users pick personal interest tags on their profile.

---

## Feature Goal

Let authenticated users select interest tags on their profile (e.g. Photography, Hiking, Tech). These tags describe what the user cares about and will later power club recommendations and filtering.

---

## Business Purpose

Interests are the social matching layer of Clubora. Without them, discovery is purely manual — users browse all clubs and hope something resonates. With interests, the platform can surface clubs the user will actually want to join. This feature is a prerequisite for recommendations (step 11) and interest-based club filtering (step 10).

---

## User Workflow

1. Logged-in user navigates to `/profile`
2. Their interests (if any) are displayed as tags in the profile view
3. User clicks "Edit Profile"
4. The edit form includes an Interests section with the tag input
5. User adds tags by typing and pressing Enter/comma, or clicking suggestion chips
6. User removes tags with the × button
7. User saves — interests are persisted to DB
8. Profile view re-renders showing the updated interest tags

---

## Frontend Responsibilities

- Show interests as tag chips in the profile view (below bio/location)
- In edit mode, include an interests tag input with:
  - Type-and-press-Enter/comma to add a tag
  - × button to remove a tag
  - Suggestion chips for a predefined list of popular interests
  - Tags are trimmed, lowercased, and deduplicated before saving
- Extract shared `TagInput` component from `CreateClub.jsx` into `components/TagInput.jsx` — both pages use it
- Pass interests to `PATCH /api/users/:id` as a comma-joined string

---

## Backend Responsibilities

- `interests` field already exists on Club; add the same field to `User`
- `GET /api/users/:id` — include `interests` in the select
- `PATCH /api/users/:id` — accept and validate `interests` field
- Storage: comma-separated string (`"photography,hiking,tech"`), same pattern as Club

---

## Schema Changes Required

Add one optional field to the `User` model:
- `interests String?` — comma-separated interest tags

Requires a new migration: `add_interests_to_user`.

---

## Validation Rules

| Field     | Rules                                                      |
|-----------|------------------------------------------------------------|
| interests | Optional. Max 20 tags. Each tag: max 50 chars after trim.  |

No minimum — a user may have no interests set.

---

## Suggested Interest Tags (predefined list)

```
Photography, Hiking, Tech, Music, Gaming, Reading, Cooking, Travel,
Art, Film, Fitness, Writing, Design, Science, Sports, Language,
Entrepreneurship, Environment, Volunteering, Mental Health
```

These are suggestions only — users can add any custom tags.

---

## API Endpoints (updates to existing)

### GET /api/users/:id

Response now includes `interests` field:
```json
{
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "bio": "Photographer and weekend hiker.",
    "location": "Los Angeles, CA",
    "interests": "photography,hiking,tech",
    "createdAt": "2026-05-25T20:00:00.000Z",
    "memberships": [...]
  }
}
```

### PATCH /api/users/:id

Request now accepts `interests`:
```json
{
  "name": "Alex Rivera",
  "bio": "Photographer and weekend hiker.",
  "location": "Los Angeles, CA",
  "interests": "photography,hiking,tech"
}
```

---

## Error Handling

| Scenario                         | HTTP Status | Error Message                              |
|----------------------------------|-------------|---------------------------------------------|
| Single tag exceeds 50 chars      | 400         | `"Each interest tag must be 50 characters or fewer"` |
| More than 20 tags submitted      | 400         | `"You can add up to 20 interest tags"`      |

---

## Success Flow

```
User clicks Edit Profile on /profile
→ Tag input renders with existing interests pre-loaded
→ User adds/removes tags
→ User clicks Save
→ PATCH /api/users/:id with interests as comma-joined string
→ DB updated
→ Profile re-renders with new interest tags shown
```

---

## Edge Cases

- User submits duplicate tags — deduplicate before saving
- User submits tags with mixed case (`Photography`, `photography`) — normalize to lowercase
- User clears all interests — save as null (empty)
- Tag input is empty on first edit — render empty, no crash
- 21 tags submitted — reject with 400

---

## QA Checklist

- [ ] Interests shown as tags on profile view when set
- [ ] No interests section shown (or empty state) when not set
- [ ] Tag input renders in edit mode with existing interests pre-loaded
- [ ] Adding tag via Enter works
- [ ] Adding tag via comma key works
- [ ] Clicking suggestion chip adds the tag
- [ ] × removes a tag
- [ ] Tags are trimmed and lowercased before saving
- [ ] Duplicate tags are deduplicated
- [ ] Save persists to DB — verified via GET
- [ ] 21+ tags rejected with 400
- [ ] Tag > 50 chars rejected with 400
- [ ] TagInput component renders correctly in both Profile and CreateClub

---

## Future Improvements

- Match user interests against club interests for recommendation score
- Allow private vs. public interests (show/hide on public profile)
- Suggest clubs with matching interests directly from the profile page
