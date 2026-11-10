// Store-Knöpfe öffnen am Handy direkt die Store-App (AP-124, Auftrag der PL vom 10.11.2026). Gilt für jeden Link der
// Website auf den Eintrag von FoodAsu bei Google Play oder im App Store (Abzeichen im Kopf, in der Leiste am Handy, im
// Fuß, auf den Rezeptseiten, auf /c/ und /l/, Knopf der Kurzlinks wie /teilen/). Das href bleibt die https-Adresse
// (Suchmaschinen, ohne JavaScript, Computer); erst beim Antippen leitet dieses Skript auf Handys um. Grund: In den
// eingebauten Browsern von WhatsApp, SMS und anderen Apps öffnet die https-Adresse oft die Webseite des Stores statt
// der Store-App.
//   Android, Abzeichen von Google Play: intent://details?id=at.tonc.einkauf&referrer=<wie im href>#Intent;scheme=market;
//     package=com.android.vending;S.browser_fallback_url=<href, kodiert>;end. Ohne Play Store lädt der Browser den
//     Rückfall, also die heutige https-Adresse.
//   iPhone und iPad (auch iPad mit Desktop-Kennung, Erkennung wie bei den Kurzlinks), Abzeichen des App Store:
//     itms-apps://<Host und Pfad wie im href>; ist die Seite nach 1,5 Sekunden noch sichtbar (der App Store ging nicht
//     auf), öffnet es die https-Adresse.
//   Alles andere (Computer, Abzeichen des anderen Stores, fremde Links): unverändert.
// Keine Anfrage an Dritte, kein Speicher, kein Cookie, keine Messung. Der Teil ohne DOM läuft auch in Node
// (tools/store_knoepfe_pruefen.mjs).

export const PAKET = 'at.tonc.einkauf';
export const APPLE_KENNUNG = 'id6829687240';
export const WARTEN_MS = 1500;

const ANDROID = /Android/;
const APPLE = /iPhone|iPad|iPod/;

// "android", "apple" oder "computer". iPad mit Desktop-Kennung: "Macintosh" mit Touch (wie src/layouts/Weiterleitung.astro).
export function geraetAus({ userAgent, maxTouchPoints } = {}) {
  const ua = String(userAgent ?? '');
  if (APPLE.test(ua) || (/Macintosh/.test(ua) && Number(maxTouchPoints) > 1)) return 'apple';
  if (ANDROID.test(ua)) return 'android';
  return 'computer';
}

// Welcher Store-Eintrag von FoodAsu: "google", "apple" oder null (anderer Link).
export function storeAus(href) {
  let url;
  try { url = new URL(String(href)); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.get('id') === PAKET) return 'google';
  if (url.hostname === 'apps.apple.com' && new RegExp(`^/([a-z]{2}/)?app/([^/]+/)?${APPLE_KENNUNG}$`).test(url.pathname)) return 'apple';
  return null;
}

// Ziel beim Antippen: { art: "android" | "apple", ziel, rueckfall } oder null (Link bleibt, wie er ist).
export function storeZiel({ href, userAgent, maxTouchPoints } = {}) {
  const store = storeAus(href);
  if (!store) return null;
  const geraet = geraetAus({ userAgent, maxTouchPoints });
  const url = new URL(String(href));
  if (store === 'google' && geraet === 'android') {
    // Abfrage wörtlich aus dem href (id und referrer mit der Kodierung von heute), ohne Fragment.
    const ziel = `intent://details${url.search}#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=${encodeURIComponent(url.href)};end`;
    return { art: 'android', ziel, rueckfall: url.href };
  }
  if (store === 'apple' && geraet === 'apple') {
    return { art: 'apple', ziel: `itms-apps://${url.host}${url.pathname}${url.search}`, rueckfall: url.href };
  }
  return null;
}

// Im Browser: ein Zuhörer für die ganze Seite. Nur der einfache Klick (Finger oder linke Maustaste ohne Zusatztaste);
// hat schon ein anderes Skript den Klick übernommen, bleibt es dabei.
export function storeKnoepfeAnbinden(dok = document, fenster = window) {
  if (fenster.__storeKnoepfe) return;
  fenster.__storeKnoepfe = true;
  dok.addEventListener('click', (ereignis) => {
    if (ereignis.defaultPrevented || ereignis.button !== 0 || ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return;
    const link = ereignis.target?.closest?.('a[href]');
    if (!link || (link.target && link.target !== '_self')) return;
    const weg = storeZiel({ href: link.href, userAgent: fenster.navigator.userAgent, maxTouchPoints: fenster.navigator.maxTouchPoints });
    if (!weg) return;
    ereignis.preventDefault();
    if (weg.art === 'android') {
      fenster.location.href = weg.ziel;
      return;
    }
    // App Store: Geht die Seite in den Hintergrund oder weg, hat sich der App Store geöffnet; sonst nach 1,5 s https.
    let verlassen = false;
    const merken = () => { if (dok.visibilityState === 'hidden') verlassen = true; };
    const weggegangen = () => { verlassen = true; };
    dok.addEventListener('visibilitychange', merken);
    fenster.addEventListener('pagehide', weggegangen);
    fenster.setTimeout(() => {
      dok.removeEventListener('visibilitychange', merken);
      fenster.removeEventListener('pagehide', weggegangen);
      if (!verlassen && dok.visibilityState !== 'hidden') fenster.location.href = weg.rueckfall;
    }, WARTEN_MS);
    fenster.location.href = weg.ziel;
  });
}
