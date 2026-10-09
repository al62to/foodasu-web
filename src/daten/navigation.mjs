// Hauptnavigation und Mega-Menü unter "Rezepte". Länder und Kategorien heißen wie in der App
// (strings_rezept_teile.xml). Jeder Eintrag zeigt auf seine Themenseite (src/daten/rezeptseiten.mjs).
import { themenMitSeite, ziel } from './rezeptseiten.mjs';

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

const laender = [
  'Deutschland', 'Österreich', 'Italien', 'Frankreich', 'Schweiz', 'Spanien', 'Griechenland', 'Türkei', 'Syrien',
  'Indien', 'Libanon', 'Jordanien', 'Thailand', 'Mexiko', 'Palästina', 'Japan', 'Marokko', 'Südkorea', 'Israel',
  'Iran', 'Vietnam', 'Ungarn', 'Tschechien', 'Liechtenstein', 'Peru',
].sort((a, b) => a.localeCompare(b, 'de'));

const kategorien = [
  'Hauptgericht', 'Suppe', 'Vorspeise', 'Salat', 'Beilage', 'Sauce', 'Snack', 'Frühstück', 'Süßspeise', 'Gebäck',
  'Getränk',
];

// Nur Einträge mit eigener Themenseite (OHNE_MIT_SEITE in rezeptseiten.mjs).
const ohne = ['Nüsse', 'Erdnüsse', 'Gluten', 'Milch', 'Eier', 'Soja', 'Sesam', 'Fisch', 'Schweinefleisch', 'Alkohol', 'Gelatine'];

export const mega = {
  alle: { titel: 'Alle Rezepte', ziel: UEBERSICHT },
  spalten: [
    { breit: true, gruppen: [{ kennung: 'land', titel: 'Nach Land', eintraege: eintraege(laender, 'Rezepte aus: ', 'land') }] },
    { gruppen: [{ kennung: 'kategorie', titel: 'Nach Kategorie', eintraege: eintraege(kategorien, 'Rezepte der Kategorie ', 'kategorie') }] },
    {
      breit: true,
      gruppen: [
        { kennung: 'ohne', titel: 'Ohne ...', eintraege: eintraege(ohne, 'Rezepte ohne ', 'ohne') },
        { kennung: 'passt', titel: 'Passt für', eintraege: eintraege(['Vegetarisch', 'Vegan'], 'Rezepte, passt für: ', 'passt') },
      ],
    },
  ],
};
