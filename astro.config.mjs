import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { setzeSprachen } from './tools/sprache_setzen.mjs';
import { pruefeSogehtsLinks } from './tools/sogehts_links.mjs';
import { pruefePreisaussagen } from './tools/preisaussagen.mjs';

// Setzt nach dem Bau das lang-Attribut um fremdsprachige Wörter und Namen (src/daten/sprachen.mjs).
const sprache = {
  name: 'sprache',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const { seiten, stellen } = setzeSprachen(fileURLToPath(dir));
      logger.info(`lang-Attribut an ${stellen} Stellen auf ${seiten} Seiten gesetzt`);
    },
  },
};

// Sperre gegen Links nach außen in "So geht's": Der Bau endet mit Fehler, sobald eine Seite unter /so-gehts/ auf eine
// andere Domain als foodasu.com führt (tools/sogehts_links.mjs). Die Meldung nennt Seite und Link.
const sogehtsOhneAussen = {
  name: 'sogehts-ohne-aussen',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const seiten = pruefeSogehtsLinks(fileURLToPath(dir));
      logger.info(`So geht's: ${seiten} Seiten ohne Link nach außen`);
    },
  },
};

// Sperre gegen Preisaussagen (AP-29): Der Bau endet mit Fehler, sobald eine Datei des fertigen Baus eine Aussage zum
// Preis von FoodAsu enthält (tools/preisaussagen.mjs: Wörter, Wendungen, der Betrag null, strukturierte Angaben). Die
// Meldung nennt Datei, Fund und Umgebung. Läuft nach "sprache", also über die Seiten, wie sie veröffentlicht werden.
const ohnePreisaussage = {
  name: 'ohne-preisaussage',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const { dateien } = pruefePreisaussagen(fileURLToPath(dir));
      logger.info(`Preisaussagen: ${dateien} Dateien durchsucht, kein Fund`);
    },
  },
};

// "preserve" hält die bestehende Adresse /datenschutz.html (die App verlinkt sie) und gibt Ordnerseiten als
// /ordner/ aus.
export default defineConfig({
  site: 'https://foodasu.com',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  integrations: [sprache, sogehtsOhneAussen, ohnePreisaussage],
});
