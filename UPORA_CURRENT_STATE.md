# UPORA — Current State of the Codebase
**Date**: September 15, 2026  
**Repository**: UPORA Core Application  
**Stack**: Next.js 15.2.0 (App Router), React 19, TypeScript 5.7.3, Tailwind CSS, Prisma ORM 6.4.1, PostgreSQL, Vitest, Jose (JWT), Bcrypt.js  

---

## Executive Summary

UPORA is an economic mobility platform designed to guide people from potential to verified skills, proof of work, and real income ("LEARN. WORK. EARN. GROW."). 

The architectural foundation, security primitives, database schema (24 Prisma models), deterministic career recommendation engine, dynamic roadmap generator, onboarding wizard, and user authentication have been implemented and verified. The test suite passes 100% (21/21 tests), and the Next.js production build compiles cleanly across all 22 static and dynamic routes.

---

## A. What is Fully Implemented

1. **Authentication & Session Security Layer**:
   - Cryptographic JWT session issuance and verification using `jose` (`HS256`, 7-day expiration).
   - Secure HTTP-only cookies (`upora_session`) with `SameSite=Lax`, `Path=/`, and conditional `Secure` flag.
   - Bcrypt password hashing (`bcryptjs` with 10 salt rounds) with timing-safe comparison.
   - Password strength validation via Zod (minimum 8 characters, uppercase letter, number).
   - Role-Based Access Control (`GlobalRole`: `WORKER`, `CLIENT`, `ADMIN`, `TALENT`, `VERIFIER`, `MODERATOR`).
   - Server-side session retrieval (`getCurrentUser()`) and guards (`requireAuth()`, `requireRole()`).
   - Client-side `AuthProvider` and `useAuth()` hook for stateful user sessions.
   - Next.js Edge Middleware (`src/middleware.ts`) enforcing RBAC across `/admin/*`, `/client/*`, and redirecting authenticated users from auth pages.
   - Registration (`/register`) and Login (`/login`) user interfaces with quick-fill test accounts.

2. **Deterministic Career Recommendation Engine**:
   - `src/lib/career/recommendation.ts`: Deterministic matching formula:
     $$\text{Score} = (0.40 \cdot S_{\text{interest}}) + (0.35 \cdot S_{\text{overlap}}) + (0.15 \cdot S_{\text{goal}}) + (0.10 \cdot S_{\text{exp}})$$
   - Zero reliance on external LLM calls for critical path recommendations; guarantees 100% reproducible results, zero latency, and zero downtime.
   - Generates transparent, human-readable rationales explaining why a path was recommended.
   - Computes candidate readiness level (`READY_FOR_WORK`, `NEEDS_CORE_SKILLS`, `BEGINNER_RAMP_UP`).
   - Foundation taxonomy of 5 careers: Cloud Security & Systems Associate, Full-Stack Software Engineer, Cloud DevOps & Platform Engineer, Data Analyst & BI Specialist, Technical Growth Marketer.

3. **Skill-Gap Analysis Engine**:
   - `src/lib/career/skill-gap.ts`: Compares user self-reported/verified skills against required career skills.
   - Categorizes skills into demonstrated competencies vs. prioritized gaps.
   - Prioritizes gaps by mandatory status and employer importance weight.
   - Computes realistic time-to-close estimates based on weekly commitment hours.

