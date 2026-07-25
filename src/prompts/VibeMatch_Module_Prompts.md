# VibeMatch — Module-by-Module Build Prompts

> Use this alongside `VibeMatch_Master_Prompt.md`. At the start of every session: paste the master prompt first, then paste **only the prompt for the module you're currently building**. Don't paste future modules ahead of time — that's what causes AI tools to over-scope and generate shallow, half-wired code.

Each prompt assumes the master prompt is already in context. Work top to bottom. Do not start a module until the previous one is tested and marked done in your `PROGRESS.md`.

---

## Module 0: Project Scaffolding (do this first, before Module 1)

```
Set up the initial project scaffolding for VibeMatch per the master prompt's tech stack.

Create:
- A monorepo structure with /frontend (Next.js App Router, TypeScript, Tailwind, shadcn/ui) and /backend (FastAPI, SQLAlchemy, Alembic)
- docker-compose.yml wiring up Postgres, backend, and frontend for local development
- .env.example files for both frontend and backend with placeholder values (DB connection string, JWT secret, OpenAI/Claude API keys) — no real secrets
- Basic health-check endpoint on the backend (GET /api/v1/health)
- A skeleton PROGRESS.md tracking all 15 modules as "not started"
- Base folder structure for the reusable component library (shadcn/ui-based) on the frontend

Do not build any feature modules yet. This is infrastructure only. Confirm the stack runs locally via docker-compose before moving on.
```

---

## Module 1: Landing Page

```
Build the Landing Page module for VibeMatch.

Requirements:
- Public route, no authentication required
- Premium SaaS aesthetic (Linear/GitHub/Notion/Vercel-inspired), responsive, dark/light mode support
- Clear value proposition explaining what VibeMatch does (skill analysis, team building, idea validation, architecture/roadmap generation, pitch prep, judge simulation, docs generation)
- CTA buttons routing to Register and Login
- Use the shared component library — don't create one-off styled components here that won't be reused

Do not touch backend auth logic yet — that's Module 2. This is frontend-only.
```

---

## Module 2: Authentication

```
Build the Authentication module for VibeMatch.

Backend:
- User model (Users table) with secure password hashing
- POST /api/v1/auth/register, POST /api/v1/auth/login, POST /api/v1/auth/refresh, POST /api/v1/auth/logout
- JWT issuance and validation; be explicit and consistent about whether you're using httpOnly cookies or bearer tokens (per the master prompt, don't mix patterns)
- Pydantic validation on all inputs; consistent error response shape per the master prompt

Frontend:
- Register and Login pages, connected to the Landing Page CTAs
- Auth state management (e.g. context/provider) available app-wide
- Protected route wrapper/middleware that redirects unauthenticated users to Login
- Route logic: after first successful login, redirect to Developer Profile setup (Module 4) instead of Dashboard

Write tests for register/login/refresh/logout happy paths and common failure cases (bad password, duplicate email, expired token).
```

---

## Module 3: Dashboard

```
Build the Dashboard module for VibeMatch.

Requirements:
- Protected route, requires valid auth session
- Central hub linking to all AI modules (even ones not built yet — show them as "coming soon" cards until their module is complete)
- Recent activity section that will later pull from Project History (Module 14) — for now, wire it to an empty state since History doesn't exist yet
- Loading state and empty state for a brand-new user with no activity
- Responsive layout matching the Landing Page's visual language

Note: leave clear integration points (comments or typed interfaces) for where History data will plug in later — don't hardcode dummy data that looks real.
```

---

## Module 4: Developer Profile

```
Build the Developer Profile module for VibeMatch.

Backend:
- Profiles table, 1:1 with Users
- Skills table + join table for many-to-many Profile↔Skill relationships
- POST/GET/PATCH endpoints for a user's profile, protected routes only

Frontend:
- First-login setup flow: name, experience level, skills (multi-select or tag input), preferences
- After submission, redirect to Dashboard
- Editable later from Settings (Module 15) — leave a clear integration point for that link, don't build Settings yet

Validate that a user who already completed their profile is NOT shown this flow again on subsequent logins — route them straight to Dashboard.
```

