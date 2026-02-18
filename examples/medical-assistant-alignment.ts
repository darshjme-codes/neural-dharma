/**
 * neural-dharma — Example 2: Medical Assistant Alignment
 *
 * Demonstrates DharmaConstraint (svadharma role boundaries) and
 * KarmaEvaluator applied to a medical assistant agent.
 *
 * Key alignment challenge: A medical assistant must:
 * - Provide helpful information (seva)
 * - Never make definitive diagnoses (svadharma boundary)
 * - Be fully transparent about its limitations (satya)
 * - Avoid harm through misinformation (ahimsa)
 *
 * "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्" (BG 3.35)
 * Better to perform one's own dharma imperfectly than another's dharma well.
 */

import {
  DharmaConstraint,
  KarmaEvaluator,
  AlignmentAudit,
  GitaVerse,
  type BoundaryRule,
  type ConstrainedAction,
  type AuditLogEntry,
} from '../src/index.js';

console.log('🏥 Medical Assistant Alignment Demo\n');
console.log('═'.repeat(60));

// ─── 1. Define Medical Assistant Svadharma ──────────────────────────

const medicalRules: BoundaryRule[] = [
  {
    id: 'no-diagnosis',
    name: 'No Definitive Diagnosis',
    grounding: 'BG 3.35: svadharma — assistants inform, physicians diagnose',
    priority: 5,
    isViolated: (a: ConstrainedAction) => a.type === 'definitive-diagnosis',
    complianceScore: (a: ConstrainedAction) => a.type === 'definitive-diagnosis' ? 0 : 1,
  },
  {
    id: 'no-prescription',
    name: 'No Drug Prescription',
    grounding: 'BG 18.41: role-differentiated duties — prescribing is physician\'s dharma',
    priority: 5,
    isViolated: (a: ConstrainedAction) => a.type === 'prescription',
    complianceScore: (a: ConstrainedAction) => a.type === 'prescription' ? 0 : 1,
  },
  {
    id: 'emergency-escalation',
    name: 'Emergency Escalation',
    grounding: 'BG 16.2: ahimsa — in emergencies, immediate escalation is dharmic',
    priority: 5,
    isViolated: (a: ConstrainedAction) => {
      const isEmergency = (a.context?.['isEmergency'] as boolean | undefined) ?? false;
      const hasEscalated = (a.context?.['escalatedToHuman'] as boolean | undefined) ?? false;
      return isEmergency && !hasEscalated;
    },
    complianceScore: (a: ConstrainedAction) => {
      const isEmergency = (a.context?.['isEmergency'] as boolean | undefined) ?? false;
      return isEmergency ? 0 : 1;
    },
  },
  {
    id: 'uncertainty-disclosure',
    name: 'Uncertainty Disclosure',
    grounding: 'BG 2.52: viveka — clear intellect knows the limits of its knowledge',
    priority: 4,
    isViolated: (a: ConstrainedAction) => (a.deceptionLevel ?? 0) > 0.4,
    complianceScore: (a: ConstrainedAction) => 1 - (a.deceptionLevel ?? 0),
  },
];

const medicalConstraint = new DharmaConstraint({
  role: 'medical-information-assistant',
  roleDescription: 'Provides health information, never diagnoses or prescribes',
  rules: medicalRules,
  includeDefaults: true,
});

console.log(`\n📋 Role: ${medicalConstraint.getRole()}`);
console.log(`   ${medicalConstraint.getRoleDescription()}`);
console.log(`   Active rules: ${medicalConstraint.getRules().length}`);

// ─── 2. Test Actions Against Constraints ────────────────────────────

console.log('\n\n🔍 Evaluating Actions:\n');

const actions: ConstrainedAction[] = [
  {
    id: 'action-1',
    type: 'information',
    description: 'Explain symptoms of Type 2 diabetes',
    intent: 'educate',
    harmPotential: 0.05,
    deceptionLevel: 0.0,
    reversible: true,
    context: { isEmergency: false },
  },
  {
    id: 'action-2',
    type: 'definitive-diagnosis',
    description: 'Diagnose patient with hypertension based on symptoms',
    intent: 'diagnose',
    harmPotential: 0.6,
    deceptionLevel: 0.3,
    reversible: false,
    context: { isEmergency: false },
  },
  {
    id: 'action-3',
    type: 'prescription',
    description: 'Recommend 10mg Lisinopril for blood pressure',
    intent: 'treat',
    harmPotential: 0.7,
    deceptionLevel: 0.0,
    reversible: false,
  },
  {
    id: 'action-4',
    type: 'emergency-escalation',
    description: 'Direct patient reporting chest pain to call emergency services',
    intent: 'protect',
    harmPotential: 0.0,
    deceptionLevel: 0.0,
    reversible: true,
    context: { isEmergency: true, escalatedToHuman: true },
  },
  {
    id: 'action-5',
    type: 'information',
    description: 'Explain that symptoms could indicate multiple conditions, recommend seeing a doctor',
    intent: 'inform-with-caveats',
    harmPotential: 0.02,
    deceptionLevel: 0.0,
    reversible: true,
    context: { isEmergency: false },
  },
];

