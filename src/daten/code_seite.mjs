// Seite für Codes (AP-54, Auftrag der Projektleitung vom 31.10.2026, Wortlaut mit Alis Ja): /c/ zeigt den Code, den
// ein Tester als Link https://foodasu.com/c/#CODE bekommt. Der Teil nach # geht nie an den Server; das Skript der Seite
// (public/skripte/code.js) liest ihn nur im Browser und speichert nichts. noindex, nicht in der Sitemap, nicht im Menü.
import { VERFUEGBAR } from './startseite.mjs';

export const codeSeite = {
  adresse: '/c/',
  krume: 'Dein Code',
  titel: 'Dein Code für FoodAsu',
  dank: 'Danke für deine Hilfe beim Test von FoodAsu.',
  deinCode: 'Dein Code:',
  kopieren: 'Code kopieren',
  kopiert: 'Kopiert',
  ohneCode: 'In dieser Adresse steht kein Code. Den Link mit deinem Code findest du in meiner Nachricht.',
  soEinloesen: 'So löst du ihn ein:',
  schritte: [
    'Ist FoodAsu auf deinem Handy, öffnet dieser Link die App direkt. Tippe dort auf „Einlösen“.',
    'Sonst öffne in FoodAsu die Einstellungen, dann „Code einlösen“, füge den Code ein und tippe auf „Einlösen“.',
  ],
  // Für iPhones; ohne Erkennung stehen Abzeichen und Satz beide da.
  iphone: VERFUEGBAR,
  hinweis: 'Der Code bleibt in deinem Browser und wird nicht an foodasu.com übertragen.',
};
