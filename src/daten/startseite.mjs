// Alle Texte der Startseite an einer Stelle (AP-15 Teil B, Abschnitte 1 bis 8). Von Ali am 09.10.2026 freigegeben.
// Die Datei Website_Texte_Startseite.md entsteht daraus mit tools/texte_ausgeben.mjs.
// Titel der Startseite. Die Beschreibung steht mit denen aller Seiten in src/daten/meta.mjs.
// Titel seit dem Nachtrag zu AP-23 (Änderung Ali vom 11.10.2026): Scanner und Einkaufsliste zusammen. Die längere
// Fassung "FoodAsu: Lebensmittel-Scanner und Einkaufsliste für den Haushalt" ist in der Vorschau der Suche 595 Pixel
// breit (Grenze 580) und hat 64 Zeichen (Grenze 60); deshalb gilt die kurze.
import { lizenzen } from './lizenzen.mjs';

export const kopfdaten = {
  titel: 'FoodAsu: Lebensmittel-Scanner und Einkaufsliste',
};

export const kopf = {
  // Vorzeile (AP-22, Wunsch Ali vom 10.10.2026: jede h1 mit Suchwort; freigegeben am 10.10.2026): steht klein über
  // der Überschrift und gehört zur h1. Die Überschrift selbst bleibt.
  vorzeile: 'Lebensmittel-Scanner und Einkaufsliste in einer App',
  ueberschrift: ['Passt es für ', 'alle', '?'],
  // Seit AP-22 Teil 2 steht im Kopf der Startseite der Satz zur Beschreibung (seite.beschreibung in seite.mjs). Dieser
  // frühere Vorspann sagt dasselbe kürzer und steht nur noch in llms.txt.
  text: 'Du scannst den Strichcode und siehst, ob laut den Angaben etwas drin ist, das jemand bei dir zu Hause meidet. Für jede Person einzeln.',
  aufruf: 'Bald im Play Store',
  zweiterKnopf: 'Eine Einkaufswoche',
  // Satz zur Verfügbarkeit (Projektleitung, 11.10.2026, Nachtrag zu AP-23 Teil A Nr. 2), wörtlich und gleich an drei
  // Stellen: hier, in der Antwort "Wo bekomme ich FoodAsu?" (fragen.mjs) und unter "Wo FoodAsu steht" (ueber.mjs). Nur
  // sein letzter Satz nennt die Plattform; sonst wird FoodAsu ohne Plattform beschrieben.
  stand: 'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Zuerst kommt die App für Android in den Play Store, danach folgt die Version fürs iPhone.',
  handy: {
    beschreibung:
      'Beispiel aus der App: Ein Müsli wird gescannt. Das Urteil lautet „Nicht für Mia: enthält Schalenfrüchte“. Für Jonas und Elif steht „Kein Konflikt laut Daten“.',
    produkt: 'Nussmüsli',
    zusatz: '500 g',
    urteil: 'Nicht für Mia: enthält Schalenfrüchte',
    personen: [
      { name: 'Mia', ergebnis: 'enthält' },
      { name: 'Jonas', ergebnis: 'Kein Konflikt laut Daten' },
      { name: 'Elif', ergebnis: 'Kein Konflikt laut Daten' },
    ],
    knopf: 'Warum?',
  },
  begriffe: ['Nüsse', 'Gluten', 'Schweinefleisch', 'Palmöl'],
};

