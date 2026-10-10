// Texte der Seite /lizenzen/ (unverändert seit der Freigabe). Eigene Datei seit AP-22, damit sitemap.xml den Tag der
// letzten Änderung der Seite aus dem Git-Datum dieser Datei lesen kann (src/daten/stand.mjs).
export const lizenzen = {
  titel: 'Lizenzen',
  einleitung: 'Diese Website verwendet die folgenden Schriften, Daten, Bilder und Programme.',
  eintraege: [
    { name: 'Plus Jakarta Sans', art: 'Schrift', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
    { name: 'Pacifico', art: 'Schrift im Logo', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
    { name: 'Astro', art: 'Programm, mit dem die Seiten gebaut werden', lizenz: 'MIT License', ziel: 'https://github.com/withastro/astro/blob/main/LICENSE' },
    { name: 'GSAP', art: 'Programm für die Animationen', lizenz: 'Standard „no charge“ GSAP License', ziel: 'https://gsap.com/standard-license' },
    {
      name: 'Bundeslebensmittelschlüssel (BLS) 4.0',
      art: 'Daten für die Nährwerte der Rezepte, herausgegeben vom Max Rubner-Institut (2025). Die Nährwerte sind eine eigene Berechnung aus den rohen Zutaten; das Max Rubner-Institut hat sie nicht geprüft.',
      lizenz: 'CC BY 4.0',
      ziel: 'https://creativecommons.org/licenses/by/4.0/deed.de',
      zusatz: { vor: ', DOI ', text: '10.25826/Data20251217-134202-0', ziel: 'https://doi.org/10.25826/Data20251217-134202-0' },
    },
  ],
  saetze: [
    { name: 'Rezepte', text: 'Die Rezepte stammen aus offenen Rezeptsammlungen. Quelle, Urheber, Lizenz und Änderungen stehen für jedes Rezept auf der Seite ', link: { text: 'Quellen und Lizenzen', ziel: '/quellen-und-lizenzen/' }, nach: '.' },
    { name: 'Bilder', text: 'Symbolbilder, mit Adobe Firefly erzeugt.' },
  ],
};
