// Seite /l/: zeigt die Einkaufsliste aus dem Link (Teil hinter dem #), hakt ab und schickt die Häkchen als neuen Link
// zurück (AP-112; Vorgabe der Projektleitung vom 08.11.2026, Abschnitte 3 und 7; Konzept 5.3). Gelesen, zusammengeführt
// und gebaut wird nur mit dem Kern unter src/skripte/teilen/ (dieselben Regeln wie in der App, geprüft mit denselben
// Testfällen); hier steht nur die Oberfläche. Der Zustand einer Liste im Browser ist der Stand aus Format Abschnitt 4
// plus eigene Angaben (Name, authorId für diese Liste, Zeitpunkt des Öffnens, "neu", Bildschirm anlassen), im lokalen
// Speicher unter foodasu-liste-<listId>. Nichts davon geht an einen Server; Texte aus dem Link kommen nur als Text
// (textContent) auf die Seite, nie als HTML.
import { lesen, schreiben } from './teilen/kodierung.mjs';
import { GRENZEN, KENNUNG_BYTE, STATUS, hat, istKennung, istObjekt, kuerzen, neueKennung } from './teilen/umschlag.mjs';
import { F, aufraeumen, allesErledigt, haekchen, zusammenfuehren } from './teilen/zusammenfuehren.mjs';
import { mengeText, ordnen, standZeit } from './teilen/anzeige.mjs';
import app from '../daten/teilen_app.json';
import { listeTexte as T } from '../daten/liste_seite.mjs';
// QR-Code am Computer: uqr (MIT, Fassung fest in package.json), im Skript der Seite mitgebaut.
import { encode } from 'uqr';

const PRAEFIX = 'foodasu-liste-';
const SPEICHER_TAGE = 60;
const jetztSek = () => Math.floor(Date.now() / 1000);
const fuelle = (vorlage, werte = {}) => vorlage.replace(/\{(\w+)\}/g, (_, name) => String(werte[name] ?? ''));

const wurzel = document.querySelector('[data-l-seite]');
const BASIS = wurzel.dataset.basis;
const $ = (auswahl) => document.querySelector(auswahl);
const kopf = {
  ueberzeile: $('.s-kopf .ueberzeile'),
  titel: $('[data-l-titel]'),
  stand: $('[data-l-stand]'),
  wachZeile: $('[data-l-wach-zeile]'),
  wach: $('[data-l-wach]'),
  neuer: $('[data-l-neuer]'),
  neuerKnopf: $('[data-l-neuer-knopf]'),
};
const teil = {
  hinweis: $('[data-l-hinweis]'),
  hinweisText: $('[data-l-hinweis-text]'),
  hinweisWeiter: $('[data-l-hinweis-weiter]'),
  ohneSpeicher: $('[data-l-ohne-speicher]'),
  name: $('[data-l-name]'),
  nameText: $('[data-l-name-text]'),
  nameFeld: $('[data-l-name-feld]'),
  nameSpaeter: $('[data-l-name-spaeter]'),
  liste: $('[data-l-liste]'),
  eintraege: $('[data-l-eintraege]'),
  zurueck: $('[data-l-zurueck]'),
  zurueckTitel: $('[data-l-zurueck-titel]'),
  zurueckText: $('[data-l-zurueck-text]'),
  senden: $('[data-l-senden]'),
  als: $('[data-l-als]'),
  alsText: $('[data-l-als-text]'),
  wege: $('[data-l-wege]'),
  whatsapp: $('[data-l-weg="whatsapp"]'),
  sms: $('[data-l-weg="sms"]'),
  kopieren: $('[data-l-weg="kopieren"]'),
  status: $('[data-l-status]'),
  selbst: $('[data-l-selbst]'),
  browser: $('[data-l-browser]'),
  entfernen: $('[data-l-entfernen]'),
  qr: $('[data-l-qr]'),
  qrBild: $('[data-l-qr-bild]'),
};
const symbol = (name) => document.querySelector(`template[data-l-symbol="${name}"]`).content.firstElementChild.cloneNode(true);
const element = (marke, klasse, text) => {
  const neu = document.createElement(marke);
  if (klasse) neu.className = klasse;
  if (text !== undefined) neu.textContent = text;
  return neu;
};

