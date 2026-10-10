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
// - noindex tragen nur /offenlegung/, /quellen-und-lizenzen/ und die 404-Seite.
import { grenzBefunde } from './breite.mjs';
import { seite } from './seite.mjs';
import { kopfdaten, fuss } from './startseite.mjs';
import { BEREICH, adresse as kapitelAdresse, kapitel } from './sogehts.mjs';
import {
  AUFWAND, KATEGORIE, LAND, ausLand, dauer, portionen, rezeptAdresse, rezeptSeiten, suchtitel, themen,
} from './rezeptseiten.mjs';

const MARKE = ` | ${seite.name}`;
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
  // Startseite: Der Titel bleibt.
  {
    pfad: '/',
    titel: kopfdaten.titel,
    beschreibung: 'Der Lebensmittel-Scanner FoodAsu zeigt, ob ein Produkt laut den Angaben für alle im Haushalt passt. Android-App ohne Konto und ohne Werbung.',
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
    pfad: '/datenschutz.html',
    titel: mitMarke('/datenschutz.html', 'Datenschutzerklärung'),
    beschreibung: 'Datenschutzerklärung der App FoodAsu und der Website foodasu.com: welche Daten verarbeitet werden, wozu, und welche Rechte du hast.',
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
    beschreibung: 'Personen im Haushalt anlegen, Einträge bei „Meiden“ wählen und die drei Stufen verstehen: von „Lieber nicht“ bis „Auf keinen Fall“.',
  },
  'scannen-und-urteil': {
    thema: 'Scannen und das Urteil verstehen',
    beschreibung: 'Strichcode scannen und das Urteil für den Haushalt lesen: was „Angaben unvollständig“ und „Kein Konflikt laut Daten“ auf der Karte bedeuten.',
  },
  produktkarte: {
    thema: 'Die Produktkarte',
    beschreibung: 'Die Produktkarte von FoodAsu lesen: Nährwerte, Nutri-Score, Abzeichen und Zutaten, Daten neu laden und ein Produkt auf die Liste setzen.',
  },
  einkaufslisten: {
    thema: 'Einkaufslisten',
    beschreibung: 'Einkaufslisten in FoodAsu: aufschreiben, im Laden abhaken, nach Warengruppen ordnen, Produkte in die Liste scannen und als Text teilen.',
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
  '/rezepte/ohne-milch/': { rezepte: ['ratatouille', 'spaetzle'] },
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
  'zuercher-geschnetzeltes': { text: 'Zürcher Geschnetzeltes aus der Schweiz: Kalbfleisch mit Champignons, Weißwein und Sahne. In {zeit}, mit Hinweisen zu den Zutaten.', zutaten: ['Kalbfleisch', 'Champignons', 'Weißwein', 'Sahne'] },
};

function rezeptMeta(rezept) {
  const pfad = rezeptAdresse(rezept);
  const name = suchtitel(rezept);
  // Rezepte aus genau einem Land nennen es im Titel. Kürzen: zuerst " aus {Land}", dann die Marke. Bei mehreren
  // Ländern stünde nur eines davon im Titel; dort steht stattdessen, was die Seite bietet.
  const lang = rezept.laender.length === 1 ? `${name}: Rezept ${ausLand(rezept.laender[0])}` : `${name}: Rezept mit Hinweisen zu den Zutaten`;
  const titel = erste(pfad, 'titel', [lang + MARKE, `${name}: Rezept${MARKE}`, `${name}: Rezept`]);
  const eintrag = REZEPT[rezept.slug];
  if (!eintrag) { fehler.push(`${pfad}: Beschreibung fehlt (REZEPT in meta.mjs)`); return { titel, beschreibung: '' }; }
  const vorhanden = new Set(rezept.zutaten.map((zutat) => zutat.grundbegriff));
  for (const zutat of eintrag.zutaten) if (!vorhanden.has(zutat)) fehler.push(`${pfad}: Die Beschreibung nennt „${zutat}“, das Rezept hat diese Zutat nicht`);
  if (rezept.laender.length === 1 && !eintrag.text.includes(ausLand(rezept.laender[0]))) fehler.push(`${pfad}: Die Beschreibung nennt das Land nicht (${ausLand(rezept.laender[0])})`);
  const werte = {
    aufwand: AUFWAND[rezept.aufwand],
    zeit: rezept.zeitGesamt == null ? null : dauer(rezept.zeitGesamt),
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
const REIHE = ['ohne', 'passt', 'kategorie', 'land'];
const themenSeiten = [...themen].sort((a, b) => REIHE.indexOf(a.art) - REIHE.indexOf(b.art)).map((thema) => ({ pfad: thema.adresse, ...themaMeta(thema) }));
const rezeptListe = rezeptSeiten.map((rezept) => ({ pfad: rezeptAdresse(rezept), ...rezeptMeta(rezept) }));

export const alleMeta = [
  fest('/'), fest(BEREICH), ...anleitung, uebersicht, ...themenSeiten, ...rezeptListe, fest('/fragen/'),
  fest('/datenschutz.html'), fest('/lizenzen/'), fest('/offenlegung/'), fest('/quellen-und-lizenzen/'), fest('/404.html'),
].map((eintrag) => ({ art: 'website', bild: GEMEINSAM, ...eintrag, index: !OHNE_INDEX.includes(eintrag.pfad) }));

// ---- Prüfung beim Laden: Jeder Verstoß bricht den Bau ab. ----
const gesehen = { titel: new Map(), beschreibung: new Map() };
for (const eintrag of alleMeta) {
  for (const art of ['titel', 'beschreibung']) {
    const text = eintrag[art];
    for (const befund of grenzBefunde(text, art)) fehler.push(`${eintrag.pfad}: ${art} „${text}“: ${befund}`);
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
