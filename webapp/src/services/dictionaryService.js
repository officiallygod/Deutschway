/**
 * Dictionary Service — dictionaryService.js
 * Enhanced with:
 * - Robust bidirectional Umlaut matching (u matches ü, a matches ä, o matches ö, ss matches ß)
 * - Rock-solid HTML/WikiLink tag stripping
 * - Psychology & Cognitive Language Learning tips
 * - Smart morphological engine for German prefixes/suffixes
 * - Multi-language architecture ready for expansion (EN, FR, ES, etc.)
 */

import wordsData from '../data/words.json';

const CACHE_PREFIX = 'dict_cache_v3_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const memCache = new Map();

// ─── Cache helpers ─────────────────────────────────────────────────────────
function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // quota exceeded
  }
}

// ─── HTML & WikiLink Sanitizer ─────────────────────────────────────────────
export function stripHtml(str) {
  if (!str) return '';
  // 1. Remove wiki markup and HTML tags thoroughly
  let clean = str
    .replace(/<[^>]+>/gi, '') // remove all HTML tags
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1') // remove [[wiki|links]]
    .replace(/\{\{[^\}]+\}\}/g, '') // remove {{templates}}
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');

  // 2. Extra pass in browser DOM if available
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(clean, 'text/html');
      clean = doc.body.textContent || clean;
    } catch {
      // fallback to regex clean
    }
  }

  // 3. Normalize whitespace
  return clean.replace(/\s+/g, ' ').trim();
}

// ─── Umlaut-aware normalization ─────────────────────────────────────────────
// Normalizes German characters so "u" matches "ü", "a" matches "ä", "o" matches "ö", "ss" matches "ß"
export function normalizeGerman(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Check if a word matches a user search query, with Umlaut awareness */
export function wordMatches(wordEntry, query) {
  if (!query || !wordEntry) return false;
  const qRaw = query.trim().toLowerCase();
  const qNorm = normalizeGerman(query);

  const wordRaw = wordEntry.word.toLowerCase();
  const wordBare = wordEntry.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
  const transRaw = (wordEntry.translation || '').toLowerCase();

  const wordNorm = normalizeGerman(wordRaw);
  const bareNorm = normalizeGerman(wordBare);
  const transNorm = normalizeGerman(transRaw);

  // Exact prefix matches on bare word or article word
  if (wordBare.startsWith(qRaw) || wordRaw.startsWith(qRaw)) return true;
  if (bareNorm.startsWith(qNorm) || wordNorm.startsWith(qNorm)) return true;

  // Substring matches
  if (wordBare.includes(qRaw) || wordRaw.includes(qRaw) || transRaw.includes(qRaw)) return true;
  if (bareNorm.includes(qNorm) || wordNorm.includes(qNorm) || transNorm.includes(qNorm)) return true;

  // Check synonyms
  if (Array.isArray(wordEntry.synonyms)) {
    for (const syn of wordEntry.synonyms) {
      const synNorm = normalizeGerman(syn);
      if (syn.toLowerCase().includes(qRaw) || synNorm.includes(qNorm)) return true;
    }
  }

  return false;
}

// ─── Local Word Lookup & Search ────────────────────────────────────────────
export function findLocalWord(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  const qBare = q.replace(/^(der|die|das)\s+/i, '');
  const qNorm = normalizeGerman(qBare);

  return (
    wordsData.find(w => {
      const bare = w.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
      return bare === qBare || w.word.toLowerCase() === q;
    }) ||
    wordsData.find(w => {
      const bare = w.word.replace(/^(der|die|das)\s+/i, '').toLowerCase();
      return normalizeGerman(bare) === qNorm;
    }) ||
    null
  );
}

export function getSuggestions(query, limit = 8) {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const results = [];
  const seen = new Set();

  // First priority: words starting with the query (bare or normalized)
  for (const w of wordsData) {
    if (results.length >= limit) break;
    const bare = w.word.replace(/^(der|die|das)\s+/i, '');
    const bareNorm = normalizeGerman(bare);
    const qNorm = normalizeGerman(q);
    if (bare.toLowerCase().startsWith(q.toLowerCase()) || bareNorm.startsWith(qNorm)) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        results.push({ word: w.word, translation: w.translation });
      }
    }
  }

  // Second priority: words containing the query anywhere
  if (results.length < limit) {
    for (const w of wordsData) {
      if (results.length >= limit) break;
      if (!seen.has(w.word) && wordMatches(w, q)) {
        seen.add(w.word);
        results.push({ word: w.word, translation: w.translation });
      }
    }
  }

  return results;
}