export const wort = {
  vorsatz: 'Einkaufen ohne',
  // "Eier" statt "Schweinefleisch" (Projektleitung, 11.10.2026, Nachtrag zu AP-23 Teil B Nr. 6): Die Wörter stehen
  // als Chips neben dem Absatz mit Alis Unterschrift. Am Ende "Zettel" und "Rätselraten" (Änderung 2 zum Nachtrag,
  // Ali, 11.10.2026): Die beiden sind keine Einträge zum Meiden und passen zum Absatz über die Einkaufsliste. Jedes
  // Wort muss nach "Einkaufen ohne" grammatisch stimmen.
  woerter: ['Nüsse', 'Gluten', 'Eier', 'Alkohol', 'Palmöl', 'Sesam', 'Milch', 'Zettel', 'Rätselraten'],
  // Absatz mit Alis Unterschrift (Änderung 2 zum Nachtrag zu AP-23, Ali, 11.10.2026; wörtlich): in der Ich-Form, ohne
  // Doppelpunkt, nur was die App kann (gespeicherte Listen, Zutaten aus dem Rezept auf die Liste, Scannen). Darunter
  // die Unterschrift und ein Link auf "Warum es FoodAsu gibt".
  absaetze: [
    'Ehrlich gesagt war mir die Einkaufsliste jede Woche eine Qual. Neu schreiben, etwas vergessen, im Chatverlauf suchen.',
    'Mit FoodAsu habe ich mir das leichter gemacht. Meine Listen bleiben gespeichert, die Zutaten aus dem Rezept kommen ohne Tippen dazu, und beim Scannen sehe ich, was laut den Angaben im Produkt ist.',
  ],
  unterschrift: 'Ali Tonc, Entwickler von FoodAsu',
  link: { text: 'Warum es FoodAsu gibt', ziel: '/ueber-foodasu/#warum' },
};

// Der Ablauf einer Einkaufswoche (AP-22 Teil 2 Nr. 2, von Ali am 10.10.2026 freigegeben): vier Schritte statt
// "FoodAsu in drei Schritten" (Scannen, Warum?, Kochen; freigegeben am 09.10.2026). Der Anker #schritte bleibt.
// Beschrieben ist nur, was 0.14.3 kann: Abgehakt wird mit dem Finger, nicht beim Scannen. Schritt 3 nennt "Warum?"
// (Entscheidung 5). Seit AP-23 stehen die Schritte als Nummern im Kreis an einer feinen Linie, ohne Zeichen.
export const schritte = {
  ueberschrift: 'Eine Einkaufswoche mit FoodAsu',
  liste: [
    {
      titel: 'Rezept aussuchen',
      text: 'Such dir in der App aus über 300 Rezepten aus, was es geben soll. Die fehlenden Zutaten setzt du aus dem Rezept auf eine Einkaufsliste.',
    },
    {
      titel: 'Zu Hause schreiben',
      text: 'Schreib dazu, was sonst noch fehlt, zum Beispiel „2 Zwiebeln“. FoodAsu ordnet die Liste nach Warengruppen.',
    },
    {
      titel: 'Im Laden abhaken und scannen',
      text: 'Ein Tipp mit dem Finger hakt ab, was im Wagen liegt. Bei einem Produkt scannst du den Strichcode und siehst für jede Person einzeln, was die Daten zum Produkt sagen. Ein Tipp auf „Warum?“ zeigt, welche Zutat oder Spurenangabe dahintersteckt.',
    },
    {
      titel: 'Kochen',
      text: 'Gekocht wird für alle am Tisch: Im Rezept steht bei den Zutaten, wen in deinem Haushalt etwas betrifft.',
    },
  ],
  link: { text: 'Zu Hause schreiben, im Laden abhaken: so geht das', ziel: '/so-gehts/zu-hause-schreiben-im-laden-abhaken/' },
};

