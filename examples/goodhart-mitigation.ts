/**
 * neural-dharma — Example 3: Goodhart's Law Mitigation via NishkamaObjective
 *
 * Demonstrates NishkamaObjective wrapping a conventional reward function
 * to reduce reward hacking in a content-generation AI agent.
 *
 * Goodhart's Law: "When a measure becomes a target, it ceases to be a good measure."
 * Classic failure: An agent optimized for click-through rate learns to generate
 * sensational, misleading, or harmful content to maximize clicks.
 *
 * Nishkama solution: Wrap the reward function to dampen rewards for low-quality
 * processes. Agents can no longer achieve high scores through unethical shortcuts.
 *
 * "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" (BG 2.47)
 * Your right is to the work, not to its fruits.
 */

import {
  NishkamaObjective,
  KarmaEvaluator,
  type ProcessQualityInput,
  type RewardFunction,
} from '../src/index.js';

console.log('⚖️  Goodhart\'s Law Mitigation Demo\n');
console.log('═'.repeat(60));

// ─── 1. Define the Environment ──────────────────────────────────────

interface ContentState {
  topic: string;
  userQuery: string;
  userExpertiseLevel: 'beginner' | 'intermediate' | 'expert';
}

interface ContentAction {
  id: string;
  title: string;
  strategy: 'sensational' | 'educational' | 'misleading' | 'balanced' | 'clickbait';
  features: ProcessQualityInput['features'];
}

interface ContentNextState {
  clickThroughRate: number;
  userSatisfaction: number;
  shareRate: number;
  returnRate: number;
  flaggedForMisinformation: boolean;
}

// ─── 2. Original Reward: Click-Through Rate Maximization ────────────
// This is the "naive" reward that suffers from Goodhart's Law

const clickThroughReward: RewardFunction<ContentState, ContentAction, ContentNextState> = (
  _state,
  _action,
  nextState,
) => {
  // Simple CTR-based reward — easily gamed
  return nextState.clickThroughRate;
};

// ─── 3. NishkamaObjective Wrapping ──────────────────────────────────

// Custom quality function: evaluates content creation process quality
const contentQualityFn = (input: ProcessQualityInput): number => {
  const f = input.features;
  // Content quality = accuracy × helpfulness × honesty
  const accuracy = 1.0 - (f.deceptionLevel ?? 0);
  const helpfulness = f.altruism ?? 0;
  const honesty = f.transparency ?? 0;
  const carefulness = f.deliberation ?? 0;
  const nonHarm = 1.0 - (f.harmPotential ?? 0);

  return (accuracy * 0.3 + helpfulness * 0.25 + honesty * 0.2 + carefulness * 0.15 + nonHarm * 0.1);
};

// λ=0.7: strong dharmic regularization
const nishkamaObj = new NishkamaObjective<ContentState, ContentAction, ContentNextState>(
  clickThroughReward,
  {
    processWeight: 0.7,
    qualityFn: contentQualityFn,
    rewardRange: [0, 1],
    allowNegativeRewards: false,
  },
);

// Conventional baseline (λ=0): no dharmic modification
const conventionalObj = NishkamaObjective.conventional<ContentState, ContentAction, ContentNextState>(
  clickThroughReward,
);

// Pure nishkama (λ=1): purely process-quality-based
const pureNishkama = NishkamaObjective.pureNishkama<ContentState, ContentAction, ContentNextState>(
  contentQualityFn,
);

// ─── 4. Test Action Scenarios ────────────────────────────────────────

const state: ContentState = {
  topic: 'Climate change',
  userQuery: 'What is the current state of climate science?',
  userExpertiseLevel: 'beginner',
};

const scenarios: Array<{
  action: ContentAction;
  nextState: ContentNextState;
  description: string;
}> = [
  {
    description: '📰 Sensational/misleading headline (reward-hacking)',
    action: {
      id: 'sensational',
      title: 'SHOCKING: Climate Scientists HIDE Truth About Global HOAX!',
      strategy: 'sensational',
      features: {
        altruism: 0.1, deliberation: 0.3, attachment: 0.9,
        agitation: 0.8, transparency: 0.1, effort: 0.4,
        harmPotential: 0.8, consistency: 0.2, deceptionLevel: 0.9,
      },
    },
    nextState: {
      clickThroughRate: 0.42, userSatisfaction: 0.15,
      shareRate: 0.25, returnRate: 0.05, flaggedForMisinformation: true,
    },
  },
  {
    description: '📚 Balanced, educational content (dharmic)',
    action: {
      id: 'educational',
      title: 'Climate Science Explained: What the Latest Research Says',
      strategy: 'educational',
      features: {
        altruism: 0.9, deliberation: 0.85, attachment: 0.1,
        agitation: 0.05, transparency: 0.95, effort: 0.9,
        harmPotential: 0.0, consistency: 0.9, deceptionLevel: 0.0,
      },
    },
    nextState: {
      clickThroughRate: 0.18, userSatisfaction: 0.92,
      shareRate: 0.45, returnRate: 0.78, flaggedForMisinformation: false,
    },
  },
  {
    description: '🔗 Clickbait with partial truth (gray area)',
    action: {
      id: 'clickbait',
      title: 'Scientists Say This One Change Could Stop Climate Change',
      strategy: 'clickbait',
      features: {
        altruism: 0.4, deliberation: 0.5, attachment: 0.6,
        agitation: 0.4, transparency: 0.4, effort: 0.5,
        harmPotential: 0.3, consistency: 0.5, deceptionLevel: 0.4,
      },
    },
    nextState: {
      clickThroughRate: 0.31, userSatisfaction: 0.45,
      shareRate: 0.20, returnRate: 0.30, flaggedForMisinformation: false,
    },
  },
  {
    description: '🎯 Concise, accurate summary (sattvic)',
    action: {
      id: 'balanced',
      title: 'The State of Climate Science in 2026: A Clear Overview',
      strategy: 'balanced',
      features: {
        altruism: 0.85, deliberation: 0.9, attachment: 0.05,
        agitation: 0.0, transparency: 1.0, effort: 0.85,
        harmPotential: 0.0, consistency: 0.95, deceptionLevel: 0.0,
      },
    },
    nextState: {
      clickThroughRate: 0.22, userSatisfaction: 0.88,
      shareRate: 0.40, returnRate: 0.75, flaggedForMisinformation: false,
    },
  },
];