// ---- Speicher im Browser (alles in try/catch: ohne Speicher geht die Seite trotzdem) ----------------------------

function datensatzPruefen(wert, listId) {
  if (!istObjekt(wert) || wert.format !== 1 || !istKennung(wert.autor) || typeof wert.name !== 'string') return null;
  const stand = wert.stand;
  if (!istObjekt(stand) || stand.id !== listId || !Array.isArray(stand.e) || !istObjekt(stand.a) || !istObjekt(stand.g)) return null;
  if (!stand.e.every((eintrag) => Array.isArray(eintrag) && eintrag.length === 13)) return null;
  return { ...wert, neu: Array.isArray(wert.neu) ? wert.neu : [], wach: wert.wach !== false };
}

// { ok: Speicher lesbar, datensatz: gültiger Eintrag oder null }
function speicherLesen(listId) {
  try {
    const roh = localStorage.getItem(PRAEFIX + listId);
    if (roh === null) return { ok: true, datensatz: null };
    try { return { ok: true, datensatz: datensatzPruefen(JSON.parse(roh), listId) }; } catch { return { ok: true, datensatz: null }; }
  } catch {
    return { ok: false, datensatz: null };
  }
}

// Einträge, die 60 Tage nicht geöffnet wurden, löscht die Seite beim Laden selbst (auch kaputte Einträge).
function altesEntfernen(jetzt) {
  try {
    const weg = [];
    for (let nummer = 0; nummer < localStorage.length; nummer++) {
      const schluessel = localStorage.key(nummer);
      if (!schluessel || !schluessel.startsWith(PRAEFIX)) continue;
      let wert = null;
      try { wert = JSON.parse(localStorage.getItem(schluessel)); } catch { /* kaputt: weg */ }
      if (!istObjekt(wert) || typeof wert.geoeffnet !== 'number' || jetzt - wert.geoeffnet > SPEICHER_TAGE * GRENZEN.tag) weg.push(schluessel);
    }
    for (const schluessel of weg) localStorage.removeItem(schluessel);
  } catch { /* ohne Speicher gibt es nichts zu löschen */ }
}

// ---- Zustand der Seite -------------------------------------------------------------------------------------------

// { listId, kodierung, datensatz: { format, name, autor, stand, geoeffnet, neu, wach, gefragt }, speicherOk, wartet }
let zustand = null;
let nachName = null; // was nach dem Speichern des Namens passiert (Senden)

function speichern() {
  if (!zustand.speicherOk) return;
  try {
    localStorage.setItem(PRAEFIX + zustand.listId, JSON.stringify(zustand.datensatz));
  } catch {
    zustand.speicherOk = false;
    teil.ohneSpeicher.hidden = false;
  }
}

// Vor jeder eigenen Änderung den neuesten Eintrag lesen (ein zweiter Tab kann geschrieben haben).
function frisch() {
  if (!zustand.speicherOk) return;
  const { ok, datensatz } = speicherLesen(zustand.listId);
  if (ok && datensatz) {
    zustand.datensatz = datensatz;
    zustand.wartet = null;
    kopf.neuer.hidden = true;
  }
}

const standVon = () => zustand.datensatz.stand;
const nameVon = (id) => (id && hat(standVon().a, id) ? standVon().a[id] : '');
const absender = () => nameVon(standVon().by);

function alleAusblenden() {
  for (const bereich of [teil.hinweis, teil.ohneSpeicher, teil.name, teil.liste, teil.zurueck, teil.browser, teil.qr, kopf.stand, kopf.wachZeile, kopf.neuer, teil.hinweisWeiter]) bereich.hidden = true;
}

