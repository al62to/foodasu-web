// Wege zum Zurückschicken auf der Seite /l/ (AP-122, Auftrag der Projektleitung vom 10.11.2026, 06:25). Reines
// ES-Modul ohne DOM: läuft im Browser und in Node (tools/teilen/pruefung.mjs prüft es).
//
// Der Hauptknopf schickt auf dem Weg, auf dem die Liste kam (Feld kw im Umschlag l): wa WhatsApp, sms SMS (am iPhone
// auch iMessage), mail E-Mail, tg Telegram. Fehlt kw oder ist er unbekannt, gilt WhatsApp. Jede Adresse öffnet die
// App mit fertigem Text; senden muss man dort selbst. Alles andere läuft über „Andere App wählen“ (navigator.share).
// Nachricht und Link sind auf jedem Weg dieselben wie bisher.
//
// SMS: Am iPhone übernimmt die Nachrichten-App den Text nur mit „sms:&body=…“, Android liest „sms:?body=…“ (die
// Mischform „sms:?&body=…“ ist nirgends festgelegt). Erkannt wird das iPhone wie bei den Kurzlinks
// (src/layouts/Weiterleitung.astro): iPhone, iPad, iPod, oder Macintosh mit Touch (iPad mit Desktop-Kennung).
// E-Mail: Zeilenumbrüche im Text als CRLF (RFC 6068, Abschnitt 5).
// Telegram: https://t.me/share/url mit dem Link in url und der Nachricht ohne Link in text. Der Dienst t.me antwortet
// bei Adressen über etwa 4.100 Zeichen mit Fehler 400 (gemessen am 10.11.2026); ist die App nicht da, käme man dort an.
// Deshalb höchstens 4.000 Zeichen, sonst null: Die Seite weicht dann auf „Andere App wählen“ aus. Für die übrigen
// Wege gilt eine großzügige Grenze (WhatsApp nahm am 10.11.2026 auch 20.000 Zeichen an).
import { WEGE } from './umschlag.mjs';

export const STANDARD_WEG = 'wa';
export const wegAus = (kw) => (WEGE.includes(kw) ? kw : STANDARD_WEG);
export const GRENZE_ADRESSE = Object.freeze({ wa: 32000, sms: 32000, mail: 32000, tg: 4000 });

export const APPLE = /iPhone|iPad|iPod/;
export function istApple({ userAgent, maxTouchPoints } = {}) {
  const kennung = String(userAgent ?? '');
  return APPLE.test(kennung) || (/Macintosh/.test(kennung) && Number(maxTouchPoints) > 1);
}

const k = encodeURIComponent;

// Adresse für den Hauptknopf. weg: wa, sms, mail oder tg (sonst WhatsApp); nachricht: Text ohne Link (mit Notiz);
// link: https://foodasu.com/l/#…; betreff: nur für E-Mail; apple: Ergebnis von istApple. null, wenn die Adresse für
// diesen Weg zu lang ist.
export function wegAdresse({ weg, nachricht, link, betreff = '', apple = false }) {
  const art = wegAus(weg);
  const ganz = `${nachricht}\n${link}`;
  let adresse;
  if (art === 'sms') adresse = smsAdresse(ganz, apple);
  else if (art === 'mail') adresse = `mailto:?subject=${k(betreff)}&body=${k(ganz.replace(/\r?\n/g, '\r\n'))}`;
  else if (art === 'tg') adresse = `https://t.me/share/url?url=${k(link)}&text=${k(nachricht)}`;
  else adresse = `https://wa.me/?text=${k(ganz)}`;
  return adresse.length <= GRENZE_ADRESSE[art] ? adresse : null;
}

// SMS-Adresse für die bisherigen Wege („So schickst du den Link:“), ohne Grenze.
export const smsAdresse = (ganz, apple) => `sms:${apple ? '&' : '?'}body=${k(ganz)}`;
