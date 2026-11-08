// Texte der Seite /lizenzen/ (seit der Freigabe unverändert bis auf Caveat, die Schrift der Handschrift im Video der
// Startseite; Auftrag der Projektleitung vom 14.10.2026, 13:45) und den Markenhinweis zum Abzeichen von Google Play
// (AP-34 Fortsetzung, 23.10.2026). Eigene Datei seit AP-22, damit sitemap.xml den Tag der
// letzten Änderung der Seite aus dem Git-Datum dieser Datei lesen kann (src/daten/stand.mjs).
export const lizenzen = {
  titel: 'Lizenzen',
  einleitung: 'Diese Website verwendet die folgenden Schriften, Daten, Bilder und Programme.',
  eintraege: [
    { name: 'Plus Jakarta Sans', art: 'Schrift', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
    { name: 'Pacifico', art: 'Schrift im Logo und in der Unterschrift', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
    { name: 'Caveat', art: 'Schrift der Handschrift im Video der Startseite', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
    { name: 'Astro', art: 'Programm, mit dem die Seiten gebaut werden', lizenz: 'MIT License', ziel: 'https://raw.githubusercontent.com/withastro/astro/main/LICENSE' },
    { name: 'GSAP', art: 'Programm für die Animationen', lizenz: 'Standard „no charge“ GSAP License', ziel: 'https://gsap.com/standard-license' },
    // Seite für geteilte Einkaufslisten /l/ (AP-112): beide Programme liegen auf foodasu.com selbst (fflate 0.8.3,
    // uqr 0.1.3, Fassung fest in package.json); fflate lädt die Seite nur in Browsern ohne DecompressionStream. Der Name
    // steht im Linktext, weil derselbe Linktext nie zu verschiedenen Zielen führt (tools/pruefe_seiten.mjs).
    { name: 'fflate', art: 'Programm zum Entpacken geteilter Einkaufslisten in älteren Browsern', lizenz: 'MIT License (fflate)', ziel: 'https://raw.githubusercontent.com/101arrowz/fflate/master/LICENSE' },
    { name: 'uqr', art: 'Programm für den QR-Code auf der Seite für geteilte Einkaufslisten', lizenz: 'MIT License (uqr)', ziel: 'https://raw.githubusercontent.com/unjs/uqr/main/LICENSE' },
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
    // Markenhinweis zum Abzeichen von Apple (AP-88 Teil B), nach der Vorgabe von Apple für Hinweise außerhalb der USA
    // („… are trademarks of Apple Inc.“, Übersetzung erlaubt, Marken bleiben englisch).
    { name: 'App Store', text: 'Apple, das Apple-Logo und App Store sind Marken von Apple Inc.' },
    { name: 'Google Play', text: 'Google Play und das Google Play-Logo sind Marken von Google LLC.' },
  ],
};
