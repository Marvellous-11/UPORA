import { createHash } from "node:crypto";

/**
 * UPORA Practical Challenge Evaluation Engine (deterministic, explainable).
 *
 * Automated grading of free-form deliverables is performed with a transparent
 * rubric-weighted heuristic that measures structural quality and topic coverage.
 * It is NOT a human certification and is explicitly versioned as such
 * (evaluatorType: "UPORA_RUBRIC_SCORE_V1").
 */

export interface RubricCriterion {
  title: string;
  weight: number;
  description?: string;
}

export interface RubricCriteriaPayload {
  criteria: RubricCriterion[];
}

export interface CriterionScore {
  title: string;
  weight: number;
  score: number; // 0-100
  weighted: number; // score * weight
  comment: string;
}

export interface EvaluationResult {
  score: number; // 0-100
  passed: boolean;
  passingScore: number;
  criteriaScores: CriterionScore[];
  summary: string;
  evidenceFound: string[];
  specificImprovements: string[];
  evaluatorType: "UPORA_RUBRIC_SCORE_V1";
}

/** Safely normalizes a persisted rubricCriteria payload. */
export function normalizeRubricCriteria(payload: unknown): RubricCriterion[] {
  if (!payload || typeof payload !== "object") return [];
  const box = payload as { criteria?: unknown };
  if (!Array.isArray(box.criteria)) return [];
  return box.criteria
    .filter((c): c is RubricCriterion => {
      if (!c || typeof c !== "object") return false;
      const item = c as Record<string, unknown>;
      return (
        typeof item.title === "string" &&
        typeof item.weight === "number" &&
        item.weight > 0
      );
    })
    .map((c) => ({
      title: c.title,
      weight: c.weight,
      description: typeof c.description === "string" ? c.description : undefined,
    }));
}

/** Splits a phrase into meaningful keywords (length >= 3). */
function keywordTokens(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function wordCount(text: string): number {
  return text
    .split(/\s+/)
    .filter((t) => t.trim().length > 0).length;
}

function structureCharacteristics(text: string): {
  headings: number;
  lists: number;
  codeBlocks: number;
  totalWords: number;
} {
  const headings = (text.match(/^#{1,6}\s+/gm) || []).length;
  const lists = (text.match(/^\s*[-*]\s+/gm) || []).length;
  const codeBlocks = (text.match(/```/g) || []).length / 2;
  return { headings, lists, codeBlocks, totalWords: wordCount(text) };
}

/**
 * Scores a single rubric criterion between 0-100.
 * - Signal (0-40): response length relative to a healthy minimum (250 words).
 * - Coverage (0-40): fraction of criterion keywords present in the deliverable.
 * - Structure (0-20): headings, lists and code blocks demonstrate organized work.
 */
function scoreCriterion(
  criterion: RubricCriterion,
  deliverable: string,
  chars: { headings: number; lists: number; codeBlocks: number; totalWords: number }
): CriterionScore {
  const keywords = keywordTokens(`${criterion.title} ${criterion.description || ""}`);
  const lower = deliverable.toLowerCase();

  const signalScore = Math.min(40, Math.round((chars.totalWords / 250) * 40));

  let found = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) found += 1;
  }
  const pool = Math.max(1, keywords.length);
  const coverageScore = Math.round((found / pool) * 40);

  let structureScore = 0;
  if (chars.headings >= 2) structureScore += 7;
  if (chars.lists >= 2) structureScore += 6;
  if (chars.codeBlocks >= 1) structureScore += 5;
  if (chars.totalWords >= 150) structureScore += 2;
  structureScore = Math.min(20, structureScore);

  const score = Math.max(0, Math.min(100, signalScore + coverageScore + structureScore));

  const comment =
    score >= 80
      ? `Strong coverage of '${criterion.title}': ${found}/${pool} key concepts addressed with organized structure.`
      : score >= 50
      ? `Partial coverage of '${criterion.title}': ${found}/${pool} key concepts detected; expand reasoning and evidence.`
      : `Limited evidence for '${criterion.title}': only ${found}/${pool} key concepts detected. Provide specific, detailed work.`;

  return {
    title: criterion.title,
    weight: criterion.weight,
    score,
    weighted: Math.round(score * criterion.weight * 100) / 100,
    comment,
  };
}

export function evaluateSubmission(input: {
  deliverable: string;
  rubric: RubricCriterion[];
  passingScore: number;
}): EvaluationResult {
  const deliverable = (input.deliverable || "").trim();
  const rubric = input.rubric.length ? input.rubric : [{ title: "Overall Quality", weight: 100 }];
  const chars = structureCharacteristics(deliverable);

  const criteriaScores = rubric.map((c) => scoreCriterion(c, deliverable, chars));

  const totalWeight = criteriaScores.reduce((sum, c) => sum + c.weight, 0) || 100;
  const weightedScore = criteriaScores.reduce((sum, c) => sum + c.weighted, 0);
  const score = Math.max(0, Math.min(100, Math.round((weightedScore / totalWeight) * 100))) || 0;

  const passed = score >= input.passingScore;

  const evidenceFound = [
    chars.totalWords >= 100
      ? `Structured deliverable: ${chars.totalWords} words, ${chars.headings} sections, ${chars.codeBlocks} code blocks.`
      : `Deliverable is brief (${chars.totalWords} words); expand with concrete technical details.`,
    ...criteriaScores
      .filter((c) => c.score >= 80)
      .map((c) => `Criterion '${c.title}' satisfied (${c.score}/100).`),
  ];

  const specificImprovements = criteriaScores
    .filter((c) => c.score < 80)
    .map(
      (c) =>
        `Improve '${c.title}' (${c.score}/100): address the untested key concepts and build a structured, evidence-backed answer.`
    );

  const summary = passed
    ? `Submission passed the ${input.passingScore}-point threshold with a score of ${score}/100 across ${criteriaScores.length} rubric criteria.`
    : `Submission scored ${score}/100, below the ${input.passingScore}-point passing threshold. Review the criterion feedback and resubmit an improved deliverable.`;

  return {
    score,
    passed,
    passingScore: input.passingScore,
    criteriaScores,
    summary,
    evidenceFound: evidenceFound.slice(0, 5),
    specificImprovements: specificImprovements.length
      ? specificImprovements.slice(0, 4)
      : ["Strong submission — no critical improvements required."],
    evaluatorType: "UPORA_RUBRIC_SCORE_V1",
  };
}

/**
 * Real, verifiable commitment for a submission. Not a security signature —
 * a tamper-evident record hash stored with the submission record.
 */
export function computeEvidenceHash(input: {
  deliverable: string;
  challengeId: string;
  userId: string;
}): string {
  return createHash("sha256")
    .update(
      [input.deliverable.trim(), input.challengeId, input.userId, "UPORA_V1"].join("::")
    )
    .digest("hex");
}