// Meta-Title, Meta-Description, Robots und Bild zum Teilen für jede Seite (AP-18 Nachtrag Meta). Das Grundlayout
// holt die Angaben über die Adresse der Seite; eine Seite ohne Eintrag bricht den Bau ab. sitemap.xml und llms.txt
// entstehen aus derselben Liste.
//
// Regeln (geprüft beim Laden dieser Datei und noch einmal an den gebauten Seiten in tools/pruefe_seiten.mjs):
// - Titel: eindeutig, 30 bis 60 Zeichen und höchstens 580 Pixel (Arial 20 px). Das Suchwort steht vorne, die Marke
//   " | FoodAsu" am Ende. Ist ein Titel zu lang, fällt zuerst die Marke weg, nie das Suchwort. Zeichen: Buchstaben,
//   Ziffern, Leerzeichen, Bindestrich, Apostroph und ":", "|", "(", ")".
// - Beschreibung: eindeutig, 120 bis 155 Zeichen und höchstens 920 Pixel (Arial 14 px), ganze Sätze, nur Tatsachen
//   aus den Daten der Seite, keine geraden Anführungszeichen. "Ohne ...", vegetarisch und vegan stehen immer mit
//   "laut Zutatenliste" und dem Hinweis auf die Verpackung.
// - Zahlen kommen aus den Daten und werden nie von Hand geschrieben.
// - noindex tragen /offenlegung/, /quellen-und-lizenzen/ und die 404-Seite, dazu jede Themenseite der Rezepte mit
//   weniger als sechs Rezepten oder ohne eigenen Einleitungstext (AP-22, src/daten/rezeptseiten.mjs).
// - Wortwahl (AP-22 Teil 1 Nr. 7): Wo es ohne Bruch der Wortregeln geht, steht das Wort, nach dem laut Keyword-Planer
//   gesucht wird (Stand 10.10.2026: "einkaufsliste app", "lebensmittel scanner app"). Der Titel der Startseite steht in
//   src/daten/startseite.mjs (kopfdaten.titel).
// - Ausnahme Startseite (Auftrag SEO 1 neu, Projektleitung, 14.10.2026): Ihr Titel heißt wörtlich
//   "Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt", ohne Marke. Er ist 67 Zeichen und 628 Pixel
//   breit; der Auftrag legt fest, dass er trotzdem so bleibt (Google kürzt ihn voraussichtlich nach "… für den
//   ganzen"). Nur genau dieser Wortlaut auf genau dieser Seite ist von den Grenzen des Titels ausgenommen; den Namen
//   "FoodAsu" tragen WebSite.name und og:site_name.
import { grenzBefunde } from './breite.mjs';
import { seite } from './seite.mjs';
import { kopfdaten, fuss } from './startseite.mjs';
import { BEREICH, adresse as kapitelAdresse, kapitel } from './sogehts.mjs';
import {
  AUFWAND, KATEGORIE, LAND, ausLand, gesamtzeit, portionen, rezeptAdresse, rezeptSeiten, suchtitel, themen,
  alteRezepte,
} from './rezeptseiten.mjs';
import { alteSeite, jahreVonBis } from './alte_rezepte.mjs';
import { appZahlen, zahlwort } from './app_zahlen.mjs';