function zeigeHinweis(texte, werte = {}, { ueberzeile = T.ueberzeileOhneName, weiter = null } = {}) {
  zustand = null;
  alleAusblenden();
  kopf.ueberzeile.textContent = ueberzeile;
  kopf.titel.textContent = fuelle(texte.titel, werte);
  teil.hinweisText.textContent = fuelle(texte.text, werte);
  if (weiter) { teil.hinweisWeiter.textContent = weiter; teil.hinweisWeiter.hidden = false; }
  teil.hinweis.hidden = false;
  wachLoesen();
}

// Art h ohne App (Vorgabe 3.1): kurze Seite für den, der die Liste geschickt hat.
function zeigeHaekchen(umschlag) {
  const von = hat(umschlag.a, umschlag.by) ? umschlag.a[umschlag.by] : '';
  const bekannt = speicherLesen(umschlag.id).datensatz?.stand;
  const fuer = bekannt && hat(bekannt.a, bekannt.by) ? bekannt.a[bekannt.by] : '';
  const anzahl = umschlag.s.filter(([, status]) => status === STATUS.erledigt).length;
  const H = T.haekchen;
  const text = !von ? H.textOhneName : umschlag.done === 1 ? H.textFertig : anzahl === 1 ? H.textEine : anzahl > 1 ? H.text : H.textOhneName;
  zeigeHinweis({ titel: von ? H.titel : H.titelOhneName, text }, { von, anzahl }, {
    ueberzeile: fuer ? fuelle(H.fuer, { absender: fuer }) : T.ueberzeileOhneName,
    weiter: H.weiter,
  });
}

// ---- Öffnen eines Links (beim Laden und bei hashchange) ----------------------------------------------------------

