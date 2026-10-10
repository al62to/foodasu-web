// sitemap.xml: genau die Seiten, die im Index stehen (src/daten/meta.mjs), je mit dem Tag der letzten Änderung ihrer
// Quelldateien laut Git (src/daten/stand.mjs, AP-22). Seiten mit noindex stehen nicht in der Datei.
import { seite } from '../daten/seite.mjs';
import { standVon } from '../daten/stand.mjs';
import { alleMeta } from '../daten/meta.mjs';

export function GET() {
  const eintraege = alleMeta
    .filter((eintrag) => eintrag.index)
    .map((eintrag) => `  <url><loc>${seite.adresse}${eintrag.pfad}</loc><lastmod>${standVon(eintrag.pfad)}</lastmod></url>`)
    .join('\n');
  const inhalt = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
  return new Response(inhalt, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
