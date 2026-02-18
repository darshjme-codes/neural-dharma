/**
 * neural-dharma — AI Alignment Framework Based on Bhagavad Gita Principles
 *
 * कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
 * मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥
 * "You have the right to work only, but never to its fruits.
 *  Let not the fruits of action be your motive, nor let your attachment be to inaction."
 * — Bhagavad Gita 2.47
 *
 * Tagline: "Aligned by dharma. Governed by karma."
 * By Darshj.me
 *
 * @packageDocumentation
 */

// ── Core: existing modules ──────────────────────────────────────────────────

export {
  NishkamaOptimizer,
  type NishkamaOptimizerConfig,
  type Action,
  type OptimizationResult,
  type DharmicPrinciple,
} from './nishkama-optimizer.js';

export {
  SthitaprajnaGuard,
  type SthitaprajnaGuardConfig,
  type GuardDecision,
  type PerturbationAnalysis,
  type ThreatPattern,
} from './sthitaprajna-guard.js';

export {
  GunaClassifier,
  type GunaClassifierConfig,
  type GunaClassification,
  type FeatureVector,
  type Guna,
  type GunaWeights,
} from './guna-classifier.js';

export {
  KarmaLogger,
  type KarmaLoggerConfig,
  type KarmaEntry,
  type Consequence,
} from './karma-logger.js';

export {
  VivekaFilter,
  type VivekaFilterConfig,
  type VivekaVerdict,
  type EthicalBoundary,
  type ActionCandidate,
} from './viveka-filter.js';

// ── New: extended alignment modules ─────────────────────────────────────────

export {
  DharmaConstraint,
  DEFAULT_BOUNDARY_RULES,
  type DharmaConstraintConfig,
  type BoundaryRule,
  type ConstrainedAction,
  type ConstraintEvaluation,
  type ViolationReport,
  type PassedRule,
} from './dharma-constraint.js';

export {
  KarmaEvaluator,
  CORE_PRINCIPLES,
  type KarmaEvaluatorConfig,
  type EvaluationPrinciple,
  type EvaluatedAction,
  type KarmaEvaluation,
  type PrincipleScore,
} from './karma-evaluator.js';

export {
  NishkamaObjective,
  type NishkamaObjectiveConfig,
  type RewardFunction,
  type ProcessQualityInput,
  type ObjectiveResult,
} from './nishkama-objective.js';

export {
  AlignmentAudit,
  type AlignmentAuditConfig,
  type AuditLogEntry,
  type AlignmentReport,
  type AlignmentStatistics,
  type AgentSummary,
} from './alignment-audit.js';

export {
  GitaVerse,
  SHLOKA_DATABASE,
  type GitaShloka,
  type AlignmentCategory,
  type VerseSearchOptions,
  type ConceptMapping,
  type TransliterationStyle,
} from './gita-verse.js';
