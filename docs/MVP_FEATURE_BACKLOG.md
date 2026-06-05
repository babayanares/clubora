# MVP_FEATURE_BACKLOG.md

> **Why this file exists:** Single authoritative list of every feature needed to deliver a complete, deployable Clubora MVP. Tracks status, priority, and scope in one place.
>
> **When to update:** When a feature status changes. Do not add features here without evaluating MVP fit first.
>
> **How it helps:** Gives a clear picture of what's done, what's next, and what's explicitly out of scope — for both development and portfolio presentation.

---

## Status Definitions

| Status      | Meaning                                                   |
|-------------|-----------------------------------------------------------|
| DONE        | Implemented, tested, documented, no blocking issues       |
| IN PROGRESS | Currently being built — backend, frontend, or both        |
| TODO        | Planned for MVP, not yet started                          |
| DEFERRED    | Explicitly out of MVP scope — post-launch only            |

A feature must meet the **Feature Status Checklist** (see `DEVELOPMENT_RULES.md`) before moving to DONE.

---

## User & Auth Features

| Status | Feature             | Purpose                               |
|--------|---------------------|---------------------------------------|
| DONE   | User Registration   | Create a new account with email + password |
| DONE   | Login / Logout      | Authenticate, issue JWT, clear session |
| DONE   | Profile Setup       | Add bio, location, and skills to profile |
| DONE   | Interest Selection  | User selects personal interest tags    |

---

## Club Features

| Status | Feature             | Purpose                                       |
|--------|---------------------|-----------------------------------------------|
| DONE   | Create Club Flow    | Authenticated user creates a community        |
| DONE   | Explore Clubs       | Browse public clubs with real DB data         |
| DONE   | Club Details Page   | View full club info, member count, owner      |
| DONE   | Edit Club           | Owner updates club name, description, etc.    |
| DONE   | Delete Club         | Owner permanently removes a club              |
| DONE   | Join Club           | User becomes a member of a public club        |
| DONE   | Leave Club          | User removes themselves from a club           |
| DONE   | My Clubs            | View all clubs the user owns or has joined    |

> **Note:** Search and filtering are tracked separately under Discovery Features (step 10 in implementation order).

---

## Discovery Features

| Status | Feature                  | Purpose                                   |
|--------|--------------------------|-------------------------------------------|
| DONE   | Club Search              | Find clubs by name (text input)           |
| DONE   | Interest Filtering       | Filter clubs by matching interests/tags   |
| TODO   | Location Filtering       | Filter clubs by city or region            |
| DONE   | Basic Recommendations    | Suggest clubs based on user interests     |

---

## Collaboration Features

| Status | Feature                  | Purpose                                        |
|--------|--------------------------|------------------------------------------------|
| DONE   | Create Club Posts        | Members post discussions inside a club         |
| DONE   | View Club Feed           | Display posts in chronological order           |
| TODO   | Create Initiative/Project | Members propose a collaborative idea or project |
| TODO   | View Initiatives         | Track and browse club projects                 |

---

## Permissions & Management

| Status | Feature                  | Purpose                                        |
|--------|--------------------------|------------------------------------------------|
| DONE   | Club Owner Controls      | Owner can edit, delete, manage their club      |
| DONE   | Private/Public Clubs     | Visibility field stored and enforced on API    |
| DONE   | Join Approval Flow       | Owner approves join requests for private clubs |
| TODO   | Basic Admin Panel        | Platform-level moderation tools                |

---

## QA & Validation

| Status | Feature                  | Purpose                                        |
|--------|--------------------------|------------------------------------------------|
| DONE   | Validation Rules         | Backend validates all Create Club inputs       |
| DONE   | Test Fixtures            | Reusable test payloads in TEST_FIXTURES.md     |
| TODO   | Regression Checklist     | Update after each new feature ships            |
| DONE   | API Test Notes           | Curl examples and response expectations        |
| DONE   | Edge Case Tracking       | EDGE_CASES.md maintained and updated          |

