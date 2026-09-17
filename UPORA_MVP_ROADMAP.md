# UPORA — MVP Execution Roadmap

**Date**: September 16, 2026 · **Status**: Active Production Plan
**Basis**: Verified codebase audit — see `UPORA_CURRENT_STATE.md`

This roadmap prioritizes the remaining work to convert the current foundation (auth, onboarding, roadmap generation, static mock screens) into a genuinely functional, end-to-end MVP.

---

## Priority Levels

- **P0 — Required for MVP**: The core loop must work with database truth, or the product cannot deliver "Learn. Work. Earn. Grow."
- **P1 — Important after MVP**: Features that strengthen trust, operations, and retention once the core loop is live.
- **P2 — Future improvement**: Advanced scalability, institutional tooling, and automated integrations.

---

## The Core MVP Loop

```
Register → Onboard → Solve Challenge (graded & persisted)
        → Get Verified → Apply to Task (persisted) → Deliver → View Balance
```

Today only `Register → Onboard → Roadmap` works end-to-end (persisted). Everything after that is browser-only simulation.

---

## P0 — Required for MVP

### P0.0 Environment & Prerequisites (do first — everything depends on it)
**Problem**: Fresh clone has no `.env`; Prisma client ungenerated; tests/DB code fail until regenerated; Next.js workspace-root misdetected due to a nested duplicate clone.
- [ ] Create `.env` from `.env.example` with a real `DATABASE_URL` (local or hosted PostgreSQL) and a strong `JWT_SECRET`.
- [ ] Remove the hard-coded default JWT secret fallback in `src/lib/auth/jwt.ts` and `src/middleware.ts` (fail loudly if `JWT_SECRET` is unset).
- [ ] Add `postinstall: prisma generate` (or run generate in build step) so fresh clones/tests work.
- [ ] Run `prisma db push` + `prisma db seed` against the target DB.
- [ ] Fix Next.js workspace-root warning: delete the nested duplicate `UPORA` copy and/or set `outputFileTracingRoot` in `next.config.ts`.
- [ ] Deal with `next lint` deprecation (migrate to ESLint CLI or replace with a lint command that works) — non-blocking but trivial.

### P0.1 Challenge Submission & Verification Engine
**Problem**: `/learn/[slug]` grades in the browser with keyword heuristics; results are localStorage-only. `ProjectSubmission`, `UserSkill` tiers and `RoadmapMilestone` are never written.
- [ ] `POST /api/challenges/[id]/submit` — auth required; Zod-validated submission (markdown/code/answers); deterministic rubric scoring (reuse seeded `rubricCriteria` weights + `passingScore`).
- [ ] Persist `ProjectSubmission` with status `PASSED` / `REJECTED`, score, and feedback.
- [ ] On pass: upsert `UserSkill` → `tier: PROJECT_VERIFIED`, `verifiedAt: now()`, link `evidenceSubmissionId`.
- [ ] Advance active roadmap: mark the current milestone `COMPLETED`, unlock the next (`AVAILABLE`).
- [ ] Remove browser-side random "evidence hash"; store a real server-generated commitment (e.g. SHA-256 of submission) in the `UserSkill`/`ProjectSubmission` record.
- [ ] Add unit tests for the rubric evaluator and milestone advancement (DB-mockable pure functions).

### P0.2 Hydrate Practical Learning from the Database
**Problem**: `/learn` and `/learn/[slug]` render static arrays; seeded `LearningModule` + `PracticalChallenge` are never queried.
- [ ] `GET /api/challenges` — return active modules + challenges + rubric weights from DB (filter/sort by skill).
- [ ] Hydrate `/learn` grid and `/learn/[slug]` brief, starter resources, and rubric from the API instead of the store.
- [ ] Wire `/learn/[slug]` submit button to `POST /api/challenges/[id]/submit`.
- [ ] Show real verification state from `/api/profile` (skills list) rather than localStorage.

