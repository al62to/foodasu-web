import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { setzeSprachen } from './tools/sprache_setzen.mjs';
import { pruefeSogehtsLinks } from './tools/sogehts_links.mjs';

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

// "preserve" hält die bestehende Adresse /datenschutz.html (die App verlinkt sie) und gibt Ordnerseiten als
// /ordner/ aus.
export default defineConfig({
  site: 'https://foodasu.com',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  integrations: [sprache, sogehtsOhneAussen],
});
