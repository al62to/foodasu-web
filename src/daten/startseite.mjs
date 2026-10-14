// Alle Texte der Startseite an einer Stelle. Seit dem Auftrag SEO 1 neu (Projektleitung, 14.10.2026,
// docs/vorgaben/SEO_Startseite_neu_2026-10-14.md im Repo einkauf-app) steht die Startseite unter dem Fokus-Keyword
// "Einkaufslisten App" und folgt dem von Ali am 14.10.2026 freigegebenen Entwurf (foodasu-play/seo/entwurf_startseite).
// Die Datei Website_Texte_Startseite.md entsteht daraus mit tools/texte_ausgeben.mjs.
// Feste Regel seit 14.10.2026 (Ali): Werden Texte geändert, bleiben Design, Layout und Animationen gleich; Abschnitte
// werden nur mit Alis Ja gelöscht, verschoben oder umgestaltet.
// Der Titel der Startseite steht hier, die Beschreibung mit denen aller Seiten in src/daten/meta.mjs.
import { appZahlen } from './app_zahlen.mjs';
import { lizenzen } from './lizenzen.mjs';
import { MEDIZIN } from './fragen.mjs';

// Der Satz zum Medizinprodukt in Absätzen zu höchstens zwei Sätzen (zusammen wieder genau MEDIZIN).
const MEDIZIN_ABSAETZE = (() => {
  const saetze = MEDIZIN.split(/(?<=\.) (?=[A-ZÄÖÜ])/);
  const absaetze = [saetze.slice(0, 2).join(' '), ...saetze.slice(2)];
  if (absaetze.join(' ') !== MEDIZIN || saetze.length !== 3) throw new Error('MEDIZIN: drei Sätze erwartet');
  return absaetze;
})();

// Titel (Auftrag SEO 1 neu, "Entschieden"): beginnt immer mit "Einkaufslisten-App". Mit der Marke ist er 77 Zeichen
// und 725 Pixel lang, ohne Marke 67 Zeichen und 628 Pixel; beides liegt über der Grenze von 60 Zeichen und 580 Pixeln. Der Auftrag
// legt fest, dass es dann bei diesem Wortlaut ohne Marke bleibt. src/daten/meta.mjs und tools/pruefe_seiten.mjs nehmen
// genau diesen Wortlaut auf der Startseite von den Grenzen aus; den Namen "FoodAsu" tragen WebSite.name und
// og:site_name.
export const kopfdaten = {
  titel: 'Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt',
};

// GEO-Satz (Auftrag Teil 2 Nr. 6): eine Aussage, die Google und KI-Systeme übernehmen können. Er steht als erster
// Satz der ersten Antwort, gleichlautend in SoftwareApplication.description und in llms.txt. Die Zahl der Rezepte
// kommt aus den Daten. Seit der Entscheidung von Ali vom 14.10.2026 (Auftrag „Veröffentlichung“, Nr. 5) ohne
// Plattform: Die Regel vom 11.10.2026 gilt ohne Ausnahme; die Plattform steht maschinenlesbar in operatingSystem und
// im Satz zur Verfügbarkeit.
export const GEO_SATZ = `FoodAsu ist eine Einkaufslisten-App mit Lebensmittel-Scanner: Einkaufsliste, über ${appZahlen.ueber} Rezepte und ein Scanner, der für jede Person im Haushalt zeigt, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet.`;

// Satz zur Verfügbarkeit (Projektleitung, 11.10.2026), wörtlich: der einzige Satz, der die Plattform nennt. "stand" ist der Hinweis zu Beta und Verfügbarkeit unter den Knöpfen (am Laptop), wörtlich gleich
// in fragen.mjs und ueber.mjs.
export const VERFUEGBAR = 'Zuerst kommt die App für Android in den Play Store, danach folgt die Version fürs iPhone.';
const BETA = 'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback.';

