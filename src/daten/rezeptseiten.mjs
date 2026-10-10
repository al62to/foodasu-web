// Rezept- und Themenseiten: feste Texte, Wörter für die Angaben des Rezeptpakets und die Regeln, nach denen aus den
// Daten Seiten werden. Kein Text wird je Seite von Hand geschrieben. Wörter mit dem Vermerk (App) stehen so in den
// Texten der App (strings_rezept_teile.xml, strings_rezept_seite.xml, strings_urteil.xml, strings_karte.xml).
import daten from './rezepte.json' with { type: 'json' };
import { auswahl, muster, HOECHSTENS } from './auswahl.mjs';

export const paket = daten.paket;
// Zahlen über alle Rezepte der App. In rezepte.json stehen nur die Rezepte der Website (tools/rezepte_exportieren.py).
export const zahlenApp = daten.zahlen;
export const GESAMT = zahlenApp.gesamt;
// Tag der ersten Veröffentlichung der Rezeptseiten (datePublished, lastmod). Bei der Veröffentlichung setzen.
export const STAND = '2026-10-10';

if (auswahl.length > HOECHSTENS) throw new Error(`Auswahl hat ${auswahl.length} Rezepte, erlaubt sind ${HOECHSTENS}`);
const nachSlug = new Map(daten.rezepte.map((rezept) => [rezept.slug, rezept]));
for (const slug of auswahl) if (!nachSlug.has(slug)) throw new Error(`Auswahl nennt ein Rezept, das in rezepte.json fehlt (neu exportieren): ${slug}`);
if (daten.rezepte.length !== auswahl.length) throw new Error(`rezepte.json hat ${daten.rezepte.length} Rezepte, die Auswahl ${auswahl.length} (neu exportieren)`);
export const rezepte = auswahl.map((slug) => nachSlug.get(slug)).sort((a, b) => a.nr - b.nr);

// ---- Wörter (App) ----
export const LAND = {
  DE: 'Deutschland', AT: 'Österreich', IT: 'Italien', FR: 'Frankreich', CH: 'Schweiz', ES: 'Spanien',
  GR: 'Griechenland', TR: 'Türkei', SY: 'Syrien', IN: 'Indien', LB: 'Libanon', JO: 'Jordanien', TH: 'Thailand',
  MX: 'Mexiko', PS: 'Palästina', JP: 'Japan', MA: 'Marokko', KR: 'Südkorea', IL: 'Israel', IR: 'Iran', VN: 'Vietnam',
  HU: 'Ungarn', CZ: 'Tschechien', LI: 'Liechtenstein', PE: 'Peru',
};
// Reihenfolge der Länder im Filter der Übersicht: zuerst Österreich, Deutschland und die Schweiz, dann die Nachbarn
// und der Rest (wie im Mega-Menü, src/daten/navigation.mjs).
export const LAND_REIHENFOLGE = [
  'AT', 'DE', 'CH', 'IT', 'FR', 'ES', 'GR', 'TR', 'IN', 'HU', 'CZ', 'LI', 'SY', 'LB', 'JO', 'PS', 'IL', 'IR', 'MA', 'TH',
  'VN', 'JP', 'KR', 'MX', 'PE',
];
const ARTIKEL = { TR: 'der Türkei', CH: 'der Schweiz', LB: 'dem Libanon', IR: 'dem Iran' };
export const ausLand = (kuerzel) => `aus ${ARTIKEL[kuerzel] ?? LAND[kuerzel]}`;
// Kategorie (App) und die Form für den Einleitungssatz.
export const KATEGORIE = {
  HAUPTGERICHT: ['Hauptgericht', 'ein Hauptgericht'], SUPPE: ['Suppe', 'eine Suppe'], VORSPEISE: ['Vorspeise', 'eine Vorspeise'],
  SALAT: ['Salat', 'ein Salat'], BEILAGE: ['Beilage', 'eine Beilage'], SAUCE: ['Sauce', 'eine Sauce'], SNACK: ['Snack', 'ein Snack'],
  FRUEHSTUECK: ['Frühstück', 'ein Frühstück'], SUESSSPEISE: ['Süßspeise', 'eine Süßspeise'], GEBAECK: ['Gebäck', 'ein Gebäck'],
  GETRAENK: ['Getränk', 'ein Getränk'],
};
export const AUFWAND = { EINFACH: 'einfach', MITTEL: 'mittel', AUFWENDIG: 'aufwendig' };
export const ENERGIE = {
  stufen: ['SEHR_LEICHT', 'LEICHT', 'MITTEL', 'GEHALTVOLL'],
  wort: { SEHR_LEICHT: 'sehr leicht', LEICHT: 'leicht', MITTEL: 'mittel', GEHALTVOLL: 'gehaltvoll' },
  bereich: { SEHR_LEICHT: 'unter 60 kcal', LEICHT: '60 bis 150 kcal', MITTEL: '150 bis 400 kcal', GEHALTVOLL: 'über 400 kcal' },
};
export const QUELLE = {
  KOCHWIKI: ['Koch-Wiki (kochwiki.org)', 'Autorinnen und Autoren des Koch-Wikis'],
  UNITOOLS: ['UniTools World Recipes (theunitools.com)', 'UniTools (theunitools.com)'],
  WIKIBOOKS: ['Wikibooks Kochbuch (de.wikibooks.org)', 'Autorinnen und Autoren von Wikibooks'],
  FANDOM: ['Rezepte-Wiki auf Fandom (rezepte.fandom.com)', 'Autorinnen und Autoren des Rezepte-Wikis auf Fandom'],
};
export const LIZENZ = {
  CC_BY_SA_3_0_DE: ['Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 3.0 Deutschland (CC BY-SA 3.0 DE)', 'CC BY-SA 3.0 DE'],
  CC_BY_SA_3_0: ['Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 3.0 Unported (CC BY-SA 3.0)', 'CC BY-SA 3.0'],
  CC_BY_SA_4_0: ['Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 4.0 International (CC BY-SA 4.0)', 'CC BY-SA 4.0'],
};
export const NAEHRWERT = [
  ['kcal', 'Kalorien', 'kcal', 0], ['fett', 'Fett', 'g', 1], ['gesaettigt', 'Gesättigte Fettsäuren', 'g', 1],
  ['kohlenhydrate', 'Kohlenhydrate', 'g', 1], ['zucker', 'Zucker', 'g', 1], ['ballaststoffe', 'Ballaststoffe', 'g', 1],
  ['eiweiss', 'Eiweiß', 'g', 1], ['salz', 'Salz', 'g', 2],
];

