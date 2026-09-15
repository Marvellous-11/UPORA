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

  // 6. Marketplace Tasks
  await prisma.marketplaceTask.create({
    data: {
      clientId: clientUser.id,
      title: "Nginx Access Log Parser & Daily Summary Script",
      description: "Write a lightweight Bash or Python script that reads gzipped daily Nginx logs and outputs a formatted Markdown summary.",
      tier: "INTERMEDIATE",
      budgetAmount: 140.0,
      currency: "USD",
      requiredSkills: ["Linux Systems Administration", "Incident Triage & SOC Reporting"],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
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
