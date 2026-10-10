// sitemap.xml: genau die Seiten, die im Index stehen (src/daten/meta.mjs), je mit dem Tag der letzten inhaltlichen
// Änderung. Feste Seiten nennen ihren Tag in src/daten/seite.mjs, Rezept- und Themenseiten den Stand der Rezepte.
import { seite, seiten } from '../daten/seite.mjs';
import { STAND } from '../daten/rezeptseiten.mjs';
import { alleMeta } from '../daten/meta.mjs';

export function GET() {
  const stand = new Map(seiten.map((eintrag) => [eintrag.pfad, eintrag.stand]));
  const eintraege = alleMeta
    .filter((eintrag) => eintrag.index)
    .map((eintrag) => {
      const tag = stand.get(eintrag.pfad) ?? (eintrag.pfad.startsWith('/rezepte/') ? STAND : null);
      if (!tag) throw new Error(`sitemap.xml: Stand fehlt für ${eintrag.pfad} (src/daten/seite.mjs)`);
      return `  <url><loc>${seite.adresse}${eintrag.pfad}</loc><lastmod>${tag}</lastmod></url>`;
    })
    .join('\n');
  const inhalt = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
  return new Response(inhalt, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