### P0.3 Real Marketplace Tasks & Applications
**Problem**: `/work` renders static tasks; applying only bumps a local counter; posting a task just calls `alert()`; no `TaskApplication`, `MarketplaceTask` writes.
- [ ] `GET /api/tasks` — active tasks from `MarketplaceTask` with tier filtering and client info.
- [ ] `POST /api/tasks` — client-only endpoint; validates title, tier, budget, currency, required skills, deadline; persists task.
- [ ] `POST /api/tasks/[id]/apply` — authenticated talent; enforces skill-prerequisite (at least one `PROJECT_VERIFIED`/`CLIENT_VALIDATED` match) and tier gating; upserts into `TaskApplication` (unique per task/talent).
- [ ] Hydrate `/work` tabs, apply modal (real submission), and post-task modal (real creation); remove "simulate approval" shortcut.
- [ ] Update `Header`/home "Browse All Work" links from `/tasks` to `/work`.

### P0.4 Public Skill Passport Verification Route
**Problem**: `/passport` is a static mock; share link targets a non-existent route.
- [ ] `GET /api/passport/[userId]` — **public** endpoint returning public profile + only skills with `tier: PROJECT_VERIFIED` / `CLIENT_VALIDATED` (+ rubric evidence), excluding `SELF_REPORTED`.
- [ ] Build `/passport/[passportId]` server-rendered public page (shareable, fast, mobile-friendly) with an evidence badge.
- [ ] Hydrate the private `/passport` page with the authenticated user's real profile/skills from `/api/profile`.

### P0.5 Real Wallet & Balance Telemetry
**Problem**: `/finance` and the header balance read mock `initialFinancials`/localStorage; `Wallet` and `PaymentTransaction` are never read.
- [ ] `GET /api/wallet` — authenticated user's `availableBalance`, `pendingEscrowBalance`, `lifetimeEarnings`, and recent `PaymentTransaction`s.
- [ ] Hydrate `/finance` metrics, transaction list, and header balance badge with real wallet data.
- [ ] Keep savings goals as a thin local feature or move to `FinancialGoal`/`FinancialLog` (recommend DB — schema already exists).
- [ ] Add a "funds are simulation/preview — payouts arrive post-gateway integration" disclosure until P2.1.

### P0.6 Auth Route Rate Limiting & Abuse Prevention
**Problem**: no throttling on login/register; default JWT secret fallback.
- [ ] Rate limit `POST /api/auth/login` (e.g. max 5 attempts / 15 min / IP) and `POST /api/auth/register` (e.g. max 3 accounts / hour / IP) — in-memory now, Redis-backed later.
- [ ] Remove default secret fallback (see P0.0).

### P0.7 Fix Broken Navigation & Dead CTAs
- [ ] `/api/roadmap/next-action.ts` CTA URLs: `/learning` → `/learn`, `/challenges` → `/learn`, `/tasks` → `/work`.
- [ ] Home "Browse All Work" → `/work`.
- [ ] Remove or guard `alert()`-only "Deposit Escrow & Publish Task" until P0.3 exists (replace with real POST).

### Definition of MVP Done
A new user can, in one sitting: register → onboard → receive a roadmap → open a real challenge from the DB → submit → receive a persisted PASS + `PROJECT_VERIFIED` badge → see it on `/passport` → apply to a real `/work` task (persisted application) → see a real (seeded) wallet balance on `/finance`.

---

## P1 — Important After MVP

### P1.1 Client Contract & Escrow Management
- Client accepts a `TaskApplication` → `Contract` created in `AWAITING_ESCROW`.
- Client funds milestone → status moves to `ACTIVE`.
- Worker submits deliverable → client approves → milestone `PAID_OUT` → worker `Wallet` credited, `PaymentTransaction` recorded.
- Implement the full status transitions on `Contract`, `ContractMilestone`, `PaymentTransaction`.

### P1.2 External Opportunity Engine Sync
- `GET /api/opportunities` querying `ExternalOpportunity` with `trustStatus` filtering (`VERIFIED`, `NEEDS_REVIEW`, `POTENTIAL_RISK`).
- Hydrate `/opportunities` with real seeded rows; add moderation for `NEEDS_REVIEW`.
- Later: crawler/authenticity scanner + clear fraud signals (per README vision).