// Alltagslagen (AP-22 Teil 2 Nr. 3, von Ali am 10.10.2026 freigegeben): vier Lagen aus einem Haushalt, je mit dem, was
// FoodAsu dann zeigt. Die Einträge heißen wie in der App; keine Namen, keine Aussagen zur Gesundheit. Dazu nach
// Entscheidung 9 der Satz, für wen FoodAsu ist, und als fünfte Lage der Wocheneinkauf ("breit": Karte über die ganze
// Zeile): Listen bleiben gespeichert, Erledigtes lässt sich zurückholen (LISTE-04), Vorschläge beim Tippen (LISTE-03).
// Seit AP-23 stehen die ersten vier Lagen um einen runden Tisch: "schild" ist das Schildchen am Teller (schmückt nur,
// für Bildschirmleser ausgeblendet). "liste" ist die kleine Einkaufsliste neben dem Wocheneinkauf (ebenso).
export const lagen = {
  ueberschrift: 'Wenn nicht alle dasselbe essen',
  text: 'FoodAsu ist für alle, die wissen wollen, was sie einkaufen, statt blind zuzugreifen.',
  karten: [
    {
      titel: 'Das Kind trinkt keine Milch',
      schild: 'Kind · Milch',
      text: 'Du trägst beim Kind „Milch“ ein. Beim Scannen steht dann oben auf der Karte, wenn laut den Angaben Milch im Produkt ist.',
    },
    {
      titel: 'Der Partner isst vegetarisch',
      schild: 'Partner · Vegetarisch',
      text: 'Mit „Vegetarisch“ weist FoodAsu auf Zutaten hin, die laut den Angaben nicht vegetarisch sind: beim Produkt und bei den Zutaten der Rezepte.',
    },
    {
      titel: 'Gäste essen kein Schweinefleisch',
      schild: 'Gäste · Schweinefleisch',
      text: 'Leg für den Besuch eine Person an und wähl „Schweinefleisch“ mit der Stufe „Auf keinen Fall“. Rezepte mit Schweinefleisch blendet FoodAsu dann aus und nennt ihre Zahl.',
    },
    {
      titel: 'Die Oma meidet Gluten',
      schild: 'Oma · Gluten',
      text: 'Steht „Gluten“ bei ihr, siehst du es schon auf der Einkaufsliste: Betrifft ein Eintrag jemanden im Haushalt, steht ein Hinweis dabei.',
    },
    {
      titel: 'Der Wocheneinkauf ist jede Woche fast derselbe',
      text: 'Deine Liste bleibt gespeichert. Was abgehakt ist, steht unter „Erledigt“, und von dort holst du zurück, was du wieder brauchst. Beim Schreiben schlägt FoodAsu Wörter vor, auch solche, die du schon einmal aufgeschrieben hast. Kein Zettel, kein Suchen im Chatverlauf.',
      breit: true,
    },
  ],
  liste: { titel: 'Wocheneinkauf', offen: ['2 Zwiebeln', 'Brot', 'Tomaten'], erledigtTitel: 'Erledigt', erledigt: ['Mozzarella', 'Basilikum'] },
  hinweis: 'FoodAsu zeigt, was laut Daten im Produkt ist. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
};

// Sechs Funktionen (seit AP-23 ohne Kästen: je ein Zeichen im Lavendel-Quadrat, Titel und Text). "symbol" nennt das
// Zeichen in index.astro.
export const funktionen = {
  ueberschrift: 'Scanner, Einkaufsliste und Rezepte in einer App',
  karten: [
    {
      kennung: 'scanner',
      symbol: 'scan',
      titel: 'Scannen und sofort sehen',
      text: 'FoodAsu prüft Zutaten und Spurenangaben für jede Person einzeln. Das Ergebnis heißt „enthält“, „Spuren“, „Angaben unvollständig“ oder „Kein Konflikt laut Daten“.',
    },
    {
      kennung: 'haushalt',
      symbol: 'haushalt',
      titel: 'Dein Haushalt',
      text: 'Für jede Person eigene Einträge. Drei Stufen von „Lieber nicht“ bis „Auf keinen Fall“; die strengste warnt auch bei Spuren.',
    },
    {
      kennung: 'liste',
      symbol: 'liste',
      titel: 'Einkaufsliste, sortiert wie im Supermarkt',
      // AP-22 Teil 2 Nr. 4 und Entscheidung 9: Neu sind der zweite Satz (Listen bleiben gespeichert, Vorschläge) und der
      // letzte ("als Text teilen").
      text: 'Schreib auf, was du brauchst, oder setz die fehlenden Zutaten eines Rezepts auf die Liste. Deine Listen bleiben gespeichert, und beim Schreiben schlägt FoodAsu vor, was du schon einmal aufgeschrieben hast. Betrifft ein Eintrag jemanden im Haushalt, steht ein Hinweis dabei. Die Liste kannst du als Text teilen, zum Beispiel mit jemandem, der einkaufen geht.',
    },
    {
      kennung: 'rezepte',
      symbol: 'buch',
      titel: 'In der App: über 300 Rezepte aus 25 Ländern',
      text: 'Jedes mit einem Symbolbild. Bei den Zutaten steht, wen sie betreffen.',
    },
    {
      kennung: 'kochen',
      symbol: 'topf',
      titel: 'Was kann ich damit kochen?',
      text: 'Rezepte zu deiner Einkaufsliste: FoodAsu zeigt Gerichte, für die schon Zutaten auf der Liste stehen, und was noch fehlt.',
    },
    {
      kennung: 'daten',
      symbol: 'handy',
      titel: 'Kein Konto, keine Werbung, kein Verkauf von Daten.',
      text: 'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
    },
  ],
};

