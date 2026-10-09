import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { setzeSprachen } from './tools/sprache_setzen.mjs';

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

// "preserve" hält die bestehende Adresse /datenschutz.html (die App verlinkt sie) und gibt Ordnerseiten als
// /ordner/ aus.
export default defineConfig({
  site: 'https://foodasu.com',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  integrations: [sprache],
});