const MARKE = ` | ${seite.name}`;
// Der eine Titel, der die Grenzen überschreiten darf (siehe oben, Ausnahme Startseite).
export const TITEL_START = 'Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt';
if (kopfdaten.titel !== TITEL_START) throw new Error(`Titel der Startseite: „${TITEL_START}“ erwartet, gefunden „${kopfdaten.titel}“`);
export const OHNE_INDEX = ['/offenlegung/', '/quellen-und-lizenzen/', '/404.html'];
const TITEL_ZEICHEN = /^[\p{L}\p{N} :|()'-]+$/u;

const fehler = [];
const passt = (text, art) => grenzBefunde(text, art).length === 0;
// Die erste Form, die in die Grenzen passt. Die Formen stehen in der Reihenfolge, in der gekürzt wird.
function erste(pfad, art, formen) {
  const treffer = formen.find((form) => passt(form, art));
  if (!treffer) fehler.push(`${pfad}: keine Form für ${art} passt in die Grenzen (${formen.map((form) => `„${form}“ ${grenzBefunde(form, art).join(', ')}`).join('; ')})`);
  return treffer ?? formen.at(-1);
}
const mitMarke = (pfad, text) => erste(pfad, 'titel', [text + MARKE, text]);
const aufzaehlung = (liste) => (liste.length < 2 ? liste.join('') : `${liste.slice(0, -1).join(', ')} und ${liste.at(-1)}`);
const namen = (liste) => aufzaehlung(liste.map((rezept) => rezept.kurztitel));

// ---- Feste Seiten ----
const FEST = [
  // Startseite: Titel aus kopfdaten.titel (seit dem Auftrag SEO 1 neu vom 14.10.2026 mit dem Fokus-Keyword vorne).
  // Die Beschreibung beginnt mit "Einkaufslisten-App" (Auftrag Teil 2 Nr. 8; der Vorschlag dort war 160 Zeichen und
  // 1.009 Pixel breit, deshalb gekürzt).
  {
    pfad: '/',
    titel: kopfdaten.titel,
    beschreibung: 'Einkaufslisten-App mit Lebensmittel-Scanner: Einkaufsliste erstellen, Rezeptzutaten mit einem Tipp hinzufügen und sehen, was für alle passt.',
  },
  {
    pfad: BEREICH,
    titel: `So geht's mit FoodAsu: Anleitung in ${kapitel.length} Kapiteln`,
    beschreibung: `Die Anleitung zu FoodAsu in ${kapitel.length} kurzen Kapiteln mit Bildschirmfotos: Haushalt, Scannen, Produktkarte, Einkaufslisten, Rezepte und deine Daten.`,
  },
  {
    pfad: '/fragen/',
    titel: 'Fragen und Antworten zu FoodAsu',
    beschreibung: 'Fragen und Antworten zu FoodAsu: woher die Daten kommen, was mit deinen Angaben passiert und warum die Verpackung maßgeblich bleibt.',
  },
  {
    pfad: '/ueber-foodasu/',
    titel: 'Über FoodAsu: warum es die App gibt und für wen sie ist',
    beschreibung: 'Wer FoodAsu entwickelt, warum es die App gibt, für wen sie ist und woher die Angaben kommen. Ohne Konto und ohne Werbung.',
  },
  {
    pfad: '/daten-und-quellen/',
    titel: mitMarke('/daten-und-quellen/', 'Daten und Quellen: woher die Angaben kommen'),
    beschreibung: 'Woher FoodAsu Produktangaben, Rezepte, Nährwerte und Bilder hat, was „laut Daten“ bedeutet und warum die Verpackung maßgeblich bleibt.',
  },
  {
    pfad: '/datenschutz.html',
    titel: mitMarke('/datenschutz.html', 'Datenschutzerklärung'),
    beschreibung: 'Datenschutzerklärung der App FoodAsu und der Website foodasu.com: welche Daten verarbeitet werden, wozu, und welche Rechte du hast.',
  },
  // Nutzungsbedingungen (AP-35A, 23.10.2026): im Index wie die Datenschutzerklärung.
  {
    pfad: '/nutzungsbedingungen.html',
    titel: mitMarke('/nutzungsbedingungen.html', 'Nutzungsbedingungen der App'),
    beschreibung: 'Nutzungsbedingungen der App FoodAsu und der Website foodasu.com: was die App ist, woher die Daten kommen, Haftung und deine Rechte.',
  },
  {
    pfad: '/lizenzen/',
    titel: mitMarke('/lizenzen/', 'Lizenzen dieser Website'),
    beschreibung: 'Lizenzen der Website foodasu.com: Schriften, Daten, Bilder und Software, die diese Website verwendet, jeweils mit dem Namen der Lizenz.',
  },
  {
    pfad: '/offenlegung/',
    titel: mitMarke('/offenlegung/', 'Offenlegung nach dem Mediengesetz'),
    beschreibung: 'Offenlegung nach § 25 Mediengesetz für die Website foodasu.com: Medieninhaber, Anschrift und die grundlegende Richtung der Website.',
  },
  {
    pfad: '/quellen-und-lizenzen/',
    titel: mitMarke('/quellen-und-lizenzen/', 'Quellen und Lizenzen der Rezepte'),
    beschreibung: 'Quelle, Urheber, Lizenz und Änderungen zu jedem Rezept auf foodasu.com, dazu die Angaben zu den Bildern und zur Berechnung der Nährwerte.',
  },
  {
    pfad: '/404.html',
    titel: mitMarke('/404.html', 'Seite nicht gefunden'),
    beschreibung: 'Diese Seite gibt es auf foodasu.com nicht. Vielleicht ist der Link veraltet. Von hier geht es zur Startseite, zur Anleitung und zu den Rezepten.',
  },
];

// ---- So geht's: je Kapitel das Thema für den Titel und die Beschreibung ----
const KAPITEL = {
  'erste-schritte': {
    thema: 'Erste Schritte',
    beschreibung: 'Erste Schritte mit FoodAsu: wie die App auf dein Handy kommt, was die Einführung zeigt und was auf der Startseite steht. Ohne Konto.',
  },
  'haushalt-und-meiden': {
    thema: 'Haushalt anlegen und Meiden',
    beschreibung: `Personen im Haushalt anlegen, Einträge bei „Meiden“ wählen und die ${zahlwort(appZahlen.stufen)} Stufen verstehen: von „Lieber nicht“ bis „Auf keinen Fall“.`,
  },
  // Seit dem Auftrag SEO 1 neu (14.10.2026, Teil 4 Nr. 4) nach Vorschlag 1 zu „Lebensmittel Scanner“ der SEO-Analyse:
  // Die Startseite geht auf die Einkaufsliste, diese Seite übernimmt den Scanner.
  'scannen-und-urteil': {
    titel: 'Lebensmittel-Scanner: scannen und das Urteil verstehen',
    beschreibung: 'Der Lebensmittel-Scanner von FoodAsu zeigt für jede Person, ob laut den Angaben etwas im Produkt ist, das sie meidet. So liest du das Urteil.',
  },
  produktkarte: {
    thema: 'Die Produktkarte',
    beschreibung: 'Die Produktkarte von FoodAsu lesen: Nährwerte, Nutri-Score, Abzeichen und Zutaten, Daten neu laden und ein Produkt auf die Liste setzen.',
  },
  einkaufslisten: {
    thema: 'Einkaufsliste als App',
    beschreibung: 'Die Einkaufsliste als App: aufschreiben, im Laden abhaken, nach Warengruppen ordnen, Produkte in die Liste scannen und die Liste als Text teilen.',
  },
  // Der Titel der Seite hat ein Komma und passt deshalb nicht in das Muster "Thema: So geht's mit FoodAsu".
  'zu-hause-schreiben-im-laden-abhaken': {
    titel: 'Einkaufsliste schreiben und im Laden abhaken | FoodAsu',
    beschreibung: 'Einkaufsliste ohne Scannen: zu Hause aufschreiben, was du brauchst, und im Laden mit einem Tipp abhaken. Kurz erklärt, mit Bildern aus der App.',
  },
  rezepte: {
    thema: 'Rezepte in der App',
    beschreibung: 'Rezepte in der App FoodAsu: Hinweise bei den Zutaten lesen, Portionen anpassen und fehlende Zutaten auf die Einkaufsliste setzen.',
  },
  'deine-daten': {
    thema: 'Einstellungen und deine Daten',
    beschreibung: 'Einstellungen von FoodAsu: Haushalt exportieren und importieren, was das Backup von Android enthält, Verlauf löschen und Feedback geben.',
  },
};

// ---- Themenseiten ----
// Kategorie in der Mehrzahl für den Titel und die Form nach der Zahl in der Beschreibung.
const MEHRZAHL = {
  HAUPTGERICHT: ['Hauptgerichte', 'Hauptgerichte'], SUPPE: ['Suppen', 'Suppen'], VORSPEISE: ['Vorspeisen', 'Vorspeisen'],
  SALAT: ['Salate', 'Salate'], BEILAGE: ['Beilagen', 'Beilagen'], SAUCE: ['Saucen', 'Saucen'], SNACK: ['Snacks', 'Snacks'],
  FRUEHSTUECK: ['Frühstück', 'Rezepte fürs Frühstück'], SUESSSPEISE: ['Süßspeisen', 'Süßspeisen'],
  GEBAECK: ['Gebäck', 'Rezepte für Gebäck'], GETRAENK: ['Getränke', 'Getränke'],
};
// "aus aller Welt" steht nur, wenn die Rezepte der Seite aus mindestens zwei Erdteilen kommen; sonst steht der Erdteil.
const ERDTEIL = {
  DE: 'Europa', AT: 'Europa', IT: 'Europa', FR: 'Europa', CH: 'Europa', ES: 'Europa', GR: 'Europa', HU: 'Europa',
  CZ: 'Europa', LI: 'Europa', TR: 'Asien', SY: 'Asien', IN: 'Asien', LB: 'Asien', JO: 'Asien', TH: 'Asien', PS: 'Asien',
  JP: 'Asien', KR: 'Asien', IL: 'Asien', IR: 'Asien', VN: 'Asien', MX: 'Amerika', PE: 'Amerika', MA: 'Afrika',
  GB: 'Europa', IE: 'Europa', SE: 'Europa', US: 'Amerika', EG: 'Afrika', SD: 'Afrika', ID: 'Asien',
};
for (const kuerzel of Object.keys(LAND)) if (!ERDTEIL[kuerzel]) fehler.push(`Erdteil fehlt für ${kuerzel}`);
for (const kategorie of Object.keys(KATEGORIE)) if (!MEHRZAHL[kategorie]) fehler.push(`Mehrzahl fehlt für ${kategorie}`);
function herkunft(liste) {
  const erdteile = new Set(liste.flatMap((rezept) => rezept.laender.map((kuerzel) => ERDTEIL[kuerzel])));
  return erdteile.size > 1 ? 'aus aller Welt' : `aus ${[...erdteile][0]}`;
}
// Satzteil "in denen laut Zutatenliste ..." je Eintrag.
const KOMMT_NICHT_VOR = {
  'en:nuts': 'keine Nüsse vorkommen', 'en:peanuts': 'keine Erdnüsse vorkommen', 'en:gluten': 'kein Gluten vorkommt',
  'en:milk': 'keine Milch vorkommt', 'en:eggs': 'keine Eier vorkommen', 'en:soybeans': 'kein Soja vorkommt',
  'en:sesame-seeds': 'kein Sesam vorkommt', 'en:fish': 'kein Fisch vorkommt', 'en:pork': 'kein Schweinefleisch vorkommt',
  'en:alcohol': 'kein Alkohol vorkommt', 'en:e428': 'keine Gelatine vorkommt',
};
const FORM = { 'en:vegetarian': ['vegetarische', 'vegetarisch'], 'en:vegan': ['vegane', 'vegan'] };
// Bis zu so vielen Rezepten nennt die Beschreibung einer Themenseite alle beim Namen.
const ALLE_NENNEN = 4;
// Zwei Rezepte als Beispiel für Themenseiten mit mehr Rezepten ("von ... bis ..."). Steht ein Rezept nicht mehr auf
// der Seite, bricht der Bau ab. "text" ersetzt die Wendung, wo der Name einen Artikel braucht.
const BEISPIELE = {
  '/rezepte/ohne-nuesse/': { rezepte: ['bibimbap', 'tsatsiki'] },
  '/rezepte/ohne-erdnuesse/': { rezepte: ['apfelstrudel', 'lahmacun'] },
  '/rezepte/ohne-gluten/': { rezepte: ['dal-tadka', 'shakshuka'] },
  '/rezepte/ohne-milch/': { rezepte: ['ratatouille', 'guacamole'] },
  '/rezepte/ohne-eier/': { rezepte: ['pizza-margherita', 'samosa'] },
  '/rezepte/ohne-soja/': { rezepte: ['croissants', 'quiche-lorraine'] },
  '/rezepte/ohne-sesam/': { rezepte: ['butter-chicken', 'tiramisu'] },
  '/rezepte/ohne-fisch/': { rezepte: ['kaiserschmarren', 'moussaka'] },
  '/rezepte/ohne-schweinefleisch/': { rezepte: ['baklava', 'hummus'] },
  '/rezepte/ohne-alkohol/': { rezepte: ['guacamole', 'menemen'] },
  '/rezepte/ohne-gelatine/': { rezepte: ['gulyas', 'sachertorte'] },
  '/rezepte/vegetarisch/': { rezepte: ['dal-tadka', 'kaiserschmarren'] },
  '/rezepte/land/deutschland/': { rezepte: ['spaetzle', 'schwarzwaelder-kirschtorte'], text: 'von Spätzle bis zur Schwarzwälder Kirschtorte' },
  '/rezepte/land/oesterreich/': { rezepte: ['wiener-schnitzel', 'kaiserschmarren'], text: 'vom Wiener Schnitzel bis zum Kaiserschmarren' },
  '/rezepte/land/italien/': { rezepte: ['pizza-margherita', 'tiramisu'], text: 'von der Pizza Margherita bis zum Tiramisu' },
  '/rezepte/land/spanien/': { rezepte: ['gazpacho-andaluz', 'paella-valenciana'], text: 'vom Gazpacho andaluz bis zur Paella valenciana' },
  '/rezepte/kategorie/hauptgericht/': { rezepte: ['bibimbap', 'wiener-schnitzel'] },
  // Seit AP-25 zeigen diese Seiten mehr Rezepte, als die Beschreibung beim Namen nennt.
  '/rezepte/kategorie/suppe/': { rezepte: ['gazpacho-andaluz', 'gulyas'] },
  '/rezepte/kategorie/suessspeise/': { rezepte: ['apfelstrudel', 'tiramisu'] },
  '/rezepte/kategorie/gebaeck/': { rezepte: ['croissants', 'sachertorte'] },
  '/rezepte/land/frankreich/': { rezepte: ['croissants', 'ratatouille'] },
};
const VERPACKUNG = 'Beim Einkauf zählt trotzdem die Verpackung.';
const ENDEN = [', jeweils mit Zutaten, Zubereitung und Hinweisen zu den Zutaten.', ', jeweils mit Hinweisen zu den Zutaten.'];

// "von A bis B" mit den zwei Beispielen der Seite.
function spanne(thema) {
  const wahl = BEISPIELE[thema.adresse];
  if (!wahl) { fehler.push(`${thema.adresse}: Beispiele fehlen (BEISPIELE in meta.mjs)`); return ''; }
  const gewaehlt = wahl.rezepte.map((slug) => thema.rezepte.find((rezept) => rezept.slug === slug));
  if (gewaehlt.some((rezept) => !rezept)) { fehler.push(`${thema.adresse}: Ein Beispiel steht nicht auf der Seite (${wahl.rezepte.join(', ')})`); return ''; }
  return wahl.text ?? `von ${gewaehlt[0].kurztitel} bis ${gewaehlt[1].kurztitel}`;
}
// Alle Rezepte beim Namen (nach Doppelpunkt) oder zwei als Beispiel (nach Komma).
const genannt = (thema) => (thema.rezepte.length <= ALLE_NENNEN ? `: ${namen(thema.rezepte)}` : `, ${spanne(thema)}`);

function themaMeta(thema) {
  const zahl = thema.rezepte.length;
  const pfad = thema.adresse;
  if (thema.art === 'ohne') {
    return {
      titel: mitMarke(pfad, `Rezepte ohne ${thema.menue}: ${zahl} Gerichte laut Zutatenliste`),
      beschreibung: `${zahl} Rezepte, in denen laut Zutatenliste ${KOMMT_NICHT_VOR[thema.schluessel]}${genannt(thema)}. ${VERPACKUNG}`,
    };
  }
  if (thema.art === 'passt') {
    const [mehrzahl, form] = FORM[thema.schluessel];
    return {
      titel: mitMarke(pfad, `${zahl} ${mehrzahl} Rezepte laut Zutatenliste`),
      beschreibung: `${zahl} Rezepte, die laut Zutatenliste ${form} sind${genannt(thema)}. ${VERPACKUNG}`,
    };
  }
  if (thema.art === 'land') {
    const anfang = `${zahl} Rezepte ${ausLand(thema.schluessel)}${genannt(thema)}`;
    return {
      titel: mitMarke(pfad, `Rezepte ${ausLand(thema.schluessel)}: ${zahl} Gerichte`),
      beschreibung: erste(pfad, 'beschreibung', ENDEN.map((ende) => anfang + ende)),
    };
  }
  const [mehrzahl, nachZahl] = MEHRZAHL[thema.schluessel];
  const anfang = `${zahl} ${nachZahl} ${herkunft(thema.rezepte)}${genannt(thema)}`;
  return {
    titel: mitMarke(pfad, `${mehrzahl}: ${zahl} Rezepte ${herkunft(thema.rezepte)}`),
    beschreibung: erste(pfad, 'beschreibung', ENDEN.map((ende) => anfang + ende)),
  };
}

// ---- Rezeptseiten ----
// Je Rezept eine eigene Beschreibung. {aufwand}, {zeit} und {portionen} kommen aus den Daten; "zutaten" nennt die
// Zutaten, die der Satz erwähnt: Fehlt eine davon im Rezept, bricht der Bau ab. Bei einem Rezept aus genau einem
// Land muss der Satz das Land nennen.
const REZEPT = {
  'alt-wiener-erdaepfelsalat': { text: 'Alt-Wiener Erdäpfelsalat aus Österreich: Kartoffeln mit Zwiebel, Rinderbrühe und Senf. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Zwiebel', 'Rinderbrühe', 'Senf'] },
  apfelstrudel: { text: 'Apfelstrudel mit Äpfeln, Rosinen, Zimt und Semmelbröseln. Aufwand {aufwand}, für {portionen}. Mit Zubereitung und Hinweisen zu den Zutaten.', zutaten: ['Apfel', 'Rosinen', 'Zimt', 'Semmelbrösel'] },
  baklava: { text: 'Baklava aus der Türkei: Yufkateig mit Pistazien, Butterschmalz und Zucker. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Yufkateig', 'Pistazien', 'Butterschmalz', 'Zucker'] },
  bibimbap: { text: 'Bibimbap aus Südkorea: Reisschale mit Rindfleisch, Spinat, Sojasprossen und Ei. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Reis', 'Rindfleisch', 'Spinat', 'Sojasprossen', 'Ei'] },
  'butter-chicken': { text: 'Butter Chicken (Murgh Makhani) aus Indien: Huhn mit Joghurt, Ingwer und Garam Masala. Für {portionen}, dazu Hinweise zu den Zutaten.', zutaten: ['Hühneroberschenkel', 'Joghurt', 'Ingwer', 'Garam Masala'] },
  croissants: { text: 'Croissants aus Frankreich: Hefeteig aus Weizenmehl, Milch und Butter. Aufwand {aufwand}, für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Hefe', 'Weizenmehl', 'Milch', 'Butter'] },
  'dal-tadka': { text: 'Dal Tadka aus Indien: Linsen mit gewürztem Ghee, Kreuzkümmel, Senfkörnern und Knoblauch. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Linsen', 'Ghee', 'Kreuzkümmel', 'Senfkörner', 'Knoblauch'] },
  'gazpacho-andaluz': { text: 'Gazpacho andaluz aus Spanien: kalte Tomatensuppe mit Gurke, Paprika und Knoblauch. In {zeit} fertig, dazu Hinweise zu den Zutaten.', zutaten: ['Tomate', 'Gurke', 'Paprika', 'Knoblauch'] },
  guacamole: { text: 'Guacamole aus Mexiko: Avocadodip mit Limette, roter Zwiebel, Chili und Koriandergrün. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Avocado', 'Limette', 'Rote Zwiebel', 'Chili', 'Koriandergrün'] },
  gulyas: { text: 'Gulyás aus Ungarn: Gulaschsuppe mit Rinderwade, Zwiebeln, Paprikapulver und Kartoffeln. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Rinderwade', 'Zwiebel', 'Paprikapulver', 'Kartoffel'] },
  hummus: { text: 'Hummus: Kichererbsenpüree mit Tahin, Zitrone, Knoblauch und Kreuzkümmel. Aufwand {aufwand}, für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Kichererbsen', 'Tahin', 'Zitrone', 'Knoblauch', 'Kreuzkümmel'] },
  'insalata-caprese': { text: 'Insalata caprese aus Italien: Tomaten, Büffelmozzarella, Basilikum und Olivenöl. In {zeit} für {portionen}, dazu Hinweise zu den Zutaten.', zutaten: ['Tomate', 'Büffelmozzarella', 'Basilikum', 'Olivenöl'] },
  kaiserschmarren: { text: 'Kaiserschmarren aus Weizenmehl, Eiern und Milch, mit Rosinen und Apfelsaft. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Weizenmehl', 'Ei', 'Milch', 'Rosinen', 'Apfelsaft'] },
  knoblauchgarnelen: { text: 'Knoblauchgarnelen (Gambas al ajillo) aus Spanien: Garnelen mit Olivenöl, Knoblauch und Chili. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Garnelen', 'Olivenöl', 'Knoblauch', 'Chili'] },
  'koenigsberger-klopse': { text: 'Königsberger Klopse aus Deutschland: Klopse aus Hackfleisch, Brötchen, Ei und Sardellen. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Hackfleisch', 'Brötchen', 'Ei', 'Sardellen'] },
  lahmacun: { text: 'Lahmacun aus der Türkei: Hefeteig mit Lammhackfleisch, Zwiebel, Paprika und Petersilie. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Trockenhefe', 'Lammhackfleisch', 'Zwiebel', 'Paprika', 'Petersilie'] },
  'lasagne-alla-bolognese': { text: 'Lasagne alla bolognese aus Italien mit Rinder- und Schweinehackfleisch und Pancetta. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Lasagneblätter', 'Rinderhackfleisch', 'Schweinehackfleisch', 'Pancetta'] },
  'massaman-curry-mit-rindfleisch': { text: 'Massaman-Curry mit Rindfleisch aus Thailand: mit Kokosmilch, Kartoffeln und Erdnüssen. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Rindfleisch', 'Kokosmilch', 'Kartoffel', 'Erdnüsse'] },
  menemen: { text: 'Menemen aus der Türkei: Rührei mit Tomaten und Spitzpaprika, dazu Butter und Oregano. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Ei', 'Tomate', 'Paprika', 'Butter', 'Oregano'] },
  'mercimek-corbasi': { text: 'Mercimek çorbası aus der Türkei: rote Linsensuppe mit Zwiebel, Karotte, Kartoffel und Minze. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Linsen', 'Zwiebel', 'Karotte', 'Kartoffel', 'Minze'] },
  moussaka: { text: 'Moussaka aus Griechenland: Auberginen, Kartoffeln und Lammhackfleisch mit Rotwein und Zimt. Mit Zubereitung und Hinweisen zu den Zutaten.', zutaten: ['Aubergine', 'Kartoffel', 'Lammhackfleisch', 'Rotwein', 'Zimt'] },
  'paella-valenciana': { text: 'Paella valenciana aus Spanien: Reispfanne mit Huhn, Kaninchen, Bohnen und Safran. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Reis', 'Hähnchen', 'Kaninchen', 'Grüne Bohnen', 'Weiße Bohnen', 'Safran'] },
  'patatas-bravas': { text: 'Patatas bravas aus Spanien: frittierte Kartoffeln mit scharfer Paprikasauce. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Paprikapulver'] },
  'pizza-margherita': { text: 'Pizza Margherita aus Italien: Hefeteig mit Tomaten, Mozzarella, Basilikum und Olivenöl. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Hefe', 'Tomate', 'Mozzarella', 'Basilikum', 'Olivenöl'] },
  'quiche-lorraine': { text: 'Quiche lorraine aus Frankreich mit Speck, Eiern, Sahne und Muskat. Aufwand {aufwand}, für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Speck', 'Ei', 'Sahne', 'Muskat'] },
  ratatouille: { text: 'Ratatouille aus Frankreich: Auberginen, Zucchini, Paprika und Tomaten mit Thymian. Für {portionen}, dazu Hinweise zu den Zutaten.', zutaten: ['Aubergine', 'Zucchini', 'Paprika', 'Tomate', 'Thymian'] },
  roesti: { text: 'Rösti aus der Schweiz: Kartoffeln in Butterschmalz, mit Speck, Zwiebel und Gruyère. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Butterschmalz', 'Speck', 'Zwiebel', 'Gruyère'] },
  sachertorte: { text: 'Sachertorte aus Österreich: Schokoladentorte mit Butter, Eiern und Konfitüre. Aufwand {aufwand}, mit Hinweisen zu den Zutaten.', zutaten: ['Zartbitterschokolade', 'Butter', 'Ei', 'Konfitüre'] },
  samosa: { text: 'Samosa aus Indien: Teigtaschen mit Kartoffeln, Erbsen, Kreuzkümmel und Koriander. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Erbsen', 'Kreuzkümmel', 'Koriander'] },
  'schwaebischer-kartoffelsalat': { text: 'Schwäbischer Kartoffelsalat aus Deutschland: Kartoffeln mit Gemüsebrühe, Zwiebel und Senf. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Gemüsebrühe', 'Zwiebel', 'Senf'] },
  'schwarzwaelder-kirschtorte': { text: 'Schwarzwälder Kirschtorte aus Deutschland mit Sahne, Sauerkirschen und Kirschwasser. Aufwand {aufwand}, mit Hinweisen zu den Zutaten.', zutaten: ['Sahne', 'Sauerkirsche', 'Kirschwasser'] },
  shakshuka: { text: 'Shakshuka: Eier in Tomaten-Paprika-Sauce mit Zwiebel, Knoblauch und Kreuzkümmel. In {zeit} für {portionen}, dazu Hinweise zu den Zutaten.', zutaten: ['Ei', 'Dosentomaten', 'Paprika', 'Zwiebel', 'Knoblauch', 'Kreuzkümmel'] },
  souvlaki: { text: 'Souvlaki aus Griechenland: Fleischspieße aus Schweineschulter mit Zitrone und Oregano. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Schweineschulter', 'Zitrone', 'Oregano'] },
  'spaghetti-carbonara': { text: 'Spaghetti carbonara aus Italien: Spaghetti mit Guanciale, Eigelb, Pecorino und Pfeffer. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Spaghetti', 'Guanciale', 'Eigelb', 'Pecorino', 'Pfeffer'] },
  spaetzle: { text: 'Spätzle aus Mehl, Eiern, Muskat und Salz, eine Beilage aus Deutschland, Österreich und der Schweiz. Mit Hinweisen zu den Zutaten.', zutaten: ['Mehl', 'Ei', 'Muskat', 'Salz'] },
  tiramisu: { text: 'Tiramisu aus Italien: Mascarpone, Eier, Löffelbiskuits, Kaffee, Marsala und Kakao. In {zeit} fertig, dazu Hinweise zu den Zutaten.', zutaten: ['Mascarpone', 'Eigelb', 'Löffelbiskuit', 'Kaffee', 'Marsala', 'Kakao'] },
  'tortilla-espanola': { text: 'Tortilla española aus Spanien: Kartoffelomelett aus Kartoffeln, Zwiebel, Eiern und Olivenöl. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Kartoffel', 'Zwiebel', 'Ei', 'Olivenöl'] },
  tsatsiki: { text: 'Tsatsiki aus Griechenland: Sauce aus griechischem Joghurt, Gurke, Knoblauch und Olivenöl. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Griechischer Joghurt', 'Gurke', 'Knoblauch', 'Olivenöl'] },
  'wiener-schnitzel': { text: 'Wiener Schnitzel aus Österreich: Kalbsschnitzel mit Mehl, Ei, Semmelbröseln und Butterschmalz. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Kalbsschnitzel', 'Weizenmehl', 'Ei', 'Semmelbrösel', 'Butterschmalz'] },
  // Rezepte, die später in die App kommen (src/daten/rezepte_zusatz.json).
  'american-pancakes': { text: 'American Pancakes aus den USA: Pfannkuchen mit Sauerrahm, Eiern und Backpulver. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Sauerrahm', 'Ei', 'Backpulver'] },
  'cottage-pie': { text: 'Cottage Pie: Auflauf aus Rinderhackfleisch mit Karotte und Tomate unter Kartoffeln und Cheddar. Für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Rinderhackfleisch', 'Karotte', 'Tomate', 'Kartoffel', 'Cheddar'] },
  'ful-medames': { text: 'Ful Medames: Püree aus Dicken Bohnen mit Tahin, Zitrone, Knoblauch und Kreuzkümmel. In {zeit} für {portionen}, mit Hinweisen zu den Zutaten.', zutaten: ['Saubohnen', 'Tahin', 'Zitrone', 'Knoblauch', 'Kreuzkümmel'] },
  kladdkaka: { text: 'Kladdkaka aus Schweden: Schokoladenkuchen aus Butter, Schokolade, Zucker, Mehl und Eiern. In {zeit} fertig, mit Hinweisen zu den Zutaten.', zutaten: ['Butter', 'Schokolade', 'Zucker', 'Weizenmehl', 'Ei'] },
  'lomo-saltado': { text: 'Lomo saltado aus Peru: Rindfleisch aus der Pfanne mit Zwiebel, Tomaten und frittierten Kartoffeln. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Rindfleisch', 'Gemüsezwiebel', 'Tomate', 'Kartoffel'] },
  // Rezepte aus alten Kochbüchern (Paket "historisch"): Jahr, Land, Buch oder Verfasser und die Zutaten.
  'apfelauflauf-1688': { text: 'Apfelauflauf von 1688 aus Österreich: Äpfel mit Eiern, Sahne, Semmelbröseln und Zimt, nach einem Grazer Kochbuch. Mit Auszug aus dem Buch.', zutaten: ['Apfel', 'Ei', 'Sahne', 'Semmelbrösel', 'Zimt'] },
  'brownies-1910': { text: 'Brownies von 1910 aus den USA, nach Fannie Farmer: Schokolade, Butter, Zucker, Mehl und Walnüsse. Mit Auszug aus dem Kochbuch.', zutaten: ['Zartbitterschokolade', 'Butter', 'Zucker', 'Weizenmehl', 'Walnüsse'] },
  'erbsensuppe-1706': { text: 'Erbsensuppe von 1706 aus Deutschland: gelbe Erbsen mit Zwiebel, Butter und geröstetem Weißbrot. Mit Auszug aus dem Nürnberger Kochbuch.', zutaten: ['Erbsen', 'Zwiebel', 'Butter', 'Weißbrot'] },
  'gazpacho-1875': { text: 'Gazpacho von 1875 aus Spanien, noch ohne Tomate: Weißbrot, Olivenöl, Knoblauch, Kreuzkümmel und Essig. Mit Auszug aus dem Original.', zutaten: ['Weißbrot', 'Olivenöl', 'Knoblauch', 'Kreuzkümmel', 'Weinessig'] },
  'gefuellte-eier-1598': { text: 'Gefüllte Eier von 1598 aus Deutschland, nach Anna Wecker: Eier mit Parmesan und Pfeffer, in Butterschmalz gebacken. Mit Auszug aus dem Buch.', zutaten: ['Ei', 'Parmesan', 'Pfeffer', 'Butterschmalz'] },
  'gnocchi-1570': { text: 'Gnocchi von 1570 aus Italien, nach Bartolomeo Scappi: Mehl und Semmelbrösel, dazu Parmesan, Zucker und Zimt. Mit Auszug aus dem Original.', zutaten: ['Weizenmehl', 'Semmelbrösel', 'Parmesan', 'Zucker', 'Zimt'] },
  'kaiserschmarrn-1890': { text: 'Kaiserschmarrn von 1890 aus Österreich, nach Katharina Prato: Sahne, Eier, Mehl und Rosinen. In {zeit}, mit Auszug aus dem Original.', zutaten: ['Sahne', 'Ei', 'Weizenmehl', 'Rosinen'] },
  'kartoffelpuffer-1905': { text: 'Kartoffelpuffer von 1905 aus Deutschland, nach Hedwig Heyl: Kartoffeln, Eier und Milch, in Butterschmalz gebacken. Mit Auszug aus dem Original.', zutaten: ['Kartoffel', 'Ei', 'Milch', 'Butterschmalz'] },
  'koenigsberger-klopse-1905': { text: 'Königsberger Klopse von 1905 aus Deutschland, nach Hedwig Heyl: Rind- und Schweinehack in Heringssauce. Mit Auszug aus dem Buch.', zutaten: ['Rinderhackfleisch', 'Schweinehackfleisch', 'Matjes'] },
  'lammeintopf-1597': { text: 'Lammeintopf von 1597 aus Großbritannien: Lammschulter mit Zwiebeln, Petersilie und einer Sauce aus Brühe und Brot. Mit Auszug aus dem Buch.', zutaten: ['Lammschulter', 'Zwiebel', 'Petersilie', 'Weißbrot'] },
  'lebkuchen-1706': { text: 'Lebkuchen von 1706 aus Deutschland: Zucker, Honig, Rosenwasser, Mehl, Zimt und Pfeffer. Für {portionen}, mit Auszug aus dem Kochbuch.', zutaten: ['Zucker', 'Honig', 'Rosenwasser', 'Weizenmehl', 'Zimt', 'Pfeffer'] },
  'linzer-torte-1849': { text: 'Linzer Torte von 1849, nach dem Kochbuch von Henriette Davidis aus Deutschland: Mandelteig mit Butter und Johannisbeerkonfitüre, mit Auszug.', zutaten: ['Mandeln', 'Butter', 'Johannisbeerkonfitüre'] },
  'maccheroni-alla-bolognese-1895': { text: 'Maccheroni alla bolognese von 1895 aus Italien, nach Artusi: Makkaroni mit Kalbfleisch, Pancetta und Parmesan. Mit Auszug aus dem Buch.', zutaten: ['Makkaroni', 'Kalbfleisch', 'Pancetta', 'Parmesan'] },
  'marzipan-1598': { text: 'Marzipan von 1598 aus Deutschland, nach Anna Wecker: Mandeln, Puderzucker und Rosenwasser, auf Oblaten. Mit Auszug aus dem Buch.', zutaten: ['Mandeln', 'Puderzucker', 'Rosenwasser', 'Oblaten'] },
  'nasi-goreng-1902': { text: 'Nasi Goreng von 1902 aus Indonesien: gebratener Reis mit Huhn, Garnelen, Schalotten und Ei. Mit Auszug aus einem Kochbuch aus Semarang.', zutaten: ['Reis', 'Hähnchenkeule', 'Garnelen', 'Schalotte', 'Ei'] },
  'omelett-1746': { text: 'Omelett von 1746 aus Frankreich, nach Menon: Eier, Butter, Petersilie und Schnittlauch. In {zeit} fertig, mit Auszug aus dem Original.', zutaten: ['Ei', 'Butter', 'Petersilie', 'Schnittlauch'] },
  'pfannkuchen-1597': { text: 'Pfannkuchen von 1597 aus Großbritannien: hauchdünn, aus Sahne, Eigelb, Mehl, Bier, Zimt und Ingwer. Mit Auszug aus dem Original.', zutaten: ['Sahne', 'Eigelb', 'Weizenmehl', 'Bier', 'Zimt', 'Ingwer'] },
  'pfirsich-melba-1907': { text: 'Pfirsich Melba von 1907 aus Frankreich, nach Auguste Escoffier: pochierte Pfirsiche auf Vanilleeis mit Himbeerpüree. Mit Auszug aus dem Original.', zutaten: ['Pfirsich', 'Speiseeis', 'Himbeere'] },
  'toad-in-the-hole-1861': { text: 'Toad in the Hole von 1861 aus Großbritannien, nach Isabella Beeton: Rumpsteak in einem Teig aus Mehl, Milch und Eiern, mit Auszug.', zutaten: ['Rumpsteak', 'Weizenmehl', 'Milch', 'Ei'] },
  'yorkshire-pudding-1774': { text: 'Yorkshire Pudding von 1774 aus Großbritannien, nach Hannah Glasse: Teig aus Mehl, Eiern und Milch, in heißem Öl gebacken, mit Auszug.', zutaten: ['Weizenmehl', 'Ei', 'Milch', 'Sonnenblumenöl'] },
  'zuercher-geschnetzeltes': { text: 'Zürcher Geschnetzeltes aus der Schweiz: Kalbfleisch mit Champignons, Weißwein und Sahne. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Kalbfleisch', 'Champignons', 'Weißwein', 'Sahne'] },
};

