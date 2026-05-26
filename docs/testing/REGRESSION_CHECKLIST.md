# REGRESSION_CHECKLIST.md

> **Why this file exists:** Regressions are bugs that were working before and broke after a change. This checklist ensures that core functionality is verified after any significant update.
>
> **When to run:** Before any major commit, after fixing a bug, after any route or schema change.
>
> **How to use:** Work through the relevant sections top to bottom. Check each item. Note any failures in `KNOWN_ISSUES.md`.

---

## How to Read This Checklist

- ⬜ = needs to be checked
- ✅ = passed
- ❌ = failed — log in KNOWN_ISSUES.md
- N/A = not applicable yet (feature not built)

Run the backend server and open the frontend before starting.

---

## 1. Server Health

- ⬜ `GET /api/health` returns `{ "status": "ok" }` with 200
- ⬜ Backend starts without errors (`npm run dev`)
- ⬜ Frontend starts without errors (`npm run dev`)
- ⬜ Frontend loads in browser without console errors

---

## 2. Navigation Checks

- ⬜ `/` loads the Landing page
- ⬜ `/explore` loads the Explore Clubs page
- ⬜ `/login` loads the Login page
- ⬜ `/register` loads the Register page
- ⬜ `/dashboard` loads the Dashboard page
- ⬜ `/clubs/new` loads the Create Club page
- ⬜ `/profile` loads the Profile page
- ⬜ Navbar links navigate to the correct pages
- ⬜ No 404 pages for any of the above routes

---

## 3. Authentication Checks

*(Run after auth is implemented)*

- ⬜ Can register with valid name, email, password
- ⬜ Duplicate email registration returns a clear error
- ⬜ Can log in with correct credentials
- ⬜ Wrong password returns error message (not crash)
- ⬜ Non-existent email returns error message
- ⬜ Successful login stores token and redirects to dashboard
- ⬜ Logout clears token and redirects to landing

---

## 4. Club Creation Checks

*(Run after Create Club is implemented)*

- ⬜ Can create a club when logged in
- ⬜ Create Club page redirects to `/login` when not logged in
- ⬜ Empty name field is rejected with error message
- ⬜ Successful creation redirects to `/clubs/:id`
- ⬜ New club appears on Explore Clubs page
- ⬜ Club detail page shows correct name, description, category

---

## 5. Explore Clubs Checks

- ⬜ `/explore` loads without errors when no clubs exist (empty state message shown)
- ⬜ `/explore` shows all clubs when they exist
- ⬜ Each club card links to the correct `/clubs/:id` page
- ⬜ Page is accessible without login
- ⬜ No network errors in browser console

---

## 6. API Checks

- ⬜ `GET /api/clubs` returns `{ "clubs": [...] }` — 200
- ⬜ `POST /api/clubs` without token returns 401
- ⬜ `POST /api/clubs` with missing name returns 400
- ⬜ `POST /api/auth/register` with duplicate email returns 409
- ⬜ `POST /api/auth/login` with wrong password returns 401
- ⬜ Any route with a malformed JSON body returns 400 (not 500)

---

## 7. Database Persistence Checks

*(Verify with Prisma Studio or direct DB query)*

- ⬜ After registration, user row exists in `User` table
- ⬜ Password is stored as a hash (not plain text)
- ⬜ After club creation, club row exists in `Club` table with correct `ownerId`
- ⬜ `createdAt` and `updatedAt` fields are populated
- ⬜ After joining a club, `Membership` row exists with correct `userId` and `clubId`
- ⬜ Unique constraints work: duplicate email or duplicate membership returns an error

---

## 8. UI Rendering Checks

- ⬜ No visible React errors (`Error: ...`) on any page
- ⬜ No broken layout or overlapping elements
- ⬜ All form fields accept input correctly
- ⬜ Submit buttons respond to click
- ⬜ Loading states appear during API calls
- ⬜ Error messages appear when API calls fail

---

## 9. Validation Checks

- ⬜ Frontend blocks form submission when required fields are empty
- ⬜ Backend rejects requests with missing required fields (400)
- ⬜ Backend rejects requests with too-short fields (400)
- ⬜ Backend rejects requests with too-long fields (400)
- ⬜ Whitespace-only values are treated as empty

---

## 10. After Each Feature: Mini-Regression

When a feature is completed, run just the sections relevant to what was touched:

| Feature completed  | Sections to re-run              |
|--------------------|---------------------------------|
| Auth               | 2, 3, 6, 7, 8, 9                |
| Create Club        | 2, 4, 5, 6, 7, 8, 9             |
| Explore Clubs      | 2, 5, 6, 8                      |
| User Profile       | 2, 6, 7, 8, 9                   |
| Any DB migration   | 7 (full)                        |
| Any route change   | 6, relevant feature sections    |

---

## Notes Section

Use this section to record anything notable during a regression run:

```
Date: 
Run by:
Changes since last run:
Issues found:
```
