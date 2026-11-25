/**
 * Dictionary Service
 * Uses the free Wiktionary/DWDS APIs and falls back to local words.json data.
 * Implements a two-tier cache: in-memory (session) + localStorage (persistent).
 */

import wordsData from '../data/words.json';

const CACHE_PREFIX = 'dict_cache_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- Cache Helpers ---
function getCached(word) {
  try {
    const key = CACHE_PREFIX + word.toLowerCase();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function setCache(word, data) {
  try {
    const key = CACHE_PREFIX + word.toLowerCase();
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded – ignore */ }
}

// In-memory session cache
const memCache = new Map();

// --- Local dataset helpers ---
function getLocalEntry(query) {
  const q = query.trim().toLowerCase();
  return wordsData.find(w => {
    const bare = w.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
    return bare === q || w.word.toLowerCase() === q;
  }) || null;
}

function getLocalSuggestions(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return wordsData
    .filter(w => {
      const bare = w.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
      return bare.startsWith(q) || w.word.toLowerCase().startsWith(q);
    })
    .slice(0, limit)
    .map(w => ({
      word: w.word,
      translation: w.translation,
      fromLocal: true,
    }));
}

// --- Wiktionary API (free, no key needed) ---
const WIKTIONARY_API = 'https://en.wiktionary.org/api/rest_v1/page/definition';

async function fetchWiktionary(word) {
  try {
    const res = await fetch(`${WIKTIONARY_API}/${encodeURIComponent(word)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    // German entries are under key 'de'
    const deEntries = json.de;
    if (!deEntries || deEntries.length === 0) return null;

    // Collect definitions
    const definitions = [];
    for (const entry of deEntries.slice(0, 3)) {
      const pos = entry.partOfSpeech || '';
      const defs = (entry.definitions || []).slice(0, 4).map(d => ({
        definition: stripHtml(d.definition),
        examples: (d.parsedExamples || d.examples || []).slice(0, 2).map(e =>
          typeof e === 'string' ? e : e.example || ''
        ).filter(Boolean),
      }));
      if (defs.length) definitions.push({ pos, defs });
    }
    return definitions.length ? definitions : null;
  } catch { return null; }
}

// --- Free Dictionary API (open-source) for English fallback ---
async function fetchFreeDictEnglish(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json) ? json[0] : null;
  } catch { return null; }
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Detect article/gender from string
function detectGender(wordStr) {
  if (/^der\s/i.test(wordStr)) return { article: 'der', gender: 'masculine', color: 'text-blue-500', label: 'Masculine' };
  if (/^die\s/i.test(wordStr)) return { article: 'die', gender: 'feminine', color: 'text-pink-500', label: 'Feminine' };
  if (/^das\s/i.test(wordStr)) return { article: 'das', gender: 'neuter', color: 'text-green-500', label: 'Neuter' };
  return null;
}

// Build conjugation table for verbs (simple heuristic)
function buildVerbForms(infinitive) {
  // Strip any article
  const verb = infinitive.replace(/^(der|die|das)\s+/i, '');
  const stem = verb.endsWith('en') ? verb.slice(0, -2) : verb.endsWith('n') ? verb.slice(0, -1) : verb;
  const stemE = stem.endsWith('t') || stem.endsWith('d') ? stem + 'e' : stem;
  return {
    infinitive: verb,
    present: {
      ich: stem + 'e',
      du: stemE + 'st',
      'er/sie/es': stemE + 't',
      wir: verb,
      ihr: stemE + 't',
      sie: verb,
    },
    simple_past: {
      ich: stem + 'te',
      du: stem + 'test',
      'er/sie/es': stem + 'te',
      wir: stem + 'ten',
      ihr: stem + 'tet',
      sie: stem + 'ten',
    },
    partizip2: `ge${stem}t`,
    auxiliary: 'haben',
  };
}

// Build noun declension table (simplified)
function buildNounForms(wordStr) {
  const genderInfo = detectGender(wordStr);
  const noun = wordStr.replace(/^(der|die|das)\s+/i, '');
  if (!genderInfo) return null;

  const { gender } = genderInfo;
  const pluralGuess = noun.endsWith('ung') ? noun + 'en'
    : noun.endsWith('keit') || noun.endsWith('heit') ? noun + 'en'
    : noun.endsWith('er') ? noun
    : noun.endsWith('el') ? noun
    : noun + 'e';

  const articles = {
    masculine: { nom: 'der', acc: 'den', dat: 'dem', gen: 'des' },
    feminine:  { nom: 'die', acc: 'die', dat: 'der', gen: 'der' },
    neuter:    { nom: 'das', acc: 'das', dat: 'dem', gen: 'des' },
  };
  const art = articles[gender];
  return {
    gender: genderInfo.label,
    singular: {
      Nominative: `${art.nom} ${noun}`,
      Accusative: `${art.acc} ${noun}`,
      Dative: `${art.dat} ${noun}${gender !== 'feminine' ? '' : ''}`,
      Genitive: `${art.gen} ${noun}${gender === 'masculine' || gender === 'neuter' ? '(e)s' : ''}`,
    },
    plural: {
      Nominative: `die ${pluralGuess}`,
      Accusative: `die ${pluralGuess}`,
      Dative: `den ${pluralGuess}n`,
      Genitive: `der ${pluralGuess}`,
    },
  };
}

// ---- Main API ----

/**
 * Get autocomplete suggestions (instant, local-first)
 */
export function getSuggestions(query, limit = 8) {
  return getLocalSuggestions(query, limit);
}

/**
 * Full word detail lookup.
 * Returns a rich WordDetail object.
 */
export async function lookupWord(query) {
  const q = query.trim();
  if (!q) return null;

  const cacheKey = q.toLowerCase();
  if (memCache.has(cacheKey)) return memCache.get(cacheKey);
  const cached = getCached(cacheKey);
  if (cached) { memCache.set(cacheKey, cached); return cached; }

  const localEntry = getLocalEntry(q);
  const wordStr = localEntry ? localEntry.word : q;
  const genderInfo = detectGender(wordStr);
  const bareWord = wordStr.replace(/^(der|die|das)\s+/i, '');
  const isNoun = !!genderInfo;

  // Determine part of speech heuristically
  const isVerb = !isNoun && (wordStr.endsWith('en') || wordStr.endsWith('ern'));

  // Fetch Wiktionary definitions (async)
  let wiktDefs = null;
  try { wiktDefs = await fetchWiktionary(bareWord); } catch { /* ignore */ }

  // Build result
  const result = {
    word: wordStr,
    bareWord,
    translation: localEntry?.translation || (wiktDefs ? null : ''),
    genderInfo,
    isNoun,
    isVerb,

    // From local data
    example: localEntry?.example || null,
    exampleTranslation: localEntry?.exampleTranslation || null,
    grammarNote: localEntry?.grammarNote || null,
    synonyms: localEntry?.synonyms || [],

    // Forms
    verbForms: isVerb ? buildVerbForms(wordStr) : null,
    nounForms: isNoun ? buildNounForms(wordStr) : null,

    // Wiktionary defs
    definitions: wiktDefs || [],

    // Additional example sentences (pulled from wiktionary if available)
    additionalExamples: [],
  };

  // Extract extra examples from wiktionary
  if (wiktDefs) {
    const examples = [];
    for (const group of wiktDefs) {
      for (const def of group.defs) {
        for (const ex of def.examples) {
          if (ex) examples.push(ex);
        }
      }
    }
    result.additionalExamples = examples.slice(0, 4);
  }

  memCache.set(cacheKey, result);
  setCache(cacheKey, result);
  return result;
}

/**
 * Search full word list (for search results page)
 */
export function searchWords(query, limit = 20) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return wordsData
    .filter(w => {
      const bare = w.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
      const trans = w.translation.toLowerCase();
      return bare.includes(q) || w.word.toLowerCase().includes(q) || trans.includes(q);
    })
    .slice(0, limit)
    .map(w => ({ ...w, fromLocal: true }));
}