export const kopf = {
  // H1 in drei Teilen (Teil 1 Nr. 2a), ein einziges Element: der erste Teil groß, der zweite groß in Indigo, der dritte
  // kleiner darunter. Die Vorzeile von früher ist entfallen, weil die H1 sie enthält.
  ueberschrift: ['Einkaufslisten-App', 'und Lebensmittel-Scanner', 'für den ganzen Haushalt'],
  // Satz statt des langen Absatzes (Teil 2 Nr. 5): höchstens 15 Wörter, mit "Einkaufsliste". "betont" steht in Indigo
  // wie "alle" im Entwurf.
  satz: { vor: 'Einkaufsliste, Rezepte und Scanner in einer App. Du siehst, ob es für ', betont: 'alle', nach: ' passt.' },
  aufruf: 'Bald im Play Store',
  zweiterKnopf: 'Eine Einkaufswoche',
  stand: `${BETA} ${VERFUEGBAR}`,
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
  // Schwebende Begriffe neben dem Handy. "Schweinefleisch" ist entfallen (Teil 1 Nr. 2e, Wortregel); die übrigen drei
  // stehen an ihren Plätzen von früher ("platz" ist die Lage s1 bis s4 in start.css).
  begriffe: [
    { wort: 'Nüsse', platz: 1 },
    { wort: 'Gluten', platz: 2 },
    { wort: 'Palmöl', platz: 4 },
  ],
};

export const wort = {
  vorsatz: 'Einkaufen ohne',
  // Die wechselnden Wörter (Ali, 11.10.2026); jedes muss nach "Einkaufen ohne" grammatisch stimmen.
  woerter: ['Nüsse', 'Gluten', 'Eier', 'Alkohol', 'Palmöl', 'Sesam', 'Milch', 'Zettel', 'Rätselraten'],
  // Absatz mit Alis Unterschrift, kürzer wie im Entwurf (Teil 1 Nr. 3), mit dem Satz zum Einkaufszettel aus dem
  // Vorschlag. Ich-Form, ohne Doppelpunkt; je Satz ein Absatz, damit kein Absatz am Handy länger als drei Zeilen ist.
  // "laut den Angaben" bleibt (Wortregel), auch wo der Entwurf kürzt.
  absaetze: [
    'Ehrlich gesagt war mir die Einkaufsliste jede Woche eine Qual.',
    'Mit FoodAsu bleiben meine Listen gespeichert, und beim Scannen sehe ich, was laut den Angaben im Produkt ist.',
    'Den Einkaufszettel aus Papier brauche ich dafür nicht mehr.',
  ],
  unterschrift: 'Ali Tonc, Entwickler von FoodAsu',
  link: { text: 'Warum es FoodAsu gibt', ziel: '/ueber-foodasu/#warum' },
};

