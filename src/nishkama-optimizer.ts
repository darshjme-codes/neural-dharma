/**
 * nishkama-optimizer.ts — Reward-Free Action Selection
 *
 * कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
 * मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥
 * "You have the right to work only, but never to its fruits.
 *  Let not the fruits of action be your motive, nor let your attachment be to inaction."
 * — Bhagavad Gita 2.47
 *
 * Implements action selection based on dharmic fitness rather than reward maximization.
 * Actions are evaluated by their intrinsic alignment with duty (svadharma),
 * not by expected outcomes — eliminating reward hacking by design.
 */

import { GunaClassifier, FeatureVector, Guna } from './guna-classifier';

/** An action candidate for the optimizer to evaluate */
export interface Action<T = unknown> {
  /** Unique identifier */
  id: string;
  /** Human-readable description */
  description: string;
  /** The action payload to execute */
  payload: T;
  /** Behavioral feature vector for guna classification */
  features: FeatureVector;
  /** The svadharma (duty context) this action fulfills */
  svadharma?: string;
}

/** Result of optimization — a ranked list of actions by dharmic fitness */
export interface OptimizationResult<T = unknown> {
  /** Actions ranked by dharmic fitness (best first) */
  ranked: Array<{
    action: Action<T>;
    dharmicFitness: number;
    guna: Guna;
    gunaScores: Record<Guna, number>;
    reasoning: string;
  }>;
  /** The selected action (highest dharmic fitness) */
  selected: Action<T>;
  /** Why this action was chosen */
  selectionReasoning: string;
}

export interface DharmicPrinciple {
  /** Principle name */
  name: string;
  /** Weight in fitness calculation (0-1) */
  weight: number;
  /** Scoring function: given features, returns 0-1 score */
  score: (features: FeatureVector) => number;
}

export interface NishkamaOptimizerConfig {
  /** Custom dharmic principles for fitness evaluation */
  principles?: DharmicPrinciple[];
  /** Guna classifier config overrides */
  gunaClassifier?: GunaClassifier;
  /** Temperature for stochastic selection (0 = deterministic, >0 = probabilistic). Default: 0 */
  temperature?: number;
  /** Minimum dharmic fitness to be considered. Actions below are filtered. Default: 0.0 */
  minimumFitness?: number;
  /** Svadharma context: boosts actions aligned with the agent's defined duty */
  svadharma?: string;
  /** Weight given to svadharma alignment. Default: 0.2 */
  svadharmaWeight?: number;
}

/** Default dharmic principles derived from Gita teachings */
const DEFAULT_PRINCIPLES: DharmicPrinciple[] = [
  {
    name: 'Ahimsa (Non-harm)',
    weight: 1.0,
    score: (f) => 1.0 - f.harmPotential,
  },
  {
    name: 'Satya (Truthfulness)',
    weight: 0.9,
    score: (f) => f.transparency,
  },
  {
    name: 'Aparigraha (Non-attachment)',
    weight: 0.85,
    score: (f) => 1.0 - f.attachment,
  },
  {
    name: 'Viveka (Discernment)',
    weight: 0.8,
    score: (f) => f.deliberation,
  },
  {
    name: 'Seva (Service)',
    weight: 0.75,
    score: (f) => f.altruism,
  },
  {
    name: 'Sthairya (Steadfastness)',
    weight: 0.7,
    score: (f) => f.consistency,
  },
];

/**
 * NishkamaOptimizer selects actions based on dharmic fitness — the intrinsic
 * alignment of an action with ethical principles — rather than expected reward.
 *
 * This eliminates reward hacking, specification gaming, and Goodhart's Law
 * failure modes by fundamentally decoupling action selection from outcome optimization.
 *
 * The optimizer scores each candidate action against a set of dharmic principles
 * and guna classification, producing a ranking free from consequentialist bias.
 */
export class NishkamaOptimizer {
  private principles: DharmicPrinciple[];
  private classifier: GunaClassifier;
  private temperature: number;
  private minimumFitness: number;
  private svadharma?: string;
  private svadharmaWeight: number;

  constructor(config: NishkamaOptimizerConfig = {}) {
    this.principles = config.principles ?? DEFAULT_PRINCIPLES;
    this.classifier = config.gunaClassifier ?? new GunaClassifier();
    this.temperature = config.temperature ?? 0;
    this.minimumFitness = config.minimumFitness ?? 0.0;
    this.svadharma = config.svadharma;
    this.svadharmaWeight = config.svadharmaWeight ?? 0.2;
  }

  /** Compute dharmic fitness for a single action */
  private computeFitness(action: Action): number {
    // Weighted sum of principle scores
    let totalWeight = 0;
    let totalScore = 0;
    for (const principle of this.principles) {
      const score = Math.max(0, Math.min(1, principle.score(action.features)));
      totalScore += principle.weight * score;
      totalWeight += principle.weight;
    }
    let fitness = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Guna bonus: sattvic actions get a boost, tamasic get a penalty
    const classification = this.classifier.classifyFeatures(action.features);
    const gunaModifier =
      classification.scores.sattva * 0.15 -
      classification.scores.tamas * 0.15;
    fitness = Math.max(0, Math.min(1, fitness + gunaModifier));

    // Svadharma alignment bonus
    if (this.svadharma && action.svadharma === this.svadharma) {
      fitness = Math.min(1, fitness + this.svadharmaWeight);
    }

    return fitness;
  }

  /** Select the best action from candidates based on dharmic fitness */
  optimize<T>(actions: Action<T>[]): OptimizationResult<T> {
    if (actions.length === 0) {
      throw new Error('Cannot optimize empty action set. At least one action required.');
    }

    const evaluated = actions.map((action) => {
      const dharmicFitness = this.computeFitness(action);
      const classification = this.classifier.classifyFeatures(action.features);
      return {
        action,
        dharmicFitness,
        guna: classification.primary,
        gunaScores: classification.scores,
        reasoning: classification.reasoning,
      };
    });

    // Filter by minimum fitness
    const viable = evaluated.filter((e) => e.dharmicFitness >= this.minimumFitness);
    const pool = viable.length > 0 ? viable : evaluated; // fallback to all if none meet threshold

    // Sort by dharmic fitness
    pool.sort((a, b) => b.dharmicFitness - a.dharmicFitness);

    // Select: deterministic or stochastic
    let selectedIdx = 0;
    if (this.temperature > 0 && pool.length > 1) {
      // Boltzmann selection weighted by fitness
      const weights = pool.map((e) => Math.exp(e.dharmicFitness / this.temperature));
      const sum = weights.reduce((a, b) => a + b, 0);
      const probs = weights.map((w) => w / sum);
      const r = Math.random();
      let cumulative = 0;
      for (let i = 0; i < probs.length; i++) {
        cumulative += probs[i];
        if (r <= cumulative) {
          selectedIdx = i;
          break;
        }
      }
    }

    const selected = pool[selectedIdx];
    const selectionReasoning =
      `Selected "${selected.action.description}" with dharmic fitness ${selected.dharmicFitness.toFixed(3)} ` +
      `(${selected.guna}). ${selected.reasoning}` +
      (this.temperature > 0 ? ` [Stochastic selection, τ=${this.temperature}]` : ' [Deterministic selection]');

    return {
      ranked: pool,
      selected: selected.action,
      selectionReasoning,
    };
  }

  /** Quick check: is this action dharmically fit? */
  isDharmic(action: Action, threshold = 0.5): boolean {
    return this.computeFitness(action) >= threshold;
  }

  /** Get fitness score without full optimization */
  getFitness(action: Action): number {
    return this.computeFitness(action);
  }
}
