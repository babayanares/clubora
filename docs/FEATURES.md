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
| Feature              | Status | Notes                          |
|----------------------|--------|--------------------------------|
| User registration    | 📋     | POST /api/auth/register        |
| User login           | 📋     | POST /api/auth/login           |
| JWT token issuance   | 📋     | Stored in localStorage         |
| Protected routes     | 📋     | Frontend + backend guards      |
| Logout               | 📋     | Clear token client-side        |

### Clubs
| Feature              | Status | Notes                          |
|----------------------|--------|--------------------------------|
| List all clubs       | 📋     | GET /api/clubs                 |
| View club details    | 📋     | GET /api/clubs/:id             |
| Create a club        | 📋     | POST /api/clubs (auth required) |
| Edit a club          | 📋     | PATCH /api/clubs/:id (owner only) |
| Delete a club        | 📋     | DELETE /api/clubs/:id (owner only) |
| Join a club          | 📋     | POST /api/clubs/:id/join       |
| Leave a club         | 📋     | DELETE /api/clubs/:id/leave    |

### User Profile
| Feature              | Status | Notes                          |
|----------------------|--------|--------------------------------|
| View own profile     | 📋     | GET /api/users/:id             |
| Edit profile         | 📋     | PATCH /api/users/:id           |
| View joined clubs    | 📋     | Derived from Membership table  |

### Navigation & UI
| Feature              | Status | Notes                          |
|----------------------|--------|--------------------------------|
| Navbar               | ✅     | Links to all main routes       |
| Landing page         | ✅     | Scaffold with CTA              |
| All page routes      | ✅     | React Router wired up          |

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