// Die 20 Einträge zum Meiden: Schlüssel im Paket, Name, Form nach "Enthält", Form nach "mit" (App), Adresse der
// Themenseite und das Wort in "Rezepte ohne ...". "Nüsse" heißt in der App "Schalenfrüchte".
export const EINTRAEGE = [
  ['en:gluten', 'Gluten', 'Gluten', 'Gluten', 'gluten'],
  ['en:crustaceans', 'Krebstiere', 'Krebstiere', 'Krebstieren', 'krebstiere'],
  ['en:eggs', 'Eier', 'Eier', 'Eiern', 'eier'],
  ['en:fish', 'Fisch', 'Fisch', 'Fisch', 'fisch'],
  ['en:peanuts', 'Erdnüsse', 'Erdnüsse', 'Erdnüssen', 'erdnuesse'],
  ['en:soybeans', 'Soja', 'Soja', 'Soja', 'soja'],
  ['en:milk', 'Milch', 'Milch', 'Milch', 'milch'],
  ['en:nuts', 'Schalenfrüchte', 'Schalenfrüchte', 'Schalenfrüchten', 'nuesse', 'Nüsse'],
  ['en:celery', 'Sellerie', 'Sellerie', 'Sellerie', 'sellerie'],
  ['en:mustard', 'Senf', 'Senf', 'Senf', 'senf'],
  ['en:sesame-seeds', 'Sesam', 'Sesam', 'Sesam', 'sesam'],
  ['en:sulphur-dioxide-and-sulphites', 'Sulfite', 'Sulfite', 'Sulfiten', 'sulfite'],
  ['en:lupin', 'Lupinen', 'Lupinen', 'Lupinen', 'lupinen'],
  ['en:molluscs', 'Weichtiere', 'Weichtiere', 'Weichtieren', 'weichtiere'],
  ['en:pork', 'Schweinefleisch', 'Schweinefleisch', 'Schweinefleisch', 'schweinefleisch'],
  ['en:alcohol', 'Alkohol', 'Alkohol', 'Alkohol', 'alkohol'],
  ['en:e428', 'Gelatine', 'Gelatine', 'Gelatine', 'gelatine'],
  ['en:palm-oil', 'Palmöl', 'Palmöl', 'Palmöl', 'palmoel'],
  ['en:vegetarian', 'Vegetarisch', 'nicht vegetarische Zutaten', 'nicht vegetarischen Zutaten', null],
  ['en:vegan', 'Vegan', 'tierische Zutaten', 'tierischen Zutaten', null],
].map(([schluessel, name, enthaelt, mit, adresse, ohne]) => ({ schluessel, name, enthaelt, mit, adresse, ohne: ohne ?? name }));
const eintragVon = new Map(EINTRAEGE.map((eintrag) => [eintrag.schluessel, eintrag]));
const ZUTATEN_EINTRAEGE = EINTRAEGE.filter((eintrag) => eintrag.adresse);
// Eine Themenseite "Rezepte ohne ..." gibt es nur für diese Einträge (Ali, 09.10.2026: nach Suchnachfrage, nicht nach
// Anzahl). Die übrigen (Lupinen, Weichtiere, Krebstiere, Sulfite, Sellerie, Senf, Palmöl) stehen weiter unter
// "Passt für" und in den Hinweisen jeder Rezeptseite, haben aber keine eigene Seite und keinen Eintrag im Menü.
export const OHNE_MIT_SEITE = [
  'en:nuts', 'en:peanuts', 'en:gluten', 'en:milk', 'en:eggs', 'en:soybeans', 'en:sesame-seeds', 'en:fish', 'en:pork',
  'en:alcohol', 'en:e428',
];
const RANG = { IST: 3, MEIST_MIT: 2, JE_NACH_PRODUKT: 1 };
// Wortlaut eines Hinweises (App, ohne den Teil "betrifft ...", den nur die App kennt).
export const hinweisText = (stufe, eintrag) =>
  stufe === 'IST' ? `Enthält ${eintrag.enthaelt}` : stufe === 'MEIST_MIT' ? `Meist mit ${eintrag.mit}` : `Je nach Produkt mit ${eintrag.mit}`;

