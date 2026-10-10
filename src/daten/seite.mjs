// Angaben zur Website an einer Stelle. Schalter stehen hier, damit kein Text und kein Link an mehreren Stellen
// gepflegt wird.
export const seite = {
  name: 'FoodAsu',
  adresse: 'https://foodasu.com',
  sprache: 'de',
  logo: '/apple-touch-icon.png',
  // Gemeinsames Bild für Open Graph und die Twitter-Karte (gebaut mit tools/teilen_bild.mjs). Rezeptseiten zeigen
  // ihr eigenes Bild in denselben Maßen (tools/rezeptbilder_bauen.py).
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

// Der Tag der letzten Änderung jeder Seite für sitemap.xml kommt seit AP-22 aus dem Git-Datum ihrer Quelldateien
// (src/daten/stand.mjs) und wird nicht mehr von Hand gepflegt. Welche Seiten im Index stehen, sagt src/daten/meta.mjs.