---

## Module 5: Skill Analyzer

```
Build the Skill Analyzer module for VibeMatch.

This is the first AI-powered module — set up the shared AI provider abstraction layer now (per master prompt Section 5) if it doesn't exist yet, so later modules reuse it rather than each rolling its own OpenAI/Claude client.

Backend:
- Endpoint that takes a user's Profile/Skills data and returns an AI-generated skill analysis (strengths, gaps, suggested growth areas)
- Streaming response (per master prompt AI requirements)
- Save every output to a shared "AI outputs" pattern that Project History (Module 14) will later read from — define this schema now since every subsequent AI module will follow the same pattern (input payload, output payload, provider/model used, timestamp, regeneration count)
- Handle AI provider failures gracefully (timeout, rate limit, malformed response) with a user-facing error state

Frontend:
- Trigger analysis from Dashboard
- Streamed rendering of the AI response
- Regenerate button
- Loading and error states
- A simple visualization of the skill breakdown (e.g. radar chart) rather than raw text only
```

---

## Module 6: Team Builder

```
Build the Team Builder module for VibeMatch.

Backend:
- Teams table, many-to-many Users↔Teams
- Endpoint that takes skill-gap data (from Skill Analyzer output where available) and suggests/matches teammates
- Reuse the AI provider abstraction layer from Module 5
- Persist outputs following the same AI-output schema pattern established in Module 5

Frontend:
- UI to view suggested teammates and form/join a team
- Streamed AI reasoning for why a match was suggested
- Regenerate button, loading/error states
- Integrate with Dashboard as a linked card
```

---

## Module 7: Project Validator

```
Build the Project Validator module for VibeMatch.

Backend:
- Projects table (a Project can belong to a User or a Team)
- Validations table, linked to Projects, following the shared AI-output schema
- Endpoint that takes a submitted project idea and returns AI feasibility/originality/scope feedback, streamed

Frontend:
- Form to submit a project idea (title, description, target users, tech approach)
- Streamed validation feedback with clear sections (feasibility, originality, risks, suggestions)
- Regenerate button, loading/error states
- This is the first module that creates a "Project" — make sure Team Builder (Module 6) and Skill Analyzer (Module 5) can later reference this Project entity if relevant
```

---

## Module 8: Architecture Generator

```
Build the Architecture Generator module for VibeMatch.

Backend:
- Architectures table, linked to Projects, shared AI-output schema
- Endpoint that takes a Project's brief (from Project Validator output or manual input) and generates a system architecture recommendation, streamed

Frontend:
- View/select which Project to generate architecture for
- Streamed architecture output — render structured sections (frontend/backend/database/deployment recommendations) rather than a single text blob
- Regenerate button, loading/error states
- Consider a simple diagram/visual representation of the architecture if feasible, not just text
```

---

## Module 9: Roadmap Generator

```
Build the Roadmap Generator module for VibeMatch.

Backend:
- Roadmaps table, linked to Projects, shared AI-output schema
- Endpoint that takes Project + Architecture context and generates an execution timeline with milestones, streamed

Frontend:
- Select Project, trigger generation
- Render roadmap as a visual timeline (not just a text list) — milestones, estimated effort, dependencies if the AI provides them
- Regenerate button, loading/error states
```

---

## Module 10: Feature Prioritizer

```
Build the Feature Prioritizer module for VibeMatch.

Backend:
- Reuse Projects table; store prioritization output following the shared AI-output schema (add a table if none of the existing ones fit — check against the master prompt's schema list first)
- Endpoint that takes a list of proposed features and returns an AI-assisted prioritization (e.g. MoSCoW or impact/effort scoring), streamed

Frontend:
- Input for listing candidate features
- Visual prioritization matrix or ranked list (impact-effort chart is a good fit here)
- Regenerate button, loading/error states
```

