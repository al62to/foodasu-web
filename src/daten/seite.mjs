// Angaben zur Website an einer Stelle. Schalter stehen hier, damit kein Text und kein Link an mehreren Stellen
// gepflegt wird.
export const seite = {
  name: 'FoodAsu',
  adresse: 'https://foodasu.com',
  sprache: 'de',
  logo: '/apple-touch-icon.png',
  // Bild für Open Graph und die Twitter-Karte (gebaut mit tools/teilen_bild.mjs).
  teilen: { pfad: '/bilder/foodasu-teilen.jpg', breite: 1200, hoehe: 630 },
};

// Auftritte. Eine leere Adresse blendet Symbol und Eintrag in sameAs aus.
export const auftritte = {
  facebook: 'https://www.facebook.com/p/FoodAsu-61594866553316/',
  instagram: 'https://www.instagram.com/foodasu.app/',
};

// Store-Eintrag. Solange "oeffentlich" aus ist, steht im Fuß der Text "Bald im Play Store" ohne Link, und die
// strukturierten Daten nennen weder den Store noch ein Angebot. "betaOhneBetrag" steuert das Angebot mit Betrag 0;
// vor einer Ankündigung einer zweiten Stufe ausschalten.
export const store = {
  oeffentlich: false,
  adresse: 'https://play.google.com/store/apps/details?id=at.tonc.einkauf',
  betaOhneBetrag: true,
  kategorie: 'ShoppingApplication',
};

// Seitenverzeichnis: Grundlage für sitemap.xml (nur "index: true") und das Prüfskript. "stand" ist der Tag der
// letzten inhaltlichen Änderung der Seite und wird von Hand gepflegt.
export const seiten = [
  { pfad: '/', stand: '2026-10-10', index: true },
  { pfad: '/datenschutz.html', stand: '2026-10-10', index: true },
  { pfad: '/lizenzen/', stand: '2026-10-10', index: true },
  { pfad: '/quellen-und-lizenzen/', stand: '2026-10-10', index: false },
  { pfad: '/so-gehts/', stand: '2026-10-10', index: false },
  { pfad: '/rezepte/', stand: '2026-10-10', index: true },
  { pfad: '/fragen/', stand: '2026-10-10', index: true },
];
