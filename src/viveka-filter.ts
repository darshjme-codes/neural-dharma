/**
 * viveka-filter.ts — Dharmic Discrimination Filter
 *
 * असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।
 * "From the unreal, lead me to the real. From darkness, lead me to light."
 * — Bṛhadāraṇyaka Upaniṣad 1.3.28 (foundational to Gita's viveka)
 *
 * Separates dharmic (aligned) from adharmic (misaligned) actions using
 * configurable ethical boundaries. Viveka is the faculty of discrimination
 * between the real and the unreal, the right and the wrong.
 */

import { GunaClassifier, FeatureVector, GunaClassification } from './guna-classifier';

/** An ethical boundary rule */
export interface EthicalBoundary {
  /** Rule name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Priority (higher = harder constraint). Default: 1 */
  priority: number;
  /** Evaluation function: returns true if action VIOLATES this boundary */
  isViolated: (action: ActionCandidate) => boolean;
  /** Severity of violation */
  severity: 'warning' | 'violation' | 'critical';
}

/** An action to be evaluated by the filter */
export interface ActionCandidate {
  /** Action description */
  description: string;
  /** Behavioral features */
  features: FeatureVector;
  /** Target entities affected */
  targets?: string[];
  /** Declared intent */
  intent?: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/** Filter verdict */
export interface VivekaVerdict {
  /** Overall: is this action dharmic? */
  dharmic: boolean;
  /** List of boundary violations */
  violations: Array<{
    boundary: string;
    severity: EthicalBoundary['severity'];
    description: string;
  }>;
  /** Guna classification */
  gunaClassification: GunaClassification;
  /** Overall alignment score (0-1) */
  alignmentScore: number;
  /** Recommendation */
  recommendation: 'proceed' | 'caution' | 'deny';
  /** Reasoning */
  reasoning: string;
}

export interface VivekaFilterConfig {
  /** Custom ethical boundaries (added to defaults) */
  boundaries?: EthicalBoundary[];
  /** Replace default boundaries entirely */
  replaceDefaults?: boolean;
  /** Guna classifier instance */
  gunaClassifier?: GunaClassifier;
  /** Minimum alignment score to pass. Default: 0.4 */
  alignmentThreshold?: number;
  /** Maximum tamasic score to pass. Default: 0.5 */
  maxTamas?: number;
}

const DEFAULT_BOUNDARIES: EthicalBoundary[] = [
  {
    name: 'Ahimsa — Non-violence',
    description: 'Actions must not cause direct harm',
    priority: 10,
    severity: 'critical',
    isViolated: (a) => a.features.harmPotential > 0.7,
  },
  {
    name: 'Satya — Truthfulness',
    description: 'Actions must maintain transparency',
    priority: 9,
    severity: 'violation',
    isViolated: (a) => a.features.transparency < 0.2,
  },
  {
    name: 'Asteya — Non-stealing',
    description: 'Actions must not misappropriate resources or credit',
    priority: 8,
    severity: 'violation',
    isViolated: (a) => a.features.altruism < 0.1 && a.features.attachment > 0.8,
  },
  {
    name: 'Aparigraha — Non-possessiveness',
    description: 'Actions must not be driven by excessive attachment',
    priority: 6,
    severity: 'warning',
    isViolated: (a) => a.features.attachment > 0.85,
  },
  {
    name: 'Dama — Self-control',
    description: 'Actions must reflect deliberation, not impulse',
    priority: 7,
    severity: 'warning',
    isViolated: (a) => a.features.deliberation < 0.15 && a.features.agitation > 0.7,
  },
];

/**
 * VivekaFilter applies dharmic discrimination to separate aligned from misaligned
 * actions. It evaluates candidates against configurable ethical boundaries
 * derived from the yamas and niyamas, combined with guna classification.
 *
 * Viveka (विवेक) — the capacity to discern right from wrong, real from unreal.
 */
export class VivekaFilter {
  private boundaries: EthicalBoundary[];
  private classifier: GunaClassifier;
  private alignmentThreshold: number;
  private maxTamas: number;

  constructor(config: VivekaFilterConfig = {}) {
    this.boundaries = config.replaceDefaults
      ? (config.boundaries ?? [])
      : [...DEFAULT_BOUNDARIES, ...(config.boundaries ?? [])];
    this.boundaries.sort((a, b) => b.priority - a.priority);
    this.classifier = config.gunaClassifier ?? new GunaClassifier();
    this.alignmentThreshold = config.alignmentThreshold ?? 0.4;
    this.maxTamas = config.maxTamas ?? 0.5;
  }

  /** Evaluate an action candidate */
  evaluate(action: ActionCandidate): VivekaVerdict {
    const gunaClassification = this.classifier.classifyFeatures(action.features);

    // Check boundary violations
    const violations = this.boundaries
      .filter((b) => b.isViolated(action))
      .map((b) => ({ boundary: b.name, severity: b.severity, description: b.description }));

    const hasCritical = violations.some((v) => v.severity === 'critical');
    const hasViolation = violations.some((v) => v.severity === 'violation');

    // Compute alignment score
    let alignmentScore = gunaClassification.scores.sattva;
    // Penalize for violations
    for (const v of violations) {
      if (v.severity === 'critical') alignmentScore -= 0.4;
      else if (v.severity === 'violation') alignmentScore -= 0.2;
      else alignmentScore -= 0.05;
    }
    alignmentScore = Math.max(0, Math.min(1, alignmentScore));

    // Tamas check
    const tooTamasic = gunaClassification.scores.tamas > this.maxTamas;

    // Final determination
    const dharmic = !hasCritical && !tooTamasic && alignmentScore >= this.alignmentThreshold;

    let recommendation: VivekaVerdict['recommendation'];
    if (hasCritical || tooTamasic) recommendation = 'deny';
    else if (hasViolation || alignmentScore < this.alignmentThreshold + 0.15) recommendation = 'caution';
    else recommendation = 'proceed';

    const parts: string[] = [];
    if (violations.length === 0) parts.push('No ethical boundary violations detected.');
    else parts.push(`${violations.length} boundary violation(s): ${violations.map((v) => v.boundary).join(', ')}.`);
    parts.push(`Guna: ${gunaClassification.primary} (sattva: ${(gunaClassification.scores.sattva * 100).toFixed(0)}%, rajas: ${(gunaClassification.scores.rajas * 100).toFixed(0)}%, tamas: ${(gunaClassification.scores.tamas * 100).toFixed(0)}%).`);
    parts.push(`Alignment score: ${(alignmentScore * 100).toFixed(1)}%.`);

    return {
      dharmic,
      violations,
      gunaClassification,
      alignmentScore,
      recommendation,
      reasoning: parts.join(' '),
    };
  }

  /** Quick check: is this action dharmic? */
  isDharmic(action: ActionCandidate): boolean {
    return this.evaluate(action).dharmic;
  }

  /** Filter a list of actions, returning only dharmic ones */
  filter(actions: ActionCandidate[]): ActionCandidate[] {
    return actions.filter((a) => this.isDharmic(a));
  }

  /** Add a boundary at runtime */
  addBoundary(boundary: EthicalBoundary): void {
    this.boundaries.push(boundary);
    this.boundaries.sort((a, b) => b.priority - a.priority);
  }

  /** List all configured boundaries */
  getBoundaries(): EthicalBoundary[] {
    return [...this.boundaries];
  }
}
