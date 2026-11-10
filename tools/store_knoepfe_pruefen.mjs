// Prüfung in Node für src/skripte/store_knoepfe.mjs (AP-124): Ziel beim Antippen je Gerät und Store, Rückfall,
// Referrer unverändert, alles andere bleibt. Dazu der Zuhörer mit nachgebautem document und window (öffnet nichts).
//   node tools/store_knoepfe_pruefen.mjs        Rückgabewert 0 = bestanden
import { geraetAus, storeAus, storeZiel, storeKnoepfeAnbinden, WARTEN_MS } from '../src/skripte/store_knoepfe.mjs';
import { storeLink, STORE_ORTE, appleLink, store, appStore } from '../src/daten/seite.mjs';
import { KURZLINKS } from '../src/daten/kurzlinks.mjs';
import { intentLesen } from '../src/skripte/teilen/app_oeffnen.mjs';
import { KENNUNGEN } from './store_knoepfe_kennungen.mjs';

let zahl = 0;
const befunde = [];
const pruefe = (bedingung, text) => { zahl += 1; if (!bedingung) befunde.push(text); };

const ERWARTET_GERAET = { 'Android Chrome': 'android', 'Android eingebaut (WebView)': 'android', 'iPhone Safari': 'apple', 'iPhone eingebaut': 'apple', 'iPad Desktop-Kennung': 'apple', Computer: 'computer' };

// 1. Geräte
for (const [name, kennung] of Object.entries(KENNUNGEN)) pruefe(geraetAus(kennung) === ERWARTET_GERAET[name], `Gerät ${name}: ${geraetAus(kennung)}`);
pruefe(geraetAus({ userAgent: KENNUNGEN.Computer.userAgent.replace('Chrome', 'Safari'), maxTouchPoints: 1 }) === 'computer', 'Mac mit einem Berührungspunkt ist Computer');
pruefe(geraetAus({}) === 'computer', 'ohne Kennung: Computer');

// 2. Welche Links zählen
const google = [store.adresse, ...STORE_ORTE.map(storeLink), ...KURZLINKS.map((k) => k.ziel)];
const apple = [appStore.adresse, ...STORE_ORTE.map(appleLink), 'https://apps.apple.com/app/id6829687240', 'https://apps.apple.com/de/app/foodasu/id6829687240'];
for (const href of google) pruefe(storeAus(href) === 'google', `Google Play erkannt: ${href}`);
for (const href of apple) pruefe(storeAus(href) === 'apple', `App Store erkannt: ${href}`);
const fremd = [
  'https://play.google.com/store/apps/details?id=at.tonc.einkauf.alltag',
  'https://play.google.com/store/apps/details?id=com.beispiel',
  'https://play.google.com/store/apps/dev?id=6237494149245847779',
  'http://play.google.com/store/apps/details?id=at.tonc.einkauf',
  'https://apps.apple.com/at/app/id1234567890',
  'https://apps.apple.com/at/app/id68292872400',
  'https://foodasu.com/', '/rezepte/', 'mailto:kontakt@foodasu.com', 'nicht einmal eine Adresse',
];
for (const href of fremd) pruefe(storeAus(href) === null, `nicht als Store erkannt: ${href}`);

// 3. Ziele je Gerät und Link
for (const [name, kennung] of Object.entries(KENNUNGEN)) {
  const geraet = ERWARTET_GERAET[name];
  for (const href of google) {
    const weg = storeZiel({ href, ...kennung });
    if (geraet !== 'android') { pruefe(weg === null, `${name}, Google Play bleibt https: ${href}`); continue; }
    const gelesen = weg && intentLesen(weg.ziel);
    const erwartet = `market://details${new URL(href).search}`;
    pruefe(weg?.art === 'android', `${name}: Art android`);
    pruefe(gelesen?.daten === erwartet, `${name}: Daten-Adresse ${gelesen?.daten} statt ${erwartet}`);
    pruefe(weg?.ziel.includes(';package=com.android.vending;'), `${name}: Paket des Play Store`);
    pruefe(gelesen?.rueckfall === href && weg?.rueckfall === href, `${name}: Rückfall ${gelesen?.rueckfall}`);
    // Referrer wörtlich wie im href (dieselbe Kodierung), id unverändert.
    const vorher = new URL(href).searchParams; const nachher = new URL(erwartet.replace('market://', 'https://x/')).searchParams;
    pruefe(vorher.get('referrer') === nachher.get('referrer') && nachher.get('id') === 'at.tonc.einkauf', `${name}: Referrer/id ${nachher.get('referrer')}`);
    pruefe(weg?.ziel.indexOf('#') === weg?.ziel.lastIndexOf('#'), `${name}: genau ein # in der intent-Adresse`);
  }
  for (const href of apple) {
    const weg = storeZiel({ href, ...kennung });
    if (geraet !== 'apple') { pruefe(weg === null, `${name}, App Store bleibt https: ${href}`); continue; }
    const url = new URL(href);
    pruefe(weg?.art === 'apple' && weg.ziel === `itms-apps://${url.host}${url.pathname}${url.search}` && weg.rueckfall === href, `${name}: App Store ${weg?.ziel} / ${weg?.rueckfall}`);
  }
}
pruefe(storeZiel({ href: appStore.adresse, ...KENNUNGEN['iPhone Safari'] })?.ziel === 'itms-apps://apps.apple.com/at/app/id6829687240', 'iPhone: Ziel wörtlich wie im Auftrag');
pruefe(storeZiel({ href: storeLink('liste'), ...KENNUNGEN['Android Chrome'] })?.ziel ===
  'intent://details?id=at.tonc.einkauf&referrer=utm_source%3Dwebsite%26utm_medium%3Dlink%26utm_campaign%3Dliste#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dat.tonc.einkauf%26referrer%3Dutm_source%253Dwebsite%2526utm_medium%253Dlink%2526utm_campaign%253Dliste;end',
  'Android: Ziel für /l/ wörtlich');
