// "So geht's", Kapitel "Haushalt anlegen und Meiden": Bereich "Haushalt und Meiden" der App (Stand 0.15.2:
// Liste "… meidet", "Hinzufügen" mit Suche und "Häufig gewählt", Blatt "Auswahl festlegen", weitere Lebensmittel aus
// der Zutatenliste der App). Der Abschnitt "Weitere Lebensmittel" steht in der Ich-Form und ohne Doppelpunkt im
// Fließtext; ein eigenes Wort lässt sich in der App nicht eingeben, deshalb verspricht er keines.
import { foto, link } from './hilfen.mjs';
// Zahlen über die App aus der Fassung der App (feste Vorgabe, Ali, 14.10.2026), nie von Hand.
import { appZahlen, zahlwort } from '../app_zahlen.mjs';

export default {
  slug: 'haushalt-und-meiden',
  symbol: 'personen',
  leitbild: 'haushalt_person_06',
  titel: 'Haushalt anlegen und Meiden',
  kurz: `Personen anlegen, Einträge wählen, die ${zahlwort(appZahlen.stufen)} Stufen.`,
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
      fotos: [foto('haushalt_person_06', 'Ein Haushalt mit drei Personen')],
    },
    {
      titel: 'Was du auswählen kannst',
      anker: 'was-du-auswaehlen-kannst',
      symbol: 'haken',
      funktionen: ['HAUSHALT-02'],
      nutzen: `Unter „Hinzufügen“ stellst du für jede Person zusammen, was sie meidet. Zur Auswahl stehen ${appZahlen.zutatenFest} Zutaten wie Gluten, Milch oder Schalenfrüchte, die Ernährungsformen vegan und vegetarisch und ${zahlwort(appZahlen.weitereFest)} Einträge wie Schweinefleisch oder Palmöl. ${zahlwort(appZahlen.haeufigGewaehlt, true)} davon stehen gleich unter „Häufig gewählt“, die übrigen findest du über die Suche.`,
      wo: 'Haushalt > Person > „Hinzufügen“',
      fotos: [foto('haushalt_hinzufuegen_01', '„Hinzufügen“ mit der Suche und „Häufig gewählt“')],
    },
    {
      // Neu mit 0.15 (AP-28). Der Anker bleibt, auch wenn sich der Titel ändert.
      titel: 'Weitere Lebensmittel',
      anker: 'weitere-lebensmittel',
      symbol: 'lupe',
      funktionen: ['HAUSHALT-09'],
      nutzen: 'Fehlt dir etwas in der Auswahl, suchst du unter „Hinzufügen“ weitere Lebensmittel, etwa Zimt oder Erdbeeren. Sie gelten für gescannte Produkte. Rezepte und Listen folgen später.',
      wo: 'Haushalt > Person > „Hinzufügen“ > „Lebensmittel suchen“',
      fotos: [foto('haushalt_suche_01', 'Die Suche nach „zimt“ mit ihren Vorschlägen')],
      liste: [
        { name: 'Suchen und wählen', text: 'Du tippst ein paar Buchstaben und wählst einen Vorschlag aus der Zutatenliste der App. Ein eigenes Wort lässt sich nicht eintippen.' },
        { name: '„Zählt mit“', text: 'Ein Oberbegriff nimmt mit, was darunter fällt. Wer Zimt wählt, meidet auch Zimtpulver. Das Blatt „Auswahl festlegen“ zeigt unter „Zählt mit“, was dazugehört.' },
        { name: '„Wie streng?“', text: 'Im selben Blatt legst du die Stufe fest, wie bei jedem anderen Eintrag.' },
        { name: 'Ändern oder entfernen', text: 'Ein Tipp auf einen Eintrag öffnet das Blatt wieder. Dort änderst du die Stufe oder nimmst ihn mit „Aus der Liste entfernen“ heraus. Alles gilt erst, wenn du unten auf der Seite „Speichern“ antippst. Gehst du vorher zurück, fragt FoodAsu, ob es speichern soll.' },
        { name: 'Auf der Produktkarte', text: 'Die Produktkarte nennt das Lebensmittel beim Namen, etwa „Nicht für Mia: enthält Zimt“. „Warum?“ zeigt, welches Wort FoodAsu in den Angaben gefunden hat. Maßgeblich ist immer die Verpackung.' },
        { name: '„Nicht gefunden?“', text: 'Findest du ein Lebensmittel nicht, schreib mir über „Feedback geben“, was dir fehlt. Ich sehe mir an, ob es in die Liste kommen kann.' },
      ],
    },
    {
      titel: `Die ${zahlwort(appZahlen.stufen)} Stufen`,
      anker: 'die-drei-stufen',
      symbol: 'regler',
      gross: true,
      funktionen: ['HAUSHALT-03'],
      nutzen: 'Für jeden Eintrag wählst du, wie deutlich FoodAsu darauf hinweist: „Auf keinen Fall“, „Meiden“ oder „Lieber nicht“. Was jede Stufe bedeutet, steht in der App direkt bei der Auswahl.',
      wo: 'Haushalt > Person > Eintrag antippen oder „Hinzufügen“ > „Wie streng?“',
      fotos: [foto('haushalt_auswahl_01', `Das Blatt „Auswahl festlegen“ mit den ${zahlwort(appZahlen.stufen)} Stufen`)],
    },
    {
      titel: 'Person bearbeiten oder löschen',
      anker: 'person-bearbeiten',
      symbol: 'stift',
      alteAnker: ['aendern-sortieren-loeschen'],
      funktionen: ['HAUSHALT-04'],
      nutzen: 'Du änderst Name, Einträge und Stufen einer Person oder entfernst sie mit allem, was sie meidet. Löschen lässt sich nicht rückgängig machen.',
      wo: 'Haushalt > Karte der Person; Löschen über den Papierkorb an der Karte',
      fotos: [foto('haushalt_liste_01', 'Die Liste „Mia meidet“ mit drei Einträgen')],
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
