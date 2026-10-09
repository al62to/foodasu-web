// Angaben zur Website an einer Stelle. Schalter stehen hier, damit kein Text und kein Link an mehreren Stellen
// gepflegt wird.
export const seite = {
  name: 'FoodAsu',
  adresse: 'https://foodasu.com',
  sprache: 'de',
  logo: '/apple-touch-icon.png',
};

// Auftritte. Eine leere Adresse blendet Symbol und Eintrag in sameAs aus.
export const auftritte = {
  facebook: '',
  instagram: 'https://www.instagram.com/foodasu.app/',
};

// Store-Eintrag. Solange "oeffentlich" aus ist, steht im Fuß der Text "Bald im Play Store" ohne Link, und die
// strukturierten Daten nennen weder den Store noch ein Angebot. "betaOhneBetrag" steuert das Angebot mit Betrag 0;
// vor einer Ankündigung einer zweiten Stufe ausschalten.
export const store = {
  oeffentlich: false,
  adresse: 'https://play.google.com/store/apps/details?id=at.tonc.einkauf',
  betaOhneBetrag: true,
  kategorie: 'LifestyleApplication',
};

// Seitenverzeichnis: Grundlage für sitemap.xml (nur "index: true") und das Prüfskript. "stand" ist der Tag der
// letzten inhaltlichen Änderung der Seite und wird von Hand gepflegt.
export const seiten = [
  { pfad: '/', stand: '2026-10-09', index: true },
  { pfad: '/datenschutz.html', stand: '2026-10-06', index: true },
  { pfad: '/lizenzen/', stand: '2026-10-09', index: true },
  { pfad: '/so-gehts/', stand: '2026-10-09', index: false },
  { pfad: '/rezepte/', stand: '2026-10-09', index: false },
  { pfad: '/fragen/', stand: '2026-10-09', index: false },
];
