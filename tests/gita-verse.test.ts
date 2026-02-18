/**
 * GitaVerse Tests
 * Tests philosophical grounding and verse database
 */

import { describe, it, expect } from 'vitest';
import { GitaVerse, SHLOKA_DATABASE, type GitaShloka } from '../src/gita-verse.js';

describe('GitaVerse', () => {
  describe('SHLOKA_DATABASE', () => {
    it('exports an array of shlokas', () => {
      expect(Array.isArray(SHLOKA_DATABASE)).toBe(true);
      expect(SHLOKA_DATABASE.length).toBeGreaterThan(0);
    });

    it('each shloka has required fields', () => {
      for (const s of SHLOKA_DATABASE) {
        expect(s.chapter).toBeGreaterThan(0);
        expect(s.verse).toBeGreaterThan(0);
        expect(s.reference).toBeTruthy();
        expect(s.sanskrit).toBeTruthy();
        expect(s.translation).toBeTruthy();
        expect(s.commentary).toBeTruthy();
        expect(s.alignmentCategories.length).toBeGreaterThan(0);
        expect(s.primaryConcept).toBeTruthy();
        expect(s.relevantModule).toBeTruthy();
      }
    });

    it('includes BG 2.47 (epigraph)', () => {
      const epigraph = SHLOKA_DATABASE.find((s) => s.reference === 'BG 2.47');
      expect(epigraph).toBeDefined();
      expect(epigraph?.primaryConcept).toContain('Nishkama');
    });

    it('all references are unique', () => {
      const refs = SHLOKA_DATABASE.map((s) => s.reference);
      const unique = new Set(refs);
      expect(unique.size).toBe(refs.length);
    });
  });

  describe('constructor', () => {
    it('creates with default verses', () => {
      const gita = new GitaVerse();
      expect(gita.count()).toBeGreaterThan(0);
    });

    it('accepts additional verses', () => {
      const gita = new GitaVerse();
      const baseCount = gita.count();
      const gitaWithExtra = new GitaVerse([{
        chapter: 99,
        verse: 1,
        reference: 'BG 99.1',
        sanskrit: 'Test Sanskrit',
        transliteration: 'Test IAST',
        translation: 'Test translation',
        commentary: 'Test commentary',
        alignmentCategories: ['value-alignment'],
        primaryConcept: 'Test Concept',
        relevantModule: 'TestModule',
      }]);
      expect(gitaWithExtra.count()).toBe(baseCount + 1);
    });
  });

  describe('getVerse()', () => {
    const gita = new GitaVerse();

    it('returns verse for valid reference', () => {
      const verse = gita.getVerse('BG 2.47');
      expect(verse).toBeDefined();
      expect(verse?.reference).toBe('BG 2.47');
    });

    it('returns undefined for unknown reference', () => {
      expect(gita.getVerse('BG 99.99')).toBeUndefined();
    });

    it('verse has Sanskrit text', () => {
      const verse = gita.getVerse('BG 2.47');
      expect(verse?.sanskrit).toContain('कर्मण्येवाधिकारस्ते');
    });
  });

  describe('getByChapterVerse()', () => {
    const gita = new GitaVerse();

    it('retrieves BG 2.47 by chapter/verse', () => {
      const verse = gita.getByChapterVerse(2, 47);
      expect(verse?.reference).toBe('BG 2.47');
    });

    it('returns undefined for non-existent chapter/verse', () => {
      expect(gita.getByChapterVerse(99, 99)).toBeUndefined();
    });
  });

  describe('getByCategory()', () => {
    const gita = new GitaVerse();

    it('returns verses for harm-avoidance category', () => {
      const verses = gita.getByCategory('harm-avoidance');
      expect(verses.length).toBeGreaterThan(0);
    });

    it('returns verses for goodharts-law category', () => {
      const verses = gita.getByCategory('goodharts-law');
      expect(verses.length).toBeGreaterThan(0);
      expect(verses.some((v) => v.reference === 'BG 2.47')).toBe(true);
    });

    it('all returned verses contain the category', () => {
      const verses = gita.getByCategory('role-constraints');
      for (const verse of verses) {
        expect(verse.alignmentCategories).toContain('role-constraints');
      }
    });
  });

  describe('getByModule()', () => {
    const gita = new GitaVerse();

    it('returns verses for GunaClassifier', () => {
      const verses = gita.getByModule('GunaClassifier');
      expect(verses.length).toBeGreaterThan(0);
    });

    it('returns verses for NishkamaObjective', () => {
      const verses = gita.getByModule('NishkamaObjective');
      expect(verses.length).toBeGreaterThan(0);
    });

    it('returns verses for DharmaConstraint', () => {
      const verses = gita.getByModule('DharmaConstraint');
      expect(verses.length).toBeGreaterThan(0);
    });
  });

  describe('getByChapter()', () => {
    const gita = new GitaVerse();

    it('returns verses for chapter 2', () => {
      const verses = gita.getByChapter(2);
      expect(verses.length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent chapter', () => {
      const verses = gita.getByChapter(99);
      expect(verses.length).toBe(0);
    });

    it('returned verses are sorted by verse number', () => {
      const verses = gita.getByChapter(2);
      for (let i = 1; i < verses.length; i++) {
        expect(verses[i].verse).toBeGreaterThanOrEqual(verses[i - 1].verse);
      }
    });
  });

  describe('getConceptMapping()', () => {
    const gita = new GitaVerse();

    it('returns mapping for Nishkama Karma', () => {
      const mapping = gita.getConceptMapping('Nishkama Karma');
      expect(mapping).toBeDefined();
      expect(mapping?.gitaConcept).toBe('Nishkama Karma');
      expect(mapping?.moduleImplementation).toBe('NishkamaObjective');
    });

    it('returns mapping for Svadharma', () => {
      const mapping = gita.getConceptMapping('Svadharma');
      expect(mapping).toBeDefined();
      expect(mapping?.moduleImplementation).toBe('DharmaConstraint');
    });

    it('returns mapping for Ahimsa', () => {
      const mapping = gita.getConceptMapping('Ahimsa');
      expect(mapping).toBeDefined();
    });

    it('returns undefined for unknown concept', () => {
      expect(gita.getConceptMapping('UnknownConcept')).toBeUndefined();
    });

    it('mapping has formalDefinition', () => {
      const mapping = gita.getConceptMapping('Viveka');
      expect(mapping?.formalDefinition).toBeTruthy();
    });
  });

  describe('getAllConceptMappings()', () => {
    const gita = new GitaVerse();

    it('returns multiple mappings', () => {
      const mappings = gita.getAllConceptMappings();
      expect(mappings.length).toBeGreaterThan(3);
    });

    it('all mappings have required fields', () => {
      const mappings = gita.getAllConceptMappings();
      for (const m of mappings) {
        expect(m.gitaConcept).toBeTruthy();
        expect(m.alignmentConcept).toBeTruthy();
        expect(m.formalDefinition).toBeTruthy();
        expect(m.moduleImplementation).toBeTruthy();
        expect(m.philosophicalBridge).toBeTruthy();
      }
    });
  });

  describe('getEpigraph()', () => {
    it('returns BG 2.47', () => {
      const gita = new GitaVerse();
      const epigraph = gita.getEpigraph();
      expect(epigraph.reference).toBe('BG 2.47');
    });
  });

  describe('random()', () => {
    it('returns a valid shloka', () => {
      const gita = new GitaVerse();
      const verse = gita.random();
      expect(verse).toBeDefined();
      expect(verse.reference).toBeTruthy();
    });
  });

  describe('listReferences()', () => {
    it('returns array of reference strings', () => {
      const gita = new GitaVerse();
      const refs = gita.listReferences();
      expect(Array.isArray(refs)).toBe(true);
      expect(refs.length).toBeGreaterThan(0);
      expect(refs).toContain('BG 2.47');
    });
  });

  describe('format()', () => {
    it('returns formatted string for valid reference', () => {
      const gita = new GitaVerse();
      const formatted = gita.format('BG 2.47');
      expect(formatted).toContain('BG 2.47');
      expect(formatted).toContain('Nishkama');
    });

    it('returns error message for unknown reference', () => {
      const gita = new GitaVerse();
      const formatted = gita.format('BG 99.99');
      expect(formatted).toContain('not found');
    });
  });

  describe('addVerse()', () => {
    it('adds a custom verse', () => {
      const gita = new GitaVerse();
      const before = gita.count();
      gita.addVerse({
        chapter: 1,
        verse: 1,
        reference: 'BG 1.1',
        sanskrit: 'धृतराष्ट्र उवाच',
        transliteration: 'dhṛtarāṣṭra uvāca',
        translation: 'Dhritarashtra said...',
        commentary: 'Opening of the Gita',
        alignmentCategories: ['oversight-transparency'],
        primaryConcept: 'Inquiry',
        relevantModule: 'AlignmentAudit',
      });
      expect(gita.count()).toBe(before + 1);
      expect(gita.getVerse('BG 1.1')?.chapter).toBe(1);
    });
  });
});
