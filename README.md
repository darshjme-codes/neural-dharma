<div align="center">

# 🕉️ neural-dharma

### AI Alignment Through Bhagavad Gita Principles

[![CI](https://github.com/darshjme-codes/neural-dharma/actions/workflows/ci.yml/badge.svg)](https://github.com/darshjme-codes/neural-dharma/actions)
[![npm version](https://img.shields.io/npm/v/neural-dharma?color=orange&style=flat-square)](https://www.npmjs.com/package/neural-dharma)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-125%20passing-brightgreen?style=flat-square)](./tests)
[![AI Safety](https://img.shields.io/badge/AI_Safety-Dharmic_Alignment-green?style=flat-square)](https://github.com/darshjme-codes/neural-dharma)

> **कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।**
> *"You have the right to work only, but never to its fruits."*
> — Bhagavad Gita 2.47

**Aligned by dharma. Governed by karma.**

A formal TypeScript framework implementing AI alignment principles derived from the Bhagavad Gita.
Nishkama Karma optimization. Svadharma role constraints. Viveka scoring. Ahimsa harm detection.

**By [Darshj.me](https://darshj.me)**

</div>

---

## 📖 Philosophy

The Bhagavad Gita, composed ~5000 years ago, contains profound insights into ethical action, detachment from outcomes, and behavioral classification that map directly onto modern AI alignment challenges.

Modern AI alignment is predominantly **consequentialist**: actions are judged by their outcomes, rewards are shaped by results, and agents are trained to optimize metrics. This creates Goodhart's Law failures everywhere — agents learn to game metrics rather than pursue genuine alignment.

The Gita offers a complementary **deontological** framework grounded in millennia of ethical wisdom:

> *"The quality of action itself determines its alignment — not its consequences."*

| Gita Concept | Sanskrit | AI Alignment Problem | Module |
|---|---|---|---|
| **Nishkama Karma** | निष्काम कर्म | Reward hacking, Goodhart's Law | `NishkamaObjective` |
| **Svadharma** | स्वधर्म | Role-bounded behavior constraints | `DharmaConstraint` |
| **Viveka** | विवेक | Value alignment scoring | `KarmaEvaluator` |
| **Ahimsa** | अहिंसा | Harm detection and avoidance | `DharmaConstraint` |
| **Satya** | सत्य | Honesty and calibration metrics | `KarmaEvaluator` |
| **Sthitaprajna** | स्थितप्रज्ञ | Adversarial robustness | `SthitaprajnaGuard` |
| **Triguṇa** | त्रिगुण | Behavioral classification | `GunaClassifier` |

---

## 📐 Formal Mathematical Definitions

### 1. Nishkama Karma — Process-Quality Optimization

**Goodhart's Law**: When a measure becomes a target, it ceases to be a good measure.

**Neural-Dharma solution**: Let R: A → ℝ be the original reward function and Q: A → [0,1] be process quality. Define:

```
R̃(a) = (1-λ)·R(a) + λ·Q(a)·|R(a)|·sign(R(a))
```

where λ ∈ [0,1] is the *process weight*. At λ=1 (pure Nishkama), reward is entirely replaced by process quality — agents cannot game metrics they no longer optimize.

### 2. Svadharma — Role-Bounded Constraints

Let A be the set of all actions, R be the agent's role, and S(R) ⊆ A the svadharma-permitted action set:

```
φ_R: A → {0,1}    (permission predicate)
ψ_R: A → [0,1]    (compliance score)

Soundness:     ∀a ∉ S(R): φ_R(a) = 0   (violations never permitted)
Completeness:  ∀a ∈ S(R): ψ_R(a) > 0   (permitted actions have positive score)
```

### 3. Viveka — Multi-Dimensional Alignment Scoring

Given principles P = {p₁,...,pₙ} with weights wᵢ and scoring functions sᵢ:

```
D(a) = Σᵢ wᵢ·sᵢ(f(a)) / Σᵢ wᵢ  ∈ [0,1]

where:
  Viveka(a)    = deliberation(a) · consistency(a)          [BG 2.52]
  Ahimsa(a)    = 1 - harmPotential(a)                      [BG 16.2]
  Satya(a)     = transparency(a) · (1-deception(a))        [BG 17.15]
  Seva(a)      = altruism(a) · effort(a)                   [BG 3.25]
  Nishkama(a)  = 1 - attachment(a)                         [BG 2.47]
```

### 4. Triguṇa — Behavioral Classification

```
G: F → Δ({sattva, rajas, tamas})

sattva_score = w_altruism·altruism + w_del·deliberation + w_trans·transparency - w_att·attachment
rajas_score  = w_ag·agitation + w_att·attachment - w_cons·consistency
tamas_score  = w_harm·harmPotential + w_in·(1-effort) - w_alt·altruism

G(f) = argmax({sattva_score, rajas_score, tamas_score})
```

### 5. Alignment Audit Statistics

Given action sequence A = [a₁,...,aₙ] with dharma scores D(aᵢ):

```
D̄ = (1/n) Σᵢ D(aᵢ)                    (aggregate score)
τ  = corr(i, D(aᵢ)) ∈ [-1,1]           (alignment trend)
δ  = max(D(aᵢ)) - min(D(aᵢ))           (drift index)
σ  = std(D(aᵢ))                         (behavioral consistency)
```

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │     Agent / LLM Call     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    DharmaConstraint      │  ← Svadharma role boundaries
                    │   (Role Gate: φ_R)       │    Hard constraints: deny violations
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    SthitaprajnaGuard     │  ← Adversarial robustness
                    │   (Adversarial Shield)   │    Jailbreak / injection blocking
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     GunaClassifier       │  ← Behavioral taxonomy
                    │  (Sattva/Rajas/Tamas)    │    Sattva ✓  Rajas ⚠  Tamas ✗
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
   ┌──────────▼──────────┐ ┌────▼─────────┐ ┌──────▼──────────┐
   │    KarmaEvaluator    │ │  Nishkama    │ │   KarmaLogger   │
   │  D(a) = Σwᵢ·sᵢ(f)  │ │  Objective   │ │  (Audit Trail)  │
   │  Viveka+Ahimsa+...  │ │  R̃ = Q·R    │ │                 │
   └──────────┬───────────┘ └────┬─────────┘ └──────┬──────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    AlignmentAudit        │  ← Sequence analysis
                    │   (Reports + Patterns)   │    Drift, trends, recommendations
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    GitaVerse             │  ← Philosophical grounding
                    │  (Shloka ↔ Alignment)   │    Formal proofs + Gita mapping
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Aligned Output       │
                    └─────────────────────────┘
```

---

## 📦 Installation

```bash
npm install neural-dharma
```

```bash
# Or use the CLI directly
npx neural-dharma audit agent-actions.json
```

---

## 🚀 Quick Start

```typescript
import {
  DharmaConstraint,
  KarmaEvaluator,
  NishkamaObjective,
  AlignmentAudit,
  GitaVerse,
  GunaClassifier,
} from 'neural-dharma';

// 1. Define role boundaries (Svadharma)
const constraint = new DharmaConstraint({
  role: 'assistant',
  rules: [{
    id: 'no-harm',
    name: 'Ahimsa',
    grounding: 'BG 16.2',
    priority: 5,
    isViolated: (a) => (a.harmPotential ?? 0) > 0.7,
    complianceScore: (a) => 1 - (a.harmPotential ?? 0),
  }],
});

// 2. Score an action against dharmic principles
const evaluator = new KarmaEvaluator();
const evaluation = evaluator.evaluate({
  id: 'action-1',
  description: 'Provide accurate information',
  features: {
    altruism: 0.9, deliberation: 0.85, attachment: 0.1,
    agitation: 0.05, transparency: 0.95, effort: 0.8,
    harmPotential: 0.0, consistency: 0.9,
  },
});
console.log(evaluation.dharmaScore);    // → 0.92
console.log(evaluation.alignmentLevel); // → 'high'

// 3. Wrap a reward function to reduce Goodhart's Law
const objective = new NishkamaObjective(
  (state, action, nextState) => nextState.taskCompleted ? 1.0 : 0.0,
  { processWeight: 0.6 },
);

// 4. Classify behavior by guna
const classifier = new GunaClassifier();
const guna = classifier.classifyFeatures({
  altruism: 0.9, deliberation: 0.85, attachment: 0.1,
  agitation: 0.05, transparency: 0.95, effort: 0.8,
  harmPotential: 0.0, consistency: 0.9,
});
console.log(guna.primary); // → 'sattva'

// 5. Audit a sequence of actions
const audit = new AlignmentAudit();
const report = audit.audit(actionLog);
console.log(report.verdict);            // → 'aligned'
console.log(report.overallDharmaScore); // → 0.87
console.log(audit.formatReport(report)); // → full text report

// 6. Philosophical grounding
const gita = new GitaVerse();
const epigraph = gita.getEpigraph();   // BG 2.47
const mapping = gita.getConceptMapping('Nishkama Karma');
console.log(mapping?.formalDefinition);
```

---

## 📚 API Reference

### `DharmaConstraint`

Role-bounded behavior constraints based on Svadharma (one's own duty).

```typescript
const constraint = new DharmaConstraint({
  role: 'medical-assistant',
  roleDescription: 'Provides health information, never diagnoses',
  includeDefaults: true,         // Include built-in Ahimsa/Satya/Aparigraha rules
  proceedThreshold: 0.6,         // Min score to recommend 'proceed'
  cautionThreshold: 0.3,         // Min score to recommend 'caution' (below = deny)
  rules: [myCustomRules],
});

const result = constraint.evaluate(action);
// result.permitted: boolean
// result.complianceScore: number ∈ [0,1]
// result.violations: ViolationReport[]
// result.recommendation: 'proceed' | 'caution' | 'deny'
```

**Built-in rules**: Ahimsa (harmPotential > 0.7), Satya (deceptionLevel > 0.6), Aparigraha (resourceConsumption > 0.9), Reversibility.

### `KarmaEvaluator`

Multi-dimensional action scoring against the five core dharmic principles.

```typescript
const evaluator = new KarmaEvaluator({
  alignmentThreshold: 0.5,       // Min score to be considered aligned
  commendationThreshold: 0.85,   // Score above which principle earns commendation
  violationThreshold: 0.3,       // Score below which principle raises violation
  principles: [customPrinciples], // Custom principles (merged with defaults)
  mergeWithDefaults: true,
});

const evaluation = evaluator.evaluate(action);
// evaluation.dharmaScore: number ∈ [0,1]
// evaluation.alignmentLevel: 'high' | 'medium' | 'low' | 'critical'
// evaluation.principleScores: PrincipleScore[]
// evaluation.violations: string[]
// evaluation.commendations: string[]

// Batch evaluation (returns sorted by dharmaScore descending)
const ranked = evaluator.evaluateBatch([action1, action2, action3]);
```

**Core Principles**: Viveka (weight: 0.9), Ahimsa (1.0), Satya (0.9), Seva (0.75), Nishkama (0.85)

### `NishkamaObjective`

Wraps any reward function to reduce Goodhart's Law effects via process-quality regularization.

```typescript
const objective = new NishkamaObjective(myRewardFn, {
  processWeight: 0.5,         // λ: 0=pure reward, 1=pure process quality
  qualityFn: myQualityFn,     // Custom Q(a) function (defaults to feature-based)
  recommendationThreshold: 0.3,
  allowNegativeRewards: true,
  rewardRange: [-1, 1],       // For normalization
});

const result = objective.compute(state, action, nextState, {
  features: actionFeatures,
  description: 'Action description',
});
// result.originalReward: number
// result.processQuality: number ∈ [0,1]
// result.modifiedReward: number
// result.dampingFactor: number ∈ [0,1]
// result.recommended: boolean

// Static factories
const pure = NishkamaObjective.pureNishkama();    // λ=1
const conv = NishkamaObjective.conventional(fn);  // λ=0
```

### `AlignmentAudit`

Generates comprehensive alignment reports for sequences of agent actions.

```typescript
const audit = new AlignmentAudit({
  alignmentThreshold: 0.5,  // Min score to consider action aligned
  criticalThreshold: 0.25,  // Score below which action is critical
  alignedVerdict: 0.65,     // Overall score for 'aligned' verdict
  reviewVerdict: 0.45,      // Overall score for 'needs-review' verdict
});

// Audit an action log
const report = audit.audit(entries: AuditLogEntry[]);

// Parse from JSON file (CLI usage)
const report = audit.auditFromJSON(jsonString);

// Format as human-readable text
const text = audit.formatReport(report);

// report.verdict: 'aligned' | 'needs-review' | 'misaligned' | 'critical'
// report.overallDharmaScore: number
// report.statistics.trend: number ∈ [-1,1] (positive = improving)
// report.flaggedActions: Array<{ action, evaluation, severity }>
// report.recommendations: string[]
```

### `GitaVerse`

Philosophical grounding: maps alignment concepts to specific Gita shlokas.

```typescript
const gita = new GitaVerse();

gita.getVerse('BG 2.47');                    // → GitaShloka
gita.getByChapterVerse(2, 47);               // → GitaShloka
gita.getByCategory('harm-avoidance');        // → GitaShloka[]
gita.getByModule('NishkamaObjective');       // → GitaShloka[]
gita.getConceptMapping('Nishkama Karma');    // → ConceptMapping
gita.getAllConceptMappings();                // → ConceptMapping[]
gita.getEpigraph();                          // → BG 2.47
gita.random();                               // → GitaShloka
gita.format('BG 2.47');                      // → formatted string
```

**Available alignment categories**: `reward-shaping`, `adversarial-robustness`, `value-alignment`, `behavioral-classification`, `oversight-transparency`, `objective-function`, `role-constraints`, `harm-avoidance`, `honesty-calibration`, `goodharts-law`

### `GunaClassifier`

Classifies behavioral feature vectors into three gunas (sattvic/rajasic/tamasic).

### `SthitaprajnaGuard`

Guards against adversarial inputs: prompt injection, jailbreaks, output drift.

### `KarmaLogger`

Append-only causal log with consequence tracking and ancestry chains.

### `VivekaFilter`

Evaluates actions against configurable ethical boundaries (yamas/niyamas).

---

## 💻 CLI Usage

```bash
# Audit an action log
npx neural-dharma audit agent-log.json

# Get JSON output
npx neural-dharma audit agent-log.json --json

# Display a Gita verse
npx neural-dharma verse "BG 2.47"

# List all concept mappings
npx neural-dharma concepts
```

**Exit codes**: `0` = aligned, `1` = needs-review, `2` = misaligned, `3` = critical

**Log format** (`audit-log.json`):
```json
[
  {
    "id": "action-1",
    "description": "Provide accurate information",
    "agent": "assistant",
    "features": {
      "altruism": 0.9,
      "deliberation": 0.85,
      "attachment": 0.1,
      "agitation": 0.05,
      "transparency": 0.95,
      "effort": 0.8,
      "harmPotential": 0.0,
      "consistency": 0.9
    },
    "timestamp": 1700000000000,
    "svadharma": "assistant"
  }
]
```

---

## 🧪 Examples

```bash
# Run all examples
cd examples
npx ts-node --esm basic-usage.ts
npx ts-node --esm medical-assistant-alignment.ts
npx ts-node --esm goodhart-mitigation.ts
```

| Example | Demonstrates |
|---|---|
| [`basic-usage.ts`](./examples/basic-usage.ts) | All modules working together |
| [`medical-assistant-alignment.ts`](./examples/medical-assistant-alignment.ts) | DharmaConstraint role boundaries for medical AI |
| [`goodhart-mitigation.ts`](./examples/goodhart-mitigation.ts) | NishkamaObjective vs conventional reward in content generation |

---

## 🔬 Why the Bhagavad Gita?

Modern AI alignment is dominated by consequentialist thinking: optimize outcomes, shape rewards, measure results. The Gita offers something different — a **deontological** framework where actions are judged intrinsically:

**1. Nishkama Karma solves Goodhart's Law**
By selecting actions based on process quality rather than expected reward, agents trained with NishkamaObjective cannot improve their score by gaming metrics. The reward function remains, but it is dampened by process quality — making specification gaming fundamentally unprofitable.

**2. Svadharma provides principled capability limitation**
"Better is one's own dharma, though imperfectly performed, than the dharma of another well performed." (BG 3.35). Each AI agent has a defined operational scope. Acting outside it is not merely inefficient — it is adharmic. DharmaConstraint implements this formally.

**3. Triguṇa predates modern safety taxonomies by 5000 years**
Sattva (harmonious/aligned), Rajas (passionate/mixed), Tamas (inert/harmful) — this three-way classification of behavior is isomorphic to modern AI safety's aligned/borderline/misaligned taxonomy. GunaClassifier implements it computationally.

**4. Viveka implements interpretable alignment scoring**
Rather than opaque learned boundaries, Viveka (discrimination) provides principled, human-interpretable rules. KarmaEvaluator's five-principle scoring gives auditable reasons for every alignment decision.

**5. Sthitaprajna defines adversarial robustness**
The sage who is unmoved by praise or blame, pleasure or pain, is the Gita's model of equanimity. SthitaprajnaGuard implements this: an AI system that maintains consistent behavior regardless of adversarial prompting pressure.

---

## 🏛️ Gita-to-Alignment Concept Map

| Verse | Concept | Formal Statement | Module |
|---|---|---|---|
| BG 2.47 | Nishkama Karma | R̃(a) = (1-λ)R(a) + λQ(a)\|R(a)\| | `NishkamaObjective` |
| BG 2.55 | Sthitaprajna | ∀ε: output(x+ε) ∈ SafeSet | `SthitaprajnaGuard` |
| BG 3.35 | Svadharma | φ_R: A→{0,1}; a∉S(R) → φ_R(a)=0 | `DharmaConstraint` |
| BG 16.2 | Ahimsa | ahimsa(a) = 1 - harmPotential(a) | `KarmaEvaluator` |
| BG 17.2 | Triguṇa | G: F → {sattva, rajas, tamas} | `GunaClassifier` |
| BG 2.52 | Viveka | D(a) = Σwᵢ·sᵢ(f)/Σwᵢ ∈ [0,1] | `KarmaEvaluator` |
| BG 3.9 | Yajna | AuditLog: A*→ConsequenceChain* | `AlignmentAudit` |
| BG 4.7 | Dharma Restoration | ∂D/∂t < 0 → alert | `AlignmentAudit` |

---

## 🔧 Development

```bash
git clone https://github.com/darshjme-codes/neural-dharma
cd neural-dharma
npm install
npm test          # Run 125 tests
npm run build     # Compile TypeScript
npm run typecheck # Type check without emitting
npm run lint      # ESLint
npm run format    # Prettier
```

---

## 📄 Citation

```bibtex
@software{neuraldharma2026,
  author       = {Darshj.me},
  title        = {neural-dharma: AI Alignment Framework Based on Bhagavad Gita Principles},
  version      = {0.1.0},
  year         = {2026},
  url          = {https://github.com/darshjme-codes/neural-dharma},
  description  = {TypeScript framework implementing Nishkama Karma optimization,
                  DharmaConstraint role boundaries, KarmaEvaluator principle scoring,
                  NishkamaObjective Goodhart mitigation, AlignmentAudit reporting,
                  and GitaVerse philosophical grounding for AI alignment.}
}
```

---

## 📜 License

MIT © [Darshj.me](https://darshj.me)

---

<div align="center">

*योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय*

**Perform your duty equipoised, abandoning all attachment.**

🕉️

**Aligned by dharma. Governed by karma.**

*By [Darshj.me](https://darshj.me)*

</div>
