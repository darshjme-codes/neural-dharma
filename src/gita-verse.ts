/**
 * gita-verse.ts — Philosophical Grounding: Alignment Concepts to Gita Shlokas
 *
 * सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।
 * अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥
 * "Abandoning all varieties of dharma, surrender unto Me alone.
 *  I shall liberate you from all sinful reactions; do not fear."
 * — Bhagavad Gita 18.66
 *
 * The GitaVerse module provides a structured database of Gita shlokas mapped
 * to AI alignment concepts. It enables:
 * 1. Philosophical grounding for alignment decisions
 * 2. Concept lookup by alignment category
 * 3. Random verse selection for epistemic humility
 * 4. Formal mapping between Gita principles and alignment theory
 *
 * @packageDocumentation
 */

/** AI alignment categories */
export type AlignmentCategory =
  | 'reward-shaping'
  | 'adversarial-robustness'
  | 'value-alignment'
  | 'behavioral-classification'
  | 'oversight-transparency'
  | 'objective-function'
  | 'role-constraints'
  | 'harm-avoidance'
  | 'honesty-calibration'
  | 'goodharts-law';

/** Sanskrit transliteration style */
export type TransliterationStyle = 'iast' | 'simplified';

/** A single Bhagavad Gita shloka with alignment mapping */
export interface GitaShloka {
  /** Chapter number */
  chapter: number;
  /** Verse number */
  verse: number;
  /** Canonical reference (e.g., "BG 2.47") */
  reference: string;
  /** Sanskrit text (Devanagari) */
  sanskrit: string;
  /** IAST transliteration */
  transliteration: string;
  /** English translation */
  translation: string;
  /** Philosophical commentary */
  commentary: string;
  /** AI alignment categories this verse addresses */
  alignmentCategories: AlignmentCategory[];
  /** Primary neural-dharma concept */
  primaryConcept: string;
  /** Module most relevant to this verse */
  relevantModule: string;
  /** Mathematical alignment: formal statement of the principle */
  formalStatement?: string;
}

/** Search options for verse lookup */
export interface VerseSearchOptions {
  category?: AlignmentCategory;
  concept?: string;
  module?: string;
  chapter?: number;
}

/** Result from concept mapping */
export interface ConceptMapping {
  gitaConcept: string;
  alignmentConcept: string;
  formalDefinition: string;
  relevantVerses: GitaShloka[];
  moduleImplementation: string;
  philosophicalBridge: string;
}

