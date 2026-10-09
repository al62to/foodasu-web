// sitemap.xml aus dem Seitenverzeichnis: nur Seiten für den Index, je mit dem Tag der letzten inhaltlichen Änderung.
import { seite, seiten } from '../daten/seite.mjs';

export function GET() {
  const eintraege = seiten
    .filter((eintrag) => eintrag.index)
    .map((eintrag) => `  <url><loc>${seite.adresse}${eintrag.pfad}</loc><lastmod>${eintrag.stand}</lastmod></url>`)
    .join('\n');
  const inhalt = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
  return new Response(inhalt, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
