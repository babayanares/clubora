# AUTH_FLOW.md

> Feature flow document for user registration and login.

---

## Feature Goal

Allow users to create an account and log in so they can access personalized features like creating clubs and tracking memberships.

---

## Business Purpose

Without auth, everyone is anonymous — we can't associate clubs with owners, track memberships, or protect sensitive actions. Auth is the foundation that unlocks all other features.

---

## User Workflow

**Registration:**
1. User visits `/register`
2. Fills in name, email, password
3. Submits the form
4. Account is created — user is logged in automatically (or redirected to login)
5. User is taken to the Dashboard

**Login:**
1. User visits `/login`
2. Fills in email and password
3. Submits the form
4. Server verifies credentials
5. JWT token is returned and stored in the browser
6. User is taken to the Dashboard

**Logout:**
1. User clicks Logout
2. JWT token is removed from storage
3. User is redirected to the Landing page

---

## Frontend Responsibilities

- `Register.jsx` — form with name, email, password fields
- `Login.jsx` — form with email, password fields
- On successful login/register: store JWT in `localStorage`, redirect to `/dashboard`
- On logout: clear JWT from storage, redirect to `/`
- Show loading state while form is submitting
- Show error message if registration or login fails
- Protect routes that require auth — redirect to `/login` if no token found

---

## Backend Responsibilities

- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — verify credentials, return token
- Hash passwords with **bcrypt** before storing
- Generate a **JWT** token on successful login/register
- Validate all inputs before processing
- Return consistent error messages (never expose raw DB errors)

---

## Database Interactions

**Register:**
- Check if email already exists (`User.findUnique({ where: { email } })`)
- If not, create user with hashed password (`User.create(...)`)

**Login:**
- Find user by email (`User.findUnique({ where: { email } })`)
- Compare submitted password against stored hash (`bcrypt.compare(...)`)

---

## Validation Rules

| Field    | Rules                                              |
|----------|----------------------------------------------------|
| name     | Required. Min 2 chars. Max 100 chars.              |
| email    | Required. Must be valid email format. Must be unique. |
| password | Required. Min 8 chars.                             |

---

## API Endpoints

### POST /api/auth/register

Request:
```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "securepassword"
}
```

Success (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "alex@example.com"
  }
}
```

### POST /api/auth/login

Request:
```json
{
  "email": "alex@example.com",
  "password": "securepassword"
}
```

Success (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "alex@example.com"
  }
}
```

---

## Error Handling

| Scenario                      | HTTP Status | Error Message                          |
|-------------------------------|-------------|----------------------------------------|
| Email already registered      | 409         | `"Email is already in use"`            |
| Invalid email format          | 400         | `"Invalid email address"`              |
| Password too short            | 400         | `"Password must be at least 8 characters"` |
| Wrong email or password       | 401         | `"Invalid email or password"`          |
| Missing required field        | 400         | `"[field] is required"`                |
| Server error                  | 500         | `"Something went wrong, try again"`    |

Note: Login should return the **same** error for wrong email and wrong password — never reveal which one is wrong.

---

## Success Flow

```
User submits register form
→ Frontend validates inputs
→ POST /api/auth/register
→ Backend validates inputs
→ Check email uniqueness
→ Hash password
→ Create user in DB
→ Generate JWT
→ Return { token, user }
→ Frontend stores token
→ Redirect to /dashboard
```

---

## Edge Cases

- User submits form twice quickly (double submit) — backend must handle duplicate email gracefully
- Password has leading/trailing whitespace — trim before validation
- Email has uppercase letters — normalize to lowercase before storing
- Very long inputs — enforce max length to prevent DB issues
- User disables JavaScript — form won't validate client-side; backend must still validate

---

## QA Checklist

**Registration:**
- [ ] Can register with valid name, email, password
- [ ] Cannot register with an already-used email
- [ ] Cannot register with an invalid email format
- [ ] Cannot register with a password under 8 characters
- [ ] Cannot register with empty name
- [ ] Error messages appear correctly for each validation failure
- [ ] Successful registration stores a token and redirects to dashboard

**Login:**
- [ ] Can log in with correct email and password
- [ ] Cannot log in with wrong password
- [ ] Cannot log in with email that doesn't exist
- [ ] Error message is shown for failed login
- [ ] Successful login stores a token and redirects to dashboard

**Logout:**
- [ ] Clicking logout clears the token
- [ ] After logout, protected pages redirect to /login

---

## Future Improvements

- Email verification after registration
- "Remember me" option (longer-lived token)
- Password reset / forgot password flow
- OAuth login (Google, GitHub)
- Rate limiting on auth endpoints to prevent brute force
