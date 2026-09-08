# UPORA — Global Opportunity Platform

> **Tagline**: LEARN. WORK. EARN. GROW.  
> **Mission**: Make opportunity accessible to anyone, anywhere.  
> **Vision**: A world where your starting point does not determine your future.  
> **Core Value Chain**: Discover → Learn → Practice → Work → Earn → Prove → Grow

---

## About UPORA

UPORA is a serious global technology product designed to help millions of people bridge the gap between human potential, verified practical ability, and economic mobility.

Rather than acting as a passive video archive or an unvetted freelance board, UPORA connects:
1. **AI Career Navigator & Skill Gap Engine**: Identifies realistic trajectories and prioritizes missing competencies based on labor market signals without deceptive guarantees.
2. **Practical Evidence Engine**: Replaces passive badges with rigorous, rubric-evaluated technical challenges.
3. **Skill Passport**: Provides a cryptographically auditable record of verified competencies, rubric scorecards, and client validations.
4. **Work Quality Marketplace**: Tier-gated client tasks backed by non-custodial milestone escrow.
5. **Opportunity Authenticity Scanner**: Scans external opportunities for domain authenticity and flags fraudulent listings (`VERIFIED`, `NEEDS_REVIEW`, `POTENTIAL_RISK`).
6. **Financial Progress Telemetry**: Tracks verified earnings, savings goals, and income growth without holding unsegregated custodial funds.

---

## Architectural Principles

- **Human-Centered, Calm UI**: Strictly WCAG 2.2 AA/AAA compliant. Zero generic AI gradients, neon glows, or floating chatbots.
- **Silent AI Infrastructure**: AI functions as an asynchronous background evaluator adhering strictly to typed schemas.
- **Non-Custodial Escrow**: Multi-gateway adapter pattern (Stripe Connect, Paystack, Wise) with double-entry internal ledgering.
- **Global & Low-Bandwidth Ready**: Sub-130KB initial bundle, mobile-first responsiveness, IANA timezone isolation, and multi-currency formatting.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS + Custom High-Contrast Tokens
- **Icons**: Lucide React
- **ORM & Database**: Prisma ORM with PostgreSQL
- **State & Telemetry**: Reactive Context Store with client-side hydration & persistence

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher (Node 24 recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd UPORA

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production
```bash
npm run build
npm run start
```

---

## License & Ownership

The founder owns all brand assets, source code, data architectures, and product rights. Designed with open standards for 100% portability.
