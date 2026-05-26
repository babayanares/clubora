# AI_WORKFLOW_NOTES.md

> **Why this file exists:** AI-assisted development has its own patterns, pitfalls, and lessons. This file captures what works, what doesn't, and useful prompts — so you don't have to rediscover them.
>
> **When to update:** After each significant AI-assisted session. Add what worked, what failed, and any prompt patterns worth keeping.
>
> **How it helps:** Builds a personal playbook for AI-assisted engineering. Especially valuable for a PM/QA-oriented workflow where requirements need to be clearly communicated to get good code output.

---

## Useful Prompts

### Scaffolding
```
Scaffold a [feature name] feature for Clubora.
Backend: Express route at [path], Prisma model [model name].
Frontend: React page at [route], form with fields [field list].
Follow the existing code structure in /backend/src/routes and /frontend/src/pages.
Keep it simple — no advanced features yet.
```

### Adding a new API route
```
Add a [METHOD] [path] route to the Clubora backend.
It should [describe what it does].
Validate that [list required fields].
Return [describe success response].
Handle errors with appropriate HTTP status codes.
Follow the existing pattern in backend/src/routes/clubs.js.
```

### Debugging
```
Here is the error I'm seeing: [paste error]
Here is the relevant code: [paste code or file path]
What is causing this and how should I fix it?
```

### Writing tests / QA checklist
```
Write a QA checklist for the [feature name] feature in Clubora.
Cover: happy path, validation errors, edge cases, API responses, and DB state.
Format as a markdown checklist.
```

### Explaining code
```
Explain this code to me as if I'm a PM/QA engineer who understands the product but is learning the technical side:
[paste code]
```

---

## Implementation Lessons

### 2026-05-25 — Initial scaffold
- Prisma 7 changed where the database URL lives — it moved from `schema.prisma` to `prisma.config.ts`. The old pattern (`url = env("DATABASE_URL")` in the schema) now throws a validation error.
- The fix: remove `url` from the datasource block in `schema.prisma` — Prisma 7 reads it from `prisma.config.ts` automatically.
- Always check Prisma version compatibility when starting a new project.

---

## Debugging Lessons

- When Express crashes with no useful error, add a global error handler middleware to catch and log unhandled errors:
  ```js
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });
  ```
- When a frontend API call fails silently, open the browser Network tab — the actual error response body is often there.
- When Prisma gives a constraint error, read the full error message — it usually names the exact constraint that was violated (e.g. `Unique constraint failed on: email`).

---

## Architecture Decisions (AI-assisted)

| Decision               | How AI helped                            | Outcome           |
|------------------------|------------------------------------------|-------------------|
| Initial scaffold       | Generated full project structure         | Good baseline     |
| Prisma schema design   | Suggested models and relationships       | Clean, scalable   |
| Route structure        | Followed REST conventions automatically  | Consistent naming |

---

## AI Limitations Observed

| Limitation                          | Mitigation                              |
|-------------------------------------|-----------------------------------------|
| AI doesn't know your exact project state between sessions | Always share relevant file contents or context at session start |
| AI can generate overly complex solutions | Explicitly say "keep it simple" and "MVP only" |
| AI may suggest outdated patterns (e.g. old Prisma syntax) | Verify against current docs when something doesn't work |
| Generated code may not match your existing conventions | Point AI to existing files as reference ("follow the pattern in X") |
| AI can miss edge cases in validation | Always review generated validation logic manually |

---

## Validation Strategies

- Ask AI to "list all edge cases" for a feature before implementing it
- Always ask "what can go wrong?" after getting an implementation
- Compare AI-generated validation against the rules in `DEVELOPMENT_RULES.md`
- Use `EDGE_CASES.md` to build a checklist before testing anything

---

## Workflow That Works Well

```
1. Define the feature clearly (what it does, who uses it, what can go wrong)
2. Ask AI to review the feature doc before writing code
3. Implement backend first — test the API with curl or Postman
4. Implement frontend second — wire it to the tested API
5. Test the full flow manually
6. Document any issues found in KNOWN_ISSUES.md
7. Update the feature doc if anything changed
```

---

## Workflow Improvements To Try

- [ ] Create a standard "session start" prompt that shares project context automatically
- [ ] Build a prompt template for each type of task (new feature, bug fix, refactor)
- [ ] Review AI output against `DEVELOPMENT_RULES.md` before accepting it
