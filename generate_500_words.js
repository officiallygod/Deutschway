const fs = require('fs');
const path = require('path');

async function translate(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=de&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[0][0][0];
  } catch (e) {
    return text;
  }
}

async function run() {
  console.log("Fetching top English words...");
  const res = await fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt');
  const text = await res.text();
  const wordsList = text.split('\n').filter(w => w.length > 2); // Exclude very short words
  
  const wordsFile = path.join(__dirname, 'webapp/src/data/words.json');
  let existing = [];
  if (fs.existsSync(wordsFile)) {
    existing = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));
  }
  
  const existingTranslations = new Set(existing.map(w => w.translation.toLowerCase()));
  const newWords = [];
  
  let i = 0;
  let added = 0;
  while (added < 500 && i < wordsList.length) {
    const enWord = wordsList[i];
    i++;
    if (existingTranslations.has(enWord.toLowerCase())) continue;
    
    const deWord = await translate(enWord);
    
    // Skip if translation failed or returned the same English word (meaning Google Translate couldn't translate it well)
    if (deWord.toLowerCase() === enWord.toLowerCase()) continue;

    const enCapitalized = enWord.charAt(0).toUpperCase() + enWord.slice(1);
    const deCapitalized = deWord.charAt(0).toUpperCase() + deWord.slice(1);
    
    newWords.push({
      word: deCapitalized,
      translation: enCapitalized,
      example: `Ich brauche ${deWord}.`,
      exampleTranslation: `I need ${enWord}.`,
      grammarNote: "Common vocabulary.",
      synonyms: []
    });
    
    added++;
    if (added % 50 === 0) console.log(`Added ${added} words...`);
    await new Promise(r => setTimeout(r, 100)); // rate limit
  }
  
  const allWords = [...existing, ...newWords];
  fs.writeFileSync(wordsFile, JSON.stringify(allWords, null, 2));
  console.log(`Successfully added ${newWords.length} new words. Total is now ${allWords.length}.`);
}

run();