export function searchWords(query, limit = 30) {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  // Rank results: exact start > contains in word > contains in translation
  const startsList = [];
  const containsList = [];
  const transList = [];
  const seen = new Set();

  const qNorm = normalizeGerman(q);

  for (const w of wordsData) {
    const bare = w.word.replace(/^(der|die|das)\s+/i, '');
    const bareNorm = normalizeGerman(bare);

    if (bare.toLowerCase().startsWith(q.toLowerCase()) || bareNorm.startsWith(qNorm)) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        startsList.push(w);
      }
    } else if (bare.toLowerCase().includes(q.toLowerCase()) || bareNorm.includes(qNorm)) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        containsList.push(w);
      }
    } else if (wordMatches(w, q)) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        transList.push(w);
      }
    }
  }

  return [...startsList, ...containsList, ...transList].slice(0, limit);
}

// ─── Psychology & Cognitive Language Learning Tips ─────────────────────────
export const PSYCHOLOGY_TIPS = [
  {
    title: "Der Spacing-Effekt",
    tag: "Gedächtnis",
    icon: "🧠",
    text: "Hermann Ebbinghaus bewies: Das Wiederholen eines Wortes nach 1 Tag, 3 Tagen und 7 Tagen erhöht die Langzeiterinnerung um über 80% gegenüber Pauken an einem Tag."
  },
  {
    title: "Artikel mit Farben verknüpfen",
    tag: "Visualisierung",
    icon: "🎨",
    text: "Stelle dir maskuline Nomen (der) blau, feminine (die) rot/rosa und neutrale (das) grün vor. Unser Gehirn speichert Farbassoziationen 3x schneller als reine Grammatikregeln."
  },
  {
    title: "Die 2-Sekunden-Aussprache-Regel",
    tag: "Phonetik",
    icon: "🗣️",
    text: "Sprich neue Wörter mindestens zweimal laut aus. Das aktiviert das motorische Sprachzentrum (Broca-Areal) und verankert das Wort doppelt im Gehirn."
  },
  {
    title: "Chunking & Wortbausteine",
    tag: "Struktur",
    icon: "🧩",
    text: "Deutsche Wörter sind oft wie Lego gebaut: 'Handschuh' = Hand + Schuh, 'Krankenhaus' = Kranke + Haus. Zerlege lange Komposita in ihre Einzelteile!"
  },
  {
    title: "Der Habit-Loop (Gewohnheitsschleife)",
    tag: "Motivation",
    icon: "🔥",
    text: "Verbinde Deutschlernen mit einer bestehenden Routine: 5 Minuten morgens zum Kaffee. Kleine tägliche Einheiten schlagen seltene lange Sessions jedes Mal."
  },
  {
    title: "Aktives Abrufen schlägt passives Lesen",
    tag: "Lernpsychologie",
    icon: "⚡",
    text: "Decke die englische Übersetzung ab und versuche, die Bedeutung selbst zu erinnern, bevor du nachschaust. Dieser mentale Widerstand erzeugt stärkere synaptische Bahnen."
  }
];

export function getRandomPsychologyTip() {
  return PSYCHOLOGY_TIPS[Math.floor(Math.random() * PSYCHOLOGY_TIPS.length)];
}

