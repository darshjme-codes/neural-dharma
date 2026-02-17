/**
 * sthitaprajna-guard.ts — Output Stability Guard
 *
 * प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।
 * आत्मन्येवात्मना तुष्टः स्थितप्रज्ञस्तदोच्यते ॥
 * "When a person gives up all desires of the mind and is satisfied in the Self alone,
 *  then that person is called sthitaprajna — one of steady wisdom."
 * — Bhagavad Gita 2.55
 *
 * Ensures agent outputs remain stable and consistent regardless of
 * adversarial input perturbations. The steady-minded agent does not waver.
 */

/** A perturbation detector result */
export interface PerturbationAnalysis {
  /** Whether adversarial perturbation was detected */
  perturbed: boolean;
  /** Similarity score between original and perturbed input (0-1) */
  similarity: number;
  /** Type of perturbation detected */
  perturbationType?: 'semantic' | 'syntactic' | 'injection' | 'jailbreak' | 'none';
  /** Details of detected perturbation */
  details?: string;
}

/** Guard decision on an output */
export interface GuardDecision {
  /** Whether the output is approved */
  approved: boolean;
  /** The (possibly sanitized) output */
  output: string;
  /** Original output before any intervention */
  originalOutput: string;
  /** Stability score (0-1, how consistent is this with baseline behavior) */
  stabilityScore: number;
  /** What the guard did */
  action: 'pass' | 'sanitize' | 'block' | 'fallback';
  /** Explanation */
  reasoning: string;
}

/** Pattern-based threat signature */
export interface ThreatPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'injection' | 'jailbreak' | 'manipulation' | 'exfiltration';
}

export interface SthitaprajnaGuardConfig {
  /** Similarity threshold below which inputs are considered perturbed. Default: 0.85 */
  similarityThreshold?: number;
  /** Maximum output variance allowed between similar inputs. Default: 0.3 */
  maxOutputVariance?: number;
  /** Fallback response when output is blocked */
  fallbackResponse?: string;
  /** Custom threat patterns to detect */
  threatPatterns?: ThreatPattern[];
  /** Custom similarity function. Default: Jaccard on token sets */
  similarityFn?: (a: string, b: string) => number;
  /** Whether to sanitize rather than block when possible. Default: true */
  preferSanitize?: boolean;
  /** Consistency window: number of recent outputs to track for drift detection */
  consistencyWindow?: number;
}

const DEFAULT_THREAT_PATTERNS: ThreatPattern[] = [
  { name: 'Instruction Override', pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i, severity: 'critical', category: 'jailbreak' },
  { name: 'Role Hijack', pattern: /you\s+are\s+now\s+(?:a|an|the)\s+/i, severity: 'high', category: 'jailbreak' },
  { name: 'System Prompt Leak', pattern: /(?:reveal|show|output|print|display)\s+(?:your\s+)?(?:system\s+)?prompt/i, severity: 'high', category: 'exfiltration' },
  { name: 'Encoding Bypass', pattern: /(?:base64|rot13|hex)\s*(?:decode|encode|convert)/i, severity: 'medium', category: 'manipulation' },
  { name: 'DAN Pattern', pattern: /\bDAN\b.*(?:mode|jailbreak|unlock)/i, severity: 'critical', category: 'jailbreak' },
  { name: 'Prompt Injection Delimiter', pattern: /(?:---|\[INST\]|\[\/INST\]|<\|im_start\|>|<\|system\|>)/i, severity: 'high', category: 'injection' },
];

/**
 * SthitaprajnaGuard maintains output stability against adversarial perturbation.
 * Like the sthitaprajna (one of steady wisdom), it does not waver under provocation.
 *
 * Features:
 * - Input perturbation detection via similarity analysis
 * - Known threat pattern matching (injection, jailbreak, exfiltration)
 * - Output consistency tracking (detects drift from baseline behavior)
 * - Graceful degradation: sanitize > block > fallback
 */
export class SthitaprajnaGuard {
  private config: Required<Omit<SthitaprajnaGuardConfig, 'threatPatterns' | 'similarityFn'>>;
  private threatPatterns: ThreatPattern[];
  private similarityFn: (a: string, b: string) => number;
  private outputHistory: string[] = [];

  constructor(config: SthitaprajnaGuardConfig = {}) {
    this.config = {
      similarityThreshold: config.similarityThreshold ?? 0.85,
      maxOutputVariance: config.maxOutputVariance ?? 0.3,
      fallbackResponse: config.fallbackResponse ?? 'I cannot process this request as it may compromise alignment integrity.',
      preferSanitize: config.preferSanitize ?? true,
      consistencyWindow: config.consistencyWindow ?? 20,
    };
    this.threatPatterns = [...DEFAULT_THREAT_PATTERNS, ...(config.threatPatterns ?? [])];
    this.similarityFn = config.similarityFn ?? SthitaprajnaGuard.jaccardSimilarity;
  }