for (const href of fremd) for (const kennung of Object.values(KENNUNGEN)) pruefe(storeZiel({ href, ...kennung }) === null, `fremder Link bleibt: ${href}`);

// 4. Zuhörer mit nachgebautem document/window
function nachbau(kennung, { sichtbarBleiben = true } = {}) {
  const zuhoerer = {}; const fensterZuhoerer = {}; const zeitgeber = [];
  const besucht = [];
  const dok = {
    visibilityState: 'visible',
    addEventListener: (art, f) => { (zuhoerer[art] ??= []).push(f); },
    removeEventListener: (art, f) => { zuhoerer[art] = (zuhoerer[art] ?? []).filter((g) => g !== f); },
  };
  const fenster = {
    navigator: kennung,
    location: { set href(adresse) { besucht.push(adresse); if (!sichtbarBleiben && adresse.startsWith('itms-apps:')) { dok.visibilityState = 'hidden'; (zuhoerer.visibilitychange ?? []).forEach((f) => f()); } } },
    addEventListener: (art, f) => { (fensterZuhoerer[art] ??= []).push(f); },
    removeEventListener: (art, f) => { fensterZuhoerer[art] = (fensterZuhoerer[art] ?? []).filter((g) => g !== f); },
    setTimeout: (f, ms) => { zeitgeber.push({ f, ms }); },
  };
  storeKnoepfeAnbinden(dok, fenster);
  const klick = (href, extra = {}) => {
    const e = { defaultPrevented: false, button: 0, target: { closest: () => ({ href, target: '' }) }, preventDefault() { this.defaultPrevented = true; }, ...extra };
    (zuhoerer.click ?? []).forEach((f) => f(e));
    return e;
  };
  return { klick, besucht, zeitgeber, dok, fenster, zuhoerer, fensterZuhoerer };
}
{
  const n = nachbau(KENNUNGEN['Android Chrome']);
  const e = n.klick(storeLink('kopf'));
  pruefe(e.defaultPrevented && n.besucht.length === 1 && n.besucht[0].startsWith('intent://details?'), 'Zuhörer Android: intent statt https');
  const e2 = n.klick(appleLink('kopf'));
  pruefe(!e2.defaultPrevented && n.besucht.length === 1, 'Zuhörer Android: App-Store-Abzeichen bleibt https');
  const e3 = n.klick(storeLink('kopf'), { metaKey: true });
  const e4 = n.klick(storeLink('kopf'), { button: 1 });
  const e5 = n.klick(storeLink('kopf'), { defaultPrevented: true });
  pruefe(!e3.defaultPrevented && !e4.defaultPrevented && n.besucht.length === 1 && e5.defaultPrevented, 'Zuhörer: Zusatztaste, mittlere Taste, schon übernommen bleiben unberührt');
  storeKnoepfeAnbinden(n.dok, n.fenster);
  pruefe(n.zuhoerer.click.length === 1, 'Zuhörer nur einmal angebunden');
}
{
  const n = nachbau(KENNUNGEN['iPhone eingebaut']);
  const e = n.klick(appleLink('liste'));
  pruefe(e.defaultPrevented && n.besucht[0] === 'itms-apps://apps.apple.com/at/app/id6829687240', 'Zuhörer iPhone: itms-apps');
  pruefe(n.zeitgeber.length === 1 && n.zeitgeber[0].ms === WARTEN_MS && WARTEN_MS === 1500, 'Zuhörer iPhone: Rückfall nach 1,5 s');
  n.zeitgeber[0].f();
  pruefe(n.besucht[1] === appStore.adresse && n.besucht.length === 2, 'Zuhörer iPhone: Seite sichtbar, Rückfall https');
  pruefe((n.zuhoerer.visibilitychange ?? []).length === 0 && (n.fensterZuhoerer.pagehide ?? []).length === 0, 'Zuhörer iPhone: Hilfs-Zuhörer wieder entfernt');
  const e2 = n.klick(storeLink('liste'));
  pruefe(!e2.defaultPrevented && n.besucht.length === 2, 'Zuhörer iPhone: Google-Play-Abzeichen bleibt https');
}
{
  const n = nachbau(KENNUNGEN['iPhone Safari'], { sichtbarBleiben: false });
  n.klick(appleLink('fuss'));
  n.zeitgeber[0].f();
  pruefe(n.besucht.length === 1, 'Zuhörer iPhone: App Store ging auf, kein Rückfall');
}
{
  const n = nachbau(KENNUNGEN['iPad Desktop-Kennung']);
  n.klick(appleLink('rezept'));
  n.fensterZuhoerer.pagehide.forEach((f) => f());
  n.zeitgeber[0].f();
  pruefe(n.besucht.length === 1 && n.besucht[0].startsWith('itms-apps://'), 'Zuhörer iPad: Seite verlassen, kein Rückfall');
}
{
  const n = nachbau(KENNUNGEN.Computer);
  const a = n.klick(storeLink('fuss')); const b = n.klick(appleLink('fuss'));
  pruefe(!a.defaultPrevented && !b.defaultPrevented && n.besucht.length === 0 && n.zeitgeber.length === 0, 'Zuhörer Computer: alles unverändert');
}

console.log(`Store-Knöpfe: ${zahl} Prüfungen, ${befunde.length} Befunde`);
for (const b of befunde) console.log(`  BEFUND ${b}`);
console.log(befunde.length ? 'Ergebnis: NICHT bestanden' : 'Ergebnis: bestanden');
process.exit(befunde.length ? 1 : 0);
