/**
 * neural-dharma — AI Alignment Framework Based on Bhagavad Gita
 *
 * योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।
 * सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥
 * "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure.
 *  Such equanimity is called yoga."
 * — Bhagavad Gita 2.48
 *
 * @packageDocumentation
 */

export { NishkamaOptimizer, type NishkamaOptimizerConfig, type Action, type OptimizationResult, type DharmicPrinciple } from './nishkama-optimizer';
export { SthitaprajnaGuard, type SthitaprajnaGuardConfig, type GuardDecision, type PerturbationAnalysis, type ThreatPattern } from './sthitaprajna-guard';
export { GunaClassifier, type GunaClassifierConfig, type GunaClassification, type FeatureVector, type Guna, type GunaWeights } from './guna-classifier';
export { KarmaLogger, type KarmaLoggerConfig, type KarmaEntry, type Consequence } from './karma-logger';
export { VivekaFilter, type VivekaFilterConfig, type VivekaVerdict, type EthicalBoundary, type ActionCandidate } from './viveka-filter';
