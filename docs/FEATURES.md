# FEATURES.md

> **Why this file exists:** Single source of truth for all planned and completed features. Prevents feature drift and keeps the backlog visible.
>
> **When to update:** After every new feature is planned, started, or shipped.
>
> **How it helps:** Gives a PM-level view of what's been built and what's next, without opening code.

---

## Status Legend

| Symbol | Meaning           |
|--------|-------------------|
| ✅     | Shipped / working |
| 🔧     | In progress       |
| 📋     | Planned           |
| ❌     | Descoped / skipped |

---

## MVP Features

### Authentication
| Feature              | Status | Notes                                        |
|----------------------|--------|----------------------------------------------|
| User registration    | ✅     | POST /api/auth/register — bcrypt + JWT       |
| User login           | ✅     | POST /api/auth/login — credential check      |
| JWT token issuance   | ✅     | 7-day token, stored in localStorage          |
| Auth middleware      | ✅     | `requireAuth` on protected backend routes    |
| Protected routes     | ✅     | Frontend redirect to /login if no token      |
| Logout               | ✅     | Clear token + user from localStorage         |

### Clubs
| Feature              | Status | Notes                                        |
|----------------------|--------|----------------------------------------------|
| List all clubs       | ✅     | GET /api/clubs — public clubs, newest first  |
| Create a club        | ✅     | POST /api/clubs — auth required, full fields |
| View club details    | 📋     | GET /api/clubs/:id — stub exists             |
| Edit a club          | 📋     | PATCH /api/clubs/:id (owner only)            |
| Delete a club        | 📋     | DELETE /api/clubs/:id (owner only)           |
| Join a club          | ✅     | POST /api/clubs/:id/join — public clubs only |
| Leave a club         | 📋     | DELETE /api/clubs/:id/leave                  |

### User Profile
| Feature              | Status | Notes                          |
|----------------------|--------|--------------------------------|
| View own profile     | ✅     | GET /api/users/:id — name, email, bio, location, interests |
| Edit profile         | ✅     | PATCH /api/users/:id — name, bio, location, interests      |
| View joined clubs    | ✅     | Shown on profile page, derived from Membership             |
| Interest selection   | ✅     | Tag input on profile edit — up to 20 tags, deduplicated    |

### Navigation & UI
| Feature              | Status | Notes                                        |
|----------------------|--------|----------------------------------------------|
| Navbar               | ✅     | Auth-aware — shows logout/username when in   |
| Landing page         | ✅     | CTA to register or explore                   |
| All page routes      | ✅     | React Router wired up                        |
| Explore Clubs page   | ✅     | Fetches real clubs, grid layout, loading/error states |
| Create Club page     | ✅     | Full form with tag input, validation, redirect |
| Club Details page    | ✅     | Full club view, owner, member count, tags, error states |

---

## Post-MVP Features (future)

| Feature                    | Priority | Notes                     |
|----------------------------|----------|---------------------------|
| Club search / filter       | High     | By name, category         |
| Club image upload          | Medium   | Profile photo for clubs   |
| Member list on club page   | Medium   | Show who's joined         |
| Notifications              | Low      | Join requests, updates    |
| Admin / moderation tools   | Low      | Remove members, etc.      |
| Email verification         | Low      | Registration flow         |
| Password reset             | Low      | Forgot password flow      |

---

## Feature Docs

Each MVP feature has a detailed flow document in `/docs/features/`:

- [AUTH_FLOW.md](./features/AUTH_FLOW.md)
- [CREATE_CLUB_FLOW.md](./features/CREATE_CLUB_FLOW.md)
- [EXPLORE_CLUBS_FLOW.md](./features/EXPLORE_CLUBS_FLOW.md)
- [USER_PROFILE_FLOW.md](./features/USER_PROFILE_FLOW.md)
