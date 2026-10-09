// Rezepte, die auf der Website mit vollem Inhalt stehen. Entscheidung Ali, 09.10.2026: höchstens 40, verteilt auf
// mehrere Länder; alle 306 Rezepte gibt es nur in der App. Die Liste ist vorläufig freigegeben (Ali, 09.10.2026);
// die Projektleitung prüft sie nach der Veröffentlichung.
// Gewählt sind bekannte Gerichte, breit über Länder, Kategorien und Einträge zum Meiden verteilt, mit vollständigen
// Nährwerten und einem Symbolbild ohne vermerkten Mangel.
export const HOECHSTENS = 40;

export const auswahl = [
  // Österreich
  'wiener-schnitzel', 'kaiserschmarren', 'apfelstrudel', 'sachertorte', 'alt-wiener-erdaepfelsalat',
  // Deutschland
  'koenigsberger-klopse', 'spaetzle', 'schwarzwaelder-kirschtorte', 'schwaebischer-kartoffelsalat',
  // Schweiz
  'roesti', 'zuercher-geschnetzeltes',
  // Italien
  'pizza-margherita', 'spaghetti-carbonara', 'lasagne-alla-bolognese', 'tiramisu', 'insalata-caprese',
  // Frankreich
  'ratatouille', 'quiche-lorraine', 'croissants',
  // Spanien
  'paella-valenciana', 'tortilla-espanola', 'gazpacho-andaluz', 'patatas-bravas', 'knoblauchgarnelen',
  // Griechenland
  'moussaka', 'tsatsiki', 'souvlaki',
  // Türkei
  'mercimek-corbasi', 'lahmacun', 'baklava', 'menemen',
  // Levante
  'hummus', 'shakshuka',
  // Indien
  'butter-chicken', 'dal-tadka', 'samosa',
  // Thailand, Südkorea
  'massaman-curry-mit-rindfleisch', 'bibimbap',
  // Mexiko, Ungarn
  'guacamole', 'gulyas',
];

// Nur zum Entwickeln: { rezepte: [...], themen: [...] } erzeugt nur diese Seiten; "null" erzeugt alle Seiten der
// Auswahl.
export const muster = null;