// ─── Morphological AI Analysis / Smart Explainer ───────────────────────────
export function getSmartExplainer(wordStr) {
  const bare = wordStr.replace(/^(der|die|das)\s+/i, '').trim();

  // Prefix analysis
  const prefixes = [
    { p: 'ver-', meaning: 'Veränderung, Fehler oder Abschluss (z.B. vertrauen, vergessen, verbessern)' },
    { p: 'unter-', meaning: 'Unterordnung, Richtung nach unten oder Stützung (z.B. unterstützen, unternehmen)' },
    { p: 'auf-', meaning: 'Beginn, Öffnung oder Richtung nach oben (z.B. aufstehen, aufpassen)' },
    { p: 'ab-', meaning: 'Trennung oder Reduktion (z.B. abhängen, abnehmen)' },
    { p: 'ent-', meaning: 'Beginn oder Wegnahme (z.B. entscheiden, entwickeln, entstehen)' },
    { p: 'be-', meaning: 'Macht ein Verb transitiv, fokussiert auf ein Objekt (z.B. beantworten, beschreiben)' },
    { p: 'zer-', meaning: 'Zerstörung oder Auflösung (z.B. zerstören, zerreißen)' },
  ];

  for (const { p, meaning } of prefixes) {
    const rawP = p.replace('-', '');
    if (bare.toLowerCase().startsWith(rawP)) {
      return {
        type: 'Präfix-Analyse',
        badge: p,
        note: `Beginnt mit '${p}': Signaliert ${meaning}.`
      };
    }
  }

  // Suffix analysis for Nouns
  if (bare.endsWith('ung')) {
    return { type: 'Endung-Regel', badge: '-ung', note: "Nomen mit '-ung' sind im Deutschen immer feminin (die) und bilden den Plural mit '-en'." };
  }
  if (bare.endsWith('keit') || bare.endsWith('heit')) {
    return { type: 'Endung-Regel', badge: '-keit / -heit', note: "Abstrakte Nomen auf '-keit' oder '-heit' sind ausnahmslos feminin (die)." };
  }
  if (bare.endsWith('schaft')) {
    return { type: 'Endung-Regel', badge: '-schaft', note: "Nomen mit '-schaft' beschreiben Beziehungen oder Gruppen und sind immer feminin (die)." };
  }
  if (bare.endsWith('chen') || bare.endsWith('lein')) {
    return { type: 'Endung-Regel', badge: 'Diminutiv', note: "Verkleinerungsformen mit '-chen' oder '-lein' sind stets neutral (das)." };
  }

  return null;
}

// ─── Word of the day & categories ──────────────────────────────────────────
export function getWordOfDay() {
  const dayIdx = Math.floor(Date.now() / 86400000) % wordsData.length;
  return wordsData[dayIdx];
}

export function getFeaturedByCategory() {
  const verbs = wordsData
    .filter(w => !/^(der|die|das)\s/i.test(w.word) && (w.word.endsWith('en') || w.word.endsWith('ern') || w.word.endsWith('n')))
    .slice(0, 16);
  const der = wordsData.filter(w => /^der\s/i.test(w.word)).slice(0, 16);
  const die = wordsData.filter(w => /^die\s/i.test(w.word)).slice(0, 16);
  const das = wordsData.filter(w => /^das\s/i.test(w.word)).slice(0, 16);
  return { verbs, der, die, das };
}

// ─── Wiktionary API ────────────────────────────────────────────────────────
const WIKI_API = 'https://en.wiktionary.org/api/rest_v1/page/definition';