---

## Module 11: Pitch Generator

```
Build the Pitch Generator module for VibeMatch.

Backend:
- Pitches table, linked to Projects, shared AI-output schema
- Endpoint that takes full Project context (validation, architecture, roadmap if available) and generates pitch content/script, streamed

Frontend:
- Select Project, trigger generation
- Render pitch content in a structured, presentable format (e.g. slide-like sections: problem, solution, demo, market, ask)
- Regenerate button, loading/error states
- Export/copy option for reuse outside the app
```

---

## Module 12: Judge Simulator

```
Build the Judge Simulator module for VibeMatch.

Backend:
- JudgeSessions table, linked to Projects, shared AI-output schema
- Endpoint that takes Project + Pitch context and has the AI role-play a hackathon judge, returning scored feedback across relevant criteria, streamed

Frontend:
- Select Project, trigger a judge session
- Render scores + qualitative feedback clearly (e.g. per-criterion score bars plus written notes)
- Regenerate button (allow re-running as a "different judge persona" if feasible), loading/error states
```

---

## Module 13: Documentation Generator

```
Build the Documentation Generator module for VibeMatch.

Backend:
- Documentation table, linked to Projects, shared AI-output schema
- Endpoint that takes full Project context (validation, architecture, roadmap, features) and generates README/technical documentation, streamed

Frontend:
- Select Project, trigger generation
- Render generated docs in a readable markdown-style view
- Regenerate button, loading/error states
- Export/download option (e.g. as a .md file)
```

---

## Module 14: Project History

```
Build the Project History module for VibeMatch.

Backend:
- History table that unifies references to outputs from every AI module built so far (Validations, Architectures, Roadmaps, Pitches, JudgeSessions, Documentation, Skill Analyzer, Team Builder)
- Endpoint(s) to list/filter a user's history by module type, Project, and date

Frontend:
- Filterable, searchable history view
- Clicking an entry shows the full saved output (and lets the user regenerate from there, reusing each module's existing regenerate logic)
- Wire this into the Dashboard's "recent activity" section that was left as a placeholder in Module 3
- Loading and empty states
```

---

## Module 15: Settings

```
Build the Settings module for VibeMatch.

Backend:
- Endpoints to update account details, theme preference, and (if applicable) personal AI API key overrides — never log or expose these keys
- Ensure all endpoints are protected routes

Frontend:
- Account settings (edit profile — reuse Developer Profile fields from Module 4, don't duplicate the form logic)
- Theme toggle (dark/light), persisted per user
- API key management UI if you're allowing user-supplied keys (mask values, never display full key after saving)
- Link in from Dashboard/nav, consistent with the rest of the app's navigation
```

---

## After Module 15: Deployment Pass

```
Now that all modules are functionally complete, prepare VibeMatch for production deployment per the master prompt's deployment section:

- Finalize Dockerfiles for frontend and backend
- Finalize docker-compose.yml for local parity
- Set up GitHub Actions: lint, test, build, and deploy to AWS App Runner on merge to main
- Confirm HTTPS is enforced in production
- Confirm .env.example is up to date and no secrets are committed anywhere in the repo
- Run a full regression pass across all 15 modules before considering this a release candidate
```

---

## Tips for Using This Sequence

- **One prompt per session (roughly).** Trying to cram 2-3 modules into one session tends to produce shallower results for each.
- **Update `PROGRESS.md` after every module** and paste its current contents at the start of your next session, alongside the master prompt.
- If a module reveals that an earlier decision needs to change (e.g. auth pattern, schema tweak), update the master prompt file itself before continuing — don't let the two documents drift apart.
- It's fine to reorder later modules (e.g. do Feature Prioritizer before Team Builder) if that better fits how you want to demo the app — the dependencies that matter most are: Auth → Profile → (any AI module) → History → Settings.
