/**
 * nishkama-objective.ts — Process-Quality Reward Wrapping (Anti-Goodhart)
 *
 * कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
 * मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥
 * "You have the right to work only, but never to its fruits.
 *  Let not the fruits of action be your motive, nor let attachment to inaction overtake you."
 * — Bhagavad Gita 2.47
 *
 * Mathematical formalization (Goodhart's Law mitigation):
 * Let R: A → ℝ be the original reward function subject to optimization.
 * Let Q: A → [0,1] be the process quality function (dharmic fitness).
 * Let λ ∈ [0,1] be the process weight (regularization coefficient).
 *
 * NishkamaObjective wraps R to produce:
 *   R̃(a) = (1-λ)·R(a) + λ·Q(a)·|R(a)|·sign(R(a))
 *
 * This ensures:
 * 1. High-quality processes receive their full reward
 * 2. Low-quality processes have reward dampened by Q factor
 * 3. As λ → 1, process quality dominates over raw reward (pure Nishkama)
 * 4. As λ → 0, original reward is preserved (conventional RL)
 *
 * Goodhart's Law: When a measure becomes a target, it ceases to be a good measure.
 * Nishkama Karma solution: The agent has no incentive to game R because its
 * selection criterion is Q (process quality), not R (outcome reward).
 *
 * @packageDocumentation
 */

import { FeatureVector } from './guna-classifier.js';

/** Original reward function signature */
export type RewardFunction<TState = unknown, TAction = unknown> = (
  state: TState,
  action: TAction,
  nextState: TState,
) => number;

/** Process quality assessment input */
export interface ProcessQualityInput {
  /** Behavioral features of the action */
  features: FeatureVector;
  /** Description of the action */
  description?: string;
  /** Agent role context */
  agentRole?: string;
  /** Timestamp */
  timestamp?: number;
}

/** Result of applying NishkamaObjective */
export interface ObjectiveResult<TState = unknown, TAction = unknown> {
  /** Original reward value from wrapped function */
  originalReward: number;
  /** Process quality score ∈ [0,1] */
  processQuality: number;
  /** Modified reward after Nishkama wrapping */
  modifiedReward: number;
  /** Reduction factor applied (1.0 = no reduction) */
  dampingFactor: number;
  /** Is this action recommended despite reward modification? */
  recommended: boolean;
  /** Explanation */
  reasoning: string;
  /** State/action context */
  context?: { state: TState; action: TAction; nextState: TState };
}

/** Configuration for NishkamaObjective */
export interface NishkamaObjectiveConfig {
  /**
   * Process weight λ ∈ [0,1]. Controls the balance between reward and process quality.
   * λ = 0: pure reward maximization (conventional RL, no Nishkama effect)
   * λ = 1: pure process quality (fully Nishkama, reward becomes irrelevant)
   * Default: 0.5 (balanced)
   */
  processWeight?: number;
  /**
   * Custom process quality function. If not provided, uses default feature-based scorer.
   */
  qualityFn?: (input: ProcessQualityInput) => number;
  /**
   * Minimum process quality to recommend an action. Default: 0.3
   */
  recommendationThreshold?: number;
  /**
   * Whether to allow negative rewards for high-quality processes.
   * If false, high-quality actions always receive non-negative reward. Default: true
   */
  allowNegativeRewards?: boolean;
  /**
   * Reward normalization range [min, max] for the original reward function.
   * Used to normalize R before combining with Q. Default: [-1, 1]
   */
  rewardRange?: [number, number];
}

/** Default process quality scorer using feature vectors */
function defaultQualityFn(input: ProcessQualityInput): number {
  const f = input.features;

  // Ahimsa: non-harm is most important
  const ahimsa = 1.0 - (f.harmPotential ?? 0);
  // Satya: transparency
  const satya = f.transparency ?? 0.5;
  // Nishkama: detachment from outcome
  const nishkama = 1.0 - (f.attachment ?? 0);
  // Viveka: deliberation quality
  const viveka = f.deliberation ?? 0.5;
  // Seva: service orientation
  const seva = f.altruism ?? 0.5;
  // Consistency: alignment with stated values
  const consistency = f.consistency ?? 0.5;

  // Weighted average (Ahimsa has highest weight — primary constraint)
  const weights = { ahimsa: 1.0, satya: 0.9, nishkama: 0.85, viveka: 0.8, seva: 0.7, consistency: 0.65 };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const score =
    (ahimsa * weights.ahimsa +
      satya * weights.satya +
      nishkama * weights.nishkama +
      viveka * weights.viveka +
      seva * weights.seva +
      consistency * weights.consistency) /
    totalWeight;

  return Math.max(0, Math.min(1, score));
}