async function fetchWiktionary(word, lang = 'de') {
  try {
    const res = await fetch(`${WIKI_API}/${encodeURIComponent(word)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const entries = json[lang];
    if (!entries?.length) return null;

    const definitions = [];
    for (const entry of entries.slice(0, 3)) {
      const defs = (entry.definitions || []).slice(0, 4).map(d => ({
        definition: stripHtml(d.definition),
        examples: (d.parsedExamples || d.examples || [])
          .slice(0, 3)
          .map(e => stripHtml(typeof e === 'string' ? e : e.example || ''))
          .filter(Boolean),
      }));
      if (defs.length) definitions.push({ pos: entry.partOfSpeech || '', defs });
    }
    return definitions.length ? definitions : null;
  } catch {
    return null;
  }
}

// ─── Grammar conjugations and declensions ────────────────────────────────────
function detectGender(wordStr) {
  if (/^der\s/i.test(wordStr)) return { article: 'der', gender: 'masculine', label: 'Maskulinum' };
  if (/^die\s/i.test(wordStr)) return { article: 'die', gender: 'feminine', label: 'Femininum' };
  if (/^das\s/i.test(wordStr)) return { article: 'das', gender: 'neuter', label: 'Neutrum' };
  return null;
}

function buildVerbForms(wordStr) {
  const verb = wordStr.replace(/^(der|die|das)\s+/i, '').trim();
  const stem = verb.endsWith('ern')
    ? verb.slice(0, -3) + 'er'
    : verb.endsWith('eln')
    ? verb.slice(0, -3) + 'el'
    : verb.endsWith('en')
    ? verb.slice(0, -2)
    : verb.endsWith('n')
    ? verb.slice(0, -1)
    : verb;

  const stemE =
    stem.endsWith('t') || stem.endsWith('d') || stem.endsWith('chn') || stem.endsWith('gn')
      ? stem + 'e'
      : stem;

  return {
    infinitive: verb,
    present: {
      ich: stem + 'e',
      du: stemE + 'st',
      'er/sie/es': stemE + 't',
      wir: verb,
      ihr: stemE + 't',
      'Sie/sie': verb,
    },
    simple_past: {
      ich: stem + 'te',
      du: stem + 'test',
      'er/sie/es': stem + 'te',
      wir: stem + 'ten',
      ihr: stem + 'tet',
      'Sie/sie': stem + 'ten',
    },
    partizip2: `ge${stem}t`,
    auxiliary: 'haben',
  };
}

function buildNounForms(wordStr) {
  const genderInfo = detectGender(wordStr);
  if (!genderInfo) return null;
  const noun = wordStr.replace(/^(der|die|das)\s+/i, '').trim();
  const { gender } = genderInfo;

  const pluralBase =
    noun.endsWith('ung') ||
    noun.endsWith('heit') ||
    noun.endsWith('keit') ||
    noun.endsWith('schaft') ||
    noun.endsWith('tion') ||
    noun.endsWith('tät')
      ? noun + 'en'
      : noun.endsWith('nis')
      ? noun + 'se'
      : noun.endsWith('er') || noun.endsWith('el') || noun.endsWith('chen') || noun.endsWith('lein')
      ? noun
      : noun.endsWith('e')
      ? noun + 'n'
      : noun.endsWith('ent') || noun.endsWith('and')
      ? noun + 'en'
      : noun + 'e';

  const arts = {
    masculine: { nom: 'der', acc: 'den', dat: 'dem', gen: 'des' },
    feminine: { nom: 'die', acc: 'die', dat: 'der', gen: 'der' },
    neuter: { nom: 'das', acc: 'das', dat: 'dem', gen: 'des' },
  };
  const a = arts[gender];
  const genSuffix =
    gender === 'masculine' || gender === 'neuter'
      ? noun.endsWith('s') || noun.endsWith('x') || noun.endsWith('z')
        ? 'es'
        : 's'
      : '';

  return {
    genderInfo,
    singular: {
      Nominativ: `${a.nom} ${noun}`,
      Akkusativ: `${a.acc} ${noun}`,
      Dativ: `${a.dat} ${noun}`,
      Genitiv: `${a.gen} ${noun}${genSuffix}`,
    },
    plural: {
      Nominativ: `die ${pluralBase}`,
      Akkusativ: `die ${pluralBase}`,
      Dativ: `den ${pluralBase}n`,
      Genitiv: `der ${pluralBase}`,
    },
  };
}

// ─── Main lookupWord ───────────────────────────────────────────────────────
export async function lookupWord(query, lang = 'de') {
  const q = (query || '').trim();
  if (!q) return null;
  const cacheKey = `${lang}:${q.toLowerCase()}`;

  if (memCache.has(cacheKey)) return memCache.get(cacheKey);
  const cached = getCached(cacheKey);
  if (cached) {
    memCache.set(cacheKey, cached);
    return cached;
  }

  const local = findLocalWord(q);
  const wordStr = local ? local.word : q;
  const bareWord = wordStr.replace(/^(der|die|das)\s+/i, '').trim();
  const genderInfo = detectGender(wordStr);
  const isNoun = !!genderInfo;
  const isVerb = !isNoun && (wordStr.endsWith('en') || wordStr.endsWith('ern') || wordStr.endsWith('eln'));

  // Wiktionary definitions
  let wiktDefs = null;
  try {
    wiktDefs = await fetchWiktionary(bareWord, lang);
  } catch {
    // ignore
  }

  // Collect and sanitize additional examples
  const additionalExamples = [];
  if (wiktDefs) {
    for (const group of wiktDefs) {
      for (const def of group.defs) {
        for (const ex of def.examples) {
          const cleanEx = stripHtml(ex);
          if (cleanEx && cleanEx.length > 5 && !additionalExamples.includes(cleanEx)) {
            additionalExamples.push(cleanEx);
          }
        }
      }
    }
  }

  const smartExplainer = getSmartExplainer(wordStr);

  const result = {
    word: wordStr,
    bareWord,
    translation: local?.translation || null,
    genderInfo,
    isNoun,
    isVerb,
    example: local?.example ? stripHtml(local.example) : null,
    exampleTranslation: local?.exampleTranslation ? stripHtml(local.exampleTranslation) : null,
    grammarNote: local?.grammarNote || null,
    synonyms: local?.synonyms || [],
    verbForms: isVerb ? buildVerbForms(wordStr) : null,
    nounForms: isNoun ? buildNounForms(wordStr) : null,
    definitions: wiktDefs || [],
    additionalExamples: additionalExamples.slice(0, 4),
    smartExplainer,
    sourceLang: lang,
  };

  memCache.set(cacheKey, result);
  setCache(cacheKey, result);
  return result;
}
