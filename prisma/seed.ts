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

  // 3. Core Skills
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

  // 4. Career Paths
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

  // 5. Practical Challenge
  const authModule = await prisma.learningModule.upsert({
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
