import json

synonyms_dict = {
    "der Alltag": ["das tägliche Leben", "die Routine"],
    "die Erfahrung": ["das Erlebnis", "die Praxis"],
    "die Entscheidung": ["der Entschluss", "die Wahl"],
    "unterstützen": ["helfen", "fördern"],
    "erfolgreich": ["siegreich", "gewinnreich", "gelungen"],
    "die Gesellschaft": ["die Gemeinschaft", "die Sozietät"],
    "das Unternehmen": ["die Firma", "der Betrieb"],
    "verantwortlich": ["zuständig", "haftbar"],
    "die Entwicklung": ["der Fortschritt", "die Entfaltung"],
    "die Beziehung": ["das Verhältnis", "die Verbindung"],
    "die Wirtschaft": ["die Ökonomie"],
    "das Ziel": ["der Zweck", "die Absicht", "das Ende"],
    "erreichen": ["erlangen", "schaffen"],
    "die Ausbildung": ["die Lehre", "das Studium"],
    "die Herausforderung": ["die Aufgabe", "das Problem"],
    "die Möglichkeit": ["die Chance", "die Gelegenheit"],
    "der Bereich": ["das Gebiet", "der Sektor"],
    "die Bedingung": ["die Voraussetzung", "die Anforderung"],
    "die Regierung": ["das Kabinett", "die Staatsführung"],
    "der Grund": ["die Ursache", "das Motiv"],
    "der Vorteil": ["der Nutzen", "das Plus"],
    "der Nachteil": ["das Manko", "der Schaden"],
    "das Ergebnis": ["das Resultat", "die Folge"],
    "der Erfolg": ["der Triumph", "der Sieg"],
    "die Bedeutung": ["der Sinn", "die Wichtigkeit"],
    "vergleichen": ["gegenüberstellen", "abwägen"],
    "der Unterschied": ["die Differenz", "die Abweichung"],
    "die Lösung": ["die Antwort", "die Klärung"],
    "der Teilnehmer": ["der Mitwirkende", "der Anwesende"],
    "die Veranstaltung": ["das Event", "das Ereignis"],
    "das Verhalten": ["das Benehmen", "die Attitüde"],
    "die Erinnerung": ["das Andenken", "das Gedächtnis"],
    "erwarten": ["hoffen", "entgegensehen"],
    "die Sicherheit": ["der Schutz", "die Gewissheit"],
    "der Einfluss": ["die Wirkung", "die Macht"],
    "die Verbesserung": ["die Optimierung", "die Korrektur"],
    "der Mitarbeiter": ["der Angestellte", "der Kollege"],
    "die Umgebung": ["das Umfeld", "die Nachbarschaft"],
    "das Angebot": ["die Offerte", "der Vorschlag"],
    "die Nachfrage": ["der Bedarf", "das Interesse"],
    "die Gesundheit": ["das Wohlbefinden"],
    "die Zukunft": ["das Morgen", "die kommende Zeit"],
    "die Vergangenheit": ["das Gestern", "die Historie"],
    "der Fehler": ["der Irrtum", "der Makel"],
    "die Wahrheit": ["die Realität", "die Tatsache"],
    "das Gefühl": ["die Emotion", "die Empfindung"],
    "der Traum": ["die Vision", "die Fantasie"],
    "die Gefahr": ["das Risiko", "die Bedrohung"],
    "die Leistung": ["das Resultat", "das Werk"],
    "der Anspruch": ["die Forderung", "das Recht"]
}

def update_words():
    path = 'webapp/src/data/words.json'
    with open(path, 'r', encoding='utf-8') as f:
        words = json.load(f)
        
    for word in words:
        if word['word'] in synonyms_dict:
            word['synonyms'] = synonyms_dict[word['word']]
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    update_words()
    print("Done adding synonyms")