// ---- Feste Texte der Seiten (neu geschrieben, zur Freigabe) ----
export const texte = {
  uebersicht: 'Rezepte',
  symbolbild: 'Symbolbild',
  passt: {
    titel: 'Passt für',
    zusatz: 'laut Zutatenliste',
    ohne: (wort) => `Ohne ${wort}`,
    vegetarisch: 'Vegetarisch',
    vegan: 'Vegan',
    moeglich: { vegetarisch: 'vegetarisch möglich', vegan: 'vegan möglich' },
    moeglichText: (form, zutaten) => `Das Rezept ist ${form}, wenn du bei diesen Zutaten auf die Zutatenliste des Produkts achtest: ${zutaten}.`,
    erklaerung: 'Grundlage ist die Zutatenliste dieses Rezepts. Was in einem Produkt aus dem Laden steckt, steht auf der Packung. Maßgeblich ist die Verpackung.',
    keine: 'Für dieses Rezept gibt es zu jedem Eintrag einen Hinweis.',
  },
  zutaten: { titel: 'Zutaten', fuer: 'Für' },
  hinweise: {
    titel: 'Hinweise zu den Zutaten',
    einleitung: 'FoodAsu prüft jede Zutat gegen 20 Einträge zum Meiden. Bei diesem Rezept gibt es diese Hinweise:',
    spalten: ['Eintrag', 'Hinweis', 'Zutaten'],
    stufen: [
      ['Enthält', 'Die Zutat ist der Eintrag oder enthält ihn.'],
      ['Meist mit', 'Die meisten Produkte dieser Art enthalten den Eintrag.'],
      ['Je nach Produkt', 'Es kommt auf das Produkt an, das du verwendest.'],
    ],
    keine: 'Zu diesem Rezept gibt es keinen Hinweis.',
    app: 'In der App siehst du diese Hinweise nur für die Personen in deinem Haushalt, die sie betreffen.',
    tabelle: 'Hinweise als Tabelle',
  },
  schritte: { titel: 'Zubereitung', marke: (nummer) => `Schritt ${nummer}` },
  naehrwerte: {
    proPortion: 'Nährwerte pro Portion',
    proStueck: 'Nährwerte pro Stück',
    je100: 'Nährwerte je 100 g',
    spalteJe100: 'je 100 g',
    unvollstaendig: ['Nährwerte unvollständig', 'Für dieses Rezept lassen sich nicht alle Zutaten berechnen.'],
    ohneSalz: 'Ohne Salz nach Geschmack.',
    grundlage: 'Berechnet aus den rohen Zutaten mit Daten des Bundeslebensmittelschlüssels (BLS 4.0, Max Rubner-Institut), CC BY 4.0.',
    energie: 'Energiedichte',
    energieStufe: (wort, stufe) => `${wort}, Stufe ${stufe} von 4`,
    energieText: 'Die Energiedichte zeigt, wie viele Kilokalorien 100 g des Gerichts haben.',
    energieHinweis: 'Berechnet aus den rohen Zutaten; beim Kochen ändert sich das Gewicht.',
    titel: 'Nährwerte',
    tabelle: 'Nährwerte als Tabelle',
    spaltePortion: 'pro Portion',
    spalteStueck: 'pro Stück',
  },
  quelle: {
    titel: 'Quelle und Lizenz',
    // Unter jedem Rezept steht nur dieser Link; die Angaben stehen auf der Seite "Quellen und Lizenzen" (Ali, 09.10.2026).
    link: 'Quelle und Lizenz',
    fuer: (titel) => `Quelle und Lizenz zu ${titel}`,
    seite: {
      titel: 'Quellen und Lizenzen',
      adresse: '/quellen-und-lizenzen/',
      beschreibung: 'Quelle, Urheber, Lizenz und Änderungen zu jedem Rezept auf foodasu.com.',
      einleitung: 'Zu jedem Rezept dieser Website stehen hier Quelle, Urheber, Lizenz und Änderungen, dazu die Angaben zum Bild und zu den Nährwerten.',
      uebersicht: 'Rezepte auf dieser Seite',
      zumRezept: 'Zum Rezept',
    },
    rezept: 'Rezept in der Quelle',
    datensatz: 'Datensatz der Quelle',
    urheber: 'Urheber',
    lizenz: 'Lizenz',
    aenderungen: 'Änderungen',
    veraendert: 'Für FoodAsu verändert.',
    bild: ['Bild', 'Symbolbild FoodAsu, mit Adobe Firefly erzeugt.'],
    // Der Satz steht in drei Teilen, damit Lizenz und DOI verlinkt sind (Ali, 09.10.2026).
    naehrwerte: ['Nährwerte', 'Eigene Berechnung auf Grundlage von Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0, DOI ', '. Lizenz: ', '. Das Max Rubner-Institut hat die Berechnung nicht geprüft.'],
    bls: { doi: '10.25826/Data20251217-134202-0', doiZiel: 'https://doi.org/10.25826/Data20251217-134202-0', lizenz: 'CC BY 4.0', lizenzZiel: 'https://creativecommons.org/licenses/by/4.0/deed.de' },
    gleicheLizenz: (kurz) => `Titel, Zutaten und Zubereitung dieses Rezepts stehen unter der Lizenz ${kurz}. Die Hinweise zu den Zutaten und der Abschnitt „Passt für“ stammen von FoodAsu.`,
  },
  app: {
    titel: 'Dieses Rezept in FoodAsu',
    text: 'In der App rechnest du die Mengen auf deine Portionen um und setzt die fehlenden Zutaten auf deine Einkaufsliste. Die Hinweise richten sich nach deinem Haushalt.',
    mehr: 'Dort findest du über 300 Rezepte.',
    soGehts: "So geht's: Anleitung zu FoodAsu",
  },
  aehnlich: 'Ähnliche Rezepte',
  themenTitel: 'Mehr Rezepte',
  // Übersicht "Rezepte" nach Entwurf 1 der Projektleitung (AP-17 Teil E3): Suche, drei Auswahlknöpfe mit Listen zum
  // Ankreuzen, gewählte Filter als Kärtchen, am Handy ein Blatt von unten.
  alle: {
    titel: 'Rezepte',
    seitentitel: 'Rezepte mit Hinweisen zu den Zutaten',
    text: (zahl) => `${zahl} Rezepte mit Hinweisen zu den Zutaten. In der App sind es über 300.`,
    grundlage: 'Grundlage ist die Zutatenliste des Rezepts. Was in einem Produkt aus dem Laden steckt, steht auf der Packung. Maßgeblich ist die Verpackung.',
    suche: 'Rezept oder Zutat suchen',
    gruppen: { kategorie: 'Kategorie', land: 'Land', passt: 'Passt für' },
    // Zusatz in der Liste "Passt für": Die Auswahl richtet sich nach der Zutatenliste des Rezepts.
    passtZusatz: 'laut Zutatenliste',
    ohne: (wort) => `Ohne ${wort}`,
    weitere: { land: 'Weitere Länder anzeigen', passt: 'Weitere anzeigen' },
    zuruecksetzen: 'Zurücksetzen',
    fertig: 'Fertig',
    gewaehlt: 'Gewählte Filter',
    entfernen: (wort) => `Filter ${wort} entfernen`,
    alleZuruecksetzen: 'Alle Filter zurücksetzen',
    stand: (zahl) => (zahl === 1 ? '1 Rezept' : `${zahl} Rezepte`),
    // Am Handy: Knopf "Filter" mit der Zahl der gewählten Filter, Blatt von unten, Knopf zum Schließen des Blatts.
    filter: 'Filter',
    schliessen: 'Filter schließen',
    zeigen: (zahl) => (zahl === 1 ? '1 Rezept anzeigen' : `${zahl} Rezepte anzeigen`),
    leer: 'Kein Rezept passt zu dieser Auswahl.',
    themen: 'Mehr Themen',
    // Sechs Themen am Ende der Seite (statt der langen Liste "Rezepte nach Thema"); alle Themen stehen im Menü.
    mehrThemen: [
      { titel: 'Rezepte ohne Nüsse', ziel: '/rezepte/ohne-nuesse/' },
      { titel: 'Rezepte ohne Gluten', ziel: '/rezepte/ohne-gluten/' },
      { titel: 'Vegetarische Rezepte', ziel: '/rezepte/vegetarisch/' },
      { titel: 'Vegane Rezepte', ziel: '/rezepte/vegan/' },
      { titel: 'Rezepte aus Österreich', ziel: '/rezepte/land/oesterreich/' },
      { titel: 'Süßspeisen', ziel: '/rezepte/kategorie/suessspeise/' },
    ],
  },
  thema: {
    grundlage: 'Grundlage ist die Zutatenliste des Rezepts. Was in einem Produkt aus dem Laden steckt, steht auf der Packung. Maßgeblich ist die Verpackung.',
    inDerApp: (zahl) => `In der App FoodAsu gibt es über 300 Rezepte, davon ${zahl} zu diesem Thema.`,
    jeNachTitel: 'Je nach Produkt',
    verwandt: 'Verwandte Themen',
  },
};

