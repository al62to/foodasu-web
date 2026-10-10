// Hauptnavigation und Mega-Menü unter "Rezepte" (Entwurf A der Projektleitung, AP-17 Teil E2). Länder und Kategorien
// heißen wie in der App (strings_rezept_teile.xml). Jeder Eintrag zeigt auf seine Themenseite
// (src/daten/rezeptseiten.mjs).
import { rezepte, themenMitSeite, ziel, LAND, rezeptAdresse } from './rezeptseiten.mjs';

const UEBERSICHT = '/rezepte/';

export const hauptpunkte = [
  { titel: 'Start', pfad: '/' },
  { titel: "So geht's", pfad: '/so-gehts/' },
  { titel: 'Rezepte', pfad: UEBERSICHT, mega: true },
  { titel: 'Fragen', pfad: '/fragen/' },
];

// Einträge ohne Themenseite (weniger als drei Rezepte auf der Website) stehen nicht im Menü.
const eintraege = (namen, vorsatz, art) =>
  namen.flatMap((name) => {
    const thema = themenMitSeite.find((eintrag) => eintrag.art === art && eintrag.menue === name);
    return thema ? [{ name, vorsatz, ziel: ziel(thema.adresse) ?? UEBERSICHT }] : [];
  });

// Zuerst Österreich, Deutschland und die Schweiz, dann die Nachbarn und der Rest, wie im Entwurf.
const laender = [
  'Österreich', 'Deutschland', 'Schweiz', 'Italien', 'Frankreich', 'Spanien', 'Griechenland', 'Türkei', 'Indien',
  'Ungarn', 'Tschechien', 'Liechtenstein', 'Syrien', 'Libanon', 'Jordanien', 'Palästina', 'Israel', 'Iran', 'Marokko',
  'Thailand', 'Vietnam', 'Japan', 'Südkorea', 'Mexiko', 'Peru',
];

const kategorien = [
  'Hauptgericht', 'Suppe', 'Vorspeise', 'Salat', 'Beilage', 'Sauce', 'Snack', 'Frühstück', 'Süßspeise', 'Gebäck',
  'Getränk',
];

// Nur Einträge mit eigener Themenseite (OHNE_MIT_SEITE in rezeptseiten.mjs).
const ohne = ['Nüsse', 'Erdnüsse', 'Gluten', 'Milch', 'Eier', 'Soja', 'Sesam', 'Fisch', 'Schweinefleisch', 'Alkohol', 'Gelatine'];

// Drei Rezepte mit Bild rechts im Menü, aus drei Ländern (Auswahl der Entwicklung nach dem Entwurf).
const PROBIEREN = ['wiener-schnitzel', 'pizza-margherita', 'bibimbap'];
const probieren = PROBIEREN.flatMap((slug) => {
  const rezept = rezepte.find((eintrag) => eintrag.slug === slug);
  const adresse = rezept && ziel(rezeptAdresse(rezept));
  return adresse ? [{ slug, titel: rezept.kurztitel, land: LAND[rezept.laender[0]], ziel: adresse }] : [];
});

export const mega = {
  titel: 'Rezepte finden',
  alle: { titel: `Alle ${rezepte.length} Rezepte`, ziel: UEBERSICHT },
  zurueck: 'Zurück',
  gruppen: [
    { kennung: 'land', titel: 'Nach Land', eintraege: eintraege(laender, 'Rezepte aus: ', 'land') },
    { kennung: 'kategorie', titel: 'Nach Kategorie', eintraege: eintraege(kategorien, 'Rezepte der Kategorie ', 'kategorie') },
    { kennung: 'ohne', titel: 'Ohne …', eintraege: eintraege(ohne, 'Rezepte ohne ', 'ohne') },
    { kennung: 'passt', titel: 'Vegetarisch und vegan', eintraege: eintraege(['Vegetarisch', 'Vegan'], 'Rezepte, passt für: ', 'passt') },
  ].filter((gruppe) => gruppe.eintraege.length > 0),
  probieren: { titel: 'Zum Ausprobieren', symbolbild: 'Symbolbild', rezepte: probieren },
};