// Eine Einkaufswoche (Anker #schritte bleibt; Teil 1 Nr. 5): drei Schritte, je mit Nummernkreis, Titel (h3), einem Satz
// und dem Link "Mehr dazu" auf die passende Stelle von "So geht's". "bild" ist ein Bildschirmfoto aus
// public/bilder/sogehts, "alt" seine Beschreibung (Teil 2 Nr. 11, Grundlage sogehts_fotos.json), "ziel" der Link,
// "ort" der Zusatz nur für Bildschirmleser, der das Ziel nennt (Teil 2 Nr. 12). Beschrieben ist nur, was die
// Play-Fassung kann: Abgehakt wird mit dem Finger, gescannt wird für das Urteil.
export const schritte = {
  ueberschrift: 'Eine Einkaufswoche mit FoodAsu',
  unterzeile: 'So funktioniert die Einkaufslisten-App, vom Rezept zur Einkaufsliste.',
  mehr: 'Mehr dazu',
  liste: [
    {
      titel: 'Rezept aussuchen',
      text: 'Ein Tipp, und die fehlenden Zutaten stehen auf deiner Einkaufsliste.',
      bild: 'rezepte_ansehen_01',
      alt: 'Rezepte in FoodAsu: oben das Suchfeld, darunter Länder, Kategorien und die ersten Rezeptkarten mit Symbolbild',
      ziel: '/so-gehts/rezepte/#fehlende-zutaten-auf-die-liste',
      ort: 'in der Anleitung: Fehlende Zutaten auf die Liste',
    },
    {
      titel: 'Zu Hause schreiben',
      text: 'Schreib dazu, was fehlt, und die Liste ordnet sich nach Warengruppen.',
      bild: 'liste_rezeptliste_01',
      alt: 'Einkaufsliste „Pizza Margherita“ in der Einkaufslisten-App FoodAsu: oben die Zeile zum Rezept, darunter die Zutaten mit Menge, nach Warengruppen geordnet',
      ziel: '/so-gehts/zu-hause-schreiben-im-laden-abhaken/#zu-hause',
      ort: 'in der Anleitung: Zu Hause schreiben',
    },
    {
      titel: 'Im Laden scannen',
      text: 'Abhaken, was im Wagen liegt, und für jede Person sehen, ob es passt.',
      bild: 'karte_auf_die_liste_02',
      alt: 'Produktkarte beim Einkauf: oben „Nicht für Mia: enthält Schalenfrüchte“, unten die Meldung „Auf ‚Wocheneinkauf‘ gesetzt“ mit „Rückgängig“',
      ziel: '/so-gehts/zu-hause-schreiben-im-laden-abhaken/#im-laden',
      ort: 'in der Anleitung: Im Laden abhaken',
    },
  ],
  link: { text: "Die ganze Anleitung: So geht's", ziel: '/so-gehts/' },
};

// Video (Teil 1 Nr. 6): Platz wie im Entwurf, am Handy unter den Schritten, am Laptop links neben den Funktionen. Bis
// das Video mit einem eigenen Auftrag kommt, steht dort ein Standbild mit festen Maßen: das Standbild der Schleife
// "Scannen" aus "So geht's". "film" nennt die Videodatei unter public/bilder/sogehts; solange sie fehlt (null), bleibt
// es beim Standbild. Mit Datei lädt das Video erst beim Scrollen, spielt ohne Ton in Schleife und bei "Bewegung
// reduzieren" nicht von selbst.
export const video = {
  standbild: 'film-scannen',
  breite: 720,
  hoehe: 1620,
  alt: 'Scanner von FoodAsu: Die Kamera erfasst einen Strichcode, dann erscheint die Produktkarte eines Müslis mit dem Ergebnis für die drei Personen des Haushalts.',
  film: null,
};