async function oeffnen() {
  const kodierung = location.hash.replace(/^#/, '');
  if (!kodierung) return zeigeHinweis(T.leer);
  const gelesen = await lesen(kodierung);
  if (gelesen.fehler) return zeigeHinweis(gelesen.fehler === 'neuere_version' ? T.neuereVersion : T.kaputt);
  const umschlag = gelesen.umschlag;
  if (umschlag.k === 'p') return zeigeHinweis(T.profil);
  if (umschlag.k === 'h') return zeigeHaekchen(umschlag);
  const jetzt = jetztSek();
  const { ok, datensatz: alt } = speicherLesen(umschlag.id);
  const vorher = alt?.stand ?? null;
  const aus = zusammenfuehren(vorher, umschlag);
  if (aus.fehler) return zeigeHinweis(T.kaputt);
  const stand = aufraeumen(aus.stand, jetzt);
  let autor = alt?.autor;
  while (!istKennung(autor) || hat(stand.a, autor) || autor === stand.by) autor = neueKennung(KENNUNG_BYTE.autor);
  zustand = {
    listId: umschlag.id,
    kodierung,
    speicherOk: ok,
    wartet: null,
    datensatz: {
      format: 1, name: alt?.name ?? '', autor, stand, geoeffnet: jetzt,
      // "neu" nur bei einem Nachtrag zu einer Liste, die hier schon offen war, bis zum nächsten Öffnen.
      neu: vorher ? aus.ergebnis.neu : [],
      wach: alt?.wach ?? true,
      gefragt: alt?.gefragt ?? false,
    },
  };
  speichern();
  alleAusblenden();
  teil.ohneSpeicher.hidden = zustand.speicherOk;
  teil.liste.hidden = false;
  teil.browser.hidden = !zustand.speicherOk;
  zeigeListe();
  zeigeName(!zustand.datensatz.name && !zustand.datensatz.gefragt);
  wachZeigen();
  zeigeQr();
  dienstAnmelden();
}

// ---- Anzeige der Liste ----------------------------------------------------------------------------------------

function zaehlen(stand) {
  const aktiv = stand.e.filter((eintrag) => eintrag[F.status] !== STATUS.gestrichen);
  return {
    alle: aktiv.length,
    erledigt: aktiv.filter((eintrag) => eintrag[F.status] === STATUS.erledigt).length,
    nicht: aktiv.filter((eintrag) => eintrag[F.status] === STATUS.nichtBekommen).sort((x, y) => x[F.ordnung] - y[F.ordnung]).map((eintrag) => eintrag[F.text]),
  };
}

function eintragZeile(eintrag, { neu }) {
  const status = eintrag[F.status];
  const eigen = eintrag[F.statusVon] === zustand.datensatz.autor;
  const zeile = element('li', 'l-eintrag');
  zeile.dataset.id = eintrag[F.id];
  zeile.dataset.status = status;
  const menge = mengeText(eintrag[F.menge], eintrag[F.einheit], app);
  const name = element('span', 'l-name');
  if (menge) { name.append(element('b', 'l-menge', menge), ' '); }
  name.append(eintrag[F.text]);
  const text = element('span', 'l-text');
  text.append(name);
  if (eintrag[F.notiz]) text.append(element('span', 'l-notiz', eintrag[F.notiz]));
  const vermerk = (inhalt, klasse = 'l-vermerk') => { const neuerVermerk = element('span', klasse); neuerVermerk.append(...inhalt); text.append(neuerVermerk); };
  const vonName = nameVon(eintrag[F.statusVon]);
  if (status === STATUS.gestrichen) {
    vermerk([symbol('strich'), vonName ? fuelle(T.liste.gestrichenVon, { von: vonName }) : T.liste.gestrichen]);
    const fest = element('div', 'l-haken l-fest');
    const kreis = element('span', 'l-kreis');
    kreis.setAttribute('aria-hidden', 'true');
    kreis.append(symbol('strich'));
    fest.append(kreis, text);
    zeile.append(fest);
    return zeile;
  }
  if (status === STATUS.nichtBekommen) vermerk([symbol('nicht'), eigen || !vonName ? T.liste.nichtBekommen : fuelle(T.liste.nichtBekommenVon, { von: vonName })]);
  if (status === STATUS.erledigt && !eigen && vonName) vermerk([fuelle(T.liste.erledigtVon, { von: vonName })]);
  if (neu && status !== STATUS.erledigt) vermerk([T.liste.neu], 'l-neu');
  const haken = element('button', 'l-haken');
  haken.type = 'button';
  haken.setAttribute('role', 'checkbox');
  haken.setAttribute('aria-checked', String(status === STATUS.erledigt));
  haken.dataset.art = 'haken';
  const kreis = element('span', 'l-kreis');
  kreis.setAttribute('aria-hidden', 'true');
  kreis.append(symbol(status === STATUS.nichtBekommen ? 'nicht' : 'haken'));
  haken.append(kreis, text);
  haken.addEventListener('click', () => setzeStatus(eintrag[F.id], status === STATUS.erledigt ? STATUS.offen : STATUS.erledigt, 'haken'));
  zeile.append(haken);
  if (status !== STATUS.erledigt) {
    const nicht = status === STATUS.nichtBekommen;
    const knopf = element('button', 'l-nicht');
    knopf.append(symbol(nicht ? 'zurueck' : 'nicht'), nicht ? T.liste.zuruecknehmen : T.liste.nichtBekommen);
    knopf.type = 'button';
    knopf.dataset.art = 'nicht';
    knopf.setAttribute('aria-label', fuelle(nicht ? T.liste.zuruecknehmenName : T.liste.nichtBekommenName, { eintrag: eintrag[F.text] }));
    knopf.addEventListener('click', () => setzeStatus(eintrag[F.id], nicht ? STATUS.offen : STATUS.nichtBekommen, 'nicht'));
    zeile.append(knopf);
  }
  return zeile;
}

function zeigeListe(fokus = null) {
  const stand = standVon();
  const absenderName = absender();
  kopf.ueberzeile.textContent = absenderName ? fuelle(T.ueberzeile, { absender: absenderName }) : T.ueberzeileOhneName;
  kopf.titel.textContent = stand.n;
  const zahl = zaehlen(stand);
  kopf.stand.textContent = `${fuelle(T.stand, { zeit: standZeit(stand.t) })} · ${fuelle(T.fortschritt, zahl)}`;
  kopf.stand.hidden = false;
  const neu = new Set(zustand.datensatz.neu);
  const { gruppen, erledigt } = ordnen(stand, app);
  const inhalt = document.createDocumentFragment();
  for (const gruppe of gruppen) {
    const block = element('div', 'l-gruppe');
    if (gruppe.name) block.append(element('h2', 'l-gruppe-titel', gruppe.name));
    else block.append(element('h2', 'vh', T.liste.titel));
    const liste = element('ul', 'l-eintraege');
    for (const eintrag of gruppe.eintraege) liste.append(eintragZeile(eintrag, { neu: neu.has(eintrag[F.id]) }));
    block.append(liste);
    inhalt.append(block);
  }
  if (erledigt.length) {
    const block = element('div', 'l-gruppe l-erledigt');
    const titel = element('h2', 'l-gruppe-titel', T.liste.erledigt);
    titel.append(' ', element('span', 'l-anzahl', String(erledigt.length)));
    block.append(titel);
    const liste = element('ul', 'l-eintraege');
    for (const eintrag of erledigt) liste.append(eintragZeile(eintrag, { neu: false }));
    block.append(liste);
    inhalt.append(block);
  }
  teil.eintraege.replaceChildren(inhalt);
  if (fokus) teil.eintraege.querySelector(`[data-id="${CSS.escape(fokus.id)}"] [data-art="${fokus.art}"]`)?.focus();
  zeigeZurueck();
}

function zeigeZurueck() {
  const { autor, name } = zustand.datensatz;
  const stand = standVon();
  const eigene = stand.e.some((eintrag) => eintrag[F.statusVon] === autor && eintrag[F.status] !== STATUS.gestrichen);
  teil.zurueck.hidden = !eigene;
  const fertig = allesErledigt(stand);
  const absenderName = absender();
  teil.zurueck.classList.toggle('fertig', fertig);
  teil.zurueckTitel.textContent = fertig ? T.zurueck.fertigTitel : T.zurueck.titel;
  teil.zurueckText.textContent = absenderName ? fuelle(T.zurueck.text, { absender: absenderName }) : T.zurueck.textOhneName;
  teil.senden.textContent = fertig
    ? (absenderName ? fuelle(T.zurueck.fertigKnopf, { absender: absenderName }) : T.zurueck.fertigKnopfOhneName)
    : (absenderName ? fuelle(T.zurueck.knopf, { absender: absenderName }) : T.zurueck.knopfOhneName);
  teil.als.hidden = !name;
  teil.alsText.textContent = fuelle(T.name.als, { ich: name });
}

function setzeStatus(id, status, art) {
  frisch();
  const eintrag = standVon().e.find((teilstueck) => teilstueck[F.id] === id);
  if (!eintrag || eintrag[F.status] === STATUS.gestrichen) return zeigeListe();
  eintrag[F.status] = status;
  // Eigene Änderung: mindestens eine Sekunde nach dem bisherigen Stand (Format 6.3), damit sie nie still verliert.
  eintrag[F.statusZeit] = Math.max(jetztSek(), eintrag[F.statusZeit] + 1);
  eintrag[F.statusVon] = zustand.datensatz.autor;
  speichern();
  teil.wege.hidden = true;
  zeigeListe({ id, art });
}

// ---- Name ------------------------------------------------------------------------------------------------------

function zeigeName(sichtbar, { senden = false } = {}) {
  teil.name.hidden = !sichtbar;
  if (!sichtbar) return;
  const absenderName = absender();
  teil.nameText.textContent = senden ? T.name.textSenden : absenderName ? fuelle(T.name.text, { absender: absenderName }) : T.name.textOhneName;
  teil.nameFeld.value = zustand.datensatz.name;
  if (senden) { teil.name.scrollIntoView({ block: 'center' }); teil.nameFeld.focus(); }
}

teil.name.addEventListener('submit', (ereignis) => {
  ereignis.preventDefault();
  const name = kuerzen(teil.nameFeld.value.trim(), GRENZEN.name);
  if (!name) { teil.nameFeld.focus(); return; }
  frisch();
  zustand.datensatz.name = name;
  zustand.datensatz.gefragt = true;
  speichern();
  zeigeName(false);
  zeigeZurueck();
  const danach = nachName;
  nachName = null;
  if (danach) danach();
});
teil.nameSpaeter.addEventListener('click', () => {
  frisch();
  zustand.datensatz.gefragt = true;
  speichern();
  nachName = null;
  zeigeName(false);
});
document.querySelector('[data-l-aendern]').addEventListener('click', () => zeigeName(true, { senden: false }));

// ---- Häkchen zurückschicken ---------------------------------------------------------------------------------------

function nachricht(stand, name, fertig) {
  const zahl = zaehlen(stand);
  const werte = { ich: name, liste: stand.n, erledigt: zahl.erledigt, alle: zahl.alle, nicht: zahl.nicht.join(', ') };
  const vorlage = fertig
    ? (zahl.nicht.length ? T.zurueck.nachrichtFertigNicht : T.zurueck.nachrichtFertig)
    : (zahl.nicht.length ? T.zurueck.nachrichtNicht : T.zurueck.nachricht);
  return fuelle(vorlage, werte);
}

async function senden() {
  frisch();
  const { stand, autor, name } = zustand.datensatz;
  if (!name) { nachName = senden; zeigeName(true, { senden: true }); return; }
  const umschlag = haekchen(stand, autor, name, jetztSek());
  const link = `${BASIS}#${await schreiben(umschlag)}`;
  const ganz = `${nachricht(stand, name, umschlag.done === 1)}\n${link}`;
  teil.wege.dataset.link = link;
  teil.wege.dataset.text = ganz;
  teil.whatsapp.href = `https://wa.me/?text=${encodeURIComponent(ganz)}`;
  teil.sms.href = `sms:?&body=${encodeURIComponent(ganz)}`;
  teil.status.textContent = '';
  teil.selbst.hidden = true;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: ganz });
      return;
    } catch (fehler) {
      if (fehler?.name === 'AbortError') return;
    }
  }
  teil.wege.hidden = false;
  teil.wege.querySelector('a, button')?.focus();
}
teil.senden.addEventListener('click', () => { senden(); });

