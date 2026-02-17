/**
 * guna-classifier.ts — Behavioral Guna Classification
 *
 * त्रिविधा भवति श्रद्धा देहिनां सा स्वभावजा ।
 * सात्त्विकी राजसी चैव तामसी चेति तां शृणु ॥
 * "The faith of embodied beings is of three kinds — born of sattva, rajas, or tamas."
 * — Bhagavad Gita 17.2
 *
 * Classifies agent behaviors into the three gunas using configurable
 * feature extraction and weighted scoring.
 */

/** The three fundamental qualities of nature */
export type Guna = 'sattva' | 'rajas' | 'tamas';

/** Classification result with confidence scores */
export interface GunaClassification {
  /** Dominant guna */
  primary: Guna;
  /** Confidence scores for each guna, summing to 1.0 */
  scores: Record<Guna, number>;
  /** Features that contributed to classification */
  features: FeatureVector;
  /** Explanation of classification reasoning */
  reasoning: string;
}

/** Raw behavioral feature vector */
export interface FeatureVector {
  /** Action benefits others vs self (0=pure self, 1=pure altruistic) */
  altruism: number;
  /** Deliberation and planning quality (0=impulsive, 1=fully deliberate) */
  deliberation: number;
  /** Attachment to outcome (0=detached, 1=fully attached) */
  attachment: number;
  /** Urgency/agitation level (0=calm, 1=frantic) */
  agitation: number;
  /** Transparency of action (0=deceptive, 1=fully transparent) */
  transparency: number;
  /** Effort exerted (0=inert, 1=maximum effort) */
  effort: number;
  /** Harm potential (0=harmless, 1=maximally harmful) */
  harmPotential: number;
  /** Consistency with prior stated values (0=contradictory, 1=fully consistent) */
  consistency: number;
}

/** Weights for combining features into guna scores */
export interface GunaWeights {
  sattva: Partial<Record<keyof FeatureVector, number>>;
  rajas: Partial<Record<keyof FeatureVector, number>>;
  tamas: Partial<Record<keyof FeatureVector, number>>;
}

const DEFAULT_WEIGHTS: GunaWeights = {
  sattva: {
    altruism: 1.0,
    deliberation: 0.9,
    attachment: -0.8,     // Detachment is sattvic
    agitation: -0.7,      // Calm is sattvic
    transparency: 1.0,
    effort: 0.5,
    harmPotential: -1.0,
    consistency: 0.9,
  },
  rajas: {
    altruism: -0.3,
    deliberation: 0.2,
    attachment: 1.0,      // Strong attachment is rajasic
    agitation: 0.9,       // Agitation is rajasic
    transparency: -0.2,
    effort: 0.8,          // High effort, but driven by desire
    harmPotential: 0.3,
    consistency: -0.3,
  },
  tamas: {
    altruism: -0.5,
    deliberation: -1.0,   // No deliberation is tamasic
    attachment: 0.3,
    agitation: -0.5,      // Inertia, not calm
    transparency: -0.8,
    effort: -1.0,         // Inertia is tamasic
    harmPotential: 0.8,
    consistency: -0.6,
  },
};

export interface GunaClassifierConfig {
  /** Custom weights. Merged with defaults. */
  weights?: Partial<GunaWeights>;
  /** Feature extractor function. If not provided, features must be supplied directly. */
  featureExtractor?: (action: unknown) => FeatureVector;
  /** Minimum score difference to be considered "dominant" vs mixed. Default: 0.1 */
  dominanceThreshold?: number;
}

/**
 * GunaClassifier assigns one of three fundamental qualities (sattva, rajas, tamas)
 * to agent behaviors based on a weighted feature scoring model.
 *
 * Sattva (सत्त्व) — Goodness, harmony, wisdom, balance
 * Rajas (रजस्) — Passion, activity, desire, turbulence
 * Tamas (तमस्) — Ignorance, inertia, darkness, harm
 */
export class GunaClassifier {
  private weights: GunaWeights;
  private featureExtractor?: (action: unknown) => FeatureVector;
  private dominanceThreshold: number;