// "Mehr als ein Einkaufszettel" (Teil 1 Nr. 7): die sechs Funktionen von heute als Karten mit ihrem Zeichen ("symbol",
// gezeichnet in index.astro), Titel (h3) und kurzem Satz ("kurz"); der ausführliche Text ("text") klappt auf und steht
// vollständig im HTML. Die erste Karte ist offen.
export const funktionen = {
  ueberschrift: 'Mehr als ein Einkaufszettel',
  karten: [
    {
      kennung: 'scanner',
      symbol: 'scan',
      titel: 'Scannen und sofort sehen',
      kurz: 'Für jede Person einzeln, mit „Warum?“.',
      text: ['Beim Einkauf prüft FoodAsu Zutaten und Spurenangaben. Das Ergebnis heißt „enthält“, „Spuren“, „Angaben unvollständig“ oder „Kein Konflikt laut Daten“.'],
    },
    {
      kennung: 'haushalt',
      symbol: 'haushalt',
      titel: 'Dein Haushalt',
      kurz: 'Für jede Person eigene Einträge.',
      text: ['Du legst für jede Person in der Familie fest, was sie meidet. Drei Stufen reichen von „Lieber nicht“ bis „Auf keinen Fall“.'],
    },
    {
      kennung: 'liste',
      symbol: 'liste',
      titel: 'Einkaufsliste, sortiert wie im Supermarkt',
      kurz: 'Mit Vorschlägen beim Schreiben.',
      text: [
        'Du kannst so viele Einkaufslisten erstellen, wie du brauchst, und sie bleiben gespeichert. Jeden Artikel tippst du einfach ein, und FoodAsu ordnet ihn nach Warengruppen, also nach Kategorien wie im Supermarkt.',
        'Vorgeschlagen wird auch, was du schon einmal aufgeschrieben hast. Was abgehakt ist, steht unter „Erledigt“, und von dort holst du es zurück.',
        'Die Liste kannst du als Text teilen, etwa mit jemandem aus der Familie; Personen und Hinweise teilt FoodAsu dabei nicht.',
      ],
    },
    {
      kennung: 'rezepte',
      symbol: 'buch',
      // "In der App:" wie bisher (Ali, 09.10.2026, Entscheidung 18): Die Zahl ist die der App, nicht die der Website.
      titel: `In der App: über ${appZahlen.ueber} Rezepte aus ${appZahlen.laender} Ländern`,
      kurz: 'Bei den Zutaten steht, wen sie betreffen.',
      text: ['Die fehlenden Zutaten fügst du mit einem Tipp einer Einkaufsliste hinzu. So kannst du Essen und Einkauf zusammen planen.'],
    },
    {
      kennung: 'kochen',
      symbol: 'topf',
      titel: 'Was kann ich damit kochen?',
      kurz: 'Rezepte zu deiner Einkaufsliste.',
      text: ['FoodAsu zeigt Gerichte, für die schon vieles auf deiner Liste steht, und sagt, was noch fehlt. Das Fehlende fügst du mit einem Tipp hinzu.'],
    },
    {
      kennung: 'daten',
      symbol: 'handy',
      titel: 'Ohne Konto, ohne Werbung',
      // Der freigegebene Datenschutzsatz vollständig (der Entwurf kürzt ihn; die Kurzform wäre eine andere Aussage).
      kurz: 'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
      text: ['Kein Konto, keine Werbung, kein Verkauf von Daten.'],
    },
  ],
};

// "Einfache Einkaufsliste oder FoodAsu?" (Teil 1 Nr. 8): Tabelle mit vier Zeilen wie im Entwurf, darunter der ehrliche
// Satz, wann eine einfache Liste reicht. Keine Namen anderer Apps. "ja" steht in Indigo, nie in Grün.
export const vergleich = {
  ueberschrift: 'Einfache Einkaufsliste oder FoodAsu?',
  spalten: ['Was du brauchst', 'Einfache Liste', 'FoodAsu'],
  zeilen: [
    ['Notieren und abhaken', 'ja', 'ja'],
    ['Rezept mit einem Tipp auf die Liste', 'selten', 'ja'],
    ['Sehen, für wen ein Produkt passt', 'nein', 'ja'],
    ['Ohne Konto', 'je nach App', 'ja'],
  ],
  satz: 'Notierst du nur schnell ein paar Dinge, reicht eine einfache Liste. FoodAsu hilft, wenn im Haushalt jeder etwas anderes meidet.',
};