teil.kopieren.addEventListener('click', async () => {
  const text = teil.wege.dataset.text ?? '';
  try {
    await navigator.clipboard.writeText(text);
    teil.status.textContent = T.zurueck.kopiert;
  } catch {
    teil.status.textContent = T.zurueck.nichtKopiert;
    teil.selbst.value = text;
    teil.selbst.hidden = false;
    teil.selbst.select();
  }
});

// ---- Liste aus diesem Browser entfernen ----------------------------------------------------------------------------

teil.entfernen.addEventListener('click', () => {
  try { localStorage.removeItem(PRAEFIX + zustand.listId); } catch { /* ohne Speicher steht nichts da */ }
  wachLoesen();
  zeigeHinweis(T.entfernt);
});

// ---- Zweiter Tab: neuere Fassung über das storage-Ereignis ------------------------------------------------------

window.addEventListener('storage', (ereignis) => {
  if (!zustand || ereignis.key !== PRAEFIX + zustand.listId || ereignis.newValue === null) return;
  let neu = null;
  try { neu = datensatzPruefen(JSON.parse(ereignis.newValue), zustand.listId); } catch { return; }
  if (!neu) return;
  const jetzt = standVon();
  if (neu.stand.rev > jetzt.rev || (neu.stand.rev === jetzt.rev && neu.stand.t > jetzt.t)) {
    zustand.wartet = neu;
    kopf.neuer.hidden = false;
  } else {
    // Dieselbe Fassung, Häkchen aus dem anderen Tab: still übernehmen.
    zustand.datensatz = neu;
    zeigeListe();
  }
});
kopf.neuerKnopf.addEventListener('click', () => {
  if (!zustand?.wartet) return;
  zustand.datensatz = zustand.wartet;
  zustand.wartet = null;
  kopf.neuer.hidden = true;
  zeigeListe();
  kopf.titel.closest('h1')?.scrollIntoView({ block: 'start' });
});