function rezeptMeta(rezept) {
  const pfad = rezeptAdresse(rezept);
  const name = suchtitel(rezept);
  // Rezepte aus genau einem Land nennen es im Titel. Kürzen: zuerst " aus {Land}", dann die Marke. Bei mehreren
  // Ländern stünde nur eines davon im Titel; dort steht stattdessen, was die Seite bietet.
  const lang = rezept.laender.length === 1 ? `${name}: Rezept ${ausLand(rezept.laender[0])}` : `${name}: Rezept mit Hinweisen zu den Zutaten`;
  // Rezepte aus alten Kochbüchern heißen im Titel "altes Rezept" (AP-25); das Jahr steht schon im Namen.
  const titel = rezept.original
    ? erste(pfad, 'titel', [`${name}: altes Rezept ${ausLand(rezept.laender[0])}${MARKE}`, `${name}: altes Rezept${MARKE}`, `${name}: altes Rezept`])
    : erste(pfad, 'titel', [lang + MARKE, `${name}: Rezept${MARKE}`, `${name}: Rezept`]);
  const eintrag = REZEPT[rezept.slug];
  if (!eintrag) { fehler.push(`${pfad}: Beschreibung fehlt (REZEPT in meta.mjs)`); return { titel, beschreibung: '' }; }
  const vorhanden = new Set(rezept.zutaten.map((zutat) => zutat.grundbegriff));
  for (const zutat of eintrag.zutaten) if (!vorhanden.has(zutat)) fehler.push(`${pfad}: Die Beschreibung nennt „${zutat}“, das Rezept hat diese Zutat nicht`);
  if (rezept.laender.length === 1 && !eintrag.text.includes(ausLand(rezept.laender[0]))) fehler.push(`${pfad}: Die Beschreibung nennt das Land nicht (${ausLand(rezept.laender[0])})`);
  const werte = {
    aufwand: AUFWAND[rezept.aufwand],
    zeit: rezept.zeitGesamt == null ? null : gesamtzeit(rezept),
    portionen: portionen(rezept),
  };
  const beschreibung = eintrag.text.replace(/\{(\w+)\}/g, (_, feld) => {
    if (werte[feld] == null) fehler.push(`${pfad}: Die Beschreibung braucht {${feld}}, das Rezept hat die Angabe nicht`);
    return werte[feld] ?? '';
  });
  return { titel, beschreibung, art: 'article', bild: { pfad: `/bilder/rezepte/${rezept.slug}-teilen.jpg`, alt: `Symbolbild: ${rezept.titel}` } };
}

