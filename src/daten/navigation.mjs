// Hauptnavigation und Mega-Menü unter "Rezepte". Länder und Kategorien heißen wie in der App
// (strings_rezept_teile.xml). Bis die Themenseiten gebaut sind, zeigen alle Einträge des Mega-Menüs auf die
// Übersicht; die echten Ziele trägt "ziel" ein, sobald es sie gibt.
const UEBERSICHT = '/rezepte/';

export const hauptpunkte = [
  { titel: 'Start', pfad: '/' },
  { titel: "So geht's", pfad: '/so-gehts/' },
  { titel: 'Rezepte', pfad: UEBERSICHT, mega: true },
  { titel: 'Fragen', pfad: '/fragen/' },
];

const eintraege = (namen, vorsatz) =>
  namen.map((name) => ({ name, vorsatz, ziel: UEBERSICHT }));

const laender = [
  'Deutschland', 'Österreich', 'Italien', 'Frankreich', 'Schweiz', 'Spanien', 'Griechenland', 'Türkei', 'Syrien',
  'Indien', 'Libanon', 'Jordanien', 'Thailand', 'Mexiko', 'Palästina', 'Japan', 'Marokko', 'Südkorea', 'Israel',
  'Iran', 'Vietnam', 'Ungarn', 'Tschechien', 'Liechtenstein', 'Peru',
].sort((a, b) => a.localeCompare(b, 'de'));

const kategorien = [
  'Hauptgericht', 'Suppe', 'Vorspeise', 'Salat', 'Beilage', 'Sauce', 'Snack', 'Frühstück', 'Süßspeise', 'Gebäck',
  'Getränk',
];

const ohne = ['Nüsse', 'Gluten', 'Schweinefleisch', 'Alkohol', 'Palmöl', 'Sesam', 'Milch'];

export const mega = {
  alle: { titel: 'Alle Rezepte', ziel: UEBERSICHT },
  spalten: [
    { kennung: 'land', titel: 'Nach Land', breit: true, eintraege: eintraege(laender, 'Rezepte aus: ') },
    { kennung: 'kategorie', titel: 'Nach Kategorie', eintraege: eintraege(kategorien, 'Rezepte der Kategorie ') },
    {
      kennung: 'ohne',
      titel: 'Ohne ...',
      eintraege: [
        ...eintraege(ohne, 'Rezepte ohne '),
        { name: 'Vegetarisch', vorsatz: 'Rezepte: ', ziel: UEBERSICHT },
        { name: 'Vegan', vorsatz: 'Rezepte: ', ziel: UEBERSICHT },
      ],
    },
  ],
};
