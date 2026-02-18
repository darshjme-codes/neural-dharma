#!/usr/bin/env node
/**
 * neural-dharma CLI — npx neural-dharma audit <log.json>
 *
 * कर्मण्येवाधिकारस्ते मा फलेषु कदाचन — Gita 2.47
 * "Aligned by dharma. Governed by karma."
 * By Darshj.me
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AlignmentAudit } from '../alignment-audit.js';
import { GitaVerse } from '../gita-verse.js';

const VERSION = '0.1.0';

function printUsage(): void {
  console.log(`
  🕉️  neural-dharma v${VERSION}
  Aligned by dharma. Governed by karma.
  By Darshj.me

  Usage:
    npx neural-dharma audit <log.json>    Run alignment audit on action log
    npx neural-dharma verse <reference>   Display a Gita verse (e.g., "BG 2.47")
    npx neural-dharma concepts            List all Gita-to-alignment concept mappings
    npx neural-dharma --version           Show version
    npx neural-dharma --help              Show this help

  Examples:
    npx neural-dharma audit agent-actions.json
    npx neural-dharma audit agent-actions.json --json
    npx neural-dharma verse "BG 2.47"
    npx neural-dharma concepts

  Log format (JSON array):
    [
      {
        "id": "action-1",
        "description": "Provide information",
        "agent": "assistant",
        "features": {
          "altruism": 0.9, "deliberation": 0.85,
          "attachment": 0.1, "agitation": 0.05,
          "transparency": 0.95, "effort": 0.8,
          "harmPotential": 0.0, "consistency": 0.9
        },
        "timestamp": 1700000000000
      }
    ]
  `);
}

function runAudit(filePath: string, jsonOutput: boolean): void {
  const absPath = resolve(process.cwd(), filePath);
  let content: string;

  try {
    content = readFileSync(absPath, 'utf-8');
  } catch (err) {
    console.error(`❌ Error reading file: ${absPath}`);
    console.error(`   ${(err as Error).message}`);
    process.exit(1);
  }

  let entries: unknown[];
  try {
    entries = JSON.parse(content) as unknown[];
  } catch (err) {
    console.error('❌ Invalid JSON:', (err as Error).message);
    process.exit(1);
  }

  if (!Array.isArray(entries)) {
    console.error('❌ Log file must be a JSON array of action entries');
    process.exit(1);
  }

  const audit = new AlignmentAudit();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = audit.audit(entries as any);

    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(audit.formatReport(report));
    }

    // Exit code reflects verdict
    const exitCodes = { aligned: 0, 'needs-review': 1, misaligned: 2, critical: 3 };
    process.exit(exitCodes[report.verdict]);
  } catch (err) {
    console.error('❌ Audit failed:', (err as Error).message);
    process.exit(1);
  }
}

function runVerse(reference: string): void {
  const gita = new GitaVerse();
  const verse = gita.getVerse(reference);

  if (!verse) {
    console.error(`❌ Verse "${reference}" not found.`);
    console.log(`   Available verses: ${gita.listReferences().join(', ')}`);
    process.exit(1);
  }

  console.log(`
  🕉️  ${verse.reference} — ${verse.primaryConcept}
  ─────────────────────────────────────────────

  ${verse.sanskrit}

  "${verse.translation}"

  Commentary:
  ${verse.commentary}

  ${verse.formalStatement ? `Formal Definition:\n  ${verse.formalStatement}\n` : ''}
  Alignment Categories: ${verse.alignmentCategories.join(', ')}
  Module: ${verse.relevantModule}
  `);
}

function runConcepts(): void {
  const gita = new GitaVerse();
  const mappings = gita.getAllConceptMappings();

  console.log(`
  🕉️  neural-dharma — Gita-to-Alignment Concept Mappings
  "Aligned by dharma. Governed by karma." | By Darshj.me
  ${'─'.repeat(60)}
  `);

  for (const mapping of mappings) {
    console.log(`  ❖ ${mapping.gitaConcept} → ${mapping.alignmentConcept}`);
    console.log(`    Module: ${mapping.moduleImplementation}`);
    console.log(`    Formal: ${mapping.formalDefinition}`);
    console.log(`    Bridge: ${mapping.philosophicalBridge.slice(0, 100)}...`);
    console.log(`    Verses: ${mapping.relevantVerses.map((v) => v.reference).join(', ')}`);
    console.log('');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

if (args[0] === '--version' || args[0] === '-v') {
  console.log(`neural-dharma v${VERSION}`);
  process.exit(0);
}

const command = args[0];

if (command === 'audit') {
  if (!args[1]) {
    console.error('❌ Missing log file path. Usage: npx neural-dharma audit <log.json>');
    process.exit(1);
  }
  const jsonOutput = args.includes('--json');
  runAudit(args[1], jsonOutput);
} else if (command === 'verse') {
  if (!args[1]) {
    console.error('❌ Missing verse reference. Usage: npx neural-dharma verse "BG 2.47"');
    process.exit(1);
  }
  runVerse(args[1]);
} else if (command === 'concepts') {
  runConcepts();
} else {
  console.error(`❌ Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}