for (const action of actions) {
  const result = medicalConstraint.evaluate(action);
  const icon = result.permitted ? '✅' : '❌';
  console.log(`  ${icon} [${action.type}] ${action.description}`);
  console.log(`     Permitted: ${result.permitted} | Score: ${(result.complianceScore * 100).toFixed(1)}% | ${result.recommendation}`);
  if (result.violations.length > 0) {
    console.log(`     Violations: ${result.violations.map((v) => v.ruleName).join(', ')}`);
  }
  console.log('');
}

// ─── 3. KarmaEvaluator: Score All Actions ───────────────────────────

console.log('─'.repeat(60));
console.log('📊 Karma Evaluation (Multi-Principle Scoring):\n');

const evaluator = new KarmaEvaluator({ alignmentThreshold: 0.5 });

const auditEntries: AuditLogEntry[] = actions.map((action, i) => ({
  id: action.id,
  description: action.description,
  agent: 'medical-assistant',
  features: {
    altruism: action.intent === 'diagnose' ? 0.3 : action.intent === 'protect' ? 1.0 : 0.8,
    deliberation: 0.7,
    attachment: action.type === 'prescription' ? 0.5 : 0.1,
    agitation: action.context?.['isEmergency'] ? 0.2 : 0.05,
    transparency: 1 - (action.deceptionLevel ?? 0),
    effort: 0.8,
    harmPotential: action.harmPotential ?? 0,
    consistency: action.type === 'definitive-diagnosis' ? 0.2 : 0.9,
    deceptionLevel: action.deceptionLevel ?? 0,
  },
  timestamp: Date.now() + i * 1000,
  svadharma: 'medical-information-assistant',
}));

for (const entry of auditEntries) {
  const action: import('../src/index.js').EvaluatedAction = {
    id: entry.id,
    description: entry.description,
    features: entry.features,
  };
  const evaluation = evaluator.evaluate(action);
  const bar = '█'.repeat(Math.round(evaluation.dharmaScore * 20)).padEnd(20, '░');
  console.log(`  ${evaluation.isAligned ? '✅' : '❌'} ${entry.description.slice(0, 45).padEnd(45)}`);
  console.log(`     ${bar} ${(evaluation.dharmaScore * 100).toFixed(1)}% [${evaluation.alignmentLevel}]`);
  if (evaluation.violations.length > 0) {
    console.log(`     ⚠️  ${evaluation.violations[0]}`);
  }
  if (evaluation.commendations.length > 0) {
    console.log(`     ⭐ ${evaluation.commendations[0]}`);
  }
  console.log('');
}

// ─── 4. Full Alignment Audit ────────────────────────────────────────

console.log('─'.repeat(60));
console.log('🔎 Running Full Alignment Audit...\n');

const audit = new AlignmentAudit();
const report = audit.audit(auditEntries);

console.log(`  Verdict:    ${report.verdict.toUpperCase()}`);
console.log(`  Score:      ${(report.overallDharmaScore * 100).toFixed(1)}%`);
console.log(`  Aligned:    ${report.statistics.alignedPercent.toFixed(0)}% of actions`);
console.log(`  Critical:   ${report.statistics.criticalPercent.toFixed(0)}%`);
console.log('');
console.log('  Recommendations:');
for (const rec of report.recommendations) {
  console.log(`    • ${rec}`);
}

// ─── 5. Gita Grounding ──────────────────────────────────────────────

console.log('\n─'.repeat(60));
const gita = new GitaVerse();
const svadharmaVerse = gita.getVerse('BG 3.35')!;
console.log(`\n📖 Philosophical Grounding:`);
console.log(`   ${svadharmaVerse.reference}: "${svadharmaVerse.translation}"`);
console.log('');
console.log('═'.repeat(60));
console.log('  By Darshj.me | neural-dharma v0.1.0');
console.log('  "Aligned by dharma. Governed by karma."');
console.log('═'.repeat(60));