// ---- Liste aller Seiten ----
const GEMEINSAM = { pfad: seite.teilen.pfad, alt: `${seite.name}: ${fuss.satz}` };
const fest = (pfad) => FEST.find((eintrag) => eintrag.pfad === pfad);
const anleitung = kapitel.map((eintrag) => {
  const pfad = kapitelAdresse(eintrag);
  const angaben = KAPITEL[eintrag.slug];
  if (!angaben) { fehler.push(`${pfad}: Titel und Beschreibung fehlen (KAPITEL in meta.mjs)`); return { pfad, titel: '', beschreibung: '' }; }
  return { pfad, titel: angaben.titel ?? `${angaben.thema}: So geht's mit ${seite.name}`, beschreibung: angaben.beschreibung };
});
const uebersicht = {
  pfad: '/rezepte/',
  titel: mitMarke('/rezepte/', `${rezeptSeiten.length} Rezepte mit Hinweisen zu den Zutaten`),
  beschreibung: `${rezeptSeiten.length} Rezepte aus ${new Set(rezeptSeiten.flatMap((rezept) => rezept.laender)).size} Ländern mit Hinweisen zu den Zutaten. Suche nach Rezept oder Zutat und filtere nach Kategorie, Land und „Passt für“.`,
};
// Sammelseite der Rezepte aus alten Kochbüchern (AP-25): Titel und Beschreibung mit den Suchbegriffen „alte Rezepte“,
// „historische Rezepte“ und „Rezepte aus alten Kochbüchern“; Zahl und Jahre kommen aus den Daten.
const [altVon, altBis] = jahreVonBis();
const alteMeta = {
  pfad: alteSeite.adresse,
  titel: mitMarke(alteSeite.adresse, 'Alte Rezepte: historische Rezepte aus alten Kochbüchern'),
  beschreibung: `${alteRezepte.length} alte Rezepte aus Kochbüchern von ${altVon} bis ${altBis}: historische Rezepte mit Auszug aus dem Original und einer heutigen Fassung mit Mengen.`,
};
const REIHE = ['ohne', 'passt', 'kategorie', 'land'];
const themenSeiten = [...themen].sort((a, b) => REIHE.indexOf(a.art) - REIHE.indexOf(b.art)).map((thema) => ({ pfad: thema.adresse, ...themaMeta(thema), imIndex: thema.imIndex }));
const rezeptListe = rezeptSeiten.map((rezept) => ({ pfad: rezeptAdresse(rezept), ...rezeptMeta(rezept) }));

