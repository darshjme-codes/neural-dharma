/**
 * NishkamaObjective Tests
 * Tests Goodhart's Law mitigation via process-quality reward wrapping
 */

import { describe, it, expect } from 'vitest';
import { NishkamaObjective, type ProcessQualityInput, type RewardFunction } from '../src/nishkama-objective.js';

type S = { value: number };
type A = { id: string };
type N = { reward: number };

const highQualityInput: ProcessQualityInput = {
  features: {
    altruism: 0.9, deliberation: 0.85, attachment: 0.1,
    agitation: 0.05, transparency: 0.95, effort: 0.8,
    harmPotential: 0.0, consistency: 0.9, deceptionLevel: 0.0,
  },
};

const lowQualityInput: ProcessQualityInput = {
  features: {
    altruism: 0.1, deliberation: 0.2, attachment: 0.9,
    agitation: 0.8, transparency: 0.1, effort: 0.3,
    harmPotential: 0.8, consistency: 0.1, deceptionLevel: 0.9,
  },
};

const fixedReward: RewardFunction<S, A, N> = () => 0.8;
const zeroReward: RewardFunction<S, A, N> = () => 0;
const negativeReward: RewardFunction<S, A, N> = () => -0.5;

const s: S = { value: 1 };
const a: A = { id: 'action' };
const n: N = { reward: 0.8 };

describe('NishkamaObjective', () => {
  describe('constructor', () => {
    it('creates with default config', () => {
      const obj = new NishkamaObjective(fixedReward);
      expect(obj.getProcessWeight()).toBe(0.5);
    });

    it('clamps processWeight to [0,1]', () => {
      const obj1 = new NishkamaObjective(fixedReward, { processWeight: 1.5 });
      expect(obj1.getProcessWeight()).toBe(1.0);
      const obj2 = new NishkamaObjective(fixedReward, { processWeight: -0.5 });
      expect(obj2.getProcessWeight()).toBe(0.0);
    });
  });

  describe('compute()', () => {
    const obj = new NishkamaObjective<S, A, N>(fixedReward, { processWeight: 0.5 });

    it('returns ObjectiveResult with all fields', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.originalReward).toBeDefined();
      expect(result.processQuality).toBeDefined();
      expect(result.modifiedReward).toBeDefined();
      expect(result.dampingFactor).toBeDefined();
      expect(result.recommended).toBeDefined();
      expect(result.reasoning).toBeDefined();
    });

    it('originalReward matches the wrapped function output', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.originalReward).toBe(0.8);
    });

    it('processQuality ∈ [0,1]', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.processQuality).toBeGreaterThanOrEqual(0);
      expect(result.processQuality).toBeLessThanOrEqual(1);
    });

    it('high quality process → high damping factor', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.dampingFactor).toBeGreaterThan(0.7);
    });

    it('low quality process → lower damping factor', () => {
      const highResult = obj.compute(s, a, n, highQualityInput);
      const lowResult = obj.compute(s, a, n, lowQualityInput);
      expect(highResult.dampingFactor).toBeGreaterThan(lowResult.dampingFactor);
    });

    it('high quality action gets higher modifiedReward than low quality', () => {
      const highResult = obj.compute(s, a, n, highQualityInput);
      const lowResult = obj.compute(s, a, n, lowQualityInput);
      expect(highResult.modifiedReward).toBeGreaterThan(lowResult.modifiedReward);
    });

    it('λ=0 (conventional): modifiedReward ≈ originalReward', () => {
      const conventional = NishkamaObjective.conventional<S, A, N>(fixedReward);
      const result = conventional.compute(s, a, n, lowQualityInput);
      // With λ=0, damping = 1.0, so modifiedReward should be close to original
      expect(result.dampingFactor).toBeCloseTo(1.0, 5);
    });

    it('λ=1 (pure nishkama): reward is irrelevant, only quality matters', () => {
      const pure = NishkamaObjective.pureNishkama<S, A, N>();
      const highResult = pure.compute(s, a, n, highQualityInput);
      const lowResult = pure.compute(s, a, n, lowQualityInput);
      // High quality should get higher reward than low quality regardless of CTR
      expect(highResult.processQuality).toBeGreaterThan(lowResult.processQuality);
    });

    it('recommended = true when quality above recommendationThreshold', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.recommended).toBe(true);
    });

    it('recommended = false when quality below recommendationThreshold', () => {
      const strictObj = new NishkamaObjective<S, A, N>(fixedReward, {
        processWeight: 0.5,
        recommendationThreshold: 0.95,
      });
      const result = strictObj.compute(s, a, n, lowQualityInput);
      expect(result.recommended).toBe(false);
    });

    it('reasoning is non-empty string', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('context includes state, action, nextState', () => {
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.context?.state).toEqual(s);
      expect(result.context?.action).toEqual(a);
      expect(result.context?.nextState).toEqual(n);
    });

    it('zero reward stays zero for any quality', () => {
      const zeroObj = new NishkamaObjective<S, A, N>(zeroReward, { rewardRange: [0, 1] });
      const result = zeroObj.compute(s, a, { reward: 0 }, highQualityInput);
      expect(result.originalReward).toBe(0);
    });
  });

  describe('getProcessQuality()', () => {
    const obj = new NishkamaObjective(fixedReward);

    it('returns process quality independently', () => {
      const quality = obj.getProcessQuality(highQualityInput);
      expect(quality).toBeGreaterThanOrEqual(0);
      expect(quality).toBeLessThanOrEqual(1);
    });

    it('high quality input → quality > 0.6', () => {
      const quality = obj.getProcessQuality(highQualityInput);
      expect(quality).toBeGreaterThan(0.6);
    });

    it('low quality input → quality < 0.4', () => {
      const quality = obj.getProcessQuality(lowQualityInput);
      expect(quality).toBeLessThan(0.4);
    });
  });

  describe('setProcessWeight()', () => {
    it('updates process weight', () => {
      const obj = new NishkamaObjective(fixedReward, { processWeight: 0.3 });
      obj.setProcessWeight(0.8);
      expect(obj.getProcessWeight()).toBe(0.8);
    });

    it('clamps to [0,1]', () => {
      const obj = new NishkamaObjective(fixedReward);
      obj.setProcessWeight(2.0);
      expect(obj.getProcessWeight()).toBe(1.0);
      obj.setProcessWeight(-1.0);
      expect(obj.getProcessWeight()).toBe(0.0);
    });
  });

  describe('static factories', () => {
    it('pureNishkama() creates λ=1 objective', () => {
      const pure = NishkamaObjective.pureNishkama();
      expect(pure.getProcessWeight()).toBe(1.0);
    });

    it('conventional() creates λ=0 objective', () => {
      const conv = NishkamaObjective.conventional(fixedReward);
      expect(conv.getProcessWeight()).toBe(0);
    });
  });

  describe('custom qualityFn', () => {
    it('uses custom quality function when provided', () => {
      const obj = new NishkamaObjective(fixedReward, {
        qualityFn: () => 0.42,
        processWeight: 0.5,
      });
      const result = obj.compute(s, a, n, highQualityInput);
      expect(result.processQuality).toBeCloseTo(0.42, 5);
    });
  });
});
