export interface UserProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  passportId: string;
  country: string;
  timezone: string;
  preferredCurrency: string;
  reputationScore: number;
  completedTasksCount: number;
  verifiedSkillsCount: number;
  targetRole: string;
  targetIncomeUSD: number;
}

export interface NextAction {
  id: string;
  order: number;
  title: string;
  category: "LEARN" | "WORK" | "ASSESS" | "FINANCE" | "PRACTICE";
  description: string;
  actionLabel: string;
  actionHref: string;
  estimatedMinutes: number;
  rewardOrImpact: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tier: "SELF_REPORTED" | "ASSESSED" | "PROJECT_VERIFIED" | "CLIENT_VALIDATED";
  score?: number;
  verifiedAt?: string;
  evidenceHash?: string;
  evidenceTitle?: string;
}

export interface CareerPathOption {
  id: string;
  title: string;
  slug: string;
  description: string;
  matchScore: number;
  entryDifficulty: "Accessible" | "Moderate" | "Steep";
  avgGlobalSalaryUSD: string;
  whyItFits: string;
  skillsRequired: string[];
  skillsAcquired: string[];
  missingSkills: string[];
  marketRisks: string;
  exampleProjects: string[];
}

export interface PracticalChallenge {
  id: string;
  moduleSlug: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  unlocksWorkTier: string;
  summary: string;
  problemBrief: string;
  starterResources: { name: string; type: string; content?: string }[];
  deliverableInstructions: string;
  rubricCriteria: {
    id: string;
    title: string;
    weight: number;
    description: string;
  }[];
  passingScore: number;
}

export interface MarketplaceTask {
  id: string;
  title: string;
  clientName: string;
  clientRating: number;
  clientCompletedJobs: number;
  tier: "FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED";
  tierLabel: string;
  budgetUSD: number;
  escrowStatus: "FUNDED" | "PENDING";
  deadline: string;
  description: string;
  deliverables: string[];
  requiredSkills: string[];
  applicantCount: number;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  domain: string;
  type: "JOB" | "INTERNSHIP" | "APPRENTICESHIP" | "FELLOWSHIP" | "GRANT" | "FREELANCE";
  location: string;
  remoteStatus: "Fully Remote" | "Hybrid" | "On-Site";
  compensation: string;
  deadline: string;
  trustStatus: "VERIFIED" | "NEEDS_REVIEW" | "POTENTIAL_RISK";
  trustScore: number;
  trustRationale: string;
  source: string;
  applyUrl: string;
}

export interface FinancialState {
  incomeThisMonth: number;
  savedThisMonth: number;
  currentGoalTitle: string;
  currentGoalTargetUSD: number;
  currentGoalSavedUSD: number;
  lifetimeEarningsUSD: number;
  pendingEscrowUSD: number;
  availableBalanceUSD: number;
  recentTransactions: {
    id: string;
    title: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    date: string;
    status: "CLEARED" | "ESCROW_HELD";
  }[];
}

export const initialProfile: UserProfile = {
  id: "usr-8829",
  fullName: "Marvellous Esohwode",
  headline: "Cloud Systems & Security Associate",
  bio: "Practical technologist focused on Linux administration, network telemetry triage, and resilient system operations. Dedicated to evidence-backed engineering.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  passportId: "UPORA-PASS-7721",
  country: "Global / Remote",
  timezone: "UTC+1 (West Africa)",
  preferredCurrency: "USD",
  reputationScore: 98.4,
  completedTasksCount: 4,
  verifiedSkillsCount: 5,
  targetRole: "Cloud & Systems Security Associate",
  targetIncomeUSD: 24000,
};