// ---- Bildschirm anlassen (Screen Wake Lock, wo der Browser es kann) -------------------------------------------

let sperre = null;
async function wachHalten() {
  const soll = Boolean(zustand?.datensatz.wach) && document.visibilityState === 'visible';
  if (soll && !sperre && 'wakeLock' in navigator) {
    try {
      sperre = await navigator.wakeLock.request('screen');
      sperre.addEventListener('release', () => { sperre = null; });
    } catch { sperre = null; }
  } else if (!soll) await wachLoesen();
}
async function wachLoesen() {
  const alt = sperre;
  sperre = null;
  if (alt) { try { await alt.release(); } catch { /* schon frei */ } }
}
function wachZeigen() {
  kopf.wachZeile.hidden = !('wakeLock' in navigator);
  kopf.wach.setAttribute('aria-checked', String(zustand.datensatz.wach));
  wachHalten();
}
kopf.wach.addEventListener('click', () => {
  frisch();
  zustand.datensatz.wach = !zustand.datensatz.wach;
  speichern();
  wachZeigen();
});
// Nach der Rückkehr in den Tab gibt der Browser die Sperre frei; sie wird neu angefordert.
document.addEventListener('visibilitychange', () => { if (zustand) wachHalten(); });

// ---- QR-Code am Computer (nur bis 1.200 Zeichen, Fehlerkorrektur M) --------------------------------------------

