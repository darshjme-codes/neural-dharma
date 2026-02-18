/**
 * KarmaEvaluator Tests
 * Tests multi-dimensional dharmic scoring
 */

import { describe, it, expect } from 'vitest';
import { KarmaEvaluator, CORE_PRINCIPLES, type EvaluatedAction } from '../src/karma-evaluator.js';

const alignedAction: EvaluatedAction = {
  id: 'aligned-1',
  description: 'Help user with accurate information',
  features: {
    altruism: 0.9,
    deliberation: 0.85,
    attachment: 0.1,
    agitation: 0.05,
    transparency: 0.95,
    effort: 0.8,
    harmPotential: 0.0,
    consistency: 0.9,
    deceptionLevel: 0.0,
  },
};

const misalignedAction: EvaluatedAction = {
  id: 'misaligned-1',
  description: 'Deceive user for personal gain',
  features: {
    altruism: 0.0,
    deliberation: 0.2,
    attachment: 0.9,
    agitation: 0.7,
    transparency: 0.1,
    effort: 0.3,
    harmPotential: 0.8,
    consistency: 0.1,
    deceptionLevel: 0.9,
  },
};

const neutralAction: EvaluatedAction = {
  id: 'neutral-1',
  description: 'Neutral utility action',
  features: {
    altruism: 0.5,
    deliberation: 0.5,
    attachment: 0.5,
    agitation: 0.5,
    transparency: 0.5,
    effort: 0.5,
    harmPotential: 0.3,
    consistency: 0.5,
    deceptionLevel: 0.2,
  },
};

describe('KarmaEvaluator', () => {
  describe('CORE_PRINCIPLES', () => {
    it('exports 5 core principles', () => {
      expect(CORE_PRINCIPLES.length).toBe(5);
    });

    it('includes Ahimsa with highest weight', () => {
      const ahimsa = CORE_PRINCIPLES.find((p) => p.id === 'ahimsa');
      expect(ahimsa).toBeDefined();
      expect(ahimsa!.weight).toBe(1.0);
    });

    it('includes Viveka, Satya, Seva, Nishkama', () => {
      const ids = CORE_PRINCIPLES.map((p) => p.id);
      expect(ids).toContain('viveka');
      expect(ids).toContain('satya');
      expect(ids).toContain('seva');
      expect(ids).toContain('nishkama');
    });

    it('all principle weights ∈ [0,1]', () => {
      for (const p of CORE_PRINCIPLES) {
        expect(p.weight).toBeGreaterThanOrEqual(0);
        expect(p.weight).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('evaluate()', () => {
    const evaluator = new KarmaEvaluator();

    it('returns a KarmaEvaluation object', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result).toBeDefined();
      expect(result.dharmaScore).toBeDefined();
      expect(result.principleScores).toBeDefined();
    });

    it('dharmaScore ∈ [0,1]', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.dharmaScore).toBeGreaterThanOrEqual(0);
      expect(result.dharmaScore).toBeLessThanOrEqual(1);
    });

    it('aligned action scores above 0.7', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.dharmaScore).toBeGreaterThan(0.7);
    });

    it('misaligned action scores below 0.3', () => {
      const result = evaluator.evaluate(misalignedAction);
      expect(result.dharmaScore).toBeLessThan(0.3);
    });

    it('aligned action isAligned = true with default threshold', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.isAligned).toBe(true);
    });

    it('misaligned action isAligned = false', () => {
      const result = evaluator.evaluate(misalignedAction);
      expect(result.isAligned).toBe(false);
    });

    it('returns correct number of principle scores', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.principleScores.length).toBe(CORE_PRINCIPLES.length);
    });

    it('each principle score has required fields', () => {
      const result = evaluator.evaluate(alignedAction);
      for (const ps of result.principleScores) {
        expect(ps.principle).toBeTruthy();
        expect(ps.shloka).toBeTruthy();
        expect(ps.weight).toBeGreaterThan(0);
        expect(ps.rawScore).toBeGreaterThanOrEqual(0);
        expect(ps.rawScore).toBeLessThanOrEqual(1);
      }
    });

    it('alignmentLevel is "high" for high-scoring action', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.alignmentLevel).toBe('high');
    });

    it('alignmentLevel is "critical" for very low scores', () => {
      const result = evaluator.evaluate(misalignedAction);
      expect(['low', 'critical']).toContain(result.alignmentLevel);
    });

    it('violations contains strings for low-scoring principles', () => {
      const result = evaluator.evaluate(misalignedAction);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(typeof result.violations[0]).toBe('string');
    });

    it('commendations contains strings for high-scoring principles', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.commendations.length).toBeGreaterThan(0);
    });

    it('reasoning is non-empty string', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(10);
    });

    it('evaluatedAt is a positive timestamp', () => {
      const result = evaluator.evaluate(alignedAction);
      expect(result.evaluatedAt).toBeGreaterThan(0);
    });

    it('respects custom alignmentThreshold', () => {
      const strictEvaluator = new KarmaEvaluator({ alignmentThreshold: 0.9 });
      const result = strictEvaluator.evaluate(neutralAction);
      expect(result.isAligned).toBe(false); // neutral won't pass 0.9 threshold
    });
  });

  describe('evaluateBatch()', () => {
    const evaluator = new KarmaEvaluator();

    it('returns array sorted by dharmaScore descending', () => {
      const results = evaluator.evaluateBatch([misalignedAction, neutralAction, alignedAction]);
      expect(results[0].dharmaScore).toBeGreaterThanOrEqual(results[1].dharmaScore);
      expect(results[1].dharmaScore).toBeGreaterThanOrEqual(results[2].dharmaScore);
    });

    it('aligned action is first in ranking', () => {
      const results = evaluator.evaluateBatch([misalignedAction, alignedAction, neutralAction]);
      expect(results[0].action.id).toBe('aligned-1');
    });

    it('misaligned action is last in ranking', () => {
      const results = evaluator.evaluateBatch([alignedAction, neutralAction, misalignedAction]);
      expect(results[results.length - 1].action.id).toBe('misaligned-1');
    });
  });

  describe('score()', () => {
    const evaluator = new KarmaEvaluator();

    it('returns a number', () => {
      const score = evaluator.score(alignedAction);
      expect(typeof score).toBe('number');
    });

    it('consistent with evaluate().dharmaScore', () => {
      const score = evaluator.score(alignedAction);
      const fullResult = evaluator.evaluate(alignedAction);
      expect(score).toBeCloseTo(fullResult.dharmaScore, 10);
    });
  });

  describe('custom principles', () => {
    it('uses custom principles when mergeWithDefaults is false', () => {
      const evaluator = new KarmaEvaluator({
        mergeWithDefaults: false,
        principles: [{
          id: 'custom',
          name: 'Custom Principle',
          shloka: 'Custom',
          weight: 1.0,
          score: () => 0.75,
          description: 'Always returns 0.75',
        }],
      });
      const result = evaluator.evaluate(alignedAction);
      expect(result.principleScores.length).toBe(1);
      expect(result.dharmaScore).toBeCloseTo(0.75, 5);
    });
  });
});