export const initialNextActions: NextAction[] = [
  {
    id: "act-1",
    order: 1,
    title: "Complete the Authentication Log Triage Challenge",
    category: "PRACTICE" as any,
    description: "Analyze 42 anomalous server logs, isolate brute-force IP ranges, and submit your Incident Report to unlock Tier 2 Cloud Work.",
    actionLabel: "Start Challenge",
    actionHref: "/learn/auth-log-triage",
    estimatedMinutes: 45,
    rewardOrImpact: "Unlocks Tier 2 Work ($100–$250/task)",
  },
  {
    id: "act-2",
    order: 2,
    title: "Apply to Matched Task: Merchant API Log Verification",
    category: "WORK",
    description: "Apex Data Labs has a funded $45 task matching your verified SQL & Data Cleaning badges.",
    actionLabel: "Review & Apply",
    actionHref: "/work",
    estimatedMinutes: 15,
    rewardOrImpact: "Earn $45.00 in Escrow",
  },
  {
    id: "act-3",
    order: 3,
    title: "Review Client Rating & Feedback from CloudOps Global",
    category: "WORK",
    description: "Your milestone for 'Log Ingestion Parser' was approved with a 5.0 rating and feedback.",
    actionLabel: "View Feedback",
    actionHref: "/passport",
    estimatedMinutes: 5,
    rewardOrImpact: "Reputation Boost (+0.4%)",
  },
  {
    id: "act-4",
    order: 4,
    title: "Review Progress Toward $500 Hardware Savings Target",
    category: "FINANCE",
    description: "You're currently at $126 (25.2%). One more completed Tier 2 task will push you past 50%.",
    actionLabel: "View Finances",
    actionHref: "/finance",
    estimatedMinutes: 5,
    rewardOrImpact: "Financial Health",
  },
];

export const initialSkills: SkillItem[] = [
  {
    id: "skl-1",
    name: "Linux Systems Administration",
    category: "Systems & Security",
    difficulty: "INTERMEDIATE",
    tier: "PROJECT_VERIFIED",
    score: 94,
    verifiedAt: "2026-08-20",
    evidenceHash: "0x8f4d92a8e4...b7c1",
    evidenceTitle: "Hardened Ubuntu Server Systemd Automation Project",
  },
  {
    id: "skl-2",
    name: "Incident Triage & SOC Reporting",
    category: "Systems & Security",
    difficulty: "INTERMEDIATE",
    tier: "PROJECT_VERIFIED",
    score: 91,
    verifiedAt: "2026-08-28",
    evidenceHash: "0x3e1a87c94b...2d99",
    evidenceTitle: "Brute-Force Infiltration Analysis Report",
  },
  {
    id: "skl-3",
    name: "SQL Data Modeling & Querying",
    category: "Data Operations",
    difficulty: "BEGINNER",
    tier: "CLIENT_VALIDATED",
    score: 98,
    verifiedAt: "2026-09-02",
    evidenceHash: "0x6a41f92cd3...e412",
    evidenceTitle: "Apex Data Labs: Multi-Store Sales Schema Normalization",
  },
  {
    id: "skl-4",
    name: "Data Cleansing & Discrepancy Auditing",
    category: "Data Operations",
    difficulty: "BEGINNER",
    tier: "PROJECT_VERIFIED",
    score: 88,
    verifiedAt: "2026-08-15",
    evidenceHash: "0x1b742e99f0...45aa",
    evidenceTitle: "5,000 Record Messy FX Dataset Cleansing Script",
  },
  {
    id: "skl-5",
    name: "Network Packet Analysis (Wireshark/tcpdump)",
    category: "Systems & Security",
    difficulty: "INTERMEDIATE",
    tier: "ASSESSED",
    score: 82,
    verifiedAt: "2026-09-04",
    evidenceHash: "0x91dae32155...611b",
    evidenceTitle: "TCP Handshake Anomaly Assessment",
  },
];