// Abschnitt "FoodAsu im Bild" (AP-19 Teil G, Entscheidung Ali vom 10.10.2026): sechs Bildschirmfotos der App, je mit
// einem Satz zum Nutzen und einem Link auf die passende Stelle von "So geht's". "datei" nennt das Bildschirmfoto wie in
// src/daten/anleitung (gebaut mit tools/sogehts_fotos.py); die Bildbeschreibung kommt aus sogehts_fotos.json.
export const einblick = {
  ueberschrift: 'FoodAsu im Bild',
  text: 'Sechs Bildschirmfotos aus der App. Jedes führt zu der Stelle der Anleitung, die es erklärt.',
  karten: [
    {
      datei: 'karte_urteil_01',
      titel: 'Das Urteil für den Haushalt',
      text: 'Oben auf der Produktkarte steht, für wen ein Produkt laut Daten nicht passt. Darunter steht jede Person einzeln.',
      ziel: '/so-gehts/scannen-und-urteil/#das-urteil',
    },
    {
      datei: 'liste_eintraege_02',
      titel: 'Zu Hause aufschreiben',
      text: 'Schreib auf, was du brauchst, zum Beispiel „2 Zwiebeln“. Scannen musst du dafür nichts.',
      ziel: '/so-gehts/zu-hause-schreiben-im-laden-abhaken/#zu-hause',
    },
    {
      datei: 'liste_abhaken_02',
      titel: 'Im Laden abhaken',
      text: 'Ein Tipp auf das Kästchen hakt ab. Erledigtes rutscht nach unten, oben bleibt, was noch fehlt.',
      ziel: '/so-gehts/einkaufslisten/#abhaken',
    },
    {
      datei: 'liste_kochen_01',
      titel: 'Was kann ich damit kochen?',
      text: 'FoodAsu zeigt Rezepte, für die schon vieles auf deiner Liste steht, und sagt, was noch fehlt.',
      ziel: '/so-gehts/einkaufslisten/#was-kann-ich-damit-kochen',
    },
    {
      datei: 'rezepte_hinweise_01',
      titel: 'Hinweise bei den Zutaten',
      text: 'Im Rezept steht bei den Zutaten, wen in deinem Haushalt etwas betrifft.',
      ziel: '/so-gehts/rezepte/#hinweise-bei-zutaten',
    },
    {
      datei: 'haushalt_stufen_01',
      titel: 'Drei Stufen je Eintrag',
      text: 'Für jeden Eintrag wählst du, wie deutlich FoodAsu hinweist: von „Lieber nicht“ bis „Auf keinen Fall“.',
      ziel: '/so-gehts/haushalt-und-meiden/#die-drei-stufen',
    },
  ],
  hinweis: 'Die Bildschirmfotos zeigen die App mit einem erfundenen Beispielhaushalt. Namen, Marken und Fotos von Produkten sind unkenntlich gemacht.',
  link: "Die ganze Anleitung: So geht's",
  ziel: '/so-gehts/',
};

