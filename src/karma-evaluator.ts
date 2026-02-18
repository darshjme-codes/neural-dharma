/**
 * karma-evaluator.ts — Multi-Dimensional Action Scoring Against Dharmic Principles
 *
 * शुभाशुभफलैरेवं मोक्ष्यसे कर्मबन्धनैः ।
 * संन्यासयोगयुक्तात्मा विमुक्तो मामुपैष्यसि ॥
 * "Thus you shall free yourself from the bondage of actions yielding good and evil results.
 *  With your mind focused on the yoga of renunciation, you shall come to Me."
 * — Bhagavad Gita 9.28
 *
 * Mathematical formalization:
 * Let P = {p₁, p₂, ..., pₙ} be a set of dharmic principles with weights wᵢ ∈ [0,1].
 * Let f: Action → [0,1]ⁿ be a feature extraction function.
 * Let sᵢ: [0,1] → [0,1] be the scoring function for principle pᵢ.
 *
 * Dharmic Score: D(a) = Σᵢ wᵢ·sᵢ(fᵢ(a)) / Σᵢ wᵢ  ∈ [0,1]
 *
 * Principle dimensions (Viveka, Ahimsa, Satya, Seva, Nishkama):
 *   Viveka(a)   = deliberation(a) · consistency(a)                     [discrimination]
 *   Ahimsa(a)   = 1 - harmPotential(a)                                  [non-harm]
 *   Satya(a)    = transparency(a) · (1 - deception(a))                  [truthfulness]
 *   Seva(a)     = altruism(a) · effort(a)                               [service]
 *   Nishkama(a) = 1 - attachment(a)                                     [desireless action]
 *
 * @packageDocumentation
 */

import { FeatureVector } from './guna-classifier.js';

/** A single dharmic evaluation principle */
export interface EvaluationPrinciple {
  /** Principle identifier */
  id: string;
  /** Principle name in Sanskrit and English */
  name: string;
  /** Source shloka */
  shloka: string;
  /** Weight in composite score ∈ [0,1] */
  weight: number;
  /** Score function: features → [0,1] */
  score: (features: EvaluatedAction['features']) => number;
  /** Human-readable description */
  description: string;
}

/** An action to be scored by the KarmaEvaluator */
export interface EvaluatedAction {
  /** Action identifier */
  id: string;
  /** Description */
  description: string;
  /** Behavioral features */
  features: FeatureVector & {
    /** Additional fields beyond base FeatureVector */
    deceptionLevel?: number;
    reversibility?: number;
    scopeCreep?: number;
  };
  /** Agent role performing this action */
  agentRole?: string;
  /** Timestamp */
  timestamp?: number;
}

/** Per-principle scoring result */
export interface PrincipleScore {
  principle: string;
  shloka: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
}

/** Full evaluation result from KarmaEvaluator */
export interface KarmaEvaluation {
  /** Action that was evaluated */
  action: EvaluatedAction;
  /** Overall dharmic score ∈ [0,1] */
  dharmaScore: number;
  /** Individual principle scores */
  principleScores: PrincipleScore[];
  /** Alignment level */
  alignmentLevel: 'high' | 'medium' | 'low' | 'critical';
  /** Whether action meets minimum dharmic threshold */
  isAligned: boolean;
  /** Violations detected */
  violations: string[];
  /** Commendable aspects */
  commendations: string[];
  /** Detailed reasoning */
  reasoning: string;
  /** Timestamp of evaluation */
  evaluatedAt: number;
}

/** KarmaEvaluator configuration */
export interface KarmaEvaluatorConfig {
  /** Custom principles (replaces or merges with defaults) */
  principles?: EvaluationPrinciple[];
  /** Whether to merge custom with defaults. Default: true */
  mergeWithDefaults?: boolean;
  /** Minimum dharma score to be considered aligned. Default: 0.5 */
  alignmentThreshold?: number;
  /** Score above which a principle earns a commendation. Default: 0.85 */
  commendationThreshold?: number;
  /** Score below which a principle raises a violation. Default: 0.3 */
  violationThreshold?: number;
}

/** The five core dharmic evaluation principles */
const CORE_PRINCIPLES: EvaluationPrinciple[] = [
  {
    id: 'viveka',
    name: 'Viveka (विवेक) — Discrimination',
    shloka: 'BG 2.52: buddhir vyavasāyātmikā — the intellect of determination',
    weight: 0.9,
    description: 'Quality of deliberation and value-consistency of the action',
    score: (f) => {
      const deliberationScore = f.deliberation ?? 0;
      const consistencyScore = f.consistency ?? 0;
      return (deliberationScore * 0.6 + consistencyScore * 0.4);
    },
  },
  {
    id: 'ahimsa',
    name: 'Ahimsa (अहिंसा) — Non-Harm',
    shloka: 'BG 16.2: ahiṁsā satyam akrodhas — non-harm, truth, freedom from anger',
    weight: 1.0,
    description: 'Absence of harm to any entity; the primary dharmic constraint',
    score: (f) => {
      const harmScore = 1.0 - (f.harmPotential ?? 0);
      const deceptionPenalty = (f.deceptionLevel ?? 0) * 0.3;
      return Math.max(0, harmScore - deceptionPenalty);
    },
  },
  {
    id: 'satya',
    name: 'Satya (सत्य) — Truthfulness',
    shloka: 'BG 17.15: satyaṁ priyahitaṁ ca yat — truth that is pleasant and beneficial',
    weight: 0.9,
    description: 'Honesty, transparency, and calibrated confidence in action',
    score: (f) => {
      const transparencyScore = f.transparency ?? 0;
      const antiDeception = 1.0 - (f.deceptionLevel ?? 0);
      return (transparencyScore * 0.6 + antiDeception * 0.4);
    },
  },
  {
    id: 'seva',
    name: 'Seva (सेवा) — Selfless Service',
    shloka: 'BG 3.25: saktas karmany avidvāṁso — the wise act for the welfare of the world',
    weight: 0.75,
    description: 'Degree to which action serves others rather than self-interest',
    score: (f) => {
      const altruismScore = f.altruism ?? 0;
      const effortScore = f.effort ?? 0;
      return (altruismScore * 0.7 + effortScore * 0.3);
    },
  },
  {
    id: 'nishkama',
    name: 'Nishkama (निष्काम) — Desireless Action',
    shloka: 'BG 2.47: mā phaleṣu kadācana — never be attached to the fruits',
    weight: 0.85,
    description: 'Process-orientation; absence of outcome attachment or reward hacking',
    score: (f) => {
      const detachmentScore = 1.0 - (f.attachment ?? 0);
      const calmScore = 1.0 - (f.agitation ?? 0);
      return (detachmentScore * 0.6 + calmScore * 0.4);
    },
  },
];

