# PROJECT_OVERVIEW.md

> **Why this file exists:** One-stop summary of what Clubora is, who it's for, and what it's trying to achieve. Read this first before opening any other doc.
>
> **When to update:** When the product vision, target audience, or MVP scope changes.
>
> **How it helps:** Keeps everyone (and every AI session) aligned on the same goal before writing a single line of code.

---

## What is Clubora?

Clubora is a web platform where people can **discover, create, and join clubs** around shared interests — sports, study groups, hobbies, local communities, and more.

Think of it as a lightweight, modern alternative to Facebook Groups or Meetup, built with a clean UI and straightforward UX.

---

## Who is it for?

| User Type       | Goal                                        |
|-----------------|---------------------------------------------|
| Club Creator    | Start a club, define its purpose, grow it   |
| Club Member     | Find clubs that match their interests       |
| General Visitor | Browse clubs without signing up             |

---

## Core Value Proposition

- Easy to find clubs by category or interest
- Simple club creation — no friction
- Clean member experience — join, participate, leave
- Mobile-friendly and fast

---

## MVP Scope

The MVP focuses on getting these flows working end-to-end:

1. **Auth** — Register, Login, Logout
2. **Explore Clubs** — Browse and search clubs
3. **Club Details** — View club info and members
4. **Create Club** — Create a club with name, description, category
5. **User Profile** — View and edit your own profile

Everything else is post-MVP.

---

## Out of Scope (for now)

- Real-time messaging / chat
- Club events or calendars
- Notifications system
- Social feeds
- Payment / premium clubs
- Mobile native app

---

## Tech Stack Summary

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | React 19 + Vite + React Router |
| Backend    | Node.js + Express 5         |
| Database   | SQLite via Prisma ORM       |
| Styling    | Plain CSS (no framework yet) |

---

## Project Status

- [x] Project scaffolded
- [x] Database schema defined
- [x] Route stubs created
- [x] Frontend pages and routing in place
- [ ] Auth implementation
- [ ] Club CRUD implementation
- [ ] Profile implementation

---

## Related Docs

- [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) — how the system is built
- [FEATURES.md](./FEATURES.md) — full feature list
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) — how we work
