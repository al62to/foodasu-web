// "So geht's", Kapitel "Haushalt anlegen und Meiden": Bereich "Haushalt und Meiden" der App (Stand 0.14.3).
import { foto, link } from './hilfen.mjs';

export default {
  slug: 'haushalt-und-meiden',
  symbol: 'personen',
  leitbild: 'haushalt_person_05',
  titel: 'Haushalt anlegen und Meiden',
  kurz: 'Personen anlegen, Einträge wählen, die drei Stufen.',
  vorspann: 'Lege für jede Person fest, was sie meidet, und wie deutlich FoodAsu darauf hinweist.',
  teile: [
    {
      titel: 'Wozu der Haushalt da ist',
      anker: 'wozu-der-haushalt-da-ist',
      symbol: 'personen',
      absaetze: [
        'Im Reiter Haushalt legst du für jede Person fest, was sie meidet, etwa Milch, Erdnüsse oder Schweinefleisch. Beim Scannen zeigt die App dann, wen ein Produkt laut Daten betrifft. Ohne Haushalt zeigt sie die Angaben zu einem Produkt ohne Urteil.',
      ],
    },
    {
      titel: 'Person hinzufügen',
      anker: 'person-hinzufuegen',
      symbol: 'person',
      gross: true,
      funktionen: ['HAUSHALT-01'],
      nutzen: 'Du legst für jede Person im Haushalt einen Namen oder ein Kürzel an. Der Name bleibt nur auf diesem Gerät.',
      wo: 'Haushalt > „Person hinzufügen“',
      fotos: [foto('haushalt_person_05', 'Ein Haushalt mit drei Personen')],
    },
    {
      titel: 'Was du auswählen kannst',
      anker: 'was-du-auswaehlen-kannst',
      symbol: 'haken',
      funktionen: ['HAUSHALT-02'],
      nutzen: 'Du tippst an, was die Person meidet: 14 Zutaten wie Gluten, Milch oder Schalenfrüchte, die Ernährungsformen vegan und vegetarisch und vier weitere Einträge wie Schweinefleisch oder Palmöl.',
      wo: 'Haushalt > Person > „Was meidet …?“',
      fotos: [foto('haushalt_meiden_01', 'Antippen, was die Person meidet')],
    },
    {
      titel: 'Die drei Stufen',
      anker: 'die-drei-stufen',
      symbol: 'regler',
      gross: true,
      funktionen: ['HAUSHALT-03'],
      nutzen: 'Für jeden Eintrag wählst du, wie deutlich FoodAsu darauf hinweist: „Auf keinen Fall“, „Meiden“ oder „Lieber nicht“. Was jede Stufe bedeutet, steht in der App direkt bei der Auswahl.',
      wo: 'Haushalt > Person > „Wie streng?“',
      fotos: [foto('haushalt_stufen_01', 'Der Abschnitt „Wie streng?“')],
    },
    {
      titel: 'Person bearbeiten oder löschen',
      anker: 'person-bearbeiten',
      symbol: 'stift',
      alteAnker: ['aendern-sortieren-loeschen'],
      funktionen: ['HAUSHALT-04'],
      nutzen: 'Du änderst Name, Einträge und Stufen einer Person oder entfernst sie mit allem, was sie meidet. Löschen lässt sich nicht rückgängig machen.',
      wo: 'Haushalt > Karte der Person; Löschen über den Papierkorb an der Karte',
    },
    {
      titel: 'Personen sortieren',
      anker: 'personen-sortieren',
      symbol: 'sortieren',
      funktionen: ['HAUSHALT-05'],
      nutzen: 'Du bringst die Personen in die Reihenfolge, die für euch passt.',
      wo: 'Haushalt > Karte lange drücken und ziehen',
    },
    {
      titel: 'Hinweis zu den Angaben',
      anker: 'hinweis-zu-den-angaben',
      symbol: 'info',
      funktionen: ['HAUSHALT-06'],
      nutzen: 'FoodAsu sagt dir, woher die Angaben zu Produkten stammen: aus der offenen Datenbank Open Food Facts. Sie können fehlen oder falsch sein; maßgeblich ist immer die Verpackung.',
      wo: 'erscheint einmal vor der ersten Person; später Einstellungen > „Haushalt“ > „Hinweis zu den Angaben“',
    },
    {
      titel: 'Wo die Angaben bleiben',
      anker: 'wo-die-angaben-bleiben',
      symbol: 'handy',
      absaetze: [
        'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
      ],
      verweis: link('Wie das geht, steht im Kapitel „Einstellungen und deine Daten“: ', 'Haushalt exportieren', '/so-gehts/deine-daten/#haushalt-exportieren'),
    },
  ],
  verweise: [
    { text: 'Scannen und das Urteil verstehen', ziel: '/so-gehts/scannen-und-urteil/' },
    { text: 'Einstellungen und deine Daten', ziel: '/so-gehts/deine-daten/' },
  ],
};
