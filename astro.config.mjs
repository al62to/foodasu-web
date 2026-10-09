import { defineConfig } from 'astro/config';

// "preserve" hält die bestehende Adresse /datenschutz.html (die App verlinkt sie) und gibt Ordnerseiten als
// /ordner/ aus.
export default defineConfig({
  site: 'https://foodasu.com',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
});