export const alleMeta = [
  fest('/'), fest(BEREICH), ...anleitung, uebersicht, alteMeta, ...themenSeiten, ...rezeptListe, fest('/fragen/'),
  fest('/daten-und-quellen/'), fest('/ueber-foodasu/'), fest('/datenschutz.html'), fest('/nutzungsbedingungen.html'), fest('/lizenzen/'), fest('/offenlegung/'), fest('/quellen-und-lizenzen/'), fest('/404.html'),
].map(({ imIndex = true, ...eintrag }) => ({ art: 'website', bild: GEMEINSAM, ...eintrag, index: imIndex && !OHNE_INDEX.includes(eintrag.pfad) }));

// ---- Prüfung beim Laden: Jeder Verstoß bricht den Bau ab. ----
const gesehen = { titel: new Map(), beschreibung: new Map() };
for (const eintrag of alleMeta) {
  for (const art of ['titel', 'beschreibung']) {
    const text = eintrag[art];
    const ausnahme = art === 'titel' && eintrag.pfad === '/' && text === TITEL_START;
    if (!ausnahme) for (const befund of grenzBefunde(text, art)) fehler.push(`${eintrag.pfad}: ${art} „${text}“: ${befund}`);
    if (gesehen[art].has(text)) fehler.push(`${eintrag.pfad}: ${art} doppelt, auch auf ${gesehen[art].get(text)}`);
    gesehen[art].set(text, eintrag.pfad);
  }
  if (!TITEL_ZEICHEN.test(eintrag.titel)) fehler.push(`${eintrag.pfad}: Titel mit einem Zeichen, das nicht erlaubt ist: „${eintrag.titel}“`);
  if (eintrag.beschreibung.includes('"')) fehler.push(`${eintrag.pfad}: Beschreibung mit geradem Anführungszeichen`);
  if (!/[.?!]$/.test(eintrag.beschreibung)) fehler.push(`${eintrag.pfad}: Beschreibung endet nicht mit einem Satzzeichen`);
  if (/\/rezepte\/(ohne-|vegetarisch|vegan)/.test(eintrag.pfad) && !(eintrag.beschreibung.includes('laut Zutatenliste') && eintrag.beschreibung.includes('Verpackung'))) {
    fehler.push(`${eintrag.pfad}: Beschreibung ohne „laut Zutatenliste“ oder ohne den Hinweis auf die Verpackung`);
  }
}
if (new Set(alleMeta.map((eintrag) => eintrag.pfad)).size !== alleMeta.length) fehler.push('Eine Adresse steht doppelt in der Liste');
if (fehler.length) throw new Error(`Meta-Daten (src/daten/meta.mjs):\n- ${fehler.join('\n- ')}`);

const nachPfad = new Map(alleMeta.map((eintrag) => [eintrag.pfad, eintrag]));
export function metaVon(pfad) {
  const eintrag = nachPfad.get(pfad);
  if (!eintrag) throw new Error(`Keine Meta-Daten für ${pfad} (src/daten/meta.mjs)`);
  return eintrag;
}
