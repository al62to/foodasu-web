// Angaben zur Website an einer Stelle. Schalter stehen hier, damit kein Text und kein Link an mehreren Stellen
// gepflegt wird.
import { appZahlen } from './app_zahlen.mjs';

export const seite = {
  name: 'FoodAsu',
  adresse: 'https://foodasu.com',
  sprache: 'de',
  logo: '/apple-touch-icon.png',
  // Gemeinsames Bild für Open Graph und die Twitter-Karte (gebaut mit tools/teilen_bild.mjs). Rezeptseiten zeigen
  // ihr eigenes Bild in denselben Maßen (tools/rezeptbilder_bauen.py).
  teilen: { pfad: '/bilder/foodasu-teilen.jpg', breite: 1200, hoehe: 630 },
  // Der Satz zur Beschreibung (Nachtrag zu AP-23 Teil A Nr. 1 in der Fassung der Änderung vom 11.10.2026; Entscheidung
  // Ali vom 11.10.2026: ohne regionale Herkunft, ohne Plattform, Scanner und Einkaufsliste zusammen; seit Nachtrag 2
  // der PL vom 14.10.2026 die Einkaufsliste zuerst), wörtlich. Er
  // steht sichtbar oben auf der Startseite und auf der Seite "Über FoodAsu" und ist die Beschreibung in Organization
  // und WebSite. Die Zahl der Rezepte steht als "über N" aus den Daten da (src/daten/app_zahlen.mjs).
  beschreibung: `FoodAsu verbindet Einkaufsliste und Lebensmittel-Scanner in einer App für den ganzen Haushalt. Beim Scannen zeigt die App für jede Person einzeln, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet. Dazu kommen über ${appZahlen.ueber} Rezepte. Ohne Konto, ohne Werbung.`,
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