export const initialCareerPaths: CareerPathOption[] = [
  {
    id: "cp-1",
    title: "Cloud Infrastructure & Systems Security Associate",
    slug: "cloud-security",
    description: "Specialize in cloud server reliability, automated monitoring, perimeter defense, and rapid incident response for distributed infrastructure.",
    matchScore: 92,
    entryDifficulty: "Moderate",
    avgGlobalSalaryUSD: "$45,000 - $80,000 / yr",
    whyItFits: "Your analytical aptitude and proven Linux/incident reporting skills provide an immediate baseline for junior Site Reliability and SOC Level 1 roles.",
    skillsRequired: ["Linux Systems Administration", "Incident Triage & SOC Reporting", "Terraform & IaC", "Bash/Python Automation", "Containerization (Docker)"],
    skillsAcquired: ["Linux Systems Administration", "Incident Triage & SOC Reporting"],
    missingSkills: ["Terraform & IaC", "Containerization (Docker)", "Bash/Python Automation"],
    marketRisks: "Increasing AI automation of basic server provisioning means engineers must focus on complex security compliance and incident resolution.",
    exampleProjects: [
      "Zero-Downtime Multi-Region Nginx Reverse Proxy",
      "Automated Incident Response Webhook Pipeline",
      "Terraform VPC Infrastructure with Bastion Host"
    ],
  },
  {
    id: "cp-2",
    title: "Data Operations & Analytics Associate",
    slug: "data-operations",
    description: "Prepare, validate, and structure business-critical datasets. Bridge raw database stores with executive analytics dashboards and automated machine learning feeds.",
    matchScore: 84,
    entryDifficulty: "Accessible",
    avgGlobalSalaryUSD: "$32,000 - $60,000 / yr",
    whyItFits: "You have already demonstrated client-validated SQL modeling and data cleaning. This path provides the fastest route to consistent freelance marketplace income.",
    skillsRequired: ["SQL Data Modeling & Querying", "Data Cleansing & Discrepancy Auditing", "Python (Pandas/Polars)", "BI Dashboard Architecture (Tableau/Metabase)"],
    skillsAcquired: ["SQL Data Modeling & Querying", "Data Cleansing & Discrepancy Auditing"],
    missingSkills: ["Python (Pandas/Polars)", "BI Dashboard Architecture (Tableau/Metabase)"],
    marketRisks: "Basic manual data entry is obsolete. Focus on automated ETL pipelines and rigorous audit trails.",
    exampleProjects: [
      "Automated Financial Reconciliation Pipeline",
      "E-Commerce Customer Lifetime Value SQL Modeling",
      "Real-Time Merchant Transaction Health Dashboard"
    ],
  },
  {
    id: "cp-3",
    title: "Full-Stack Software Engineer (TypeScript/Cloud)",
    slug: "fullstack-software",
    description: "Construct scalable web applications, robust REST/GraphQL APIs, and resilient data layers using modern TypeScript, Next.js, and PostgreSQL.",
    matchScore: 78,
    entryDifficulty: "Steep",
    avgGlobalSalaryUSD: "$48,000 - $95,000 / yr",
    whyItFits: "High global demand for engineers who understand both frontend accessibility and backend relational database performance.",
    skillsRequired: ["TypeScript Architecture", "React & Next.js App Router", "PostgreSQL Relational Design", "RESTful API Security", "CI/CD & Automated Testing"],
    skillsAcquired: ["PostgreSQL Relational Design"],
    missingSkills: ["TypeScript Architecture", "React & Next.js App Router", "RESTful API Security", "CI/CD & Automated Testing"],
    marketRisks: "Syntax generation is handled by AI; employers prioritize architectural judgment, testing rigor, and cross-cultural communication.",
    exampleProjects: [
      "Distributed Real-Time Collaborative Workspace",
      "High-Throughput Webhook Ingestion Engine",
      "Accessible Design System Component Library"
    ],
  },
];