4. **Dynamic Roadmap Generator & Next-Best-Action State Machine**:
   - `src/lib/roadmap/generator.ts`: Generates structured 5-phase progressive roadmaps in PostgreSQL (`LEARN`, `PRACTICE_PROJECT`, `ASSESSMENT`, `PRACTICE_PROJECT`, `APPLY_TASK`) with milestone states (`AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `LOCKED`).
   - `src/lib/roadmap/next-action.ts`: State machine determining the single highest-priority action across 5 user states (Unauthenticated Visitor $\to$ Incomplete Onboarding $\to$ Select Career Path $\to$ Incomplete Milestone $\to$ Work Ready).

5. **Diagnostic Onboarding Wizard (`/onboarding`)**:
   - 6-step progressive disclosure wizard: Goal, Starting Point, Interests, Skills, Capacity & Pace, and Career Trajectory Confirmation.
   - Clear trust disclaimer explaining that self-reported skills remain `SELF_REPORTED` until verified through practical challenges.
   - Autosaving intermediate step states via `POST /api/onboarding` and restoring on load via `GET /api/onboarding`.
   - Finalizes profile and generates personalized roadmap via `POST /api/onboarding/complete`.

6. **Dashboard Hydration (`/` & `/discover`)**:
   - Home dashboard (`/`) connects to real authenticated user session, displays live Next Best Action, active roadmap milestone timeline, real reputation score, real wallet balance ($0.00 for new users, zero fake metrics), and prompts incomplete onboarding.
   - Discover page (`/discover`) runs live deterministic matching and skill gap analysis against user profile and allows activating a target career path.

---

## B. What is Partially Implemented

1. **Profile System (`/api/profile`)**:
   - `GET /api/profile` and `PUT /api/profile` are fully functional with IDOR protection.
   - The `/passport` page currently reads mock profile data from Zustand store rather than `/api/profile`.
2. **Roadmap Milestone Transitions**:
   - Milestones are generated and stored in PostgreSQL, but there is no dedicated endpoint (e.g. `POST /api/roadmap/milestones/:id/complete`) for users to mark milestones complete outside of challenge evaluations.
3. **Marketplace Tasks (`/work`)**:
   - Prisma schema has complete models for tasks, applications, contracts, and milestones.
   - `prisma/seed.ts` seeds real tasks into PostgreSQL.
   - The `/work` UI exists with filtering, application modal, and task posting modal, but mutates client Zustand store rather than communicating with backend task APIs.
4. **Practical Challenges & Submissions (`/learn`, `/learn/[slug]`)**:
   - `LearningModule`, `PracticalChallenge`, and `ProjectSubmission` exist in Prisma schema with rubrics and passing scores.
   - The UI displays challenges and problem briefs, but submission evaluation runs in-memory in the client store instead of saving to PostgreSQL.
5. **Financial Progress & Wallet (`/finance`)**:
   - `Wallet`, `PaymentTransaction`, `FinancialGoal`, and `FinancialLog` models exist in Prisma.
   - The `/finance` page visualizes income and escrow, but runs against mock data instead of live database wallet balances.

---

## C. What is Frontend-Only / Mock Data

1. **External Opportunity Feed (`/opportunities`)**:
   - Data rendered on `/opportunities` comes from `src/lib/data/initialData.ts` via Zustand.
   - No `GET /api/opportunities` endpoint exists yet to query the `ExternalOpportunity` table.
2. **Marketplace Task Application & Creation**:
   - Applications submitted on `/work` do not persist to `TaskApplication` in PostgreSQL.
   - "Post a Task" does not persist to `MarketplaceTask` in PostgreSQL.
3. **Escrow Simulation**:
   - Marking a task milestone complete in `/work` increments local React state; no real escrow or database transaction occurs.
4. **Public Skill Passport Route (`/passport/[userId]`)**:
   - Only the private `/passport` view exists. A shareable public verification page accessible without login is not yet built.

---

## D. What is Connected to PostgreSQL

- **Users & Profiles**: `User` and `Profile` models are fully connected. Registrations, logins, session queries, and onboarding saves execute against PostgreSQL.
- **Skills & UserSkills**: Skill catalog lookup and linking self-reported skills during onboarding write directly to `UserSkill` in PostgreSQL with `tier = SELF_REPORTED`.
- **Career Paths**: `CareerPath` records and skill requirements are fetched or created in PostgreSQL.
- **User Roadmaps & Milestones**: `UserRoadmap` and `RoadmapMilestone` records are generated and persisted transactionally.
- **Initial Wallets**: Created transactionally upon user registration.
- **Database Seeding**: `prisma/seed.ts` seeds accounts (worker, client, admin), 8 core skills, 5 career paths, 3 practical learning modules & challenges, 1 marketplace task, and 2 verified external opportunities.

---

## E. What API Routes Exist

| Route | Methods | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | No | Creates user, profile, wallet, hashes password, sets session cookie |
| `/api/auth/login` | `POST` | No | Verifies credentials, sets session cookie |
| `/api/auth/logout` | `POST` | Yes | Clears session cookie |
| `/api/auth/me` | `GET` | Yes | Validates session, returns current user and profile summary |
| `/api/onboarding` | `GET`, `POST` | Yes | Fetches or saves intermediate wizard steps (resumable) |
| `/api/onboarding/complete`| `POST` | Yes | Completes onboarding, stores self-reported skills, generates roadmap |
| `/api/profile` | `GET`, `PUT` | Yes | Retrieves or updates authenticated profile (IDOR-safe) |
| `/api/roadmap` | `GET` | Yes | Retrieves active roadmap and ordered milestone list |
| `/api/next-action` | `GET` | Optional | Computes deterministic next-best action for user or visitor |

---

## F. What Authentication Flows Exist

1. **Registration**: Validates email/password/name $\to$ hashes password with bcrypt $\to$ creates User, Profile, and Wallet in an ACID transaction $\to$ issues signed JWT $\to$ sets HTTP-only cookie $\to$ redirects to `/onboarding`.
2. **Login**: Validates input $\to$ queries user by lowercase email $\to$ timing-safe password verification $\to$ issues signed JWT $\to$ sets HTTP-only cookie $\to$ redirects to `/` or callback URL.
3. **Session Verification**: Reads `upora_session` cookie $\to$ verifies signature with `jose` $\to$ loads fresh user from PostgreSQL (graceful fallback to JWT payload if DB unreachable).
4. **Role-Based Guards**: Middleware checks JWT payload `role` against route prefix:
   - `/admin/*` $\to$ requires `role: ADMIN`
   - `/client/*` $\to$ requires `role: CLIENT` or `ADMIN`
   - `/login`, `/register` $\to$ redirects already-logged-in users to `/`
5. **Logout**: Sets cookie maxAge to 0 $\to$ redirects to `/login`.

---

## G. What Database Models Exist (24 Prisma Models)

- **Identity & Auth**: `User`, `Profile`, `AuditLog`
- **Career & Skills**: `Skill`, `UserSkill`, `CareerPath`, `CareerSkillRequirement`, `UserRoadmap`, `RoadmapMilestone`
- **Learning & Verification**: `LearningModule`, `PracticalChallenge`, `ProjectSubmission`, `PortfolioItem`
- **Marketplace & Contracts**: `MarketplaceTask`, `TaskApplication`, `Contract`, `ContractMilestone`, `ContractDispute`, `Review`
- **Opportunities**: `ExternalOpportunity`
- **Financials**: `Wallet`, `PaymentTransaction`, `FinancialGoal`, `FinancialLog`
- **Reputation**: `ReputationLog`

---

## H. What Major User Journeys Already Work

1. **User Sign Up & Onboarding**:
   - Register account as a worker (`/register`) $\to$ Authenticated session established $\to$ Directed to `/onboarding`.
   - Complete 6-step diagnostic wizard $\to$ Auto-saves each step $\to$ Generates personalized 5-phase roadmap $\to$ Redirected to hydrated dashboard.
2. **Login & Session Continuity**:
   - Log in (`/login`) $\to$ Validates credentials $\to$ Accesses protected profile and active roadmap.
3. **Career Discovery & Skill-Gap Analysis**:
   - Browse `/discover` $\to$ Compares user background with 5 trajectories $\to$ Inspects demonstrated vs missing skills, estimated time to close gaps, and transparent market risks.
4. **Personalized Next-Best-Action**:
   - Home page (`/`) dynamically computes next high-leverage action based on current state.

---

## I. What Major User Journeys Are Broken or Incomplete

1. **Practical Challenge Evaluation Pipeline**:
   - `/learn/[slug]` runs evaluation purely in the browser store. It does not call a backend endpoint to persist `ProjectSubmission` or upgrade `UserSkill` to `PROJECT_VERIFIED`.
2. **Marketplace Task Application & Work Delivery**:
   - Applying to a task on `/work` only increments local React state. No database record in `TaskApplication` is created.
3. **Client Task Posting**:
   - Client users cannot currently persist new tasks to PostgreSQL via an API endpoint.
4. **Public Skill Passport Verification**:
   - The shareable link `/passport/[passportId]` has no server-backed public route for external employers.
5. **Real Financial Telemetry**:
   - `/finance` is not yet reading from `Wallet` and `PaymentTransaction` tables.

---

## J. Build, Type, and Test Status

- **TypeScript Compilation**: `npx tsc --noEmit` $\to$ **0 errors (Clean)**.
- **Automated Tests**: Vitest $\to$ **7 test files, 21 tests passing (100%)** in 6.70s.
- **Production Build**: `npm run build` $\to$ **22/22 routes successfully compiled** (static and dynamic) with **zero build errors**.

---

## K. Missing Environment Variables or External Services

- `DATABASE_URL`: Currently configured for local development. A managed PostgreSQL instance (e.g. Neon, Supabase, RDS) is required for staging/production.
- `JWT_SECRET`: Present in `.env` and `.env.example`. A cryptographically secure 32+ character key must be set in production.
- Payment Gateway (Stripe/Flutterwave): No credentials or SDKs configured yet.
- Object Storage (AWS S3/Cloudflare R2): No credentials configured yet for file deliverable uploads (currently accepting markdown reports and code snippets via text).

---

## L. Security Issues & Safeguards

- **Implemented Safeguards**:
  - Bcrypt (10 rounds) password hashing with timing-safe comparison.
  - Edge-compatible signed JWTs (`jose`) in HTTP-only, SameSite cookies.
  - Zod validation on all API inputs.
  - IDOR protection: User identity derived strictly from validated session cookie.
  - Skill verification isolation: Self-reported skills cannot self-promote to `VERIFIED`.
- **Recommended Hardening**:
  - Rate limiting on `/api/auth/login` and `/api/auth/register` to prevent credential stuffing and account spam.
  - Explicit CSRF tokens for state-mutating requests as defense-in-depth alongside `SameSite=Lax`.

---

## M. Deployment Blockers

1. **Managed PostgreSQL Database**: Requires a live PostgreSQL database URL for remote hosting.
2. **Prisma Migration / Push**: Production database requires initial schema push (`prisma db push` or `prisma migrate deploy`) and seeding (`prisma db seed`).

---

## N. Exact Remaining Work Required for a Functional MVP

1. **Challenge Submission API (`POST /api/challenges/[id]/submit`)**:
   - Receive student submission $\to$ evaluate rubric $\to$ create `ProjectSubmission` $\to$ update `UserSkill` to `PROJECT_VERIFIED` $\to$ advance active roadmap milestone.
2. **Hydrate `/learn` and `/learn/[slug]` from Database**:
   - Replace Zustand mock modules with real `LearningModule` and `PracticalChallenge` database queries.
3. **Marketplace Tasks API (`GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/[id]/apply`)**:
   - Fetch real tasks from database, allow client task creation, and allow talent applications to persist in `TaskApplication`.
4. **Public Skill Passport View (`/passport/[userId]`)**:
   - Publicly verifiable page showing user's verified skills, rubrics passed, and proof of work.
5. **Wallet API (`GET /api/wallet`)**:
   - Read user's real balance, escrow, and payment transactions from `Wallet`.
