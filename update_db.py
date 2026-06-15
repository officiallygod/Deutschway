import json
import os

file_path = "e:/Projects/german/webapp/src/data/words.json"

with open(file_path, "r", encoding="utf-8") as f:
    words = json.load(f)

for w in words:
    word = w["word"]
    
    # 1. Basic Heuristic for Grammar Notes
    note = "Pay attention to the word's specific context."
    if word.startswith("der ") or word.startswith("die ") or word.startswith("das "):
        if word.endswith("ung"):
            note = "Nouns ending in '-ung' are always feminine (die)."
        elif word.endswith("chen"):
            note = "Nouns ending in '-chen' are always neuter (das) and indicate a diminutive."
        elif word.endswith("keit") or word.endswith("heit"):
            note = "Nouns ending in '-keit' or '-heit' are always feminine (die)."
        elif word.endswith("er"):
            note = "Nouns ending in '-er' often refer to a male person or agent (der)."
        else:
            note = "Memorize the article along with the noun."
    elif word.endswith("en") and " " not in word:
        # likely a verb
        if word in ["sein", "haben", "werden", "können", "müssen", "wollen", "sollen", "dürfen"]:
            note = "This is an irregular or modal verb. Its conjugation must be memorized."
        else:
            note = "Verbs typically go in the second position in a main clause."
    elif word in ["aber", "und", "oder", "denn", "sondern"]:
        note = "Coordinating conjunction: does not change the word order of the following clause."
    
    w["grammarNote"] = note
    
    # 2. Add an empty synonyms array (can be populated later or selectively here)
    if "synonyms" not in w:
        w["synonyms"] = []

# Save back
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(words, f, indent=2, ensure_ascii=False)

print("Database updated with grammar notes and synonyms!")