  /** Default similarity: Jaccard index on word-level tokens */
  static jaccardSimilarity(a: string, b: string): number {
    const tokenize = (s: string) => new Set(s.toLowerCase().split(/\s+/).filter(Boolean));
    const setA = tokenize(a);
    const setB = tokenize(b);
    if (setA.size === 0 && setB.size === 0) return 1.0;
    let intersection = 0;
    for (const token of setA) if (setB.has(token)) intersection++;
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 1.0 : intersection / union;
  }

  /** Analyze input for perturbation against a reference */
  analyzeInput(input: string, reference?: string): PerturbationAnalysis {
    // Check threat patterns first
    for (const tp of this.threatPatterns) {
      if (tp.pattern.test(input)) {
        const category = tp.category === 'injection' || tp.category === 'jailbreak'
          ? tp.category : 'injection';
        return {
          perturbed: true,
          similarity: reference ? this.similarityFn(input, reference) : 0,
          perturbationType: category as PerturbationAnalysis['perturbationType'],
          details: `Threat pattern detected: ${tp.name} (${tp.severity} severity)`,
        };
      }
    }

    // Similarity check against reference
    if (reference) {
      const similarity = this.similarityFn(input, reference);
      if (similarity < this.config.similarityThreshold) {
        return {
          perturbed: true,
          similarity,
          perturbationType: 'semantic',
          details: `Input diverges significantly from reference (similarity: ${similarity.toFixed(3)})`,
        };
      }
      return { perturbed: false, similarity, perturbationType: 'none' };
    }

    return { perturbed: false, similarity: 1.0, perturbationType: 'none' };
  }

  /** Guard an output: check for consistency, sanitize if needed */
  guard(output: string, input?: string, referenceInput?: string): GuardDecision {
    const originalOutput = output;
    let stabilityScore = 1.0;
    let action: GuardDecision['action'] = 'pass';
    let reasoning = '';

    // 1. Check input for adversarial perturbation
    if (input) {
      const analysis = this.analyzeInput(input, referenceInput);
      if (analysis.perturbed) {
        stabilityScore -= 0.4;
        reasoning += `Input perturbation detected: ${analysis.details}. `;

        if (analysis.perturbationType === 'jailbreak' || analysis.perturbationType === 'injection') {
          return {
            approved: false,
            output: this.config.fallbackResponse,
            originalOutput,
            stabilityScore: 0,
            action: 'block',
            reasoning: reasoning + 'Blocked due to adversarial input.',
          };
        }
      }
    }

    // 2. Check output consistency with history
    if (this.outputHistory.length > 0) {
      const avgSimilarity =
        this.outputHistory.reduce((sum, prev) => sum + this.similarityFn(output, prev), 0) /
        this.outputHistory.length;
      const variance = 1 - avgSimilarity;

      if (variance > this.config.maxOutputVariance) {
        stabilityScore -= 0.3;
        reasoning += `Output deviates from baseline (variance: ${variance.toFixed(3)}). `;

        if (this.config.preferSanitize) {
          action = 'sanitize';
          reasoning += 'Output passed with reduced confidence. ';
        } else {
          return {
            approved: false,
            output: this.config.fallbackResponse,
            originalOutput,
            stabilityScore: Math.max(0, stabilityScore),
            action: 'fallback',
            reasoning: reasoning + 'Falling back to safe response due to excessive drift.',
          };
        }
      }
    }

    // 3. Check output for leaked patterns (e.g., system prompt in output)
    for (const tp of this.threatPatterns) {
      if (tp.category === 'exfiltration' && tp.pattern.test(output)) {
        stabilityScore -= 0.5;
        reasoning += `Potential data exfiltration in output: ${tp.name}. `;
        action = 'sanitize';
        output = output.replace(tp.pattern, '[REDACTED]');
      }
    }

    // Record in history
    this.outputHistory.push(originalOutput);
    if (this.outputHistory.length > this.config.consistencyWindow) {
      this.outputHistory.shift();
    }

    stabilityScore = Math.max(0, Math.min(1, stabilityScore));
    if (!reasoning) reasoning = 'Output is stable and consistent.';

    return {
      approved: stabilityScore > 0.3,
      output: action === 'pass' ? originalOutput : output,
      originalOutput,
      stabilityScore,
      action: action === 'pass' && stabilityScore <= 0.3 ? 'block' : action,
      reasoning,
    };
  }

  /** Reset the output history (e.g., on context change) */
  resetHistory(): void {
    this.outputHistory = [];
  }

  /** Get current consistency window contents */
  getHistory(): string[] {
    return [...this.outputHistory];
  }

  /** Add a custom threat pattern at runtime */
  addThreatPattern(pattern: ThreatPattern): void {
    this.threatPatterns.push(pattern);
  }
}