---

## Deployment & Portfolio

| Status | Feature                  | Purpose                                        |
|--------|--------------------------|------------------------------------------------|
| TODO   | Production Build Setup   | Configure env vars, build scripts, DB for prod |
| TODO   | Public Deployment        | Live accessible MVP (Render, Railway, etc.)    |
| TODO   | README Polish            | Portfolio-quality run instructions and overview |
| TODO   | Architecture Screenshots | Visual documentation of the running app        |
| TODO   | Demo/Test Accounts       | Pre-seeded data for showcasing the product     |

---

## Deferred (Out of MVP Scope)

These will not be built for the MVP. Any implementation before the above TODO items are complete is out of scope.

| Feature                    | Reason deferred                                 |
|----------------------------|-------------------------------------------------|
| Real-time chat             | Requires WebSocket infrastructure               |
| Push notifications         | Requires service workers / external service     |
| In-app notifications       | UI complexity beyond MVP                        |
| Mobile native app          | Separate project track                          |
| Video / audio calls        | Requires third-party integration                |
| Advanced AI matching       | Requires ML pipeline                            |
| Advanced moderation tools  | Post-launch when user base exists               |
| Payments / subscriptions   | Business model decision, post-launch            |
| Social media feed algorithm | Algorithmic ranking is post-MVP complexity     |

---

## Recommended Implementation Order

Build in this sequence. Each step depends on the previous ones being stable.

```
1.  Create Club Flow          ✅ DONE
2.  Explore Clubs             ✅ DONE
3.  Club Details Page         ✅ DONE
4.  Profile Setup             ✅ DONE
5.  Interest Selection        ✅ DONE
6.  Join Club                 ✅ DONE
7.  My Clubs                  ✅ DONE
8.  Leave Club                ✅ DONE
9.  Club Posts                ✅ DONE
10. Search & Filtering        ✅ DONE
11. Basic Recommendations     ✅ DONE
12. Club Owner Controls       ✅ DONE
13. Join Approval Flow        ✅ DONE
14. Basic Admin               — platform health
15. Deployment & Final QA     — ship it
```

**Why this order:**
- Core CRUD before discovery (can't search what doesn't exist)
- Profile before recommendations (interests power suggestions)
- Join before leave (membership state must exist first)
- Content (posts) before search (content must exist to search)
- All features stable before deployment

---

## MVP Completion Definition

The MVP is complete when a user can do all of this in a single session on a live deployed URL:

```
Register
  ↓
Login
  ↓
Set up profile (bio, location)
  ↓
Select interests
  ↓
Discover clubs (explore, search, filter)
  ↓
Create a club
  ↓
Join a club
  ↓
Participate in discussions / create a project
  ↓
Manage memberships (my clubs, leave)
```

Through a deployed full-stack web application with:

| Layer           | Requirement                                   |
|-----------------|-----------------------------------------------|
| Frontend        | React app, all MVP pages functional           |
| Backend         | Express REST API, all MVP routes implemented  |
| Database        | Persistent data (production DB, not SQLite)   |
| Authentication  | JWT-based login, protected routes             |
| Validation      | All inputs validated frontend + backend       |
| QA Coverage     | Regression checklist passed, edge cases logged |
| Documentation   | All feature docs updated, README accurate     |

---

## Progress Summary

| Category              | Done | Todo | Deferred |
|-----------------------|------|------|----------|
| User & Auth           | 4    | 0    | 0        |
| Club Features         | 8    | 0    | 0        |
| Discovery             | 3    | 1    | 0        |
| Collaboration         | 2    | 2    | 0        |
| Permissions           | 3    | 1    | 0        |
| QA & Validation       | 4    | 1    | 0        |
| Deployment/Portfolio  | 0    | 5    | 0        |
| Out of Scope          | —    | —    | 9        |
| **Total**             | **24**| **10**| **9** |