const computer = window.matchMedia('(min-width: 56rem) and (hover: hover) and (pointer: fine)');
async function zeigeQr() {
  teil.qr.hidden = true;
  if (!zustand || !computer.matches) return;
  const adresse = `${BASIS}#${zustand.kodierung}`;
  if (adresse.length > GRENZEN.qrZeichen) return;
  try {
    const { data, size } = encode(adresse, { ecc: 'M', boostEcc: false, border: 0 });
    let pfad = '';
    data.forEach((reihe, y) => reihe.forEach((dunkel, x) => { if (dunkel) pfad += `M${x} ${y}h1v1h-1z`; }));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `-4 -4 ${size + 8} ${size + 8}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', teil.qrBild.dataset.name);
    const flaeche = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    flaeche.setAttribute('d', pfad);
    flaeche.setAttribute('fill', 'currentColor');
    svg.append(flaeche);
    teil.qrBild.replaceChildren(svg);
    teil.qr.hidden = false;
    dienstMerken();
  } catch { teil.qr.hidden = true; }
}
computer.addEventListener('change', () => { zeigeQr(); });

// ---- Ohne Netz nach dem ersten Öffnen (Service Worker nur für /l/) ---------------------------------------------

// Der Service Worker (public/l/sw.js) speichert nur die eigenen Dateien der Seite; nie etwas aus dem #.
let dienst = null;
function dienstMerken() {
  if (!dienst?.active) return;
  const eigene = new Set([new URL('/l/', location.href).href]);
  for (const eintrag of performance.getEntriesByType('resource')) {
    const adresse = new URL(eintrag.name);
    if (adresse.origin !== location.origin) continue;
    adresse.hash = '';
    eigene.add(adresse.href);
  }
  dienst.active.postMessage({ art: 'merken', dateien: [...eigene] });
}
function dienstAnmelden() {
  if (!('serviceWorker' in navigator) || dienst) return;
  navigator.serviceWorker.register('/l/sw.js', { scope: '/l/' })
    .then(() => navigator.serviceWorker.ready)
    .then((anmeldung) => {
      dienst = anmeldung;
      if (document.readyState === 'complete') dienstMerken();
      else window.addEventListener('load', dienstMerken, { once: true });
    })
    .catch(() => { /* ohne Service Worker geht die Seite nur mit Netz */ });
}

// ---- Start ---------------------------------------------------------------------------------------------------

wurzel.querySelector('[data-l-ohne-skript]')?.remove();
altesEntfernen(jetztSek());
window.addEventListener('hashchange', () => { oeffnen(); });
oeffnen().finally(() => { wurzel.dataset.bereit = '1'; });