// ---- Darstellung ----
export const zahl = (wert, stellen) => wert.toLocaleString('de-AT', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
export const dauer = (minuten) => {
  if (minuten < 60) return `${minuten} Min.`;
  if (minuten >= 1440) { const tage = Math.round(minuten / 1440); return tage === 1 ? '1 Tag' : `${tage} Tage`; }
  const rest = minuten % 60;
  return rest ? `${Math.floor(minuten / 60)} Std. ${rest} Min.` : `${minuten / 60} Std.`;
};
export const iso = (minuten) => `PT${minuten}M`;
export const portionen = (rezept) =>
  rezept.portionen == null ? null : rezept.portionenEinheit === 'STUECK' ? `${rezept.portionen} Stück` : `${rezept.portionen} ${rezept.portionen === 1 ? 'Portion' : 'Portionen'}`;
export const zutatText = (zutat) => [zutat.menge, zutat.einheit, zutat.name].filter(Boolean).join(' ');
const aufzaehlung = (liste) => (liste.length < 2 ? liste.join('') : `${liste.slice(0, -1).join(', ')} und ${liste.at(-1)}`);

// Hinweise eines Rezepts je Eintrag: stärkste Stufe und die Zutaten je Stufe.
export function hinweiseVon(rezept) {
  const je = new Map();
  for (const zutat of rezept.zutaten) {
    for (const { eintrag, stufe } of zutat.hinweise) {
      if (!je.has(eintrag)) je.set(eintrag, { IST: [], MEIST_MIT: [], JE_NACH_PRODUKT: [] });
      const liste = je.get(eintrag)[stufe];
      if (!liste.includes(zutat.grundbegriff)) liste.push(zutat.grundbegriff);
    }
  }
  return EINTRAEGE.filter((eintrag) => je.has(eintrag.schluessel)).map((eintrag) => ({
    eintrag,
    stufen: ['IST', 'MEIST_MIT', 'JE_NACH_PRODUKT'].filter((stufe) => je.get(eintrag.schluessel)[stufe].length).map((stufe) => ({ stufe, text: hinweisText(stufe, eintrag), zutaten: je.get(eintrag.schluessel)[stufe] })),
  }));
}
export const ohneHinweis = (rezept) => ZUTATEN_EINTRAEGE.filter((eintrag) => !(eintrag.schluessel in rezept.hinweise));
// 'voll' ohne jeden Hinweis, 'moeglich' wenn es nur auf einzelne Produkte ankommt, sonst null.
export const ernaehrung = (rezept, schluessel) =>
  !(schluessel in rezept.hinweise) ? 'voll' : rezept.hinweise[schluessel] === 'JE_NACH_PRODUKT' ? 'moeglich' : null;

// Einleitung, sparsame Variante: ein bis zwei sachliche Sätze aus den Daten.
export function einleitung(rezept) {
  const laender = aufzaehlung(rezept.laender.slice(0, 3).map((kuerzel, nummer) => (nummer === 0 ? ARTIKEL[kuerzel] ?? LAND[kuerzel] : ARTIKEL[kuerzel] ?? LAND[kuerzel])));
  const teile = [];
  if (rezept.zeitGesamt != null) teile.push(`Gesamtzeit ${dauer(rezept.zeitGesamt)}`);
  teile.push(`Aufwand: ${AUFWAND[rezept.aufwand]}`);
  if (portionen(rezept)) teile.push(`für ${portionen(rezept)}`);
  const enthaelt = EINTRAEGE.filter((eintrag) => eintrag.adresse && rezept.hinweise[eintrag.schluessel] === 'IST').map((eintrag) => eintrag.enthaelt);
  const form = ernaehrung(rezept, 'en:vegan') === 'voll' ? 'vegan' : ernaehrung(rezept, 'en:vegetarian') === 'voll' ? 'vegetarisch' : null;
  const saetze = [`${rezept.kurztitel}: ${KATEGORIE[rezept.kategorie][1]} aus ${laender}. ${teile.join(', ')}.`];
  if (enthaelt.length) saetze.push(`Laut Zutatenliste enthält das Rezept ${aufzaehlung(enthaelt)}.`);
  if (form) saetze.push(`Laut Zutatenliste ist es ${form}.`);
  return saetze.join(' ');
}

// ---- Themenseiten ----
const landAdresse = (kuerzel) => `/rezepte/land/${LAND[kuerzel].toLowerCase().replace('ö', 'oe').replace('ä', 'ae').replace('ü', 'ue')}/`;
const kategorieAdresse = (kategorie) => `/rezepte/kategorie/${kategorie.toLowerCase().replace('ue', 'ue')}/`;

function themenBauen() {
  const themen = [];
  for (const eintrag of ZUTATEN_EINTRAEGE.filter((einer) => OHNE_MIT_SEITE.includes(einer.schluessel))) {
    const probe = (rezept) => !(eintrag.schluessel in rezept.hinweise);
    const jeNach = (rezept) => ['JE_NACH_PRODUKT', 'MEIST_MIT'].includes(rezept.hinweise[eintrag.schluessel]);
    const genau = eintrag.ohne === eintrag.name ? eintrag.name : `${eintrag.ohne} (${eintrag.name})`;
    themen.push({
      art: 'ohne', schluessel: eintrag.schluessel, adresse: `/rezepte/ohne-${eintrag.adresse}/`, menue: eintrag.ohne,
      titel: `Rezepte ohne ${eintrag.ohne} laut Zutatenliste`,
      text: (zahlHier) => `${zahlHier} Rezepte ohne ${genau}: Bei keiner Zutat steht ein Hinweis darauf, auch nicht „meist mit“ oder „je nach Produkt“.`,
      jeNachText: `Bei diesen Rezepten kommt es auf das Produkt an, oder eine Zutat ist meist mit ${eintrag.mit}.`,
      probe, jeNach, inDerApp: GESAMT - (zahlenApp.mitHinweis[eintrag.schluessel] ?? 0),
    });
  }
  for (const [schluessel, wort, adresse] of [['en:vegetarian', 'Vegetarische', 'vegetarisch'], ['en:vegan', 'Vegane', 'vegan']]) {
    themen.push({
      art: 'passt', schluessel, adresse: `/rezepte/${adresse}/`, menue: eintragVon.get(schluessel).name,
      titel: `${wort} Rezepte laut Zutatenliste`,
      text: (zahlHier) => `${zahlHier} Rezepte, deren Zutatenliste keine ${eintragVon.get(schluessel).enthaelt} nennt.`,
      jeNachText: `Diese Rezepte sind ${adresse} möglich: Bei einzelnen Zutaten kommt es auf das Produkt an.`,
      probe: (rezept) => !(schluessel in rezept.hinweise),
      jeNach: (rezept) => rezept.hinweise[schluessel] === 'JE_NACH_PRODUKT',
      inDerApp: GESAMT - (zahlenApp.mitHinweis[schluessel] ?? 0),
    });
  }
  for (const kuerzel of Object.keys(LAND)) {
    themen.push({
      art: 'land', schluessel: kuerzel, adresse: landAdresse(kuerzel), menue: LAND[kuerzel],
      titel: `Rezepte ${ausLand(kuerzel)}`,
      text: (zahlHier) => `${zahlHier} Rezepte ${ausLand(kuerzel)}, mit Hinweisen zu den Zutaten.`,
      probe: (rezept) => rezept.laender.includes(kuerzel),
      inDerApp: zahlenApp.land[kuerzel] ?? 0,
    });
  }
  for (const kategorie of Object.keys(KATEGORIE)) {
    themen.push({
      art: 'kategorie', schluessel: kategorie, adresse: kategorieAdresse(kategorie), menue: KATEGORIE[kategorie][0],
      titel: `Rezepte der Kategorie ${KATEGORIE[kategorie][0]}`,
      text: (zahlHier) => `${zahlHier} Rezepte der Kategorie ${KATEGORIE[kategorie][0]}, mit Hinweisen zu den Zutaten.`,
      probe: (rezept) => rezept.kategorie === kategorie,
      inDerApp: zahlenApp.kategorie[kategorie] ?? 0,
    });
  }
  for (const thema of themen) {
    thema.rezepte = rezepte.filter(thema.probe);
    thema.jeNachRezepte = thema.jeNach ? rezepte.filter(thema.jeNach) : [];
  }
  return themen;
}
export const alleThemen = themenBauen();
// Eine Themenseite gibt es nur, wenn sie mindestens drei Rezepte der Website zeigt.
export const MINDESTENS = 3;
const mitSeite = alleThemen.filter((thema) => thema.rezepte.length >= MINDESTENS);
export const themen = muster ? mitSeite.filter((thema) => muster.themen.includes(thema.adresse)) : mitSeite;
export const rezeptSeiten = muster ? rezepte.filter((rezept) => muster.rezepte.includes(rezept.slug)) : rezepte;

const gebaut = new Set([...themen.map((thema) => thema.adresse), ...rezeptSeiten.map((rezept) => `/rezepte/${rezept.slug}/`)]);
// Adresse, wenn es die Seite gibt, sonst null (solange nur die Muster erzeugt werden).
export const ziel = (adresse) => (gebaut.has(adresse) ? adresse : null);
// Themen mit eigener Seite nach der Regel (auch wenn sie als Muster noch nicht erzeugt ist): Grundlage des Mega-Menüs.
export const themenMitSeite = mitSeite;
export const rezeptAdresse = (rezept) => `/rezepte/${rezept.slug}/`;
// Abschnitt eines Rezepts auf der Seite "Quellen und Lizenzen".
export const quelleAdresse = (rezept) => `${texte.quelle.seite.adresse}#${rezept.slug}`;
export const themaZu = (art, schluessel) => mitSeite.find((thema) => thema.art === art && thema.schluessel === schluessel);

// Verwandte Themen (zwei bis vier), fest je Eintrag; bei Ländern und Kategorien die mit den meisten Rezepten.
const NAH = {
  'en:nuts': ['en:peanuts', 'en:sesame-seeds', 'en:lupin'], 'en:peanuts': ['en:nuts', 'en:sesame-seeds', 'en:soybeans'],
  'en:gluten': ['en:milk', 'en:eggs'], 'en:milk': ['en:eggs', 'en:gluten', 'en:vegan'], 'en:eggs': ['en:milk', 'en:gluten', 'en:vegan'],
  'en:fish': ['en:crustaceans', 'en:molluscs', 'en:vegetarian'], 'en:crustaceans': ['en:fish', 'en:molluscs'],
  'en:molluscs': ['en:fish', 'en:crustaceans'], 'en:soybeans': ['en:lupin', 'en:peanuts'], 'en:celery': ['en:mustard', 'en:sulphur-dioxide-and-sulphites'],
  'en:mustard': ['en:celery', 'en:sesame-seeds'], 'en:sesame-seeds': ['en:nuts', 'en:peanuts', 'en:mustard'],
  'en:sulphur-dioxide-and-sulphites': ['en:alcohol', 'en:celery'], 'en:lupin': ['en:soybeans', 'en:peanuts'],
  'en:pork': ['en:e428', 'en:alcohol', 'en:vegetarian'], 'en:alcohol': ['en:pork', 'en:sulphur-dioxide-and-sulphites'],
  'en:e428': ['en:pork', 'en:vegetarian'], 'en:palm-oil': ['en:vegan', 'en:milk'],
  'en:vegetarian': ['en:vegan', 'en:pork', 'en:fish'], 'en:vegan': ['en:vegetarian', 'en:milk', 'en:eggs'],
};
export function verwandte(thema) {
  const nachSchluessel = (schluessel) => mitSeite.find((anderes) => anderes.schluessel === schluessel && ['ohne', 'passt'].includes(anderes.art));
  const liste = NAH[thema.schluessel]
    ? NAH[thema.schluessel].map(nachSchluessel)
    : mitSeite.filter((anderes) => anderes.art === thema.art && anderes !== thema).sort((a, b) => b.rezepte.length - a.rezepte.length).slice(0, 3);
  const erg = liste.filter(Boolean);
  for (const anderes of mitSeite) {
    if (erg.length >= 2) break;
    if (anderes !== thema && !erg.includes(anderes) && ['ohne', 'passt'].includes(anderes.art)) erg.push(anderes);
  }
  return erg.slice(0, 4);
}

// Ähnliche Rezepte (drei bis sechs): gleiche Kategorie oder gemeinsame Zutaten, dann gleiches Land.
export function aehnliche(rezept) {
  const eigene = new Set(rezept.zutaten.map((zutat) => zutat.grundbegriff));
  return rezepte
    .filter((anderes) => anderes !== rezept)
    .map((anderes) => ({
      anderes,
      wert: (anderes.kategorie === rezept.kategorie ? 3 : 0) + new Set(anderes.zutaten.map((z) => z.grundbegriff).filter((g) => eigene.has(g))).size +
        (anderes.laender.some((land) => rezept.laender.includes(land)) ? 2 : 0),
    }))
    .sort((a, b) => b.wert - a.wert || a.anderes.nr - b.anderes.nr)
    .slice(0, 4)
    .map(({ anderes }) => anderes);
}

// Angaben einer Karte für Suche und Filter der Übersicht: Kategorie, Länder, die Einträge ohne jeden Hinweis (nur die
// mit eigener Themenseite, dazu vegetarisch und vegan) und der Suchtext aus Titel und Zutaten.
// Reihenfolge in der Liste "Passt für": zuerst die am häufigsten gesuchten.
export const FILTER_PASST = [
  'en:vegetarian', 'en:vegan', 'en:nuts', 'en:gluten', 'en:milk', 'en:eggs',
  ...OHNE_MIT_SEITE.filter((schluessel) => !['en:nuts', 'en:gluten', 'en:milk', 'en:eggs'].includes(schluessel)),
];
// So viele Möglichkeiten zeigt eine lange Liste zuerst; der Rest folgt hinter "Weitere ... anzeigen".
export const FILTER_ZUERST = 6;
export function filterAngaben(rezept) {
  const worte = [rezept.titel, ...new Set(rezept.zutaten.map((zutat) => zutat.grundbegriff))];
  return {
    kategorie: rezept.kategorie,
    land: rezept.laender.join(' '),
    passt: FILTER_PASST.filter((schluessel) => !(schluessel in rezept.hinweise)).join(' '),
    text: worte.join(' ').toLocaleLowerCase('de'),
  };
}

// Titel einer Rezeptseite für die Suche (AP-17 Teil E5): Wo der Name des Rezepts von der gängigsten Suchschreibweise
// abweicht, steht diese im <title> in Klammern dabei. Auf der Seite selbst bleibt der Name, wie er im Rezeptpaket steht.
export const SUCHTITEL = {
  tsatsiki: 'Tsatsiki (Tzatziki)',
  gulyas: 'Gulyás (ungarische Gulaschsuppe)',
  kaiserschmarren: 'Kaiserschmarren (Kaiserschmarrn)',
  'alt-wiener-erdaepfelsalat': 'Alt-Wiener Erdäpfelsalat (Wiener Kartoffelsalat)',
  'mercimek-corbasi': 'Mercimek çorbası (rote Linsensuppe)',
  lahmacun: 'Lahmacun (türkische Pizza)',
  knoblauchgarnelen: 'Knoblauchgarnelen (Gambas al ajillo)',
  'insalata-caprese': 'Insalata caprese (Tomate-Mozzarella)',
  'tortilla-espanola': 'Tortilla española (spanische Tortilla)',
};
for (const slug of Object.keys(SUCHTITEL)) if (!nachSlug.has(slug)) throw new Error(`SUCHTITEL nennt ein Rezept, das es nicht gibt: ${slug}`);
export const suchtitel = (rezept) => SUCHTITEL[rezept.slug] ?? rezept.kurztitel;

// Kurzer Name eines Schritts für die strukturierten Daten: der Anfang bis zum ersten Satzzeichen, höchstens 60 Zeichen.
export function schrittName(text) {
  let name = text.split(/[.,;:!?]/)[0].trim();
  if (name.length > 60) name = name.slice(0, 60).replace(/\s+\S*$/, '');
  return name;
}
export const rang = RANG;
