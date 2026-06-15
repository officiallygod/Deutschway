export const getGenderInfo = (word) => {
  if (word.startsWith('der ')) return { label: 'Masculine', rule: 'Often ends in -er, -ig, -ling' };
  if (word.startsWith('die ')) return { label: 'Feminine / Plural', rule: 'Often ends in -ung, -keit, -schaft, -tion' };
  if (word.startsWith('das ')) return { label: 'Neuter', rule: 'Often ends in -chen, -lein, -ment' };
  return null;
};

export const FUN_FACTS = [
  "German is the most widely spoken native language in the European Union.",
  "All nouns in German are capitalized!",
  "The longest German word published is 'Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft'.",
  "German has three genders: masculine (der), feminine (die), and neuter (das).",
  "About 60% of English vocabulary shares roots with German."
];

export const getRandomFunFact = () => {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
};
