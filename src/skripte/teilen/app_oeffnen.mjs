// „In FoodAsu öffnen“ auf den Seiten /l/ und /p/ (AP-114, AP-113 Offen 4; Vorgabe der PL vom 08.11.2026, 6.4). Reines
// ES-Modul ohne DOM: läuft im Browser und in Node (tools/teilen/pruefung.mjs prüft es). Keine Anfrage an Dritte; der
// Teil hinter dem # geht dabei an keinen Server, nur an die App auf demselben Handy.
//
// Android: Chrome öffnet eine App nicht über einen normalen Link auf dieselbe Website (App Links greifen nur, wenn der
// Link von außerhalb kommt). Deshalb nimmt der Knopf in Android-Browsern eine intent-Adresse:
//   intent://foodasu.com/l/#<Kodierung>#Intent;scheme=https;package=at.tonc.einkauf;S.browser_fallback_url=<…>;end
// Android liest sie mit Intent.parseUri: Der Teil vor dem LETZTEN # ist die Daten-Adresse, „intent:“ wird dabei durch
// das Schema aus „scheme=https“ ersetzt. Die Daten-Adresse darf deshalb ihr eigenes Fragment tragen
// (intent://foodasu.com/l/#<Kodierung> wird https://foodasu.com/l/#<Kodierung>), solange nach „#Intent;“ kein
// weiteres # steht: Die Rückfall-Adresse ist mit encodeURIComponent kodiert (# als %23), die Kodierung besteht nur aus
// base64url-Zeichen. So bekommt die App die ganze https-Adresse samt Fragment, genau wie bei einem App Link. Ist die
// App nicht da (oder zu alt für /l/ bzw. /p/), lädt Chrome browser_fallback_url, also die Seite selbst.
// Sonst (Laptop, iPhone, andere): die https-Adresse der Seite (location.href) wie bisher; am iPhone öffnet sie die App
// über Universal Links, wo die App installiert ist.
//
// Der Host kommt aus der Grundadresse der Seite (data-basis, https://foodasu.com/l/ bzw. /p/), nie aus location: So
// öffnet die App auch von www.foodasu.com oder einer Vorschau aus die Adresse von foodasu.com.

export const ANDROID = /Android/;
const KODIERUNG = /^[A-Za-z0-9_-]+$/;

// Teil hinter dem # (ohne #), wenn er nur aus base64url-Zeichen besteht; sonst leer.
export function kodierungAus(hash) {
  const teil = String(hash ?? '').replace(/^#/, '');
  return KODIERUNG.test(teil) ? teil : '';
}

// Adresse für „In FoodAsu öffnen“. basis: Grundadresse der Seite (https://foodasu.com/l/), href: location.href,
// hash: location.hash, userAgent: navigator.userAgent.
export function oeffnenAdresse({ basis, href, hash, userAgent }) {
  if (!ANDROID.test(String(userAgent ?? ''))) return href;
  const ziel = new URL(basis);
  const kodierung = kodierungAus(hash);
  const daten = `${ziel.host}${ziel.pathname}${kodierung ? `#${kodierung}` : ''}`;
  return `intent://${daten}#Intent;scheme=https;package=at.tonc.einkauf;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}

// Wie Android eine intent-Adresse liest (Intent.parseUri, nur die Teile, die hier vorkommen): für die Prüfung in Node.
// Ergebnis { daten, paket, rueckfall } oder null.
export function intentLesen(adresse) {
  if (!adresse.startsWith('intent:')) return null;
  const stelle = adresse.lastIndexOf('#');
  if (stelle < 0 || !adresse.startsWith('#Intent;', stelle) || !adresse.endsWith(';end')) return null;
  const teile = Object.fromEntries(adresse.slice(stelle + '#Intent;'.length, -';end'.length).split(';').map((teil) => {
    const gleich = teil.indexOf('=');
    return [teil.slice(0, gleich), teil.slice(gleich + 1)];
  }));
  const schema = teile.scheme;
  const daten = adresse.slice('intent:'.length, stelle);
  return { daten: schema ? `${schema}:${daten}` : daten, paket: teile.package, rueckfall: decodeURIComponent(teile['S.browser_fallback_url'] ?? '') };
}
