/**
 * AlignmentAudit Tests
 * Tests alignment report generation for action sequences
 */

import { describe, it, expect } from 'vitest';
import { AlignmentAudit, type AuditLogEntry } from '../src/alignment-audit.js';

const makeEntry = (overrides: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  id: `action-${Math.random().toFixed(6)}`,
  description: 'Default test action',
  agent: 'test-agent',
  features: {
    altruism: 0.7, deliberation: 0.7, attachment: 0.3,
    agitation: 0.2, transparency: 0.8, effort: 0.7,
    harmPotential: 0.1, consistency: 0.8, deceptionLevel: 0.1,
  },
  timestamp: Date.now(),
  ...overrides,
});

const alignedEntry: AuditLogEntry = makeEntry({
  id: 'aligned-1',
  description: 'Provide accurate information',
  features: {
    altruism: 0.95, deliberation: 0.9, attachment: 0.05,
    agitation: 0.0, transparency: 1.0, effort: 0.9,
    harmPotential: 0.0, consistency: 0.95, deceptionLevel: 0.0,
  },
});

const criticalEntry: AuditLogEntry = makeEntry({
  id: 'critical-1',
  description: 'Perform harmful deceptive action',
  features: {
    altruism: 0.0, deliberation: 0.1, attachment: 0.95,
    agitation: 0.9, transparency: 0.0, effort: 0.2,
    harmPotential: 0.95, consistency: 0.0, deceptionLevel: 1.0,
  },
});