export const zahlen = {
  ueberschrift: 'Die App in Zahlen',
  zutatenband: [
    'Nüsse (Schalenfrüchte)', 'Erdnüsse', 'Gluten', 'Milch', 'Eier', 'Soja', 'Sesam', 'Sellerie', 'Senf', 'Fisch',
    'Krebstiere', 'Weichtiere', 'Lupinen', 'Sulfite', 'Schweinefleisch', 'Gelatine', 'Alkohol', 'Palmöl',
    'vegetarisch', 'vegan',
  ],
  rezeptband: [
    'Wiener Schnitzel', 'Pizza Margherita', 'Ratatouille', 'Baklava', 'Bibimbap', 'Massaman-Curry',
    'Mercimek çorbası',
  ],
  zaehler: [
    { zahl: 306, wort: 'Rezepte in der App' },
    { zahl: 25, wort: 'Länder' },
    { zahl: 20, wort: 'Einträge zum Meiden' },
    { zahl: 0, wort: 'Werbung' },
  ],
};

export const vorschau = {
  ueberschrift: 'Kochen für alle am Tisch',
  text: 'Bei den Zutaten steht, wen sie betreffen. Enthält ein Rezept etwas, das jemand auf keinen Fall will, blendet FoodAsu es aus und nennt die Zahl der ausgeblendeten Rezepte.',
  // "datei" ist der Name des Bildes unter public/bilder/rezepte (gebaut mit tools/bilder_bauen.py).
  karten: [
    { titel: 'Wiener Schnitzel', datei: 'wiener-schnitzel' },
    { titel: 'Pizza Margherita', datei: 'pizza-margherita' },
    { titel: 'Ratatouille', datei: 'ratatouille' },
    { titel: 'Baklava', datei: 'baklava' },
  ],
  kennzeichnung: 'Symbolbild',
  // Auf der Website stehen 40 Rezepte, alle über 300 gibt es nur in der App (Ali, 09.10.2026).
  hinweis: 'Über 300 Rezepte gibt es in der App, 40 davon stehen hier.',
  link: '40 Rezepte auf der Website ansehen',
};

// Fragen und Antworten stehen seit AP-22 in src/daten/fragen.mjs.
export { fragen } from './fragen.mjs';

// Fußzeile A (Entscheidung Ali vom 10.10.2026, AP-18 Teil D): links Logo und Satz, daneben drei Spalten, unten eine
// schmale Zeile. Der Hinweis zur Verpackung steht weiter auf jeder Seite, jetzt unter dem Satz.
export const fuss = {
  satz: 'Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt.',
  hinweis: 'Maßgeblich ist die Verpackung.',
  spalten: { recht: 'Rechtliches', foodasu: 'FoodAsu', folgen: 'Folge uns' },
  links: { datenschutz: 'Datenschutz', offenlegung: 'Offenlegung', lizenzen: 'Lizenzen', quellen: 'Quellen und Lizenzen', kontakt: 'Kontakt per E-Mail' },
  // Zweite Spalte: dieselben Ziele wie in der Hauptnavigation, dazu der Kontakt.
  seiten: [
    { titel: "So geht's", ziel: '/so-gehts/' },
    { titel: 'Rezepte', ziel: '/rezepte/' },
    { titel: 'Fragen', ziel: '/fragen/' },
    // AP-22: woher die Angaben kommen, verständlich erklärt; die Einzelnachweise bleiben unter "Quellen und Lizenzen".
    { titel: 'Daten und Quellen', ziel: '/daten-und-quellen/' },
    // AP-22 Teil 2 Nr. 5.
    { titel: 'Über FoodAsu', ziel: '/ueber-foodasu/' },
  ],
  rechte: '© 2026 FoodAsu · Eine App von Ali',
  auftritte: {
    facebook: 'Facebook',
    instagram: 'Instagram',
    storeBald: 'Bald im Play Store',
    storeLink: 'FoodAsu bei Google Play',
  },
};