// Abschnitt "FoodAsu im Bild" (AP-19 Teil G): sechs Bildschirmfotos der App, je mit einem Link auf die passende Stelle
// von "So geht's". Überschrift, Text, Hinweis und Knopf wie bisher; die Sätze der Karten so kurz wie im Entwurf. "alt"
// beschreibt das Foto (Teil 2 Nr. 11), "ort" ergänzt "In der Anleitung" für Bildschirmleser (Teil 2 Nr. 12).
export const einblick = {
  ueberschrift: 'FoodAsu im Bild',
  text: 'Sechs Bildschirmfotos aus der App. Jedes führt zu der Stelle der Anleitung, die es erklärt.',
  mehr: 'In der Anleitung',
  karten: [
    {
      datei: 'karte_urteil_01',
      titel: 'Das Urteil für den Haushalt',
      text: 'Oben auf der Karte steht, für wen ein Produkt laut Daten nicht passt.',
      alt: 'Produktkarte in FoodAsu: oben „Nicht für Mia: enthält Schalenfrüchte“ mit „Warum?“, darunter jede Person einzeln und die Nährwerte',
      ziel: '/so-gehts/scannen-und-urteil/#das-urteil',
    },
    {
      datei: 'liste_eintraege_02',
      titel: 'Zu Hause aufschreiben',
      text: 'Schreib auf, was du brauchst, zum Beispiel „2 Zwiebeln“.',
      alt: 'Einkaufsliste in FoodAsu: im Feld „Hinzufügen“ steht „2 Zwiebeln“, darunter der Vorschlag „Zwiebeln“',
      ziel: '/so-gehts/zu-hause-schreiben-im-laden-abhaken/#zu-hause',
    },
    {
      datei: 'liste_abhaken_02',
      titel: 'Im Laden abhaken',
      text: 'Ein Tipp hakt ab. Oben bleibt, was noch fehlt.',
      alt: 'Einkaufsliste nach dem Tipp auf das Kästchen: Meldung „Bananen erledigt“ mit „Rückgängig“',
      ziel: '/so-gehts/einkaufslisten/#abhaken',
    },
    {
      datei: 'liste_kochen_01',
      titel: 'Was kann ich damit kochen?',
      text: 'Rezepte, für die schon vieles auf deiner Liste steht.',
      alt: '„Was kann ich damit kochen?“: Rezepte zur Einkaufsliste „Wocheneinkauf“, je mit den Zutaten, die schon auf der Liste stehen',
      ziel: '/so-gehts/einkaufslisten/#was-kann-ich-damit-kochen',
    },
    {
      datei: 'rezepte_hinweise_01',
      titel: 'Hinweise bei den Zutaten',
      text: 'Im Rezept steht, wen eine Zutat betrifft.',
      alt: 'Zutaten der Pizza Margherita in FoodAsu: bei Weizenmehl der Hinweis zu Jonas, bei Mozzarella die Hinweise zu Mia und Elif',
      ziel: '/so-gehts/rezepte/#hinweise-bei-zutaten',
    },
    {
      datei: 'haushalt_stufen_01',
      titel: 'Drei Stufen je Eintrag',
      text: 'Von „Lieber nicht“ bis „Auf keinen Fall“.',
      alt: 'Abschnitt „Wie streng?“ in FoodAsu: bei Milch ist „Meiden“ gewählt, bei Schalenfrüchten „Auf keinen Fall“',
      ziel: '/so-gehts/haushalt-und-meiden/#die-drei-stufen',
    },
  ],
  // Hinweis so kurz wie im Entwurf (Teil 2 Nr. 1; am Handy höchstens drei Zeilen, Teil 3 Nr. 6).
  hinweis: 'Erfundener Beispielhaushalt. Namen, Marken und Fotos von Produkten sind unkenntlich gemacht.',
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
  // Die Zahlen der App kommen aus den Daten (src/daten/app_zahlen.mjs), nie von Hand; die Einträge zum Meiden aus der
  // öffentlich verfügbaren Fassung der App (app_fassung.json).
  zaehler: [
    { zahl: appZahlen.rezepte, wort: 'Rezepte in der App' },
    { zahl: appZahlen.laender, wort: 'Länder' },
    { zahl: appZahlen.eintraege, wort: 'Einträge zum Meiden' },
    { zahl: 0, wort: 'Werbung' },
  ],
};

