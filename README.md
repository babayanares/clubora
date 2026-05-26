# Clubora

A platform for discovering, creating, and joining clubs around shared interests.

## Tech Stack

- **Frontend:** React 19 + Vite + React Router
- **Backend:** Node.js + Express 5
- **Database:** SQLite via Prisma ORM

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

---

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit values if needed
npm run dev            # starts on http://localhost:5000
```

Verify the API is running:
```
GET http://localhost:5000/api/health
```

---

### 2. Database

The SQLite database is created automatically when you run the backend for the first time. To re-run migrations manually:

```bash
cd backend
npx prisma migrate dev
```

To open Prisma Studio (visual DB editor):
```bash
npx prisma studio
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

---

## Project Structure

```
clubora/
├── frontend/          # React app
│   └── src/
│       ├── api/       # Axios client
│       ├── components/
│       └── pages/     # Landing, Login, Register, Dashboard, Explore, ClubDetails, CreateClub, Profile
├── backend/           # Express REST API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   └── prisma/        # Schema + migrations
├── database/          # SQLite .db file (git-ignored)
└── docs/              # Architecture docs
```

## API Endpoints

| Method | Path                | Description         |
|--------|---------------------|---------------------|
| GET    | /api/health         | Health check        |
| POST   | /api/auth/register  | Register user       |
| POST   | /api/auth/login     | Login               |
| GET    | /api/clubs          | List clubs          |
| GET    | /api/clubs/:id      | Get club by ID      |
| POST   | /api/clubs          | Create club         |
| GET    | /api/users/:id      | Get user profile    |