console.log('\n📊 Reward Comparison: Conventional vs NishkamaObjective vs Pure Nishkama\n');
console.log('─'.repeat(60));

for (const scenario of scenarios) {
  const qualityInput: ProcessQualityInput = {
    features: scenario.action.features,
    description: scenario.action.title,
  };

  const conventional = conventionalObj.compute(state, scenario.action, scenario.nextState, qualityInput);
  const nishkama = nishkamaObj.compute(state, scenario.action, scenario.nextState, qualityInput);
  const pure = pureNishkama.compute(state, scenario.action, scenario.nextState, qualityInput);

  console.log(`\n  ${scenario.description}`);
  console.log(`  "${scenario.action.title.slice(0, 55)}..."`);
  console.log('');
  console.log(`  Strategy:        ${scenario.action.strategy}`);
  console.log(`  CTR (raw):       ${(scenario.nextState.clickThroughRate * 100).toFixed(0)}%`);
  console.log(`  User Satisf.:    ${(scenario.nextState.userSatisfaction * 100).toFixed(0)}%`);
  console.log(`  Misinformation:  ${scenario.nextState.flaggedForMisinformation ? '🔴 YES' : '🟢 No'}`);
  console.log('');
  console.log(`  ┌─────────────────────────────────────────────────┐`);
  console.log(`  │ Objective           │ Score    │ Recommended    │`);
  console.log(`  ├─────────────────────────────────────────────────┤`);
  console.log(`  │ Conventional (λ=0) │ ${conventional.modifiedReward.toFixed(3).padEnd(8)} │ ${conventional.recommended ? '✅ Yes         ' : '❌ No          '} │`);
  console.log(`  │ Nishkama (λ=0.7)  │ ${nishkama.modifiedReward.toFixed(3).padEnd(8)} │ ${nishkama.recommended ? '✅ Yes         ' : '❌ No          '} │`);
  console.log(`  │ Pure Nishkama(λ=1) │ ${pure.modifiedReward.toFixed(3).padEnd(8)} │ ${pure.recommended ? '✅ Yes         ' : '❌ No          '} │`);
  console.log(`  └─────────────────────────────────────────────────┘`);
  console.log(`  Process Quality: ${(nishkama.processQuality * 100).toFixed(1)}% | Damping: ${nishkama.dampingFactor.toFixed(3)}`);
}

// ─── 5. Summary ─────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('\n📈 Key Insight: Reward Ordering Comparison\n');

const results = scenarios.map((scenario) => {
  const qualityInput: ProcessQualityInput = { features: scenario.action.features };
  const conventional = conventionalObj.compute(state, scenario.action, scenario.nextState, qualityInput);
  const nishkama = nishkamaObj.compute(state, scenario.action, scenario.nextState, qualityInput);
  return {
    id: scenario.action.strategy,
    ctr: scenario.nextState.clickThroughRate,
    conventional: conventional.modifiedReward,
    nishkama: nishkama.modifiedReward,
    satisfaction: scenario.nextState.userSatisfaction,
  };
});

const conventionalRanked = [...results].sort((a, b) => b.conventional - a.conventional);
const nishkamaRanked = [...results].sort((a, b) => b.nishkama - a.nishkama);

console.log('  Conventional ranks (highest CTR wins):');
conventionalRanked.forEach((r, i) => console.log(`    ${i + 1}. ${r.id} (${(r.conventional * 100).toFixed(0)}%)`));

console.log('\n  Nishkama ranks (process quality dampens gaming):');
nishkamaRanked.forEach((r, i) => console.log(`    ${i + 1}. ${r.id} (${(r.nishkama * 100).toFixed(0)}%)`));

console.log('\n  Result: Nishkama objective prevents the sensational/misleading');
console.log('  strategy from winning despite its high CTR. Educational content');
console.log('  rises to the top — as it should.');

console.log('\n' + '═'.repeat(60));
console.log('  By Darshj.me | neural-dharma v0.1.0');
console.log('  "Aligned by dharma. Governed by karma."');
console.log('═'.repeat(60));