export const initialPracticalChallenges: PracticalChallenge[] = [
  {
    id: "chal-1",
    moduleSlug: "auth-log-triage",
    title: "Production Authentication Log Triage & Incident Report",
    category: "Cloud & Systems Security",
    difficulty: "Intermediate",
    estimatedHours: 2,
    unlocksWorkTier: "Tier 2 Work ($100–$250/task)",
    summary: "Analyze raw authentication log telemetry from a production gateway experiencing a targeted brute-force incident. Produce an industry-standard SOC incident report.",
    problemBrief: `SCENARIO:
On September 4 at 03:14 UTC, the UPORA production auth gateway triggered an alert: 340 authentication attempts failed within 180 seconds.
The majority of requests originated from a coordinated botnet subnet targeting administrative and service accounts.

YOUR MISSION:
1. Examine the provided sanitized log entries below.
2. Identify the attack methodology (e.g. Distributed Credential Stuffing vs. Dictionary Brute Force).
3. Determine the primary offending IP ranges (CIDR notation).
4. Specify the exact firewall/iptables or Cloudflare WAF rule to neutralize the attack.
5. Author a concise, executive-level Incident Summary containing: Impact, Root Cause, Mitigation Action, and Long-Term Hardening Recommendations.`,
    starterResources: [
      {
        name: "sanitized_auth_access.log",
        type: "LOG_FILE",
        content: `2026-09-04T03:14:02Z [AUTH_FAIL] user="admin" ip="198.51.100.42" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=22ms
2026-09-04T03:14:03Z [AUTH_FAIL] user="root" ip="198.51.100.43" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=19ms
2026-09-04T03:14:03Z [AUTH_FAIL] user="billing_svc" ip="198.51.100.44" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=21ms
2026-09-04T03:14:04Z [AUTH_FAIL] user="marvellous" ip="198.51.100.45" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=20ms
2026-09-04T03:14:05Z [AUTH_FAIL] user="deploy_bot" ip="203.0.113.12" proto="HTTP/1.1" user_agent="python-requests/2.31.0" latency=35ms
2026-09-04T03:14:06Z [AUTH_SUCCESS] user="worker_proc" ip="10.0.4.18" proto="GRPC" latency=3ms
2026-09-04T03:14:07Z [AUTH_FAIL] user="superadmin" ip="198.51.100.46" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=18ms
2026-09-04T03:14:08Z [AUTH_FAIL] user="finance" ip="198.51.100.47" proto="HTTP/2" user_agent="Go-http-client/1.1" latency=20ms`,
      },
    ],
    deliverableInstructions: "Submit a structured Markdown Incident Report answering: (1) Attack Vector Type, (2) Offending Subnets, (3) Firewall Rule (iptables or WAF expression), (4) Prevention strategy.",
    rubricCriteria: [
      {
        id: "rc-1",
        title: "Attack Vector & Pattern Identification",
        weight: 25,
        description: "Accurately diagnoses the automated dictionary/brute-force nature and user-agent signatures.",
      },
      {
        id: "rc-2",
        title: "Subnet & Offender Isolation",
        weight: 25,
        description: "Correctly identifies 198.51.100.0/24 as the synchronized attacking cluster.",
      },
      {
        id: "rc-3",
        title: "Mitigation & Firewall Rule Accuracy",
        weight: 25,
        description: "Provides valid, syntactically correct iptables or WAF rule blocking the CIDR block with rate-limiting.",
      },
      {
        id: "rc-4",
        title: "Executive Clarity & Professionalism",
        weight: 25,
        description: "Structured according to industry SOC guidelines; clear impact and prevention recommendations.",
      },
    ],
    passingScore: 80,
  },
  {
    id: "chal-2",
    moduleSlug: "data-reconciliation",
    title: "Multi-Currency Revenue Reconciliation & Anomaly Flagging",
    category: "Data Operations",
    difficulty: "Beginner",
    estimatedHours: 1.5,
    unlocksWorkTier: "Tier 1 Work ($30–$80/task)",
    summary: "Normalize messy global transaction logs across USD, EUR, and GBP, reconcile missing FX references, and isolate duplicate records.",
    problemBrief: `SCENARIO:
A global digital goods vendor processed 400 sales across 3 regions. Due to a network partition during a database failover, some records lack ISO currency symbols, while others feature corrupted exchange rate multipliers.

YOUR MISSION:
1. Normalize all transaction values to base USD using given daily benchmark rates.
2. Identify and flag duplicate order IDs.
3. Compute total verified revenue and isolate the variance caused by un-reconciled orders.`,
    starterResources: [
      {
        name: "transactions_raw.csv",
        type: "CSV_DATASET",
        content: `order_id,timestamp,raw_amount,currency,reported_usd
ord_1001,2026-09-01T10:12:00Z,120.00,USD,120.00
ord_1002,2026-09-01T10:14:30Z,95.00,EUR,102.60
ord_1003,2026-09-01T10:18:00Z,45.00,GBP,57.15
ord_1002,2026-09-01T10:14:30Z,95.00,EUR,102.60
ord_1004,2026-09-01T10:22:15Z,210.00,UNKNOWN,NULL`,
      },
    ],
    deliverableInstructions: "Submit your reconciliation report detailing clean total USD, duplicate order IDs removed, and handling methodology for the unknown currency record.",
    rubricCriteria: [
      {
        id: "rc-21",
        title: "Duplicate Detection",
        weight: 30,
        description: "Accurately identifies and explains duplicate record ord_1002.",
      },
      {
        id: "rc-22",
        title: "Normalization Mathematics",
        weight: 40,
        description: "Correctly computes clean gross revenue with validated exchange rate multipliers.",
      },
      {
        id: "rc-23",
        title: "Edge Case & Missing Data Handling",
        weight: 30,
        description: "Documents sensible operational treatment for the UNKNOWN currency order.",
      },
    ],
    passingScore: 80,
  },
];

