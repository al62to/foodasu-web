// Sperre gegen fremde Apps am Mac (AP-122c, Ali 10.11.2026): Prüfungen im Browser dürfen nie Mail, Nachrichten,
// FaceTime, WhatsApp, Telegram oder das Telefon öffnen. Adressen mit mailto:, sms:, tel:, whatsapp:, tg:, facetime: und
// Links auf wa.me oder t.me werden in der Seite abgefangen, bevor Chrome sie an macOS weitergibt (Navigation API,
// Klicks auf Links, window.open). Die Prüfung liest die abgefangenen Adressen über das Feld, das die Sperre zurückgibt.
//   const ziele = await fremdeAppsSperren(seite);   // vor dem ersten goto aufrufen
export const FREMDE_SCHEMATA = ['mailto:', 'sms:', 'smsto:', 'mms:', 'tel:', 'telprompt:', 'whatsapp:', 'tg:', 'facetime:', 'facetime-audio:', 'imessage:', 'intent:', 'message:'];
export const FREMDE_HOSTS = ['wa.me', 'www.wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'chat.whatsapp.com', 't.me', 'www.t.me', 'telegram.me', 'www.telegram.me'];

// Läuft in der Seite (vor ihren Skripten); deshalb ohne Bezug auf Werte außerhalb.
export function sperreInDerSeite(schemata, hosts) {
  const fremd = (adresse) => {
    let url;
    try { url = new URL(adresse, location.href); } catch { return false; }
    return schemata.includes(url.protocol) || hosts.includes(url.hostname);
  };
  const melden = (adresse) => {
    const ganz = new URL(adresse, location.href).href;
    (window.__fremdAbgefangen ??= []).push(ganz);
    try { window.__fremdMelden?.(ganz); } catch { /* ohne Rückkanal bleibt die Liste in der Seite */ }
  };
  if (typeof navigation !== 'undefined') {
    navigation.addEventListener('navigate', (e) => {
      if (fremd(e.destination.url)) { e.preventDefault(); melden(e.destination.url); }
    });
  }
  window.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href]');
    if (a && fremd(a.href)) { e.preventDefault(); melden(a.href); }
  }, true);
  const oeffnen = window.open;
  window.open = function (adresse, ...rest) {
    if (adresse && fremd(String(adresse))) { melden(String(adresse)); return null; }
    return oeffnen.call(this, adresse, ...rest);
  };
}

export async function fremdeAppsSperren(seite) {
  if (seite.__fremdZiele) return seite.__fremdZiele;
  const ziele = [];
  seite.__fremdZiele = ziele;
  await seite.exposeFunction('__fremdMelden', (adresse) => { if (!ziele.includes(adresse)) ziele.push(adresse); });
  await seite.evaluateOnNewDocument(sperreInDerSeite, FREMDE_SCHEMATA, FREMDE_HOSTS);
  return ziele;
}

// Für Selbsttests: dieselbe Prüfung wie in der Seite.
export const istFremd = (adresse) => {
  try { const url = new URL(adresse); return FREMDE_SCHEMATA.includes(url.protocol) || FREMDE_HOSTS.includes(url.hostname); } catch { return false; }
};
