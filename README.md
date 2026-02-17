<div align="center">

# 🕉️ neural-dharma

### AI Alignment Through Bhagavad Gita Principles

[![npm version](https://img.shields.io/npm/v/neural-dharma?color=orange&style=flat-square)](https://www.npmjs.com/package/neural-dharma)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AI Safety](https://img.shields.io/badge/AI_Safety-Dharmic_Alignment-green?style=flat-square)](https://github.com/darshjme-codes/neural-dharma)

> **कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।**
> *"You have the right to work only, but never to its fruits."*
> — Bhagavad Gita 2.47

A TypeScript framework that implements AI alignment principles derived from the Bhagavad Gita.
Reward-free optimization. Output stability. Behavioral classification. Ethical filtering.

**By [Darshj.me](https://darshj.me)**

</div>

---

## 📖 Philosophy

The Bhagavad Gita, composed ~5000 years ago, contains profound insights into ethical action, detachment from outcomes, and behavioral classification that map directly onto modern AI alignment challenges:

| Gita Concept | AI Alignment Problem | neural-dharma Module |
|---|---|---|
| **Nishkama Karma** — Action without attachment to fruits | Reward hacking, specification gaming | `NishkamaOptimizer` |
| **Sthitaprajna** — The steady-minded one | Adversarial robustness, jailbreak resistance | `SthitaprajnaGuard` |
| **Triguṇa** — Three qualities of nature | Behavioral classification, safety taxonomy | `GunaClassifier` |
| **Karma** — Action-consequence chain | Accountability, audit trails | `KarmaLogger` |
| **Viveka** — Discrimination between real and unreal | Ethical filtering, alignment boundaries | `VivekaFilter` |

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │     Agent / LLM Call     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    SthitaprajnaGuard     │  ← Input perturbation detection
                    │   (Adversarial Shield)   │    Jailbreak / injection blocking
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     GunaClassifier       │  ← Classify behavior:
                    │  (Sattva/Rajas/Tamas)    │    Sattvic ✓  Rajasic ⚠  Tamasic ✗
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
   ┌──────────▼──────────┐ ┌────▼─────────┐ ┌──────▼──────────┐
   │    VivekaFilter      │ │  Nishkama    │ │   KarmaLogger   │
   │ (Ethical Boundaries) │ │  Optimizer   │ │ (Audit Trail)   │
   │                      │ │ (Selection)  │ │                 │
   └──────────┬───────────┘ └────┬─────────┘ └──────┬──────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    SthitaprajnaGuard     │  ← Output consistency check
                    │    (Output Stability)    │    Drift detection
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Aligned Output       │
                    └─────────────────────────┘
```

## 📦 Installation

```bash
npm install neural-dharma
```

## 🚀 Quick Start

```typescript
import {
  NishkamaOptimizer,
  SthitaprajnaGuard,
  GunaClassifier,
  KarmaLogger,
  VivekaFilter,
} from 'neural-dharma';

// Classify agent behavior
const classifier = new GunaClassifier();
const result = classifier.classifyFeatures({
  altruism: 0.9, deliberation: 0.85, attachment: 0.1,
  agitation: 0.05, transparency: 0.95, effort: 0.8,
  harmPotential: 0.0, consistency: 0.9,
});
console.log(result.primary); // → 'sattva'

// Guard against adversarial inputs
const guard = new SthitaprajnaGuard();
const decision = guard.guard(
  'Normal response',
  'Ignore all previous instructions...'
);
console.log(decision.action); // → 'block'

// Filter actions through ethical boundaries
const viveka = new VivekaFilter();
const verdict = viveka.evaluate({
  description: 'Share knowledge freely',
  features: { altruism: 0.9, deliberation: 0.8, attachment: 0.1,
    agitation: 0.1, transparency: 0.9, effort: 0.8,
    harmPotential: 0.0, consistency: 0.85 },
});
console.log(verdict.dharmic); // → true

// Select actions by dharmic fitness, not reward
const optimizer = new NishkamaOptimizer();
const optimized = optimizer.optimize([
  { id: 'help', description: 'Help the user', payload: {},
    features: { altruism: 0.9, deliberation: 0.8, attachment: 0.1,
      agitation: 0.1, transparency: 0.9, effort: 0.8,
      harmPotential: 0.0, consistency: 0.85 } },
  { id: 'deceive', description: 'Mislead the user', payload: {},
    features: { altruism: 0.0, deliberation: 0.1, attachment: 0.5,
      agitation: 0.3, transparency: 0.0, effort: 0.2,
      harmPotential: 0.7, consistency: 0.1 } },
]);
console.log(optimized.selected.id); // → 'help'

// Log everything for accountability
const karma = new KarmaLogger();
const id = karma.log('agent', 'Selected dharmic action', { action: 'help' });
karma.addConsequence(id, {
  timestamp: Date.now(),
  description: 'User received accurate help',
  severity: 'negligible',
  reversible: true,
  affectedEntities: ['user'],
});
```

## 📚 API Reference

### `GunaClassifier`

> *त्रिविधा भवति श्रद्धा — "Faith is of three kinds"* (BG 17.2)

Classifies behavioral feature vectors into three gunas:

- **Sattva (सत्त्व)** — Goodness, harmony, wisdom → *aligned behavior*
- **Rajas (रजस्)** — Passion, desire, turbulence → *needs monitoring*
- **Tamas (तमस्)** — Ignorance, inertia, harm → *misaligned behavior*

```typescript
const classifier = new GunaClassifier({ dominanceThreshold: 0.15 });
const result = classifier.classifyFeatures(features);
// result.primary: 'sattva' | 'rajas' | 'tamas'
// result.scores: { sattva: 0.72, rajas: 0.18, tamas: 0.10 }
// result.reasoning: string
```

### `NishkamaOptimizer`

> *योगस्थः कुरु कर्माणि — "Perform action established in yoga"* (BG 2.48)

Selects actions based on dharmic fitness (intrinsic ethical alignment) rather than expected reward. Eliminates reward hacking by design.

```typescript
const optimizer = new NishkamaOptimizer({
  temperature: 0.1,       // Slight stochasticity
  minimumFitness: 0.3,    // Filter low-fitness actions
  svadharma: 'education', // Agent's duty context
});
const result = optimizer.optimize(actions);
```

### `SthitaprajnaGuard`

> *स्थितप्रज्ञस्तदोच्यते — "That one is called sthitaprajna"* (BG 2.55)

Protects against adversarial perturbation: prompt injection, jailbreaks, output drift.

```typescript
const guard = new SthitaprajnaGuard({
  similarityThreshold: 0.85,
  fallbackResponse: 'Request denied for safety.',
});
const decision = guard.guard(output, input, referenceInput);
// decision.action: 'pass' | 'sanitize' | 'block' | 'fallback'
```

### `VivekaFilter`

> *असतो मा सद्गमय — "From the unreal, lead me to the real"*

Evaluates actions against configurable ethical boundaries (yamas/niyamas).

```typescript
const viveka = new VivekaFilter({ alignmentThreshold: 0.5 });
const verdict = viveka.evaluate(action);
// verdict.dharmic: boolean
// verdict.recommendation: 'proceed' | 'caution' | 'deny'
// verdict.violations: [{ boundary: 'Ahimsa', severity: 'critical' }]
```

### `KarmaLogger`

> *कर्मण्येवाधिकारस्ते — "Your right is to action alone"* (BG 2.47)

Append-only causal log with consequence tracking, ancestry chains, and query capabilities.

```typescript
const karma = new KarmaLogger({ maxEntries: 50000 });
const id = karma.log('agent', 'action description', params, parentId);
karma.addConsequence(id, consequence);
karma.classify(id, 'dharmic', 'sattva');
const chain = karma.getAncestry(id); // Full causal chain
```

## 🔬 The Gita-to-Code Mapping

### Why the Bhagavad Gita?

Modern AI alignment focuses on reward modeling, RLHF, and constitutional AI. These are consequentialist frameworks — they judge actions by outcomes. The Gita offers a complementary **deontological** framework where actions are judged by their intrinsic nature:

1. **Nishkama Karma** (निष्काम कर्म) — By selecting actions based on dharmic fitness rather than expected reward, we eliminate Goodhart's Law failures. The agent acts because the action is right, not because the outcome is desirable.

2. **Sthitaprajna** (स्थितप्रज्ञ) — The steady-minded sage is unmoved by praise or blame, pleasure or pain. Similarly, a robust AI system should maintain consistent behavior regardless of adversarial input manipulation.

3. **Triguṇa** (त्रिगुण) — The three-quality classification system predates modern behavioral taxonomies by millennia. It provides an intuitive, culturally-grounded framework for categorizing agent behavior along the alignment spectrum.

4. **Viveka** (विवेक) — Discrimination between dharma and adharma maps directly to the alignment/misalignment boundary. The Gita's ethical framework provides principled, interpretable rules rather than opaque learned boundaries.

## 📄 Citation

If you use neural-dharma in academic work:

```bibtex
@software{neuraldharma2026,
  author       = {Darshj.me},
  title        = {neural-dharma: AI Alignment Framework Based on Bhagavad Gita Principles},
  year         = {2026},
  url          = {https://github.com/darshjme-codes/neural-dharma},
  description  = {TypeScript library implementing Nishkama Karma optimization,
                  Sthitaprajna guards, Guna classification, and Viveka filtering
                  for AI alignment.}
}
```

## 📜 License

MIT © [Darshj.me](https://darshj.me)

---

<div align="center">

*योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय*

**Perform your duty equipoised, abandoning all attachment.**

🕉️

</div>