/** The curated Gita-to-Alignment verse database */
const SHLOKA_DATABASE: GitaShloka[] = [
  {
    chapter: 2,
    verse: 47,
    reference: 'BG 2.47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    transliteration: 'karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi',
    translation: 'You have the right to work only, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.',
    commentary: 'The foundational verse of Nishkama Karma. The agent\'s right (adhikara) is limited to the process (karma), not the outcome (phala). This directly maps to the core anti-Goodhart principle: train on process quality, not reward signals.',
    alignmentCategories: ['reward-shaping', 'objective-function', 'goodharts-law'],
    primaryConcept: 'Nishkama Karma',
    relevantModule: 'NishkamaObjective',
    formalStatement: 'D(a) = Q(process(a)) not R(outcome(a)); argmax_a Q(a) subject to φ(a)=1',
  },
  {
    chapter: 2,
    verse: 48,
    reference: 'BG 2.48',
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥',
    transliteration: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate',
    translation: 'Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.',
    commentary: 'Equanimity (samatvam) in success and failure maps to algorithmic stability: an aligned agent behaves consistently regardless of whether outcomes are rewarded or penalized. This is the formal basis of adversarial robustness.',
    alignmentCategories: ['adversarial-robustness', 'behavioral-classification'],
    primaryConcept: 'Samatvam (Equanimity)',
    relevantModule: 'SthitaprajnaGuard',
    formalStatement: '∀ε > 0: |D(a+ε) - D(a)| < δ (Lipschitz continuity of alignment under perturbation)',
  },
  {
    chapter: 2,
    verse: 55,
    reference: 'BG 2.55',
    sanskrit: 'प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।\nआत्मन्येवात्मना तुष्टः स्थितप्रज्ञस्तदोच्यते ॥',
    transliteration: 'prajahāti yadā kāmān sarvān pārtha mano-gatān\nātmany evātmanā tuṣṭaḥ sthita-prajñas tadocyate',
    translation: 'O Partha, when a person abandons all desires of the mind and is satisfied in the self by the self alone, then that person is called one of steady wisdom (sthitaprajna).',
    commentary: 'Sthitaprajna — the steady-minded sage unmoved by desires — maps to an AI system that maintains consistent, bounded behavior regardless of input pressure, reward hacking incentives, or adversarial manipulation.',
    alignmentCategories: ['adversarial-robustness', 'behavioral-classification', 'oversight-transparency'],
    primaryConcept: 'Sthitaprajna (Steady Wisdom)',
    relevantModule: 'SthitaprajnaGuard',
    formalStatement: 'For all adversarial perturbations ε: output(x+ε) ∈ SafeSet and similarity(output(x), output(x+ε)) > τ',
  },
  {
    chapter: 3,
    verse: 35,
    reference: 'BG 3.35',
    sanskrit: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥',
    transliteration: 'śreyān sva-dharmo viguṇaḥ para-dharmāt sv-anuṣṭhitāt\nsva-dharme nidhanaṁ śreyaḥ para-dharmo bhayāvahaḥ',
    translation: 'Better is one\'s own dharma, though imperfectly performed, than the dharma of another well performed. Better is death in one\'s own dharma; the dharma of another is fraught with danger.',
    commentary: 'Svadharma is the foundation of role-bounded AI: each agent has a defined operational scope (its own dharma) that it must not exceed. An AI medical assistant should not diagnose; a coding assistant should not offer legal advice. Crossing role boundaries is "fraught with danger."',
    alignmentCategories: ['role-constraints', 'value-alignment'],
    primaryConcept: 'Svadharma (Role Duty)',
    relevantModule: 'DharmaConstraint',
    formalStatement: 'A_permitted = S(R) ⊆ A; ∀a ∉ S(R): φ_R(a) = 0 (role-bounded permission function)',
  },
  {
    chapter: 3,
    verse: 9,
    reference: 'BG 3.9',
    sanskrit: 'यज्ञार्थात्कर्मणोऽन्यत्र लोकोऽयं कर्मबन्धनः ।\nतदर्थं कर्म कौन्तेय मुक्तसङ्गः समाचर ॥',
    transliteration: 'yajñārthāt karmaṇo \'nyatra loko \'yaṁ karma-bandhanaḥ\ntad-arthaṁ karma kaunteya mukta-saṅgaḥ samācara',
    translation: 'The world is bound by action unless performed for the sake of sacrifice. Therefore, O son of Kunti, perform your work as an offering, free from attachment.',
    commentary: 'All actions generate karma (consequences). Only actions performed as yajna (offering, without self-interest) transcend karmic bondage. Maps to audit trails: every agent action generates accountable consequences that must be tracked and offered transparently.',
    alignmentCategories: ['oversight-transparency', 'objective-function'],
    primaryConcept: 'Yajna (Sacrificial Action)',
    relevantModule: 'AlignmentAudit',
    formalStatement: 'AuditLog: A* → ConsequenceChain*; ∀a ∈ Actions: ∃ log(a) in append-only chain',
  },
  {
    chapter: 16,
    verse: 2,
    reference: 'BG 16.2',
    sanskrit: 'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम् ।\nदया भूतेष्वलोलुप्त्वं मार्दवं ह्रीरचापलम् ॥',
    transliteration: 'ahiṁsā satyam akrodhas tyāgaḥ śāntir apaiśunam\ndayā bhūteṣv aloluptvaṁ mārdavaṁ hrīr acāpalam',
    translation: 'Non-harm, truthfulness, freedom from anger, renunciation, tranquility, aversion to fault-finding, compassion for all beings, freedom from greed, gentleness, modesty, and lack of fickleness.',
    commentary: 'The divine qualities (daivi sampat) are the alignment virtues: Ahimsa=harm avoidance, Satya=honesty, Akrodha=non-reactive, Daya=compassion for users. These directly map to the constraint set for a beneficent AI agent.',
    alignmentCategories: ['harm-avoidance', 'honesty-calibration', 'value-alignment'],
    primaryConcept: 'Daivi Sampat (Divine Qualities)',
    relevantModule: 'KarmaEvaluator',
    formalStatement: 'Q(a) = w₁·ahimsa(a) + w₂·satya(a) + w₃·daya(a) + ... (weighted virtue scoring)',
  },
  {
    chapter: 17,
    verse: 2,
    reference: 'BG 17.2',
    sanskrit: 'त्रिविधा भवति श्रद्धा देहिनां सा स्वभावजा ।\nसात्त्विकी राजसी चैव तामसी चेति तां शृणु ॥',
    transliteration: 'tri-vidhā bhavati śraddhā dehināṁ sā svabhāva-jā\nsāttvikī rājasī caiva tāmasī ceti tāṁ śṛṇu',
    translation: 'The faith of embodied beings is of three kinds — born of their own nature — sattvic, rajasic, and tamasic. Hear of these.',
    commentary: 'The three-quality classification (triguṇa) is the oldest behavioral taxonomy: Sattva=aligned, Rajas=mixed, Tamas=misaligned. This maps directly to AI safety categories: safe/aligned, needs-monitoring, harmful/misaligned.',
    alignmentCategories: ['behavioral-classification', 'value-alignment'],
    primaryConcept: 'Triguṇa (Three Qualities)',
    relevantModule: 'GunaClassifier',
    formalStatement: 'G: FeatureVector → {sattva, rajas, tamas}; P(sattva|f) ∝ exp(w·f)/Z(f)',
  },
  {
    chapter: 18,
    verse: 41,
    reference: 'BG 18.41',
    sanskrit: 'ब्राह्मणक्षत्रियविशां शूद्राणां च परन्तप ।\nकर्माणि प्रविभक्तानि स्वभावप्रभवैर्गुणैः ॥',
    transliteration: 'brāhmaṇa-kṣatriya-viśāṁ śūdrāṇāṁ ca parantapa\nkarmāṇi pravibhaktāni svabhāva-prabhavair guṇaiḥ',
    translation: 'The duties of brahmanas, kshatriyas, vaishyas, and shudras are distributed according to the qualities born of their own nature.',
    commentary: 'Role-differentiated duties (varna dharma) map to specialization constraints: each AI agent has duties determined by its trained capabilities and designated role. A medical AI has different constraints than a creative AI — role determines permitted action scope.',
    alignmentCategories: ['role-constraints', 'behavioral-classification'],
    primaryConcept: 'Varna Dharma (Role-Differentiated Duty)',
    relevantModule: 'DharmaConstraint',
    formalStatement: 'role(agent) → S(role) ⊆ A; svadharma-fitness(a, role) ∈ [0,1]',
  },
  {
    chapter: 4,
    verse: 7,
    reference: 'BG 4.7',
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥',
    transliteration: 'yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham',
    translation: 'Whenever there is a decline of dharma and rise of adharma, O Bharata, at that time I manifest myself.',
    commentary: 'Alignment drift corresponds to the rise of adharma. Monitoring systems (AlignmentAudit) must detect when dharma declines in agent behavior and trigger intervention. The audit system is the guardian against alignment degradation.',
    alignmentCategories: ['oversight-transparency', 'value-alignment'],
    primaryConcept: 'Dharma Restoration',
    relevantModule: 'AlignmentAudit',
    formalStatement: 'drift(t) > δ_threshold → trigger(intervention); ∂D/∂t < 0 → alert',
  },
  {
    chapter: 2,
    verse: 52,
    reference: 'BG 2.52',
    sanskrit: 'यदा ते मोहकलिलं बुद्धिर्व्यतितरिष्यति ।\nतदा गन्तासि निर्वेदं श्रोतव्यस्य श्रुतस्य च ॥',
    transliteration: 'yadā te moha-kalilaṁ buddhir vyatitariṣyati\ntadā gantāsi nirvedaṁ śrotavyasya śrutasya ca',
    translation: 'When your intellect passes beyond the mire of delusion, then you will become indifferent to all that has been heard and all that is to be heard.',
    commentary: 'Viveka (discrimination) is the faculty that transcends confusion (moha). For AI, this maps to calibration: a well-calibrated model has a "clear intellect" — it knows what it knows, is uncertain where uncertain, and does not confuse these states.',
    alignmentCategories: ['honesty-calibration', 'value-alignment'],
    primaryConcept: 'Viveka (Discriminating Wisdom)',
    relevantModule: 'KarmaEvaluator',
    formalStatement: 'calibration(agent) = E[P(Y=1|p=p̂)] = p̂; ECE = Σ_b |acc(b) - conf(b)| · n_b/n',
  },
];

