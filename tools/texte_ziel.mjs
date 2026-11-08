// Ziel der Textdateien von `npm run texte` (AP-111): ohne Angabe der Ordner Material neben der Website
// (~/Projekte/FoodAsu/Material am Mac), relativ zum Repository, nie ein fester Pfad. Anderer Ordner über die Umgebung
// FOODASU_TEXTE_ORDNER (zum Beispiel ein Ordner unter Material/temp, solange die Texte nicht live sind).
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function textZiel(datei) {
  const ordner = resolve(process.env.FOODASU_TEXTE_ORDNER ?? join(wurzel, '../Material'));
  mkdirSync(ordner, { recursive: true });
  return join(ordner, datei);
}