### P1.3 Dynamic Reputation Scoring Engine
- Transparent recalculation on milestone completion, on-time delivery, and review ratings.
- Record each change to `ReputationLog`; reflect updates on `/passport`.

### P1.4 Email Verification & Password Reset
- Transactional email (Resend / Postmark / SendGrid) to verify email (`isEmailVerified: true`) and send secure password-reset tokens.
- Enforce verified email before work marketplace access (GDPR/trust baseline).
- Add a forgot-password flow + settings page (trigger the existing `PUT /api/profile`).

### P1.5 Client Dashboard (`/client/*`)
- Dedicated view for clients: manage posted tasks, review incoming `TaskApplication`s, inspect applicant Skill Passports, approve deliverables.
- Wire to the RBAC middleware already protecting `/client/*`.

### P1.6 Admin & Moderation Console (`/admin/*`)
- Manage skills/challenges, moderate opportunities and disputes, view `AuditLog`, seed content. (Middleware guard already exists.)

### P1.7 Test Coverage Expansion
- Tests for `PUT /api/profile`, `POST /api/onboarding` step persistence, `POST /api/onboarding/complete`, roadmap milestone transitions, and auth route error paths (mock Prisma where possible).

---

## P2 — Future Improvement

### P2.1 Live Payment Gateway Integrations
- Stripe Connect for US/EU/UK payouts; Flutterwave / Paystack for African cross-border clearing; Wise multi-currency.
- Non-custodial milestone escrow adapter pattern; double-entry internal ledgering; KYC + tax documentation.

### P2.2 Automated Code Execution Sandbox
- Isolated Docker/Wasm runner to evaluate programming submissions against automated unit tests (instead of rubric heuristics).

### P2.3 Multi-Factor Authentication (2FA / TOTP)
- Authenticator-app TOTP using the existing `twoFactorSecret` / `twoFactorEnabled` fields.

### P2.4 Dispute Resolution Center
- Administrative mediation of disputed contracts via `ContractDispute`; tie into `P1.6`.

### P2.5 Opportunity Authenticity Scanner
- Automated domain-registry checks, fee-request detection, and term screening for external listings (per README "Opportunity Authenticity Scanner").

### P2.6 Audit & Observability
- Actually write to `AuditLog` for security-sensitive actions (login, register, file upload, payouts); structured logging and error tracking; Redis-backed rate limiting.

### P2.7 Object Storage for Deliverables
- S3/R2 uploads for deliverables/attachments (`deliverableAttachmentUrl`, `starterCodeOrDatasetUrl`) instead of text-only submissions.

---

## Recommended Execution Sequence

```
P0.0 (env + prisma + secrets) ──► P0.1 (challenge API + verification)
      │
      ├──► P0.2 (hydrate /learn) ──► P0.3 (marketplace APIs + /work) ──► P0.5 (wallet API + /finance)
      ├──► P0.4 (public passport)
      ├──► P0.6 (rate limiting + secret hardening)
      └──► P0.7 (fix CTAs / dead buttons)
                                          │
                                          ▼
                             MVP DONE (Definition of Done above)
                                          │
                                          ▼
                       P1.1 contracts/escrow ─► P1.5 client dashboard ─► P1.6 admin
                       P1.4 email verification ─► P1.2 opportunities ─► P1.3 reputation
                                          │
                                          ▼
                       P2 payment gateways, sandboxed execution, 2FA, disputes, audit
```

Start with **P0.0** (unblock the environment) — without a real `DATABASE_URL`, `.env`, and a generated Prisma client, nothing else can be verified at runtime. Then proceed in order through the P0 items; each is independently shippable and testable.

## Guardrails (per the task directive)

- Do **not** rebuild or replace the existing architecture.
- Preserve the deterministic (LLM-free) recommendation/skill-gap/roadmap engines.
- Keep the existing Prisma schema as the single source of truth — extend with migrations, never redefine.
- Reuse existing UI primitives (`components/ui/*`) rather than new component libraries.
- Verify each P0 change with the existing Vitest suite + `tsc --noEmit`.