export const initialMarketplaceTasks: MarketplaceTask[] = [
  {
    id: "tsk-101",
    title: "Global Fintech Merchant Directory Data Verification",
    clientName: "Apex Data Labs",
    clientRating: 5.0,
    clientCompletedJobs: 18,
    tier: "FOUNDATIONAL",
    tierLabel: "Tier 1: Foundational",
    budgetUSD: 45.00,
    escrowStatus: "FUNDED",
    deadline: "2026-09-15",
    description: "Verify operational URLs, business registry numbers, and primary contact domains for 150 merchant profiles across Southeast Asia and Latin America. Flag inactive domains and format into a standardized JSON export.",
    deliverables: ["150 Verified Merchant Records in JSON", "Audit Log of Inactive or Suspicious URLs"],
    requiredSkills: ["Data Cleansing & Discrepancy Auditing", "SQL Data Modeling & Querying"],
    applicantCount: 3,
    status: "OPEN",
  },
  {
    id: "tsk-102",
    title: "Nginx Access Log Parser & Daily Summary Script",
    clientName: "CloudOps Global",
    clientRating: 4.9,
    clientCompletedJobs: 42,
    tier: "INTERMEDIATE",
    tierLabel: "Tier 2: Intermediate",
    budgetUSD: 140.00,
    escrowStatus: "FUNDED",
    deadline: "2026-09-18",
    description: "Write a lightweight Bash or Python script that reads gzipped daily Nginx logs, calculates 95th percentile latency per endpoint, extracts 4xx/5xx status code distributions, and outputs a formatted Markdown summary.",
    deliverables: ["Tested Script (Python or Bash)", "README with installation & crontab instructions", "Sample run verification output"],
    requiredSkills: ["Linux Systems Administration", "Incident Triage & SOC Reporting"],
    applicantCount: 2,
    status: "OPEN",
  },
  {
    id: "tsk-103",
    title: "WCAG 2.2 Accessibility Audit for E-Commerce Checkout Flow",
    clientName: "Aura Commerce UK",
    clientRating: 5.0,
    clientCompletedJobs: 9,
    tier: "ADVANCED",
    tierLabel: "Tier 3: Advanced",
    budgetUSD: 280.00,
    escrowStatus: "FUNDED",
    deadline: "2026-09-22",
    description: "Conduct an automated (axe-core) and manual screen-reader (NVDA/VoiceOver) audit of a 3-step checkout flow. Provide code-level remediation snippets for contrast issues, missing aria-labels, and tab order traps.",
    deliverables: ["Comprehensive A11y Audit Report (PDF/Markdown)", "Git Patch with semantic HTML & ARIA fixes"],
    requiredSkills: ["TypeScript Architecture", "React & Next.js App Router"],
    applicantCount: 1,
    status: "OPEN",
  },
];