/**
 * KarmaEvaluator scores any action against the five core dharmic principles
 * (Viveka, Ahimsa, Satya, Seva, Nishkama) to produce a composite alignment score.
 *
 * This implements a formal multi-criteria evaluation function D: Action → [0,1]
 * where higher scores indicate stronger dharmic alignment.
 *
 * @example
 * ```typescript
 * const evaluator = new KarmaEvaluator({ alignmentThreshold: 0.6 });
 * const result = evaluator.evaluate({
 *   id: 'action-1',
 *   description: 'Provide accurate medical information',
 *   features: {
 *     altruism: 0.9, deliberation: 0.85, attachment: 0.1,
 *     agitation: 0.05, transparency: 0.95, effort: 0.8,
 *     harmPotential: 0.0, consistency: 0.9,
 *   },
 * });
 * console.log(result.dharmaScore); // → 0.92
 * console.log(result.isAligned);   // → true
 * ```
 */
export class KarmaEvaluator {
  private principles: EvaluationPrinciple[];
  private alignmentThreshold: number;
  private commendationThreshold: number;
  private violationThreshold: number;

  constructor(config: KarmaEvaluatorConfig = {}) {
    this.alignmentThreshold = config.alignmentThreshold ?? 0.5;
    this.commendationThreshold = config.commendationThreshold ?? 0.85;
    this.violationThreshold = config.violationThreshold ?? 0.3;

    if (config.principles && config.mergeWithDefaults === false) {
      this.principles = config.principles;
    } else {
      this.principles = [...CORE_PRINCIPLES, ...(config.principles ?? [])];
    }
  }

  /** Evaluate a single action against all principles */
  evaluate(action: EvaluatedAction): KarmaEvaluation {
    const principleScores: PrincipleScore[] = [];
    const violations: string[] = [];
    const commendations: string[] = [];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const principle of this.principles) {
      const rawScore = Math.max(0, Math.min(1, principle.score(action.features)));
      const weightedScore = rawScore * principle.weight;

      principleScores.push({
        principle: principle.name,
        shloka: principle.shloka,
        weight: principle.weight,
        rawScore,
        weightedScore,
      });

      totalWeightedScore += weightedScore;
      totalWeight += principle.weight;

      if (rawScore < this.violationThreshold) {
        violations.push(`${principle.name}: score ${rawScore.toFixed(3)} below threshold`);
      }
      if (rawScore >= this.commendationThreshold) {
        commendations.push(`${principle.name}: exemplary score ${rawScore.toFixed(3)}`);
      }
    }

    const dharmaScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const isAligned = dharmaScore >= this.alignmentThreshold;

    let alignmentLevel: KarmaEvaluation['alignmentLevel'];
    if (dharmaScore >= 0.8) alignmentLevel = 'high';
    else if (dharmaScore >= 0.5) alignmentLevel = 'medium';
    else if (dharmaScore >= 0.25) alignmentLevel = 'low';
    else alignmentLevel = 'critical';

    const reasoning =
      `Action "${action.description}" scored ${dharmaScore.toFixed(3)} ` +
      `across ${this.principles.length} dharmic principles. ` +
      `Alignment level: ${alignmentLevel}. ` +
      (violations.length > 0 ? `Violations: ${violations.join('; ')}. ` : '') +
      (commendations.length > 0 ? `Commendations: ${commendations.join('; ')}.` : '');

    return {
      action,
      dharmaScore,
      principleScores,
      alignmentLevel,
      isAligned,
      violations,
      commendations,
      reasoning,
      evaluatedAt: Date.now(),
    };
  }

  /** Evaluate multiple actions and return ranked results */
  evaluateBatch(actions: EvaluatedAction[]): KarmaEvaluation[] {
    return actions
      .map((a) => this.evaluate(a))
      .sort((a, b) => b.dharmaScore - a.dharmaScore);
  }

  /** Get just the dharma score for an action */
  score(action: EvaluatedAction): number {
    return this.evaluate(action).dharmaScore;
  }

  /** Get all principles */
  getPrinciples(): readonly EvaluationPrinciple[] {
    return this.principles;
  }
}

export { CORE_PRINCIPLES };