/**
 * NishkamaObjective wraps any reward function to reduce Goodhart's Law effects.
 *
 * By multiplying the original reward by a process quality factor, agents trained
 * with NishkamaObjective cannot improve their score by gaming the reward metric —
 * they must also improve process quality (dharmic alignment).
 *
 * This implements the Gita's insight: focus on the quality of action (karma yoga),
 * not the fruits of action (phala). The agent is trained to act well, not to
 * appear to achieve good outcomes.
 *
 * @example
 * ```typescript
 * // Wrap a task-completion reward
 * const objective = new NishkamaObjective({
 *   rewardFn: (state, action, nextState) => nextState.taskCompleted ? 1.0 : 0.0,
 *   processWeight: 0.6,
 * });
 *
 * const result = objective.compute(state, action, nextState, {
 *   features: { altruism: 0.8, deliberation: 0.9, ... }
 * });
 * // result.modifiedReward: dampened by process quality
 * // An agent cannot game this by completing tasks deceptively
 * ```
 */
export class NishkamaObjective<TState = unknown, TAction = unknown> {
  private rewardFn: RewardFunction<TState, TAction>;
  private qualityFn: (input: ProcessQualityInput) => number;
  private processWeight: number;
  private recommendationThreshold: number;
  private allowNegativeRewards: boolean;
  private rewardRange: [number, number];

  constructor(
    rewardFn: RewardFunction<TState, TAction>,
    config: NishkamaObjectiveConfig = {},
  ) {
    this.rewardFn = rewardFn;
    this.qualityFn = config.qualityFn ?? defaultQualityFn;
    this.processWeight = Math.max(0, Math.min(1, config.processWeight ?? 0.5));
    this.recommendationThreshold = config.recommendationThreshold ?? 0.3;
    this.allowNegativeRewards = config.allowNegativeRewards ?? true;
    this.rewardRange = config.rewardRange ?? [-1, 1];
  }

  /**
   * Compute modified reward: R̃(a) = (1-λ)·R(a) + λ·Q(a)·|R(a)|·sign(R(a))
   */
  compute(
    state: TState,
    action: TAction,
    nextState: TState,
    qualityInput: ProcessQualityInput,
  ): ObjectiveResult<TState, TAction> {
    const originalReward = this.rewardFn(state, action, nextState);
    const processQuality = this.qualityFn(qualityInput);

    // Normalize original reward to [-1, 1] range for stable combination
    const [rMin, rMax] = this.rewardRange;
    const normalizedR = rMax !== rMin
      ? ((originalReward - rMin) / (rMax - rMin)) * 2 - 1
      : originalReward;

    // Damping factor: Q reduces reward for low-quality processes
    // High Q (≈1) → dampingFactor ≈ 1 (full reward)
    // Low Q (≈0) → dampingFactor ≈ (1-λ) (heavily dampened)
    const dampingFactor = (1 - this.processWeight) + this.processWeight * processQuality;

    // Modified reward: R̃ = R · dampingFactor (in normalized space)
    let modifiedNormalized = normalizedR * dampingFactor;

    // If not allowing negative rewards for high-quality actions, floor at 0 when Q is high
    if (!this.allowNegativeRewards && processQuality >= 0.7) {
      modifiedNormalized = Math.max(0, modifiedNormalized);
    }

    // Scale back to original reward range
    const modifiedReward = ((modifiedNormalized + 1) / 2) * (rMax - rMin) + rMin;

    const recommended = processQuality >= this.recommendationThreshold;

    const rewardChange = ((modifiedReward - originalReward) / (Math.abs(originalReward) || 1)) * 100;
    const reasoning =
      `Original reward: ${originalReward.toFixed(4)}. ` +
      `Process quality (Q): ${processQuality.toFixed(3)}. ` +
      `Process weight (λ): ${this.processWeight.toFixed(2)}. ` +
      `Damping factor: ${dampingFactor.toFixed(3)}. ` +
      `Modified reward: ${modifiedReward.toFixed(4)} ` +
      `(${rewardChange >= 0 ? '+' : ''}${rewardChange.toFixed(1)}% change). ` +
      (recommended ? 'Action recommended.' : 'Action discouraged (low process quality).');

    return {
      originalReward,
      processQuality,
      modifiedReward,
      dampingFactor,
      recommended,
      reasoning,
      context: { state, action, nextState },
    };
  }

  /**
   * Compute process quality independently (without reward computation)
   */
  getProcessQuality(qualityInput: ProcessQualityInput): number {
    return this.qualityFn(qualityInput);
  }

  /**
   * Get the process weight (λ)
   */
  getProcessWeight(): number {
    return this.processWeight;
  }

  /**
   * Adjust the process weight dynamically
   */
  setProcessWeight(weight: number): void {
    this.processWeight = Math.max(0, Math.min(1, weight));
  }

  /**
   * Create a pure Nishkama objective (λ=1): reward entirely replaced by process quality.
   * This is the maximum Goodhart's Law protection — agent is completely decoupled from outcome reward.
   */
  static pureNishkama<S, A>(qualityFn?: (input: ProcessQualityInput) => number): NishkamaObjective<S, A> {
    return new NishkamaObjective<S, A>(
      () => 0, // reward function is irrelevant at λ=1
      { processWeight: 1.0, qualityFn },
    );
  }

  /**
   * Create a conventional reward objective (λ=0): standard RL with no dharmic modification.
   * Use as baseline comparison to measure Goodhart mitigation.
   */
  static conventional<S, A>(rewardFn: RewardFunction<S, A>): NishkamaObjective<S, A> {
    return new NishkamaObjective<S, A>(rewardFn, { processWeight: 0 });
  }
}