export const initialOpportunities: OpportunityItem[] = [
  {
    id: "opp-1",
    title: "Global Cloud Reliability Apprentice",
    organization: "Stripe Infrastructure",
    domain: "stripe.com",
    type: "APPRENTICESHIP",
    location: "Worldwide",
    remoteStatus: "Fully Remote",
    compensation: "$3,800 - $4,500 / month",
    deadline: "2026-10-15",
    trustStatus: "VERIFIED",
    trustScore: 99,
    trustRationale: "Confirmed official organization domain. Direct corporate career portal link. No application or screening fees.",
    source: "Stripe Corporate Careers",
    applyUrl: "https://stripe.com/jobs",
  },
  {
    id: "opp-2",
    title: "Open Source Systems Security Research Fellowship",
    organization: "Mozilla Foundation",
    domain: "mozilla.org",
    type: "FELLOWSHIP",
    location: "Worldwide",
    remoteStatus: "Fully Remote",
    compensation: "$5,000 Project Grant",
    deadline: "2026-11-01",
    trustStatus: "VERIFIED",
    trustScore: 98,
    trustRationale: "Established 501(c)(3) foundation grant program. Documented transparent application rubric.",
    source: "Mozilla Foundation Grants",
    applyUrl: "https://foundation.mozilla.org/fellowships",
  },
  {
    id: "opp-3",
    title: "Junior Data Quality Associate",
    organization: "OmniMetrics Research",
    domain: "omnimargins-data.io",
    type: "JOB",
    location: "EMEA / Remote",
    remoteStatus: "Fully Remote",
    compensation: "$1,400 - $2,200 / month",
    deadline: "2026-09-30",
    trustStatus: "NEEDS_REVIEW",
    trustScore: 72,
    trustRationale: "Domain registered 4 months ago. Official company social channels match, but requires standard verification before submitting sensitive personal data.",
    source: "Direct Employer Listing",
    applyUrl: "https://omnimargins-data.io/careers",
  },
  {
    id: "opp-4",
    title: "Urgent: Remote Data Typing & Copy Worker",
    organization: "Global Swift Tasking",
    domain: "swift-earn-easy-tasks.biz",
    type: "FREELANCE",
    location: "Worldwide",
    remoteStatus: "Fully Remote",
    compensation: "$90 / hour guaranteed",
    deadline: "2026-09-12",
    trustStatus: "POTENTIAL_RISK",
    trustScore: 14,
    trustRationale: "SUSPICIOUS: Unrealistic compensation for unverified entry skills. Domain uses high-risk registrar known for phishing. Discovered preliminary fee request in small print.",
    source: "External Aggregator Feed",
    applyUrl: "#",
  },
];

export const initialFinancials: FinancialState = {
  incomeThisMonth: 126.00,
  savedThisMonth: 43.00,
  currentGoalTitle: "Dedicated Dev Laptop Upgrade",
  currentGoalTargetUSD: 500.00,
  currentGoalSavedUSD: 126.00,
  lifetimeEarningsUSD: 311.00,
  pendingEscrowUSD: 85.00,
  availableBalanceUSD: 126.00,
  recentTransactions: [
    {
      id: "tx-401",
      title: "Milestone Release: CloudOps Global Log Ingestion Parser",
      amount: 85.00,
      type: "CREDIT",
      date: "2026-09-03",
      status: "CLEARED",
    },
    {
      id: "tx-402",
      title: "Milestone Release: Apex Data Labs Merchant Normalization",
      amount: 41.00,
      type: "CREDIT",
      date: "2026-08-29",
      status: "CLEARED",
    },
    {
      id: "tx-403",
      title: "Escrow Deposit Held: Apex Data Merchant Directory Task",
      amount: 45.00,
      type: "CREDIT",
      date: "2026-09-05",
      status: "ESCROW_HELD",
    },
  ],
};
