# EDGE_CASES.md

> **Why this file exists:** Happy paths are easy to test. Edge cases are where real bugs hide. This file lists known tricky scenarios so they don't get forgotten.
>
> **When to update:** Whenever a new edge case is discovered, especially from a real bug.
>
> **How to use:** Before testing any feature, scan this list. Run any relevant cases against that feature.

---

## Input Edge Cases

### Empty / Blank Values

| Scenario                             | Expected behavior              | Status  |
|--------------------------------------|--------------------------------|---------|
| Club name is empty string `""`       | 400 — name is required         | ✅      |
| Club name is only spaces `"   "`     | 400 — name is required (after trim) | ✅  |
| User name is a single character      | 400 — min 2 chars              | 📋      |
| Password is only whitespace          | 400 — password is required     | 📋      |
| Email is empty string                | 400 — email is required        | 📋      |
| Entire request body is empty `{}`    | 400 — required fields missing  | 📋      |

---

### Duplicate Data

| Scenario                                       | Expected behavior                     | Status |
|------------------------------------------------|---------------------------------------|--------|
| Register with an email that already exists     | 409 — email already in use            | 📋     |
| User joins a club they're already a member of  | 409 or 200 — handle gracefully        | 📋     |
| Two requests to create same club simultaneously | One succeeds, one fails or is deduplicated | 📋 |

---

### Invalid Formats

| Scenario                                | Expected behavior              | Status |
|-----------------------------------------|--------------------------------|--------|
| Email missing `@` symbol               | 400 — invalid email            | 📋     |
| Email with spaces (`foo @bar.com`)      | 400 — invalid email            | 📋     |
| Email with double dots (`foo..bar@x.com`) | 400 — invalid email          | 📋     |
| Password is only numbers               | Pass (no format restriction, only length) | 📋 |

---

### Length Extremes

| Scenario                                | Expected behavior              | Status |
|-----------------------------------------|--------------------------------|--------|
| Club name exactly 3 chars (min valid)   | 201 — success                  | ✅     |
| Club name exactly 100 chars (max valid) | 201 — success                  | ✅     |
| Club name is 101 chars                  | 400 — too long                 | ✅     |
| Description is exactly 500 chars        | 201 — success                  | ✅     |
| Description is 501 chars                | 400 — too long                 | ✅     |

---

## Authentication Edge Cases

| Scenario                                     | Expected behavior                  | Status |
|----------------------------------------------|------------------------------------|--------|
| Request to protected route with no token     | 401 — unauthorized                 | ✅     |
| Request with expired JWT token               | 401 — token expired                | ✅     |
| Request with a malformed/fake token          | 401 — invalid token                | ✅     |
| Token for a user ID that no longer exists    | 401 or 404 — handle gracefully     | 📋     |
| User tries to edit another user's profile    | 403 — forbidden                    | 📋     |
| User tries to delete a club they don't own   | 403 — forbidden                    | 📋     |

---

## Club-Specific Edge Cases

| Scenario                                         | Expected behavior              | Status |
|--------------------------------------------------|--------------------------------|--------|
| View a club with ID that doesn't exist           | 404 — club not found           | 📋     |
| View a club with a non-numeric ID (`/clubs/abc`) | 400 — invalid ID               | 📋     |
| Create a club while not logged in                | 401 — unauthorized             | ✅     |
| Owner tries to leave their own club              | Handled (transfer or block)    | 📋     |

---

## Profile Edge Cases

| Scenario                               | Expected behavior              | Status |
|----------------------------------------|--------------------------------|--------|
| Update name to empty string            | 400 — name is required         | 📋     |
| Update name to only whitespace         | 400 — name is required         | 📋     |
| Fetch profile for non-existent user ID | 404 — user not found           | 📋     |
| User has no club memberships           | 200 — memberships is empty `[]` | 📋    |

---

## Network / API Edge Cases

| Scenario                                        | Expected behavior                    | Status |
|-------------------------------------------------|--------------------------------------|--------|
| Malformed JSON in request body                  | 400 — invalid JSON                   | 📋     |
| Missing `Content-Type: application/json` header | Body may not parse correctly         | 📋     |
| Very large request payload                      | Should be rejected or truncated      | 📋     |
| Sending unexpected extra fields in body         | Should be ignored (not cause errors) | 📋     |

---

## Frontend / UI Edge Cases

| Scenario                                         | Expected behavior              | Status |
|--------------------------------------------------|--------------------------------|--------|
| User double-clicks submit button                 | Only one request sent          | 📋     |
| User navigates away mid-form                     | No partial submission          | 📋     |
| Network request fails (API is down)              | Error message shown, not crash | 📋     |
| Page loads but API returns empty clubs list      | Empty state message shown      | 📋     |
| Form with JavaScript disabled                    | Backend still validates        | 📋     |

---

## How to Use This List

Before shipping any feature:
1. Identify which edge cases apply to the feature
2. Add them to the feature's QA checklist
3. Test each one manually
4. Mark status: ✅ if handled, 🐛 if it's a bug, ⚠️ if known limitation

Update the Status column as cases are verified.
