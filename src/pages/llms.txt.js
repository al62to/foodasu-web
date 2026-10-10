// /llms.txt nach dem Format von llmstxt.org: Überschrift, ein Absatz zu FoodAsu, Abschnitte mit Links auf die
// wichtigsten Seiten (Nachtrag SEO, Punkt 6). Die Sätze stammen aus den freigegebenen Texten der Startseite und der
// Rezeptseiten; die Themen kommen aus den Daten. "So geht's" steht hier erst, wenn die Anleitung veröffentlicht ist.
import { seite, seiten } from '../daten/seite.mjs';
import { kopf, fuss, fragen, geruest } from '../daten/startseite.mjs';
import { rezepte, texte, themen } from '../daten/rezeptseiten.mjs';

const voll = (pfad) => seite.adresse + pfad;
const link = (titel, pfad, text) => `- [${titel}](${voll(pfad)})${text ? `: ${text}` : ''}`;
const imIndex = (pfad) => seiten.some((eintrag) => eintrag.pfad === pfad && eintrag.index);
const gruppe = (art) => themen.filter((thema) => thema.art === art).sort((a, b) => a.titel.localeCompare(b.titel, 'de'));

export function GET() {
  const zeilen = [
    `# ${seite.name}`,
    '',
    `> ${seite.name} ist eine App für Android. ${kopf.text} ${fuss.hinweis}`,
    '',
    kopf.stand,
    '',
    '## Website',
    link('Startseite', '/', 'was die App macht, in drei Schritten'),
    link(geruest.fragenSeite.titel, '/fragen/', fragen.liste.map((eintrag) => eintrag.frage).join(' ')),
    ...(imIndex('/so-gehts/') ? [link("So geht's", '/so-gehts/', 'Anleitung zur App')] : []),
    '',
    '## Rezepte',
    link(texte.alle.seitentitel, '/rezepte/', texte.alle.text(rezepte.length)),
    ...gruppe('ohne').map((thema) => link(thema.titel, thema.adresse)),
    ...gruppe('passt').map((thema) => link(thema.titel, thema.adresse)),
    ...gruppe('kategorie').map((thema) => link(thema.titel, thema.adresse)),
    ...gruppe('land').map((thema) => link(thema.titel, thema.adresse)),
    '',
    '## Rechtliches',
    link('Datenschutzerklärung', '/datenschutz.html'),
    link(fuss.links.offenlegung, '/offenlegung/', 'Offenlegung nach § 25 Mediengesetz'),
    link(geruest.lizenzen.titel, '/lizenzen/', geruest.lizenzen.beschreibung),
    link(texte.quelle.seite.titel, texte.quelle.seite.adresse, texte.quelle.seite.beschreibung),
    '',
  ];
  return new Response(zeilen.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
