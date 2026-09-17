import { PrismaClient, GlobalRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding UPORA production database...");

  // 1. Password Hashing
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);

  // 2. Demo Users & Profiles
  const workerUser = await prisma.user.upsert({
    where: { email: "worker@upora.org" },
    update: {},
    create: {
      email: "worker@upora.org",
      passwordHash: defaultPasswordHash,
      role: GlobalRole.WORKER,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: "Marvellous Esohwode",
          headline: "Cloud Systems & Security Associate",
          bio: "Practical technologist focused on Linux administration, network telemetry triage, and resilient system operations.",
          countryCode: "NG",
          timezone: "Africa/Lagos",
          preferredCurrency: "USD",
          languageCode: "en",
          availabilityHoursPerWeek: 30,
          targetAnnualIncome: 24000.0,
          reputationScore: 98.4,
          verifiedSkillsCount: 5,
          completedProjectsCount: 4,
          onboardingCompleted: true,
        },
      },
      wallet: {
        create: {
          currency: "USD",
          availableBalance: 126.0,
          pendingEscrowBalance: 85.0,
          lifetimeEarnings: 311.0,
        },
      },
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@upora.org" },
    update: {},
    create: {
      email: "client@upora.org",
      passwordHash: defaultPasswordHash,
      role: GlobalRole.CLIENT,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: "Elena Rostova",
          headline: "VP of Engineering at CloudOps Global",
          bio: "Hiring verified infrastructure engineers and data operations talent for enterprise cloud projects.",
          countryCode: "US",
          timezone: "America/New_York",
          preferredCurrency: "USD",
          languageCode: "en",
          onboardingCompleted: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@upora.org" },
    update: {},
    create: {
      email: "admin@upora.org",
      passwordHash: adminPasswordHash,
      role: GlobalRole.ADMIN,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: "System Administrator",
          headline: "UPORA Trust & Safety Operations",
          countryCode: "US",
          timezone: "UTC",
          preferredCurrency: "USD",
          languageCode: "en",
          onboardingCompleted: true,
        },
      },
    },
  });

  // 3. Core Skills Catalog
  const linuxSkill = await prisma.skill.upsert({
    where: { slug: "linux-systems-admin" },
    update: {},
    create: {
      slug: "linux-systems-admin",
      name: "Linux Systems Administration",
      category: "Systems & Security",
      description: "Managing production Linux servers, systemd services, permissions, and bash automation.",
      difficultyLevel: "INTERMEDIATE",
      isHighDemand: true,
    },
  });

  const incidentSkill = await prisma.skill.upsert({
    where: { slug: "incident-triage-soc" },
    update: {},
    create: {
      slug: "incident-triage-soc",
      name: "Incident Triage & SOC Reporting",
      category: "Systems & Security",
      description: "Detecting brute force attacks, analyzing server logs, and writing executive SOC reports.",
      difficultyLevel: "INTERMEDIATE",
      isHighDemand: true,
    },
  });

  const sqlSkill = await prisma.skill.upsert({
    where: { slug: "sql-data-modeling" },
    update: {},
    create: {
      slug: "sql-data-modeling",
      name: "SQL Data Modeling & Querying",
      category: "Data Operations",
      description: "Relational database schema design, complex joins, indexing, and transactional integrity.",
      difficultyLevel: "BEGINNER",
      isHighDemand: true,
    },
  });

  const tsSkill = await prisma.skill.upsert({
    where: { slug: "typescript-fullstack" },
    update: {},
    create: {
      slug: "typescript-fullstack",
      name: "TypeScript & API Engineering",
      category: "Software Engineering",
      description: "Building type-safe backends, RESTful endpoints, and asynchronous business logic with Node.js and TypeScript.",
      difficultyLevel: "INTERMEDIATE",
      isHighDemand: true,
    },
  });

  const reactSkill = await prisma.skill.upsert({
    where: { slug: "react-frontend-ui" },
    update: {},
    create: {
      slug: "react-frontend-ui",
      name: "Modern React & UI Architecture",
      category: "Software Engineering",
      description: "Building responsive, accessible web applications with Next.js, React, Tailwind CSS, and state management.",
      difficultyLevel: "INTERMEDIATE",
      isHighDemand: true,
    },
  });

  const dockerSkill = await prisma.skill.upsert({
    where: { slug: "docker-containerization" },
    update: {},
    create: {
      slug: "docker-containerization",
      name: "Docker & Container Workflows",
      category: "Cloud & DevOps",
      description: "Creating reproducible multi-stage Dockerfiles, compose environments, and container health monitoring.",
      difficultyLevel: "INTERMEDIATE",
      isHighDemand: true,
    },
  });

  const pythonDataSkill = await prisma.skill.upsert({
    where: { slug: "python-data-analytics" },
    update: {},
    create: {
      slug: "python-data-analytics",
      name: "Python Data Analysis & Pandas",
      category: "Data Operations",
      description: "Extracting, transforming, and visualizing business datasets using Python, Pandas, and data storytelling.",
      difficultyLevel: "BEGINNER",
      isHighDemand: true,
    },
  });

  const growthSkill = await prisma.skill.upsert({
    where: { slug: "digital-growth-analytics" },
    update: {},
    create: {
      slug: "digital-growth-analytics",
      name: "Conversion Analytics & SEO Growth",
      category: "Growth & Marketing",
      description: "Funnel instrumentation, search optimization, retention modeling, and data-backed landing page iteration.",
      difficultyLevel: "BEGINNER",
      isHighDemand: true,
    },
  });

  // 4. Five Foundational Career Paths
  await prisma.careerPath.upsert({
    where: { slug: "cloud-security" },
    update: {},
    create: {
      slug: "cloud-security",
      title: "Cloud Infrastructure & Systems Security Associate",
      description: "Specialize in cloud server reliability, automated monitoring, perimeter defense, and rapid incident response.",
      averageGlobalSalaryUSD: 65000.0,
      entryDifficulty: "MODERATE",
      riskFactors: [
        "Increasing AI automation of basic server provisioning means engineers must focus on complex security compliance and incident resolution.",
      ],
      requiredSkills: {
        create: [
          { skillId: linuxSkill.id, importance: 9, isMandatory: true },
          { skillId: incidentSkill.id, importance: 8, isMandatory: true },
        ],
      },
    },
  });

  await prisma.careerPath.upsert({
    where: { slug: "software-engineering" },
    update: {},
    create: {
      slug: "software-engineering",
      title: "Full-Stack Software Engineer",
      description: "Build robust end-to-end web applications, resilient backend services, and scalable cloud database architectures.",
      averageGlobalSalaryUSD: 72000.0,
      entryDifficulty: "MODERATE",
      riskFactors: [
        "Generic syntax generation is increasingly automated; engineers must excel in system architecture, type safety, and product logic.",
      ],
      requiredSkills: {
        create: [
          { skillId: tsSkill.id, importance: 9, isMandatory: true },
          { skillId: reactSkill.id, importance: 8, isMandatory: true },
          { skillId: sqlSkill.id, importance: 7, isMandatory: true },
        ],
      },
    },
  });

  await prisma.careerPath.upsert({
    where: { slug: "cloud-devops" },
    update: {},
    create: {
      slug: "cloud-devops",
      title: "Cloud DevOps & Platform Engineer",
      description: "Design automated continuous delivery pipelines, container orchestrations, and robust infrastructure as code.",
      averageGlobalSalaryUSD: 78000.0,
      entryDifficulty: "STEEP",
      riskFactors: [
        "Cloud vendor pricing complexity requires platform engineers to possess deep FinOps cost optimization and monitoring expertise.",
      ],
      requiredSkills: {
        create: [
          { skillId: linuxSkill.id, importance: 9, isMandatory: true },
          { skillId: dockerSkill.id, importance: 8, isMandatory: true },
        ],
      },
    },
  });

  await prisma.careerPath.upsert({
    where: { slug: "data-analytics" },
    update: {},
    create: {
      slug: "data-analytics",
      title: "Data Analyst & Business Intelligence Specialist",
      description: "Turn raw transactional datasets into clear executive dashboards, actionable funnel metrics, and predictive insights.",
      averageGlobalSalaryUSD: 58000.0,
      entryDifficulty: "EASY",
      riskFactors: [
        "Basic queries can be generated with natural language; competitive analysts must master domain translation and data verification.",
      ],
      requiredSkills: {
        create: [
          { skillId: sqlSkill.id, importance: 9, isMandatory: true },
          { skillId: pythonDataSkill.id, importance: 8, isMandatory: true },
        ],
      },
    },
  });

  await prisma.careerPath.upsert({
    where: { slug: "digital-growth" },
    update: {},
    create: {
      slug: "digital-growth",
      title: "Technical Growth & Performance Marketer",
      description: "Drive verifiable user acquisition, search rankings, retention experiments, and automated marketing workflows.",
      averageGlobalSalaryUSD: 52000.0,
      entryDifficulty: "EASY",
      riskFactors: [
        "Ad platform automation requires growth operators to emphasize first-party data capture, high-converting copy, and real attribution.",
      ],
      requiredSkills: {
        create: [
          { skillId: growthSkill.id, importance: 9, isMandatory: true },
          { skillId: sqlSkill.id, importance: 6, isMandatory: false },
        ],
      },
    },
  });

  // 5. Practical Learning Modules & Real Challenges
  await prisma.learningModule.upsert({
    where: { slug: "auth-log-triage" },
    update: {},
    create: {
      slug: "auth-log-triage",
      skillId: incidentSkill.id,
      title: "Production Authentication Log Triage",
      summary: "Analyze raw telemetry from an active brute-force incident and write a mitigation report.",
      contentMarkdown: "# Practical Log Analysis Guide\n\nLearn how to isolate botnet subnets using CIDR notation and iptables.",
      estimatedMinutes: 45,
      challenges: {
        create: [
          {
            title: "Production Authentication Log Triage & Incident Report",
            problemBrief: "Inspect sanitized access logs and isolate offending subnets.",
            expectedDeliverableFormat: "MARKDOWN_REPORT",
            rubricCriteria: {
              criteria: [
                { title: "Attack Vector Identification", weight: 25 },
                { title: "Subnet & Offender Isolation", weight: 25 },
                { title: "Mitigation & Firewall Rule Accuracy", weight: 25 },
                { title: "Executive Clarity & Professionalism", weight: 25 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  await prisma.learningModule.upsert({
    where: { slug: "ts-api-resilience" },
    update: {},
    create: {
      slug: "ts-api-resilience",
      skillId: tsSkill.id,
      title: "Resilient REST API with TypeScript & Zod",
      summary: "Implement strict validation and structured error handling for a high-volume checkout endpoint.",
      contentMarkdown: "# Safe API Engineering\n\nLearn defensive payload validation and HTTP status conventions.",
      estimatedMinutes: 60,
      challenges: {
        create: [
          {
            title: "Build & Test Validated Idempotent API Endpoint",
            problemBrief: "Implement an idempotent charge handler with Zod schema validation and unit tests.",
            expectedDeliverableFormat: "TYPESCRIPT_FILE",
            rubricCriteria: {
              criteria: [
                { title: "Input Validation & Sanitation", weight: 30 },
                { title: "Idempotency Handling", weight: 30 },
                { title: "Error Response Formatting", weight: 20 },
                { title: "Test Coverage", weight: 20 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  await prisma.learningModule.upsert({
    where: { slug: "sql-ecommerce-analytics" },
    update: {},
    create: {
      slug: "sql-ecommerce-analytics",
      skillId: sqlSkill.id,
      title: "E-Commerce Revenue & Churn SQL Analysis",
      summary: "Write multi-table SQL queries with CTEs and window functions to diagnose customer churn.",
      contentMarkdown: "# Advanced SQL Analysis\n\nMaster window functions (LAG, LEAD, RANK) and cohort grouping.",
      estimatedMinutes: 50,
      challenges: {
        create: [
          {
            title: "30-Day Cohort Retention & Churn SQL Query",
            problemBrief: "Calculate monthly retention cohorts and average customer lifetime value from transactional logs.",
            expectedDeliverableFormat: "SQL_SCRIPT",
            rubricCriteria: {
              criteria: [
                { title: "Query Correctness & Logic", weight: 40 },
                { title: "Window Function Usage", weight: 30 },
                { title: "Query Execution Optimization", weight: 30 },
              ],
            },
            passingScore: 85,
          },
        ],
      },
    },
  });

  // 6. Additional core learning modules (one per foundational skill)
  await prisma.learningModule.upsert({
    where: { slug: "linux-server-hardening" },
    update: {},
    create: {
      slug: "linux-server-hardening",
      skillId: linuxSkill.id,
      title: "Linux Server Hardening & Automation",
      summary: "Harden a production VPS with secure SSH, firewall policies, fail2ban and a scheduled audit script.",
      contentMarkdown: "# Linux Hardening Guide\n\nSecure SSH (key-only), UFW rulesets, fail2ban jails, and cron-driven health audits.",
      estimatedMinutes: 45,
      challenges: {
        create: [
          {
            title: "Production VPS Hardening Audit & Automation Script",
            problemBrief: "Produce a hardening checklist and a Bash script that audits SSH policy, firewall state, and running services.",
            expectedDeliverableFormat: "MARKDOWN_AND_BASH",
            rubricCriteria: {
              criteria: [
                { title: "SSH Security Hardening", weight: 30 },
                { title: "Firewall & Fail2ban Configuration", weight: 30 },
                { title: "Automation Script Correctness", weight: 25 },
                { title: "Documentation & Clarity", weight: 15 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  await prisma.learningModule.upsert({
    where: { slug: "docker-compose-deploy" },
    update: {},
    create: {
      slug: "docker-compose-deploy",
      skillId: dockerSkill.id,
      title: "Docker & Compose Production Workflows",
      summary: "Author multi-stage Dockerfiles and compose environments with health checks and logs persistence.",
      contentMarkdown: "# Docker Workflows\n\nMulti-stage builds, non-root users, health checks, volumes, and environment isolation.",
      estimatedMinutes: 50,
      challenges: {
        create: [
          {
            title: "Production Docker Compose Stack for a Web Service",
            problemBrief: "Create a multi-container stack (web, api, db) with health checks, secrets, and persistent volumes.",
            expectedDeliverableFormat: "DOCKER_COMPOSE",
            rubricCriteria: {
              criteria: [
                { title: "Multi-Stage Dockerfile Quality", weight: 30 },
                { title: "Compose Orchestration & Health Checks", weight: 30 },
                { title: "Secrets & Volumes Handling", weight: 25 },
                { title: "Reproducibility & Docs", weight: 15 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  await prisma.learningModule.upsert({
    where: { slug: "python-sales-cohort-analysis" },
    update: {},
    create: {
      slug: "python-sales-cohort-analysis",
      skillId: pythonDataSkill.id,
      title: "Python Data Analysis with Pandas",
      summary: "Load, clean and visualize a transactional dataset to answer a business retention question.",
      contentMarkdown: "# Pandas Analysis\n\nDataFrames, groupby cohorts, date arithmetic, and clear chart summaries.",
      estimatedMinutes: 50,
      challenges: {
        create: [
          {
            title: "Monthly Retention Cohort Analysis",
            problemBrief: "Load a CSV, compute monthly revenue cohorts, and produce a summary with supporting charts described in markdown.",
            expectedDeliverableFormat: "PYTHON_NOTEBOOK",
            rubricCriteria: {
              criteria: [
                { title: "Data Cleaning & Transformation", weight: 30 },
                { title: "Cohort Calculation Correctness", weight: 30 },
                { title: "Insight & Visualization Quality", weight: 25 },
                { title: "Code Readability & Comments", weight: 15 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  await prisma.learningModule.upsert({
    where: { slug: "landing-conversion-audit" },
    update: {},
    create: {
      slug: "landing-conversion-audit",
      skillId: growthSkill.id,
      title: "Landing Page Conversion & SEO Audit",
      summary: "Structure a funnel audit with measurable experiments, copy priorities, and SEO basics.",
      contentMarkdown: "# Conversion Audit\n\nFunnel stages, event instrumentation, headline testing and retention loops.",
      estimatedMinutes: 40,
      challenges: {
        create: [
          {
            title: "SaaS Landing Page Conversion Audit",
            problemBrief: "Analyze a sample landing page funnel and produce prioritized, measurable experiment recommendations.",
            expectedDeliverableFormat: "MARKDOWN_REPORT",
            rubricCriteria: {
              criteria: [
                { title: "Funnel & Event Instrumentation", weight: 30 },
                { title: "Copy & Value Proposition Analysis", weight: 30 },
                { title: "SEO & Metadata Basics", weight: 20 },
                { title: "Prioritized Experiment Plan", weight: 20 },
              ],
            },
            passingScore: 80,
          },
        ],
      },
    },
  });

  // 6. Marketplace Tasks

  // 6. Marketplace Tasks
  async function seedTask(data: {
    title: string;
    description: string;
    tier: "FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED";
    budgetAmount: number;
    requiredSkills: string[];
  }) {
    const exists = await prisma.marketplaceTask.findFirst({ where: { title: data.title } });
    if (!exists) {
      await prisma.marketplaceTask.create({
        data: {
          clientId: clientUser.id,
          title: data.title,
          description: data.description,
          tier: data.tier,
          budgetAmount: data.budgetAmount,
          currency: "USD",
          requiredSkills: data.requiredSkills,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  await seedTask({
    title: "Nginx Access Log Parser & Daily Summary Script",
    description:
      "Write a lightweight Bash or Python script that reads gzipped daily Nginx logs and outputs a formatted Markdown summary of status codes, top IPs, and slow endpoints.",
    tier: "INTERMEDIATE",
    budgetAmount: 140.0,
    requiredSkills: ["Linux Systems Administration", "Incident Triage & SOC Reporting"],
  });

  await seedTask({
    title: "SQL Churn Cohort Diagnostic Query Pack",
    description:
      "Produce a set of SQL queries that compute monthly retention cohorts and surface the highest-risk customer segments from a provided transaction schema.",
    tier: "FOUNDATIONAL",
    budgetAmount: 85.0,
    requiredSkills: ["SQL Data Modeling & Querying"],
  });

  await seedTask({
    title: "Accessible React Component Audit & Fix",
    description:
      "Audit a small React component library for accessibility gaps and deliver corrected components with keyboard navigation, labels, and focus states.",
    tier: "ADVANCED",
    budgetAmount: 320.0,
    requiredSkills: ["Modern React & UI Architecture"],
  });

  // 7. Verified Opportunities
  await prisma.externalOpportunity.createMany({
    data: [
      {
        title: "Global Cloud Reliability Apprentice",
        organizationName: "Stripe Infrastructure",
        organizationDomain: "stripe.com",
        type: "APPRENTICESHIP",
        location: "Worldwide",
        isRemoteEligible: true,
        salaryOrStipendUSD: "$3,800 - $4,500 / month",
        applicationUrl: "https://stripe.com/jobs",
        trustStatus: "VERIFIED",
        trustScore: 99,
        trustRationale: "Confirmed official organization domain. Direct corporate career portal link.",
        rawSource: "Stripe Corporate Careers",
      },
      {
        title: "Open Source Systems Security Research Fellowship",
        organizationName: "Mozilla Foundation",
        organizationDomain: "mozilla.org",
        type: "FELLOWSHIP",
        location: "Worldwide",
        isRemoteEligible: true,
        salaryOrStipendUSD: "$5,000 Project Grant",
        applicationUrl: "https://foundation.mozilla.org/fellowships",
        trustStatus: "VERIFIED",
        trustScore: 98,
        trustRationale: "Established 501(c)(3) foundation grant program.",
        rawSource: "Mozilla Foundation Grants",
      },
    ],
  });

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Database seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