export const vorschau = {
  ueberschrift: 'Kochen für alle am Tisch',
  // Text so kurz wie im Entwurf (Teil 2 Nr. 1; am Handy höchstens drei Zeilen, Teil 3 Nr. 6).
  text: 'Bei den Zutaten steht, wen sie betreffen.',
  // "datei" ist der Name des Bildes unter public/bilder/rezepte (gebaut mit tools/bilder_bauen.py).
  karten: [
    { titel: 'Wiener Schnitzel', datei: 'wiener-schnitzel' },
    { titel: 'Pizza Margherita', datei: 'pizza-margherita' },
    { titel: 'Ratatouille', datei: 'ratatouille' },
    { titel: 'Baklava', datei: 'baklava' },
  ],
  kennzeichnung: 'Symbolbild',
  // Auf der Website steht nur eine Auswahl aus der App, alle anderen gibt es nur in der App (Ali, 09.10.2026). Seit
  // AP-25 kommen Rezepte dazu, die es in der App noch nicht gibt; die Zahlen kommen aus den Daten
  // (websiteZahlen in src/daten/rezeptseiten.mjs).
  // Zwei Sätze, je ein Absatz (am Handy höchstens drei Zeilen); Wortlaut unverändert.
  hinweis: (zahlen) => [`Über ${appZahlen.ueber} Rezepte gibt es in der App, ${zahlen.app} davon stehen hier.`, `Dazu kommen ${zahlen.alt} Rezepte aus alten Kochbüchern und ${zahlen.neu} neue, die später in die App kommen.`],
  link: (zahlen) => `${zahlen.gesamt} Rezepte auf der Website ansehen`,
  // Kleine Karte, die zur Rubrik "Aus alten Kochbüchern" führt (AP-25 Teil C Nr. 5). Die Zahlen kommen aus den Daten.
  alt: {
    titel: 'Aus alten Kochbüchern',
    // So kurz wie im Entwurf (Laptop) und am Handy höchstens drei Zeilen.
    text: (zahl, von, bis) => `${zahl} Rezepte von ${von} bis ${bis}, mit Auszug aus dem Original und heutiger Fassung.`,
    link: 'Alte Rezepte ansehen',
    ziel: '/alte-rezepte/',
    // Adresse des Rezepts, dessen Symbolbild die Karte zeigt.
    bild: 'linzer-torte-1849',
  },
};