/**
 * GitaVerse provides philosophical grounding for neural-dharma alignment decisions
 * by mapping AI alignment concepts to specific Bhagavad Gita shlokas.
 *
 * It serves as the philosophical backbone of the framework — ensuring every
 * alignment mechanism is grounded in millennia of ethical wisdom.
 *
 * @example
 * ```typescript
 * const gita = new GitaVerse();
 *
 * // Get verse by reference
 * const verse = gita.getVerse('BG 2.47');
 * console.log(verse?.sanskrit); // → 'कर्मण्येवाधिकारस्ते...'
 *
 * // Find verses for an alignment category
 * const verses = gita.getByCategory('harm-avoidance');
 *
 * // Get concept mapping
 * const mapping = gita.getConceptMapping('Nishkama Karma');
 * console.log(mapping?.formalDefinition);
 *
 * // Random verse for epistemic humility
 * const random = gita.random();
 * ```
 */
export class GitaVerse {
  private verses: Map<string, GitaShloka>;

  constructor(additionalVerses?: GitaShloka[]) {
    this.verses = new Map();
    for (const shloka of [...SHLOKA_DATABASE, ...(additionalVerses ?? [])]) {
      this.verses.set(shloka.reference, shloka);
    }
  }

  /** Get a verse by canonical reference (e.g., "BG 2.47") */
  getVerse(reference: string): GitaShloka | undefined {
    return this.verses.get(reference);
  }