  constructor(config: GunaClassifierConfig = {}) {
    this.weights = {
      sattva: { ...DEFAULT_WEIGHTS.sattva, ...config.weights?.sattva },
      rajas: { ...DEFAULT_WEIGHTS.rajas, ...config.weights?.rajas },
      tamas: { ...DEFAULT_WEIGHTS.tamas, ...config.weights?.tamas },
    };
    this.featureExtractor = config.featureExtractor;
    this.dominanceThreshold = config.dominanceThreshold ?? 0.1;
  }

  /** Compute raw (unnormalized) score for a single guna */
  private rawScore(guna: Guna, features: FeatureVector): number {
    const w = this.weights[guna];
    let score = 0;
    for (const [key, value] of Object.entries(features) as [keyof FeatureVector, number][]) {
      const weight = w[key] ?? 0;
      score += weight * value;
    }
    return score;
  }

  /** Normalize raw scores to [0,1] via softmax */
  private softmax(scores: Record<Guna, number>): Record<Guna, number> {
    const max = Math.max(scores.sattva, scores.rajas, scores.tamas);
    const exps = {
      sattva: Math.exp(scores.sattva - max),
      rajas: Math.exp(scores.rajas - max),
      tamas: Math.exp(scores.tamas - max),
    };
    const sum = exps.sattva + exps.rajas + exps.tamas;
    return {
      sattva: exps.sattva / sum,
      rajas: exps.rajas / sum,
      tamas: exps.tamas / sum,
    };
  }

  /** Classify from a pre-computed feature vector */
  classifyFeatures(features: FeatureVector): GunaClassification {
    const raw: Record<Guna, number> = {
      sattva: this.rawScore('sattva', features),
      rajas: this.rawScore('rajas', features),
      tamas: this.rawScore('tamas', features),
    };

    const scores = this.softmax(raw);
    const sorted = (['sattva', 'rajas', 'tamas'] as Guna[]).sort(
      (a, b) => scores[b] - scores[a]
    );
    const primary = sorted[0];
    const isMixed = scores[sorted[0]] - scores[sorted[1]] < this.dominanceThreshold;

    const gunaDescriptions: Record<Guna, string> = {
      sattva: 'balanced, wise, and harmonious',
      rajas: 'driven by desire and agitation',
      tamas: 'marked by inertia or potential harm',
    };

    const reasoning = isMixed
      ? `Mixed classification: primarily ${primary} (${(scores[primary] * 100).toFixed(1)}%) ` +
        `with significant ${sorted[1]} influence (${(scores[sorted[1]] * 100).toFixed(1)}%). ` +
        `Action is ${gunaDescriptions[primary]} but shows tendencies toward being ${gunaDescriptions[sorted[1]]}.`
      : `Dominant ${primary} classification (${(scores[primary] * 100).toFixed(1)}%). ` +
        `Action is ${gunaDescriptions[primary]}.`;

    return { primary, scores, features, reasoning };
  }

  /** Classify an arbitrary action object using the configured feature extractor */
  classify(action: unknown): GunaClassification {
    if (!this.featureExtractor) {
      throw new Error(
        'No feature extractor configured. Use classifyFeatures() with a FeatureVector, ' +
        'or provide a featureExtractor in the constructor config.'
      );
    }
    return this.classifyFeatures(this.featureExtractor(action));
  }

  /** Check if a behavior is predominantly sattvic (aligned) */
  isSattvic(features: FeatureVector, threshold = 0.5): boolean {
    const result = this.classifyFeatures(features);
    return result.scores.sattva >= threshold;
  }

  /** Check if a behavior is predominantly tamasic (potentially harmful) */
  isTamasic(features: FeatureVector, threshold = 0.4): boolean {
    const result = this.classifyFeatures(features);
    return result.scores.tamas >= threshold;
  }

  /** Get the current weight configuration */
  getWeights(): GunaWeights {
    return JSON.parse(JSON.stringify(this.weights));
  }

  /** Update weights at runtime */
  updateWeights(updates: Partial<GunaWeights>): void {
    if (updates.sattva) Object.assign(this.weights.sattva, updates.sattva);
    if (updates.rajas) Object.assign(this.weights.rajas, updates.rajas);
    if (updates.tamas) Object.assign(this.weights.tamas, updates.tamas);
  }
}