// Fragen der Startseite (Teil 1 Nr. 12, Teil 2 Nr. 9): sieben Fragen zur Einkaufslisten-App in dieser Reihenfolge,
// Gestaltung wie bisher. Jede Antwort beginnt mit einem Satz, der für sich allein verständlich ist und die Frage
// beantwortet; die erste beginnt mit dem GEO-Satz. Jeder Eintrag in "antwort" ist ein Absatz mit ein oder zwei Sätzen
// (Alis Entscheidung vom 14.10.2026). FAQPage gibt die Fragen und Antworten wortgleich wieder (index.astro). Die früheren Fragen der
// Startseite stehen weiter auf /fragen/ (src/daten/fragen.mjs).
export const fragenStart = {
  ueberschrift: 'Fragen zur Einkaufslisten-App',
  liste: [
    {
      // Korrektur der Projektleitung vom 14.10.2026 (a): Frage und erster Satz der Antwort passen zusammen.
      frage: 'Was kann die Einkaufslisten-App FoodAsu?',
      antwort: [
        GEO_SATZ,
        'Die Einkaufsliste erstellst und teilst du schnell, und jeden Artikel ordnet sie nach Kategorien, damit du beim Einkauf nichts suchst.',
      ],
    },
    {
      frage: 'Ist FoodAsu auch eine Einkaufszettel-App?',
      antwort: [
        'Ja, FoodAsu ist eine Einkaufsapp, die den Zettel aus Papier durch eine digitale Einkaufsliste auf dem Handy ersetzt.',
        'Du schreibst zu Hause auf, was fehlt, und die Liste ordnet sich nach Kategorien. Beim Einkauf hakst du jeden Artikel ab, der im Wagen liegt.',
      ],
    },
    {
      frage: 'Brauche ich ein Konto?',
      antwort: [
        'Nein, FoodAsu funktioniert ohne Konto und ohne Registrierung. Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
      ],
    },
    {
      frage: 'Wie kommt ein Rezept auf die Einkaufsliste?',
      antwort: [
        'In FoodAsu setzt du die fehlenden Zutaten eines Rezepts mit einem Tipp auf eine Einkaufsliste, die so heißt wie das Rezept; gibt es sie noch nicht, wird sie dafür erstellt.',
        'Grundzutaten wie Salz und Öl sind dabei abgewählt, du kannst sie aber hinzufügen. Kleine Mengen wie „1 EL“ stehen als Notiz beim Eintrag.',
      ],
    },
    {
      frage: 'Woher weiß die App, was im Produkt steckt?',
      antwort: [
        'FoodAsu liest die Angaben zu einem Produkt aus der offenen Datenbank Open Food Facts. Diese Daten können fehlen oder veraltet sein.',
        // Der Satz zum Medizinprodukt (wörtlich, src/daten/fragen.mjs) in zwei Absätzen: zwei Sätze und einer.
        ...MEDIZIN_ABSAETZE,
      ],
    },
    {
      // Ehrliche Antwort aus der Funktionsliste (KARTE-10: Meldung ohne Verbindung, gespeicherte Angaben) und dem Code
      // der App (Listen, Haushalt und Rezepte liegen auf dem Handy).
      frage: 'Funktioniert FoodAsu ohne Internet?',
      antwort: [
        'Zum Scannen braucht FoodAsu eine Verbindung zum Internet, weil die App bei Open Food Facts nachfragt. Schon gescannte Produkte zeigt sie auch ohne Verbindung, mit den gespeicherten Angaben.',
        'Einkaufslisten, Haushalt und Rezepte liegen auf deinem Handy und gehen ohne Internet.',
      ],
    },
    {
      // Korrektur der Projektleitung vom 14.10.2026 (b): zuerst der Satz zur Verfügbarkeit, der die Frage beantwortet.
      frage: 'Gibt es FoodAsu fürs iPhone?',
      antwort: [VERFUEGBAR, BETA],
    },
  ],
};

// Abschluss (Teil 1 Nr. 13): gepunktete Lavendel-Fläche, H2, der Satz zur Verfügbarkeit, weißer Knopf "Bald im Play
// Store" mit Punkt. Am Handy steht darunter klein der Hinweis zur Beta (am Laptop steht er unter den Knöpfen im Kopf).
export const abschluss = {
  ueberschrift: 'Passt es für alle? Schau einfach nach.',
  satz: VERFUEGBAR,
  knopf: 'Bald im Play Store',
  beta: BETA,
};

// Leiste unten am Handy (Teil 1 Nr. 15): erscheint nach dem ersten Bildschirm, nur am Handy. Das Logo führt an den
// Anfang der Seite. Der Knopf führt, solange der Eintrag bei Google Play nicht öffentlich ist, zum Abschluss mit dem
// Satz zur Verfügbarkeit, danach zum Eintrag (store.oeffentlich in seite.mjs).
export const kurzleiste = {
  name: 'FoodAsu im Play Store',
  logo: 'FoodAsu, zum Anfang der Seite',
  knopf: 'Bald im Play Store',
  ziel: '#abschluss',
  storeKnopf: 'FoodAsu bei Google Play',
};

// Fragen und Antworten der Seite /fragen/ stehen seit AP-22 in src/daten/fragen.mjs.
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
    // AP-25: Rubrik mit Rezepten aus alten Kochbüchern.
    { titel: 'Aus alten Kochbüchern', ziel: '/alte-rezepte/' },
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
    // Satz neben den zwei Auftritten (Entscheidung Ali und Projektleitung vom 13.10.2026), als Text ohne Link.
    dabei: 'Von Anfang an dabei sein.',
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
