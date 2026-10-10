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
  // Der Satz zur Beschreibung (Projektleitung, 10.10.2026, AP-22 Teil 2 Nr. 1), wörtlich. Er steht sichtbar oben auf der
  // Startseite und auf der Seite "Über FoodAsu" und ist die Beschreibung in Organization und WebSite.
  beschreibung: 'FoodAsu ist eine App für Android aus Vorarlberg. Beim Scannen zeigt sie für jede Person im Haushalt einzeln, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet. Dazu kommen Einkaufslisten und über 300 Rezepte. Ohne Konto, ohne Werbung.',
};

// Auftritte. Eine leere Adresse blendet Symbol und Eintrag in sameAs aus.
export const auftritte = {
  facebook: 'https://www.facebook.com/p/FoodAsu-61594866553316/',
  instagram: 'https://www.instagram.com/foodasu.app/',
};

// Store-Eintrag. Solange "oeffentlich" aus ist, steht im Fuß der Text "Bald im Play Store" ohne Link, und die
// strukturierten Daten nennen den Store nicht. Mit "oeffentlich" kommt die Adresse in sameAs von Organization
// (Vormerkung aus AP-22). Ein Angebot oder MobileApplication steht in den strukturierten Daten nicht mehr.
export const store = {
  oeffentlich: false,
  adresse: 'https://play.google.com/store/apps/details?id=at.tonc.einkauf',
};

// Der Tag der letzten Änderung jeder Seite für sitemap.xml kommt seit AP-22 aus dem Git-Datum ihrer Quelldateien
// (src/daten/stand.mjs) und wird nicht mehr von Hand gepflegt. Welche Seiten im Index stehen, sagt src/daten/meta.mjs.