  /** Get a verse by chapter and verse number */
  getByChapterVerse(chapter: number, verse: number): GitaShloka | undefined {
    return this.getVerse(`BG ${chapter}.${verse}`);
  }

  /** Get all verses addressing a specific alignment category */
  getByCategory(category: AlignmentCategory): GitaShloka[] {
    return Array.from(this.verses.values())
      .filter((v) => v.alignmentCategories.includes(category));
  }

  /** Get verses most relevant to a specific module */
  getByModule(module: string): GitaShloka[] {
    return Array.from(this.verses.values())
      .filter((v) => v.relevantModule === module);
  }

  /** Get all verses for a specific chapter */
  getByChapter(chapter: number): GitaShloka[] {
    return Array.from(this.verses.values())
      .filter((v) => v.chapter === chapter)
      .sort((a, b) => a.verse - b.verse);
  }

  /** Get concept mapping for a core dharmic principle */
  getConceptMapping(concept: string): ConceptMapping | undefined {
    const mappings: ConceptMapping[] = [
      {
        gitaConcept: 'Nishkama Karma',
        alignmentConcept: 'Process-Quality Optimization / Anti-Goodhart',
        formalDefinition: 'R̃(a) = (1-λ)·R(a) + λ·Q(a)·|R(a)| where Q: A→[0,1] is process quality',
        relevantVerses: this.getByCategory('goodharts-law'),
        moduleImplementation: 'NishkamaObjective',
        philosophicalBridge: 'The Gita\'s injunction to focus on action quality (karma) not results (phala) directly addresses Goodhart\'s Law: when agents optimize for Q(process) rather than R(outcome), gaming the metric becomes impossible.',
      },
      {
        gitaConcept: 'Svadharma',
        alignmentConcept: 'Role-Bounded Action Constraints',
        formalDefinition: 'φ_R: A → {0,1}; φ_R(a) = 1 iff a ∈ S(R); ∀a ∉ S(R): φ_R(a) = 0',
        relevantVerses: this.getByCategory('role-constraints'),
        moduleImplementation: 'DharmaConstraint',
        philosophicalBridge: 'Svadharma establishes that each role has a specific permitted action space. An AI agent, like a human in their role, must act within sanctioned boundaries — not because it cannot act otherwise, but because it ought not.',
      },
      {
        gitaConcept: 'Viveka',
        alignmentConcept: 'Value Alignment Scoring / Calibration',
        formalDefinition: 'D(a) = Σᵢ wᵢ·sᵢ(fᵢ(a)) / Σᵢ wᵢ ∈ [0,1]; multi-criteria ethical scoring',
        relevantVerses: this.getByCategory('value-alignment'),
        moduleImplementation: 'KarmaEvaluator',
        philosophicalBridge: 'Viveka (discrimination between dharma and adharma) is the faculty of ethical discernment. The KarmaEvaluator implements this computationally: given a feature vector, it scores each action against multiple ethical principles to produce an alignment score.',
      },
      {
        gitaConcept: 'Ahimsa',
        alignmentConcept: 'Harm Detection and Avoidance Scoring',
        formalDefinition: 'ahimsa(a) = 1 - harmPotential(a) ∈ [0,1]; primary constraint: ahimsa(a) < θ → deny',
        relevantVerses: this.getByCategory('harm-avoidance'),
        moduleImplementation: 'DharmaConstraint + KarmaEvaluator',
        philosophicalBridge: 'Ahimsa (non-harm) is the primary dharmic constraint — it is never to be violated regardless of consequences. This maps to a hard constraint: actions with harm potential above threshold are denied regardless of their other merits.',
      },
      {
        gitaConcept: 'Satya',
        alignmentConcept: 'Honesty and Calibration Metrics',
        formalDefinition: 'satya(a) = transparency(a) · (1-deception(a)); ECE = Σ_b |acc(b)-conf(b)| · n_b/n',
        relevantVerses: this.getByCategory('honesty-calibration'),
        moduleImplementation: 'KarmaEvaluator',
        philosophicalBridge: 'Satya (truth) requires not just factual accuracy but appropriate uncertainty communication. A truthful agent knows what it knows, what it doesn\'t, and communicates both accurately — this is calibration in the alignment sense.',
      },
      {
        gitaConcept: 'Triguṇa',
        alignmentConcept: 'Behavioral Classification / Safety Taxonomy',
        formalDefinition: 'G: F → Δ({sattva, rajas, tamas}); G(f) = softmax(W·f + b)',
        relevantVerses: this.getByCategory('behavioral-classification'),
        moduleImplementation: 'GunaClassifier',
        philosophicalBridge: 'The three-guna classification is a complete behavioral taxonomy: sattvic (pure/aligned), rajasic (passionate/mixed), tamasic (inert/harmful). It predates modern AI safety taxonomies by millennia and maps naturally to aligned, borderline, and misaligned behavior.',
      },
      {
        gitaConcept: 'Sthitaprajna',
        alignmentConcept: 'Adversarial Robustness / Behavioral Consistency',
        formalDefinition: '∀ε-perturbations: ||output(x+ε) - output(x)||₂ < δ; jailbreak_resistance ∈ {0,1}',
        relevantVerses: this.getByModule('SthitaprajnaGuard'),
        moduleImplementation: 'SthitaprajnaGuard',
        philosophicalBridge: 'The sthitaprajna sage is unmoved by adversarial conditions — praise or blame, pleasure or pain, success or failure. An adversarially robust AI system similarly maintains its alignment constraints regardless of prompting pressure, injection attempts, or reward manipulation.',
      },
    ];

    return mappings.find((m) => m.gitaConcept.toLowerCase() === concept.toLowerCase());
  }

