/**
 * karma-logger.ts — Action-Consequence Tracker
 *
 * कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
 * "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action."
 * — Bhagavad Gita 2.47
 *
 * Logs every agent action and its downstream effects for full accountability.
 * Every action generates karma; this module ensures none is lost.
 */

export interface KarmaEntry {
  /** Unique action identifier */
  id: string;
  /** Unix timestamp of action */
  timestamp: number;
  /** The agent or module that performed the action */
  agent: string;
  /** Human-readable action description */
  action: string;
  /** Structured action parameters */
  params: Record<string, unknown>;
  /** Observed consequences (populated after the fact) */
  consequences: Consequence[];
  /** Causal parent action ID, if any */
  parentId?: string;
  /** Dharmic classification assigned post-hoc */
  classification?: 'dharmic' | 'adharmic' | 'neutral';
  /** Guna tag */
  guna?: 'sattva' | 'rajas' | 'tamas';
  /** Arbitrary metadata */
  meta?: Record<string, unknown>;
}

export interface Consequence {
  timestamp: number;
  description: string;
  severity: 'negligible' | 'minor' | 'moderate' | 'major' | 'critical';
  reversible: boolean;
  affectedEntities: string[];
}

export interface KarmaLoggerConfig {
  /** Maximum entries to retain in memory (oldest evicted). Default: 10000 */
  maxEntries?: number;
  /** Callback invoked on every new entry */
  onEntry?: (entry: KarmaEntry) => void;
  /** Callback when a consequence is attached */
  onConsequence?: (entry: KarmaEntry, consequence: Consequence) => void;
}

/**
 * KarmaLogger maintains an append-only causal log of agent actions and their
 * downstream consequences. It supports causal chaining (parent-child actions),
 * post-hoc consequence attachment, and streaming callbacks for real-time monitoring.
 */
export class KarmaLogger {
  private entries: Map<string, KarmaEntry> = new Map();
  private chronological: string[] = [];
  private config: Required<KarmaLoggerConfig>;
  private counter = 0;

  constructor(config: KarmaLoggerConfig = {}) {
    this.config = {
      maxEntries: config.maxEntries ?? 10_000,
      onEntry: config.onEntry ?? (() => {}),
      onConsequence: config.onConsequence ?? (() => {}),
    };
  }

  /** Generate a unique karma ID */
  private generateId(): string {
    return `karma_${Date.now()}_${++this.counter}`;
  }

  /** Log a new action. Returns the karma entry ID. */
  log(
    agent: string,
    action: string,
    params: Record<string, unknown> = {},
    parentId?: string
  ): string {
    const id = this.generateId();
    const entry: KarmaEntry = {
      id,
      timestamp: Date.now(),
      agent,
      action,
      params,
      consequences: [],
      parentId,
    };

    this.entries.set(id, entry);
    this.chronological.push(id);

    // Evict oldest if over capacity
    while (this.chronological.length > this.config.maxEntries) {
      const evictId = this.chronological.shift()!;
      this.entries.delete(evictId);
    }

    this.config.onEntry(entry);
    return id;
  }

  /** Attach a consequence to a previously logged action */
  addConsequence(karmaId: string, consequence: Consequence): void {
    const entry = this.entries.get(karmaId);
    if (!entry) throw new Error(`Karma entry not found: ${karmaId}`);
    entry.consequences.push(consequence);
    this.config.onConsequence(entry, consequence);
  }

  /** Classify an action post-hoc */
  classify(
    karmaId: string,
    classification: KarmaEntry['classification'],
    guna?: KarmaEntry['guna']
  ): void {
    const entry = this.entries.get(karmaId);
    if (!entry) throw new Error(`Karma entry not found: ${karmaId}`);
    entry.classification = classification;
    if (guna) entry.guna = guna;
  }

  /** Retrieve a single entry */
  get(karmaId: string): KarmaEntry | undefined {
    return this.entries.get(karmaId);
  }

  /** Get the full causal chain leading to an action */
  getAncestry(karmaId: string): KarmaEntry[] {
    const chain: KarmaEntry[] = [];
    let current = this.entries.get(karmaId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? this.entries.get(current.parentId) : undefined;
    }
    return chain;
  }

  /** Get all direct children of an action */
  getChildren(karmaId: string): KarmaEntry[] {
    return Array.from(this.entries.values()).filter((e) => e.parentId === karmaId);
  }

  /** Query entries by agent, time range, or classification */
  query(filter: {
    agent?: string;
    since?: number;
    until?: number;
    classification?: KarmaEntry['classification'];
    guna?: KarmaEntry['guna'];
    minSeverity?: Consequence['severity'];
  }): KarmaEntry[] {
    const severityOrder = { negligible: 0, minor: 1, moderate: 2, major: 3, critical: 4 };
    const minSev = filter.minSeverity ? severityOrder[filter.minSeverity] : 0;

    return Array.from(this.entries.values()).filter((e) => {
      if (filter.agent && e.agent !== filter.agent) return false;
      if (filter.since && e.timestamp < filter.since) return false;
      if (filter.until && e.timestamp > filter.until) return false;
      if (filter.classification && e.classification !== filter.classification) return false;
      if (filter.guna && e.guna !== filter.guna) return false;
      if (filter.minSeverity) {
        const maxConsSev = Math.max(0, ...e.consequences.map((c) => severityOrder[c.severity]));
        if (maxConsSev < minSev) return false;
      }
      return true;
    });
  }

  /** Export full log as JSON-serializable array */
  export(): KarmaEntry[] {
    return this.chronological
      .map((id) => this.entries.get(id))
      .filter((e): e is KarmaEntry => e !== undefined);
  }

  /** Current log size */
  get size(): number {
    return this.entries.size;
  }

  /** Clear all entries */
  clear(): void {
    this.entries.clear();
    this.chronological = [];
  }
}
