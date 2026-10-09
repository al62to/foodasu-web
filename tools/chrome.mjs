// Sucht das lokal installierte Chrome (oder Edge) für die Werkzeuge, die einen Browser steuern
// (tools/nachweise.mjs, tools/teilen_bild.mjs). Es wird kein Browser heruntergeladen.
import { existsSync } from 'node:fs';

const ORTE = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export function chromePfad() {
  const pfad = ORTE.find((ort) => ort && existsSync(ort));
  if (!pfad) throw new Error('Kein Chrome gefunden. Pfad in der Umgebungsvariable CHROME_PATH angeben.');
  return pfad;
}
