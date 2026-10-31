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

// Store-Eintrag. Seit dem öffentlichen Start (23.10.2026, 17:51 Uhr; AP-34) ist "oeffentlich" an: Im Fuß steht das
// offizielle deutsche Abzeichen von Google Play (public/bilder/google-play-abzeichen-de.png, unverändert von Google),
// die Knöpfe der Startseite und der Rezeptseiten führen zum Eintrag, die Adresse steht in sameAs von Organization,
// als installUrl der MobileApplication und in llms.txt. Ein Angebot oder ein Preis steht nirgends (Wortregel).
export const store = {
  oeffentlich: true,
  adresse: 'https://play.google.com/store/apps/details?id=at.tonc.einkauf',
  // Entwicklerseite bei Google Play (AP-35A; live erreichbar am 23.10.2026, „Android Apps von Ali Tonc bei Google
  // Play“ mit FoodAsu). Nur als url der Person „Ali Tonc“ in den strukturierten Daten der Startseite.
  entwickler: 'https://play.google.com/store/apps/dev?id=6237494149245847779',
};

// Links zum Eintrag bei Google Play mit Kennung des Kanals (AP-44, 25.10.2026), nach dem Muster des "Google Play URL
// Builder": referrer=utm_source=website, utm_medium=link, utm_campaign=<ort>. Die Kennung enthält nichts über
// Besucher; die Website lädt dafür nichts nach und speichert nichts. Feste Orte (Kleinbuchstaben, ohne Umlaute):
// kopf, abschluss, kurzleiste (Startseite), rezept (Knopf auf den Rezeptseiten), fuss (Abzeichen in der Fußzeile).
// Seit AP-54 dazu code (Abzeichen auf der Seite für Codes /c/).
// Ohne Kennung bleiben store.adresse in strukturierten Daten (installUrl, sameAs), llms.txt, Sitemap und die
// Rechtstexte samt ihrer Fußzeile; `npm run pruefen` meldet jeden anderen Link zu Google Play ohne Kennung.
export const STORE_ORTE = ['kopf', 'abschluss', 'kurzleiste', 'rezept', 'fuss', 'code'];
export const storeLink = (ort) => {
  if (!STORE_ORTE.includes(ort)) throw new Error(`Unbekannter Ort für den Link zu Google Play: ${ort}`);
  return `${store.adresse}&referrer=utm_source%3Dwebsite%26utm_medium%3Dlink%26utm_campaign%3D${ort}`;
};

// Eigene Kurzlinks (AP-45, 25.10.2026): /fb/, /ig/ und /app/ leiten sofort (meta refresh, ohne Skript) auf den Eintrag bei
// Google Play mit Kennung weiter, weil Facebook den langen Link mit Kennung für den Button der Seite nicht annimmt. Die
// Seiten tragen noindex, stehen in keiner Navigation, nicht in der Sitemap und nicht in llms.txt, und robots.txt sperrt
// sie nicht. Kampagne ist immer "kurzlink"; die Quelle sagt, wo der Kurzlink steht.
export const KURZLINKS = [
  { pfad: '/fb/', quelle: 'facebook', medium: 'social', wofuer: 'Button der Facebook-Seite' },
  { pfad: '/ig/', quelle: 'instagram', medium: 'social', wofuer: 'Profil bei Instagram' },
  { pfad: '/app/', quelle: 'nachricht', medium: 'persoenlich', wofuer: 'WhatsApp und E-Mail' },
].map((kurzlink) => ({
  ...kurzlink,
  ziel: `${store.adresse}&referrer=utm_source%3D${kurzlink.quelle}%26utm_medium%3D${kurzlink.medium}%26utm_campaign%3Dkurzlink`,
}));

// Der Tag der letzten Änderung jeder Seite für sitemap.xml kommt seit AP-22 aus dem Git-Datum ihrer Quelldateien
// (src/daten/stand.mjs) und wird nicht mehr von Hand gepflegt. Welche Seiten im Index stehen, sagt src/daten/meta.mjs.
