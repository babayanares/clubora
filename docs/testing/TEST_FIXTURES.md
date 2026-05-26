# TEST_FIXTURES.md

> **Why this file exists:** Reusable example payloads that can be copy-pasted into API tests, used in documentation, or referenced when writing test scenarios. Saves time and ensures consistency.
>
> **When to update:** When new models are added or validation rules change.
>
> **How to use:** Copy the payloads into curl commands, Postman, or frontend test forms.

---

## Valid Users

```json
// Minimum required fields
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "securepassword"
}

// Full valid user
{
  "name": "Jordan Lee",
  "email": "jordan.lee@example.com",
  "password": "MyP@ssw0rd!"
}

// Long but valid name
{
  "name": "Christopher Alexander Thompson",
  "email": "cat@example.com",
  "password": "validpassword123"
}
```

---

## Invalid Users

```json
// Missing name
{
  "email": "noname@example.com",
  "password": "validpassword"
}

// Missing email
{
  "name": "No Email",
  "password": "validpassword"
}

// Missing password
{
  "name": "No Password",
  "email": "nopwd@example.com"
}

// Invalid email format
{
  "name": "Bad Email",
  "email": "not-an-email",
  "password": "validpassword"
}

// Password too short (under 8 chars)
{
  "name": "Short Pass",
  "email": "shortpass@example.com",
  "password": "abc"
}

// Name too short (under 2 chars)
{
  "name": "X",
  "email": "shortname@example.com",
  "password": "validpassword"
}

// Empty strings (not the same as missing — still invalid)
{
  "name": "",
  "email": "",
  "password": ""
}

// Whitespace-only name
{
  "name": "   ",
  "email": "wsname@example.com",
  "password": "validpassword"
}
```

---

## Valid Clubs

```json
// Minimum required fields (name + at least one interest)
{
  "name": "Photography Club",
  "interests": "photography"
}

// Full valid club
{
  "name": "Photography Club",
  "description": "A welcoming space for photographers of all skill levels.",
  "location": "New York, NY",
  "interests": "photography,travel,outdoors",
  "visibility": "public"
}

// Different interests
{
  "name": "Weekend Runners",
  "description": "Casual weekend running group. All paces welcome.",
  "location": "Central Park, NYC",
  "interests": "running,fitness,outdoors",
  "visibility": "public"
}

{
  "name": "Book Exchange",
  "description": "Monthly book swap and discussion.",
  "interests": "reading,literature",
  "visibility": "public"
}

// Private club
{
  "name": "Inner Circle Investors",
  "description": "Private investment discussion group.",
  "interests": "investing,finance",
  "visibility": "private"
}

// Online club (no location)
{
  "name": "Global Dev Community",
  "interests": "programming,technology,opensource",
  "visibility": "public"
}
```

---

## Invalid Clubs

```json
// Missing name
{
  "interests": "photography",
  "description": "A club with no name"
}

// Empty name
{
  "name": "",
  "interests": "photography"
}

// Whitespace-only name
{
  "name": "     ",
  "interests": "photography"
}

// Name too short (under 3 chars)
{
  "name": "AB",
  "interests": "photography"
}

// Name too long (over 100 chars)
{
  "name": "This club name is intentionally way too long and should be rejected by the validation layer of the API because it exceeds the maximum allowed length of one hundred characters",
  "interests": "test"
}

// Missing interests (required since 2026-05-26)
{
  "name": "Valid Name"
}

// Interests is empty string
{
  "name": "Valid Name",
  "interests": ""
}

// Interests is only commas/whitespace
{
  "name": "Valid Name",
  "interests": " , , "
}

// Description too long (over 500 chars)
{
  "name": "Valid Name",
  "interests": "test",
  "description": "This description is intentionally too long. It goes on and on and on, repeating itself over and over with filler text that does nothing except push the character count past the five hundred character maximum that the API is supposed to enforce. The validation layer should catch this and return a 400 error. This text continues to fill space and nothing more. Almost there now. And done."
}
```

---

## Malformed Requests

```json
// Completely empty body
{}

// Wrong data types
{
  "name": 12345,
  "email": true,
  "password": null
}

// Extra unknown fields (should be ignored, not error)
{
  "name": "Valid Name",
  "email": "valid@example.com",
  "password": "validpassword",
  "isAdmin": true,
  "id": 999,
  "role": "superuser"
}
```

---

## Edge Case Scenarios

```json
// Duplicate registration (use this payload twice to test uniqueness check)
{
  "name": "Duplicate User",
  "email": "duplicate@example.com",
  "password": "firstpassword"
}

// Login with correct credentials
{
  "email": "alex@example.com",
  "password": "securepassword"
}

// Login with wrong password
{
  "email": "alex@example.com",
  "password": "wrongpassword"
}

// Login with non-existent email
{
  "email": "nobody@example.com",
  "password": "anypassword"
}

// Club creation without auth header (should return 401)
{
  "name": "Unauthorized Club"
}
```

---

## curl Examples

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Rivera","email":"alex@example.com","password":"securepassword"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"securepassword"}'

# Create club (replace TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Photography Club","description":"For photographers","category":"Creative"}'

# Get clubs
curl http://localhost:5000/api/clubs

# Health check
curl http://localhost:5000/api/health
```