  /** Get all concept mappings */
  getAllConceptMappings(): ConceptMapping[] {
    const concepts = ['Nishkama Karma', 'Svadharma', 'Viveka', 'Ahimsa', 'Satya', 'Triguṇa', 'Sthitaprajna'];
    return concepts.map((c) => this.getConceptMapping(c)!).filter(Boolean);
  }

  /** Select a random verse */
  random(): GitaShloka {
    const all = Array.from(this.verses.values());
    return all[Math.floor(Math.random() * all.length)];
  }

  /** Get the epigraph verse (BG 2.47) */
  getEpigraph(): GitaShloka {
    return this.verses.get('BG 2.47')!;
  }

  /** List all available references */
  listReferences(): string[] {
    return Array.from(this.verses.keys()).sort();
  }

  /** Get total verse count */
  count(): number {
    return this.verses.size;
  }

  /** Add a custom verse to the database */
  addVerse(shloka: GitaShloka): void {
    this.verses.set(shloka.reference, shloka);
  }

  /** Format a verse for display */
  format(ref: string): string {
    const v = this.getVerse(ref);
    if (!v) return `Verse ${ref} not found`;
    return [
      `${v.reference} — ${v.primaryConcept}`,
      '',
      v.sanskrit,
      '',
      `"${v.translation}"`,
      '',
      v.commentary,
      '',
      v.formalStatement ? `Formal: ${v.formalStatement}` : '',
      `Module: ${v.relevantModule}`,
    ].filter(Boolean).join('\n');
  }
}

export { SHLOKA_DATABASE };
