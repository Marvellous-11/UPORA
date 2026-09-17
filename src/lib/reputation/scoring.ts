/**
 * UPORA Reputation Scoring Engine
 * Deterministic and explainable. Reputation is derived ONLY from real platform
 * activity: verified skills, passed challenges, completed contracts, client
 * ratings, on-time delivery, and revision behavior.
 */

export interface ReputationInputs {
  verifiedSkills: number; // skill count with tier >= ASSESSED
  passedChallenges: number; // distinct challenges passed
  completedContracts: number; // contracts completed as talent
  averageClientRating: number | null; // 1-5
  onTimeDeliveries: number;
  totalDeliveries: number;
  revisionRate: number; // 0-1 fraction of milestones that required >1 revision
}

export interface ReputationComponents {
  base: number;
  verifiedSkillsPoints: number;
  challengePoints: number;
  contractPoints: number;
  ratingPoints: number;
  reliabilityPoints: number;
  revisionPenalty: number;
}

export interface ReputationResult {
  score: number; // 1-100
  components: ReputationComponents;
  breakdown: string[];
}

export function computeReputationScore(input: Partial<ReputationInputs>): ReputationResult {
  const values: ReputationInputs = {
    verifiedSkills: Math.max(0, input.verifiedSkills ?? 0),
    passedChallenges: Math.max(0, input.passedChallenges ?? 0),
    completedContracts: Math.max(0, input.completedContracts ?? 0),
    averageClientRating: input.averageClientRating ?? null,
    onTimeDeliveries: Math.max(0, input.onTimeDeliveries ?? 0),
    totalDeliveries: Math.max(0, input.totalDeliveries ?? 0),
    revisionRate: Math.min(1, Math.max(0, input.revisionRate ?? 0)),
  };

  const base = 50;
  const verifiedSkillsPoints = Math.min(20, values.verifiedSkills * 4);
  const challengePoints = Math.min(12, values.passedChallenges * 2);
  const contractPoints = Math.min(15, values.completedContracts * 5);

  let ratingPoints = 0;
  if (values.averageClientRating !== null) {
    ratingPoints = Math.max(0, Math.min(8, (values.averageClientRating - 3.5) * 4));
  }

  const reliabilityRatio =
    values.totalDeliveries > 0 ? values.onTimeDeliveries / values.totalDeliveries : 0;
  const reliabilityPoints = Math.min(10, Math.round(reliabilityRatio * 10));

  const revisionPenalty = values.revisionRate > 0.5
    ? Math.min(10, Math.round((values.revisionRate - 0.5) * 20))
    : 0;

  const raw =
    base +
    verifiedSkillsPoints +
    challengePoints +
    contractPoints +
    ratingPoints +
    reliabilityPoints -
    revisionPenalty;

  const score = Math.max(1, Math.min(100, Math.round(raw)));

  const breakdown = [
    `Base trust score: ${base}/100.`,
    `Verified skills (+${verifiedSkillsPoints}): ${values.verifiedSkills} verified skill(s).`,
    `Practical challenges (+${challengePoints}): ${values.passedChallenges} passed.`,
    `Completed contracts (+${contractPoints}): ${values.completedContracts}.`,
    values.averageClientRating !== null
      ? `Client rating (+${ratingPoints}): ${values.averageClientRating.toFixed(1)}/5 average.`
      : `Client rating (+0): no rated work yet.`,
    `Reliability (+${reliabilityPoints}): ${values.onTimeDeliveries}/${values.totalDeliveries} on-time deliveries.`,
    revisionPenalty > 0
      ? `Revision penalty (-${revisionPenalty}): ${Math.round(values.revisionRate * 100)}% revision rate.`
      : `Revision behavior: within healthy bounds.`,
  ];

  return { score, components: { base, verifiedSkillsPoints, challengePoints, contractPoints, ratingPoints, reliabilityPoints, revisionPenalty }, breakdown };
}

export function describeScoreBand(score: number): string {
  if (score >= 85) return "Exceptional track record";
  if (score >= 70) return "Strong verified track record";
  if (score >= 55) return "Building a credible track record";
  if (score >= 40) return "Early-stage, establishing credibility";
  return "Needs to demonstrate verifiable activity";
}