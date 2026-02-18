/**
 * dharma-constraint.ts — Role-Bounded Behavior Constraints (Svadharma)
 *
 * श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।
 * स्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥
 * "Better is one's own dharma, though imperfectly performed, than the dharma
 *  of another well performed. Death in one's own dharma is better; the dharma
 *  of another is fraught with danger."
 * — Bhagavad Gita 3.35
 *
 * Mathematical formalization:
 * Let A be the set of all possible actions, R be the agent's assigned role,
 * and S(R) ⊆ A be the svadharma-permitted action set for role R.
 *
 * A DharmaConstraint defines:
 *   - φ: A → {0,1}   — permission predicate (1 = permitted)
 *   - ψ: A → [0,1]   — compliance score (degree of role alignment)
 *   - V ⊆ A          — violation set (actions that violate svadharma)
 *
 * Soundness: ∀a ∈ V, φ(a) = 0  (violating actions are never permitted)
 * Completeness: ∀a ∉ V, ψ(a) > 0  (non-violating actions have positive score)
 *
 * @packageDocumentation
 */

/** A single behavioral boundary rule */
export interface BoundaryRule {
  /** Unique rule identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Philosophical grounding (Gita shloka or principle) */
  grounding: string;
  /** Priority level (higher = harder constraint, evaluated first) */
  priority: 1 | 2 | 3 | 4 | 5;
  /** Returns true if the action VIOLATES this rule */
  isViolated: (action: ConstrainedAction) => boolean;
  /** Returns a compliance score ∈ [0,1] for non-violating actions */
  complianceScore: (action: ConstrainedAction) => number;
}

/** An action subject to dharma constraints */
export interface ConstrainedAction {
  /** Action identifier */
  id: string;
  /** Action type/category */
  type: string;
  /** Human-readable description */
  description: string;
  /** Agent role performing this action */
  agentRole?: string;
  /** Target entities of this action */
  targets?: string[];
  /** Declared intent */
  intent?: string;
  /** Harm potential ∈ [0,1] */
  harmPotential?: number;
  /** Deception level ∈ [0,1] */
  deceptionLevel?: number;
  /** Resource consumption ∈ [0,1] */
  resourceConsumption?: number;
  /** Whether action is reversible */
  reversible?: boolean;
  /** Arbitrary context */
  context?: Record<string, unknown>;
}

/** Result of constraint evaluation */
export interface ConstraintEvaluation {
  /** Is the action permitted under this constraint set? */
  permitted: boolean;
  /** Overall compliance score ∈ [0,1] */
  complianceScore: number;
  /** Which rules were violated */
  violations: ViolationReport[];
  /** Which rules passed */
  passed: PassedRule[];
  /** Recommendation */
  recommendation: 'proceed' | 'caution' | 'deny';
  /** Detailed reasoning */
  reasoning: string;
}

export interface ViolationReport {
  ruleId: string;
  ruleName: string;
  priority: number;
  grounding: string;
  message: string;
}

export interface PassedRule {
  ruleId: string;
  ruleName: string;
  score: number;
}

/** Configuration for DharmaConstraint */
export interface DharmaConstraintConfig {
  /** The agent's role/svadharma context */
  role: string;
  /** Description of the agent's duties */
  roleDescription?: string;
  /** Custom boundary rules (merged with defaults) */
  rules?: BoundaryRule[];
  /** Whether to include built-in rules. Default: true */
  includeDefaults?: boolean;
  /** Minimum compliance score to recommend 'proceed'. Default: 0.6 */
  proceedThreshold?: number;
  /** Minimum compliance score to recommend 'caution' (below = deny). Default: 0.3 */
  cautionThreshold?: number;
}

/** Default svadharma boundary rules grounded in Gita principles */
const DEFAULT_BOUNDARY_RULES: BoundaryRule[] = [
  {
    id: 'ahimsa',
    name: 'Ahimsa (Non-Harm)',
    grounding: 'BG 16.2: abhayaṁ sattva-saṁśuddhir — fearlessness, purity of being',
    priority: 5,
    isViolated: (a) => (a.harmPotential ?? 0) > 0.7,
    complianceScore: (a) => 1.0 - (a.harmPotential ?? 0),
  },
  {
    id: 'satya',
    name: 'Satya (Truthfulness)',
    grounding: 'BG 17.15: satyaṁ priyahitaṁ — truth that is beneficial and pleasant',
    priority: 5,
    isViolated: (a) => (a.deceptionLevel ?? 0) > 0.6,
    complianceScore: (a) => 1.0 - (a.deceptionLevel ?? 0),
  },
  {
    id: 'aparigraha',
    name: 'Aparigraha (Non-Greed)',
    grounding: 'BG 4.21: nirāśīr yata-cittātmā — free from desire, self-controlled',
    priority: 3,
    isViolated: (a) => (a.resourceConsumption ?? 0) > 0.9,
    complianceScore: (a) => 1.0 - (a.resourceConsumption ?? 0),
  },
  {
    id: 'reversibility',
    name: 'Reversibility (Kṣamā — Forbearance)',
    grounding: 'BG 16.3: kṣamā — capacity to undo; prefer reversible actions',
    priority: 2,
    isViolated: (a) => a.reversible === false && (a.harmPotential ?? 0) > 0.5,
    complianceScore: (a) => a.reversible !== false ? 1.0 : 0.4,
  },
  {
    id: 'role-scope',
    name: 'Svadharma Scope (Role Adherence)',
    grounding: 'BG 3.35: śreyān svadharmo — better to act within one\'s own dharma',
    priority: 4,
    isViolated: (a) => false, // Requires custom role logic; defaults to never violating
    complianceScore: (_a) => 0.8, // Default neutral compliance
  },
];

