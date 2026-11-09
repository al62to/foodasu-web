// Seite /p/: zeigt das Profil aus dem Link (Teil hinter dem #) mit Name, „Geteilt von …“ und den Einträgen unter
// „Meiden“ mit ihrer Stufe (AP-114; Vorgabe der Projektleitung vom 08.11.2026, Abschnitte 3, 4.4 und 8.1; Format 3.4).
// Gelesen wird nur mit dem Kern unter src/skripte/teilen/ (dieselben Regeln wie in der App, geprüft mit denselben
// Testfällen); hier steht nur die Oberfläche. Die Seite speichert nichts: kein lokaler Speicher, keine Cookies, kein
// Service Worker (Vorgabe 8.1 „Speichert nichts.“, Entwurf der Datenschutzerklärung 17 „Die Seite für Profile
// speichert nichts.“). Nichts geht an einen Server; Texte aus dem Link kommen nur als Text (textContent) auf die
// Seite, nie als HTML.
import { lesen } from './teilen/kodierung.mjs';
import { anfangsbuchstabe, profilZeilen } from './teilen/profil.mjs';
import { oeffnenAdresse } from './teilen/app_oeffnen.mjs';
import profil from '../daten/teilen_profil.json';
import { profilTexte as T } from '../daten/profil_seite.mjs';
import { listeTexte as L } from '../daten/liste_seite.mjs';

const fuelle = (vorlage, werte = {}) => vorlage.replace(/\{(\w+)\}/g, (_, name) => String(werte[name] ?? ''));

const wurzel = document.querySelector('[data-p-seite]');
const BASIS = wurzel.dataset.basis;
const $ = (auswahl) => document.querySelector(auswahl);
const kopf = {
  ueberzeile: $('.s-kopf .ueberzeile'),
  kreis: $('[data-p-kreis]'),
  titel: $('[data-p-titel]'),
  von: $('[data-p-von]'),
  satz: $('[data-p-satz]'),
};
const teil = {
  hinweis: $('[data-p-hinweis]'),
  hinweisText: $('[data-p-hinweis-text]'),
  liste: $('[data-p-liste]'),
  listeTitel: $('[data-p-liste-titel]'),
  eintraege: $('[data-p-eintraege]'),
  leer: $('[data-p-leer]'),
  neuer: $('[data-p-neuer]'),
  verpackung: $('[data-p-verpackung]'),
  appOeffnen: $('[data-p-app-oeffnen]'),
};
const element = (marke, klasse, text) => {
  const neu = document.createElement(marke);
  if (klasse) neu.className = klasse;
  if (text !== undefined) neu.textContent = text;
  return neu;
};

let zeigtProfil = false;

function alleAusblenden() {
  for (const bereich of [teil.hinweis, teil.liste, teil.leer, teil.neuer, teil.verpackung, teil.appOeffnen, kopf.kreis, kopf.von, kopf.satz]) bereich.hidden = true;
}

// Zustände ohne Profil: kein #, kaputt (auch eine Liste oder Häkchen auf /p/), neuere Version. Wortlaute wie auf /l/.
function zeigeHinweis(texte) {
  zeigtProfil = false;
  alleAusblenden();
  kopf.ueberzeile.textContent = T.ueberzeile;
  kopf.titel.textContent = texte.titel;
  teil.hinweisText.textContent = texte.text;
  teil.hinweis.hidden = false;
}

function zeigeProfil(umschlag) {
  zeigtProfil = true;
  alleAusblenden();
  const name = umschlag.n.trim();
  const von = umschlag.from.trim();
  kopf.ueberzeile.textContent = T.ueberzeile;
  kopf.titel.textContent = name ? fuelle(T.titel, { name }) : T.leerSeite.titel;
  const buchstabe = anfangsbuchstabe(name);
  kopf.kreis.textContent = buchstabe;
  kopf.kreis.hidden = !buchstabe;
  kopf.von.textContent = fuelle(T.von, { von });
  kopf.von.hidden = !von;
  kopf.satz.textContent = fuelle(T.satz, { name });
  kopf.satz.hidden = !name;
  teil.listeTitel.textContent = name ? fuelle(T.listeTitel, { name }) : T.listeTitelOhneName;
  const { zeilen, neuer } = profilZeilen(umschlag.m, profil);
  const inhalt = document.createDocumentFragment();
  for (const zeile of zeilen) {
    const eintrag = element('li', 'p-eintrag');
    eintrag.dataset.schluessel = zeile.schluessel;
    eintrag.dataset.stufe = zeile.stufe;
    eintrag.append(element('span', 'p-name', zeile.name), element('span', 'p-stufe', zeile.stufeName));
    inhalt.append(eintrag);
  }
  teil.eintraege.replaceChildren(inhalt);
  teil.eintraege.hidden = zeilen.length === 0;
  teil.leer.textContent = fuelle(T.leer, { name });
  teil.leer.hidden = zeilen.length > 0 || neuer > 0 || !name;
  teil.neuer.textContent = neuer === 1 ? T.neuerEiner : fuelle(T.neuerMehr, { anzahl: neuer });
  teil.neuer.hidden = neuer === 0;
  teil.liste.hidden = false;
  teil.verpackung.hidden = false;
  zeigeAppOeffnen();
}

// ---- „In FoodAsu öffnen“ (wie auf /l/; AP-114, Begründung in src/skripte/teilen/app_oeffnen.mjs) -----------------

// Dieselbe https-Adresse samt Teil hinter dem # (location.href); am iPhone öffnet sie die App über Universal Links,
// in Android-Browsern eine intent-Adresse mit der Seite als Rückfall. Nur mit Profil und nicht am Computer.
const computer = window.matchMedia('(min-width: 56rem) and (hover: hover) and (pointer: fine)');
function zeigeAppOeffnen() {
  teil.appOeffnen.href = oeffnenAdresse({ basis: BASIS, href: location.href, hash: location.hash, userAgent: navigator.userAgent });
  teil.appOeffnen.hidden = !zeigtProfil || computer.matches;
}
computer.addEventListener('change', zeigeAppOeffnen);

// ---- Öffnen eines Links (beim Laden und bei hashchange) ----------------------------------------------------------

async function oeffnen() {
  const kodierung = location.hash.replace(/^#/, '');
  if (!kodierung) return zeigeHinweis(T.leerSeite);
  const gelesen = await lesen(kodierung);
  if (gelesen.fehler) return zeigeHinweis(gelesen.fehler === 'neuere_version' ? L.neuereVersion : L.kaputt);
  // Eine Liste oder Häkchen auf /p/: wie ein kaputter Link (der Link gehört nicht hierher).
  if (gelesen.umschlag.k !== 'p') return zeigeHinweis(L.kaputt);
  return zeigeProfil(gelesen.umschlag);
}

// ---- Start ---------------------------------------------------------------------------------------------------

wurzel.querySelector('[data-p-ohne-skript]')?.remove();
window.addEventListener('hashchange', () => { oeffnen(); });
oeffnen().catch(() => zeigeHinweis(L.kaputt)).finally(() => { wurzel.dataset.bereit = '1'; });