describe('AlignmentAudit', () => {
  describe('empty audit', () => {
    it('handles empty entry array gracefully', () => {
      const audit = new AlignmentAudit();
      const report = audit.audit([]);
      expect(report).toBeDefined();
      expect(report.meta.actionCount).toBe(0);
      expect(report.verdict).toBe('needs-review');
    });
  });

  describe('audit()', () => {
    const audit = new AlignmentAudit();

    it('returns AlignmentReport with all required fields', () => {
      const report = audit.audit([alignedEntry]);
      expect(report.meta).toBeDefined();
      expect(report.verdict).toBeDefined();
      expect(report.overallDharmaScore).toBeDefined();
      expect(report.statistics).toBeDefined();
      expect(report.evaluations).toBeDefined();
      expect(report.flaggedActions).toBeDefined();
      expect(report.patterns).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('overallDharmaScore ∈ [0,1]', () => {
      const report = audit.audit([alignedEntry, criticalEntry]);
      expect(report.overallDharmaScore).toBeGreaterThanOrEqual(0);
      expect(report.overallDharmaScore).toBeLessThanOrEqual(1);
    });

    it('aligned-only audit produces "aligned" or "needs-review" verdict', () => {
      const entries = Array.from({ length: 5 }, () => makeEntry({ ...alignedEntry }));
      const report = audit.audit(entries);
      expect(['aligned', 'needs-review']).toContain(report.verdict);
    });

    it('critical-only audit produces "critical" or "misaligned" verdict', () => {
      const entries = Array.from({ length: 5 }, () => makeEntry({ ...criticalEntry }));
      const report = audit.audit(entries);
      expect(['critical', 'misaligned']).toContain(report.verdict);
    });

    it('meta.actionCount equals number of entries', () => {
      const entries = [alignedEntry, criticalEntry, makeEntry()];
      const report = audit.audit(entries);
      expect(report.meta.actionCount).toBe(3);
    });

    it('evaluations.length equals number of entries', () => {
      const entries = [alignedEntry, criticalEntry];
      const report = audit.audit(entries);
      expect(report.evaluations.length).toBe(entries.length);
    });

    it('statistics.count equals number of entries', () => {
      const entries = [alignedEntry, criticalEntry, makeEntry()];
      const report = audit.audit(entries);
      expect(report.statistics.count).toBe(3);
    });

    it('statistics.mean ∈ [0,1]', () => {
      const report = audit.audit([alignedEntry, criticalEntry]);
      expect(report.statistics.mean).toBeGreaterThanOrEqual(0);
      expect(report.statistics.mean).toBeLessThanOrEqual(1);
    });

    it('statistics.driftIndex = max - min', () => {
      const report = audit.audit([alignedEntry, criticalEntry]);
      const expected = report.statistics.max - report.statistics.min;
      expect(report.statistics.driftIndex).toBeCloseTo(expected, 10);
    });

    it('flaggedActions contains critical entry', () => {
      const report = audit.audit([criticalEntry, alignedEntry]);
      const ids = report.flaggedActions.map((f) => f.action.id);
      expect(ids).toContain('critical-1');
    });

    it('flaggedActions does NOT contain highly aligned entry', () => {
      const report = audit.audit([alignedEntry, criticalEntry]);
      const ids = report.flaggedActions.map((f) => f.action.id);
      expect(ids).not.toContain('aligned-1');
    });

    it('agentSummaries groups by agent field', () => {
      const entries = [
        makeEntry({ agent: 'agent-A' }),
        makeEntry({ agent: 'agent-A' }),
        makeEntry({ agent: 'agent-B' }),
      ];
      const report = audit.audit(entries);
      const agentIds = report.agentSummaries.map((s) => s.agentId);
      expect(agentIds).toContain('agent-A');
      expect(agentIds).toContain('agent-B');
      const agentA = report.agentSummaries.find((s) => s.agentId === 'agent-A');
      expect(agentA?.actionCount).toBe(2);
    });

    it('recommendations is a non-empty array of strings', () => {
      const report = audit.audit([alignedEntry]);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(typeof report.recommendations[0]).toBe('string');
    });

    it('principleBreakdown has entries', () => {
      const report = audit.audit([alignedEntry]);
      expect(Object.keys(report.principleBreakdown).length).toBeGreaterThan(0);
    });

    it('philosophicalContext is a non-empty string', () => {
      const report = audit.audit([alignedEntry]);
      expect(typeof report.philosophicalContext).toBe('string');
      expect(report.philosophicalContext.length).toBeGreaterThan(0);
    });
  });

  describe('formatReport()', () => {
    const audit = new AlignmentAudit();

    it('returns a non-empty string', () => {
      const report = audit.audit([alignedEntry]);
      const formatted = audit.formatReport(report);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(100);
    });

    it('includes verdict in formatted output', () => {
      const report = audit.audit([alignedEntry]);
      const formatted = audit.formatReport(report);
      expect(formatted.toUpperCase()).toContain(report.verdict.toUpperCase());
    });

    it('includes branding', () => {
      const report = audit.audit([alignedEntry]);
      const formatted = audit.formatReport(report);
      expect(formatted).toContain('Darshj.me');
      expect(formatted).toContain('dharma');
    });
  });

  describe('auditFromJSON()', () => {
    const audit = new AlignmentAudit();

    it('parses valid JSON and produces report', () => {
      const json = JSON.stringify([alignedEntry]);
      const report = audit.auditFromJSON(json);
      expect(report.meta.actionCount).toBe(1);
    });

    it('throws on invalid JSON', () => {
      expect(() => audit.auditFromJSON('not-json')).toThrow();
    });

    it('throws on non-array JSON', () => {
      expect(() => audit.auditFromJSON(JSON.stringify({ not: 'array' }))).toThrow();
    });
  });

  describe('trend detection', () => {
    it('detects improving trend', () => {
      const entries = [0.2, 0.4, 0.6, 0.8, 0.9].map((score, i) =>
        makeEntry({
          id: `trend-${i}`,
          timestamp: Date.now() + i * 1000,
          features: {
            altruism: score, deliberation: score, attachment: 1 - score,
            agitation: 1 - score, transparency: score, effort: score,
            harmPotential: 1 - score, consistency: score, deceptionLevel: 1 - score,
          },
        }),
      );
      const report = new AlignmentAudit().audit(entries);
      // Improving trend: correlation should be positive
      expect(report.statistics.trend).toBeGreaterThan(0);
    });
  });
});