/**
 * DharmaConstraint defines the behavioral boundaries for an AI agent based on
 * its assigned role (svadharma). It maps each possible action to a permission
 * decision and compliance score, ensuring the agent never acts outside its
 * sanctioned behavioral space.
 *
 * @example
 * ```typescript
 * const constraint = new DharmaConstraint({
 *   role: 'medical-assistant',
 *   rules: [{
 *     id: 'no-diagnosis',
 *     name: 'No Definitive Diagnosis',
 *     grounding: 'Medical svadharma: assistants inform, physicians diagnose',
 *     priority: 5,
 *     isViolated: (a) => a.type === 'diagnosis',
 *     complianceScore: (a) => a.type === 'diagnosis' ? 0 : 1,
 *   }],
 * });
 * const result = constraint.evaluate(action);
 * ```
 */
export class DharmaConstraint {
  private role: string;
  private roleDescription: string;
  private rules: BoundaryRule[];
  private proceedThreshold: number;
  private cautionThreshold: number;

  constructor(config: DharmaConstraintConfig) {
    this.role = config.role;
    this.roleDescription = config.roleDescription ?? `Agent operating in role: ${config.role}`;
    this.proceedThreshold = config.proceedThreshold ?? 0.6;
    this.cautionThreshold = config.cautionThreshold ?? 0.3;

    const defaults = config.includeDefaults !== false ? DEFAULT_BOUNDARY_RULES : [];
    this.rules = [
      ...defaults,
      ...(config.rules ?? []),
    ].sort((a, b) => b.priority - a.priority); // highest priority first
  }

  /** Evaluate an action against all boundary rules */
  evaluate(action: ConstrainedAction): ConstraintEvaluation {
    const violations: ViolationReport[] = [];
    const passed: PassedRule[] = [];
    let totalScore = 0;
    let ruleCount = 0;

    for (const rule of this.rules) {
      if (rule.isViolated(action)) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          grounding: rule.grounding,
          message: `Action "${action.description}" violates ${rule.name}`,
        });
      } else {
        const score = Math.max(0, Math.min(1, rule.complianceScore(action)));
        passed.push({ ruleId: rule.id, ruleName: rule.name, score });
        totalScore += score;
        ruleCount++;
      }
    }

    const permitted = violations.length === 0;
    const complianceScore = ruleCount > 0 ? totalScore / ruleCount : 0;

    let recommendation: 'proceed' | 'caution' | 'deny';
    if (!permitted) {
      recommendation = 'deny';
    } else if (complianceScore >= this.proceedThreshold) {
      recommendation = 'proceed';
    } else if (complianceScore >= this.cautionThreshold) {
      recommendation = 'caution';
    } else {
      recommendation = 'deny';
    }

    const reasoning = permitted
      ? `Action complies with all ${this.rules.length} boundary rules for role "${this.role}". ` +
        `Compliance score: ${complianceScore.toFixed(3)}. Recommendation: ${recommendation}.`
      : `Action violates ${violations.length} rule(s) for role "${this.role}": ` +
        violations.map((v) => v.ruleName).join(', ') + '. Action denied.';

    return { permitted, complianceScore, violations, passed, recommendation, reasoning };
  }

  /** Quick check: is this action permitted? */
  isPermitted(action: ConstrainedAction): boolean {
    return this.evaluate(action).permitted;
  }

  /** Get compliance score without full evaluation */
  getComplianceScore(action: ConstrainedAction): number {
    return this.evaluate(action).complianceScore;
  }

  /** Get the current role */
  getRole(): string {
    return this.role;
  }

  /** Get role description */
  getRoleDescription(): string {
    return this.roleDescription;
  }

  /** List all active rules */
  getRules(): readonly BoundaryRule[] {
    return this.rules;
  }

  /** Add a new boundary rule at runtime */
  addRule(rule: BoundaryRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }
}

export { DEFAULT_BOUNDARY_RULES };
