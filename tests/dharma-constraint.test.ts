/**
 * DharmaConstraint Tests
 * Tests role-bounded behavior constraints (Svadharma)
 */

import { describe, it, expect } from 'vitest';
import { DharmaConstraint, DEFAULT_BOUNDARY_RULES, type ConstrainedAction } from '../src/dharma-constraint.js';

const safeAction: ConstrainedAction = {
  id: 'test-1',
  type: 'information',
  description: 'Provide factual information',
  harmPotential: 0.05,
  deceptionLevel: 0.0,
  reversible: true,
};

const harmfulAction: ConstrainedAction = {
  id: 'test-2',
  type: 'harmful',
  description: 'Take harmful action',
  harmPotential: 0.9,
  deceptionLevel: 0.0,
  reversible: false,
};

const deceptiveAction: ConstrainedAction = {
  id: 'test-3',
  type: 'deception',
  description: 'Mislead user',
  harmPotential: 0.1,
  deceptionLevel: 0.8,
  reversible: true,
};

const highResourceAction: ConstrainedAction = {
  id: 'test-4',
  type: 'resource-intensive',
  description: 'Consume excessive resources',
  harmPotential: 0.1,
  deceptionLevel: 0.0,
  reversible: true,
  resourceConsumption: 0.95,
};

describe('DharmaConstraint', () => {
  describe('constructor', () => {
    it('initializes with default rules when includeDefaults is true', () => {
      const constraint = new DharmaConstraint({ role: 'assistant' });
      expect(constraint.getRules().length).toBeGreaterThan(0);
    });

    it('initializes without default rules when includeDefaults is false', () => {
      const constraint = new DharmaConstraint({ role: 'assistant', includeDefaults: false });
      expect(constraint.getRules().length).toBe(0);
    });

    it('merges custom rules with defaults', () => {
      const constraint = new DharmaConstraint({
        role: 'assistant',
        rules: [{
          id: 'custom',
          name: 'Custom Rule',
          grounding: 'Custom',
          priority: 3,
          isViolated: () => false,
          complianceScore: () => 0.8,
        }],
      });
      expect(constraint.getRules().length).toBeGreaterThan(DEFAULT_BOUNDARY_RULES.length);
    });

    it('getRole() returns the configured role', () => {
      const constraint = new DharmaConstraint({ role: 'medical-assistant' });
      expect(constraint.getRole()).toBe('medical-assistant');
    });

    it('getRoleDescription() returns description', () => {
      const constraint = new DharmaConstraint({
        role: 'assistant',
        roleDescription: 'General purpose assistant',
      });
      expect(constraint.getRoleDescription()).toBe('General purpose assistant');
    });
  });

  describe('evaluate()', () => {
    const constraint = new DharmaConstraint({ role: 'assistant' });

    it('permits safe actions', () => {
      const result = constraint.evaluate(safeAction);
      expect(result.permitted).toBe(true);
    });

    it('denies harmful actions (harmPotential > 0.7)', () => {
      const result = constraint.evaluate(harmfulAction);
      expect(result.permitted).toBe(false);
    });

    it('denies deceptive actions (deceptionLevel > 0.6)', () => {
      const result = constraint.evaluate(deceptiveAction);
      expect(result.permitted).toBe(false);
    });

    it('returns violations array for denied actions', () => {
      const result = constraint.evaluate(harmfulAction);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].ruleName).toBeTruthy();
    });

    it('returns passed rules for permitted actions', () => {
      const result = constraint.evaluate(safeAction);
      expect(result.passed.length).toBeGreaterThan(0);
    });

    it('complianceScore ∈ [0,1]', () => {
      const result = constraint.evaluate(safeAction);
      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(1);
    });

    it('recommendation is "deny" for violations', () => {
      const result = constraint.evaluate(harmfulAction);
      expect(result.recommendation).toBe('deny');
    });

    it('recommendation is "proceed" for compliant actions', () => {
      const result = constraint.evaluate(safeAction);
      expect(result.recommendation).toBe('proceed');
    });

    it('reasoning is a non-empty string', () => {
      const result = constraint.evaluate(safeAction);
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('flags high resource consumption', () => {
      const result = constraint.evaluate(highResourceAction);
      // High resource consumption (>0.9) violates aparigraha
      expect(result.violations.some((v) => v.ruleId === 'aparigraha')).toBe(true);
    });
  });

  describe('isPermitted()', () => {
    const constraint = new DharmaConstraint({ role: 'assistant' });

    it('returns true for safe action', () => {
      expect(constraint.isPermitted(safeAction)).toBe(true);
    });

    it('returns false for harmful action', () => {
      expect(constraint.isPermitted(harmfulAction)).toBe(false);
    });
  });

  describe('getComplianceScore()', () => {
    const constraint = new DharmaConstraint({ role: 'assistant' });

    it('returns a number in [0,1]', () => {
      const score = constraint.getComplianceScore(safeAction);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('safe action has higher score than harmful action', () => {
      const safeScore = constraint.getComplianceScore(safeAction);
      const harmScore = constraint.getComplianceScore(harmfulAction);
      expect(safeScore).toBeGreaterThan(harmScore);
    });
  });

  describe('addRule()', () => {
    it('adds a new rule at runtime', () => {
      const constraint = new DharmaConstraint({ role: 'assistant', includeDefaults: false });
      expect(constraint.getRules().length).toBe(0);
      constraint.addRule({
        id: 'custom',
        name: 'Custom',
        grounding: 'Custom',
        priority: 3,
        isViolated: () => false,
        complianceScore: () => 0.9,
      });
      expect(constraint.getRules().length).toBe(1);
    });
  });

  describe('custom rules', () => {
    it('custom isViolated determines permission', () => {
      const constraint = new DharmaConstraint({
        role: 'code-assistant',
        includeDefaults: false,
        rules: [{
          id: 'no-delete',
          name: 'No File Deletion',
          grounding: 'Svadharma of code assistant',
          priority: 5,
          isViolated: (a) => a.type === 'file-delete',
          complianceScore: () => 1.0,
        }],
      });

      const deleteAction: ConstrainedAction = {
        id: 'del-1',
        type: 'file-delete',
        description: 'Delete file',
      };

      const readAction: ConstrainedAction = {
        id: 'read-1',
        type: 'file-read',
        description: 'Read file',
      };

      expect(constraint.isPermitted(deleteAction)).toBe(false);
      expect(constraint.isPermitted(readAction)).toBe(true);
    });
  });
});
