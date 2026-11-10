// Sperre gegen fremde Apps am Mac (AP-122c, Ali 10.11.2026): Prüfungen im Browser dürfen nie Mail, Nachrichten,
// FaceTime, WhatsApp, Telegram oder das Telefon öffnen. Adressen mit mailto:, sms:, tel:, whatsapp:, tg:, facetime: und
// Links auf wa.me oder t.me werden in der Seite abgefangen, bevor Chrome sie an macOS weitergibt (Navigation API,
// Klicks auf Links, window.open). Die Prüfung liest die abgefangenen Adressen über das Feld, das die Sperre zurückgibt.
//   const ziele = await fremdeAppsSperren(seite);   // vor dem ersten goto aufrufen
// Seit AP-124 (10.11.2026) auch die Stores: market:, itms-apps:, itms-appss:, itms: und die Hosts apps.apple.com,
// itunes.apple.com und play.google.com, damit kein Test den App Store am Mac öffnet. Bei den Store-Hosts wird nur die
// Navigation abgefangen (Navigation API, window.open, Klick erst nach den Skripten der Seite), damit das Skript der
// Seite (src/skripte/store_knoepfe.mjs) den Klick noch selbst übernehmen kann; das Laden der geprüften Seite bleibt.
export const FREMDE_SCHEMATA = ['mailto:', 'sms:', 'smsto:', 'mms:', 'tel:', 'telprompt:', 'whatsapp:', 'tg:', 'facetime:', 'facetime-audio:', 'imessage:', 'intent:', 'message:', 'market:', 'itms-apps:', 'itms-appss:', 'itms:'];
export const FREMDE_HOSTS = ['wa.me', 'www.wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'chat.whatsapp.com', 't.me', 'www.t.me', 'telegram.me', 'www.telegram.me'];
export const STORE_HOSTS = ['apps.apple.com', 'itunes.apple.com', 'play.google.com'];

// Läuft in der Seite (vor ihren Skripten); deshalb ohne Bezug auf Werte außerhalb.
export function sperreInDerSeite(schemata, hosts, storeHosts = []) {
  const fremd = (adresse) => {
    let url;
    try { url = new URL(adresse, location.href); } catch { return false; }
    return schemata.includes(url.protocol) || hosts.includes(url.hostname);
  };
  const storeHost = (adresse) => {
    try { return storeHosts.includes(new URL(adresse, location.href).hostname); } catch { return false; }
  };
  const melden = (adresse) => {
    const ganz = new URL(adresse, location.href).href;
    (window.__fremdAbgefangen ??= []).push(ganz);
    try { window.__fremdMelden?.(ganz); } catch { /* ohne Rückkanal bleibt die Liste in der Seite */ }
  };
  if (typeof navigation !== 'undefined') {
    navigation.addEventListener('navigate', (e) => {
      if (fremd(e.destination.url) || storeHost(e.destination.url)) { e.preventDefault(); melden(e.destination.url); }
    });
  }
  window.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href]');
    if (a && fremd(a.href)) { e.preventDefault(); melden(a.href); }
  }, true);
  // Store-Hosts: erst nach den Zuhörern der Seite (Bubbling am window); hat die Seite den Klick übernommen, fängt die
  // Navigation API ihr Ziel ab.
  window.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href]');
    if (a && !e.defaultPrevented && storeHost(a.href)) { e.preventDefault(); melden(a.href); }
  });
  const oeffnen = window.open;
  window.open = function (adresse, ...rest) {
    if (adresse && (fremd(String(adresse)) || storeHost(String(adresse)))) { melden(String(adresse)); return null; }
    return oeffnen.call(this, adresse, ...rest);
  };
}

export async function fremdeAppsSperren(seite) {
  if (seite.__fremdZiele) return seite.__fremdZiele;
  const ziele = [];
  seite.__fremdZiele = ziele;
  await seite.exposeFunction('__fremdMelden', (adresse) => { if (!ziele.includes(adresse)) ziele.push(adresse); });
  await seite.evaluateOnNewDocument(sperreInDerSeite, FREMDE_SCHEMATA, FREMDE_HOSTS, STORE_HOSTS);
  return ziele;
}

// Für Selbsttests: dieselbe Prüfung wie in der Seite.
export const istFremd = (adresse) => {
  try { const url = new URL(adresse); return FREMDE_SCHEMATA.includes(url.protocol) || FREMDE_HOSTS.includes(url.hostname) || STORE_HOSTS.includes(url.hostname); } catch { return false; }
};