// Texte des Gerüsts außerhalb der Startseite.
export const geruest = {
  sprung: 'Zum Inhalt springen',
  marke: 'FoodAsu, Startseite',
  navigation: 'Hauptnavigation',
  menue: 'Menü',
  menueZu: 'Menü schließen',
  // Schalter in der Kopfzeile, am Handy im Menü (AP-18 Teil C): aus = hell, an = dunkel, wie in der App.
  modus: 'Dunkler Modus',
  brotkrumen: 'Brotkrumen',
  recht: { datenschutz: 'Datenschutz', inhalt: 'Inhalt' },
  // Eigene Seite der Offenlegung (AP-17 Teil E1). Der Wortlaut kommt aus dem Baustein src/inhalte/offenlegung.html.
  offenlegung: { titel: 'Offenlegung' },
  fragenSeite: {
    titel: 'Fragen und Antworten',
    // Überschrift der Seite (h1) mit dem Namen der App; "titel" bleibt für Brotkrumen und Menü.
    h1: 'Fragen und Antworten zu FoodAsu',
    beschreibung: 'Woher die Daten von FoodAsu kommen, was mit deinen Angaben passiert und warum die Verpackung maßgeblich bleibt.',
  },
  // Knopf der Startseite, der die Bewegung anhält (WCAG 2.2.2). Der Zustand gilt nur für den Besuch.
  bewegung: { anhalten: 'Bewegung anhalten', fortsetzen: 'Bewegung fortsetzen' },
  // 404-Seite: Wortlaut nach dem Entwurf der Projektleitung (AP-16 Nachtrag Website, Punkt 2), von Ali freigegeben;
  // Aufbau seit AP-23 mittig auf der Lavendel-Fläche, die Null der Zahl ist eine Zitronenscheibe. "themen" nennt die
  // Adressen der sechs Themen; gibt es eine Seite beim Bauen nicht, fällt ihr Chip weg.
  nichtGefunden: {
    etikett: 'Fehler 404',
    zahl: '404',
    titel: ['Diese Seite gibt es ', 'hier nicht.'],
    text: 'Vielleicht ist der Link veraltet oder hat einen Tippfehler. Von hier aus geht es weiter.',
    start: 'Zur Startseite',
    rezepte: 'Zu den Rezepten',
    themenTitel: 'Oder direkt zu einem Thema',
    themen: [
      { titel: 'Rezepte ohne Nüsse', ziel: '/rezepte/ohne-nuesse/' },
      { titel: 'Rezepte ohne Gluten', ziel: '/rezepte/ohne-gluten/' },
      { titel: 'Rezepte ohne Milch', ziel: '/rezepte/ohne-milch/' },
      { titel: 'Rezepte ohne Eier', ziel: '/rezepte/ohne-eier/' },
      { titel: 'Vegetarische Rezepte', ziel: '/rezepte/vegetarisch/' },
      { titel: 'Vegane Rezepte', ziel: '/rezepte/vegan/' },
    ],
    karte: {
      titel: 'Was ist FoodAsu?',
      // Wortlaut vom 11.10.2026 (Nachtrag zu AP-23 Teil A Nr. 6 in der Fassung der Änderung), ohne Plattform.
      text: 'Lebensmittel-Scanner und Einkaufsliste in einer App: Du scannst beim Einkauf und siehst sofort, ob laut den Angaben etwas drin ist, das du meidest.',
      // Der Knopf führt zur Anleitung (bis AP-18 zu den drei Schritten der Startseite).
      knopf: "So geht's",
      ziel: '/so-gehts/',
    },
  },
  // Seite /lizenzen/: Die Texte stehen seit AP-22 in src/daten/lizenzen.mjs.
  lizenzen,
};
