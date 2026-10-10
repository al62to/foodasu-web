// Bewegung der Startseite mit GSAP. Die Seite lädt diese Datei erst nach dem ersten Zeichnen und nur ohne
// "Bewegung reduzieren" (src/pages/index.astro). Alles hier verändert nur Elemente, die beim Start noch unterhalb des
// sichtbaren Bereichs liegen, oder läuft als Schleife aus dem fertigen Zustand heraus: Ohne dieses Skript ist die Seite
// vollständig, mit ihm springt nichts.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const alle = (auswahl, wurzel = document) => Array.from(wurzel.querySelectorAll(auswahl));
const unterhalb = (element) => element.getBoundingClientRect().top > window.innerHeight * 0.92;

// Schleifen laufen nur, solange ihr Abschnitt zu sehen ist.
function nurSichtbar(abschnitt, lauf) {
  lauf.pause();
  ScrollTrigger.create({
    trigger: abschnitt,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (zustand) => (zustand.isActive ? lauf.play() : lauf.pause()),
  });
}

// Blendet Elemente beim Scrollen ein. Was beim Start schon zu sehen ist, bleibt unberührt.
function zeige(elemente, zusatz = {}) {
  const ziel = elemente.filter(unterhalb);
  if (!ziel.length) return;
  gsap.from(ziel, {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: { trigger: ziel[0], start: 'top 86%', once: true },
    ...zusatz,
  });
}

// 1 Kopf: Der Scan läuft im Handy in Schleife (Strahl, Karte gleitet hoch, Urteil, Personen nacheinander).
function kopf() {
  const handy = document.querySelector('[data-handy]');
  if (!handy) return;
  const blatt = handy.querySelector('[data-blatt]');
  const teile = [handy.querySelector('[data-urteil]'), ...alle('[data-person]', handy)];
  const lauf = gsap.timeline({ repeat: -1, delay: 2.2 });
  lauf
    .to(blatt, { yPercent: 105, duration: 0.6, ease: 'power2.in' })
    .set(teile, { opacity: 0, y: 12 })
    .fromTo(handy.querySelector('[data-strahl]'), { y: 40 }, { y: 150, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' })
    .to(blatt, { yPercent: 0, duration: 0.7, ease: 'power3.out' })
    .to(teile[0], { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' })
    .to(teile.slice(1), { opacity: 1, y: 0, duration: 0.35, stagger: 0.15 }, '-=0.1')
    .to({}, { duration: 2.8 });
  nurSichtbar('#start', lauf);
  if (window.matchMedia('(min-width: 56rem)').matches) {
    gsap.to(handy, { y: -60, ease: 'none', scrollTrigger: { trigger: '#start', start: 'top top', end: 'bottom top', scrub: true } });
  }
}

// 2 Wechselndes Wort; die Marke des aktuellen Worts ist hervorgehoben.
function wort() {
  const element = document.querySelector('[data-wort]');
  if (!element) return undefined;
  const woerter = JSON.parse(element.dataset.woerter);
  const marken = alle('[data-wortmarke]');
  const setze = (nummer) => {
    element.textContent = woerter[nummer];
    marken.forEach((marke, stelle) => marke.classList.toggle('an', stelle === nummer));
  };
  let nummer = 0;
  const lauf = gsap.timeline({ repeat: -1 });
  lauf
    .to({}, { duration: 1.35 })
    .to(element, { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in' })
    .call(() => setze((nummer = (nummer + 1) % woerter.length)))
    .fromTo(element, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', immediateRender: false });
  nurSichtbar('#ohne', lauf);
  zeige(alle('.wort-text'));
  return () => setze(0);
}

// 3 Drei Schritte: Die Linie wächst mit dem Scrollen.
function schritte() {
  gsap.fromTo('[data-linie]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#schritte', start: 'top 75%', end: 'bottom 70%', scrub: true } });
  zeige(alle('.schritt'), { stagger: 0.18 });
}

// 4 Glas-Raster: Karten erscheinen, die Einkaufsliste hakt sich ab, am Laptop neigen sich die Karten zur Maus.
function glas() {
  const aufraeumen = [];
  zeige(alle('.glaskarte'), { y: 70, stagger: 0.08 });

  const punkte = alle('[data-haken] li');
  if (punkte.length) {
    let erledigt = 0;
    const lauf = gsap.timeline({ repeat: -1 });
    lauf
      .call(() => {
        punkte.forEach((punkt, stelle) => punkt.classList.toggle('erledigt', stelle < erledigt));
        erledigt = (erledigt + 1) % (punkte.length + 1);
      })
      .to({}, { duration: 0.9 });
    nurSichtbar('.k-liste', lauf);
    aufraeumen.push(() => punkte.forEach((punkt) => punkt.classList.remove('erledigt')));
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    for (const karte of alle('[data-neigung]')) {
      const neige = (ereignis) => {
        const flaeche = karte.getBoundingClientRect();
        const x = (ereignis.clientX - flaeche.left) / flaeche.width - 0.5;
        const y = (ereignis.clientY - flaeche.top) / flaeche.height - 0.5;
        gsap.to(karte, { rotateY: x * 9, rotateX: -y * 9, transformPerspective: 800, duration: 0.4, overwrite: 'auto' });
      };
      const richte = () => gsap.to(karte, { rotateY: 0, rotateX: 0, duration: 0.6, overwrite: 'auto' });
      karte.addEventListener('pointermove', neige);
      karte.addEventListener('pointerleave', richte);
      aufraeumen.push(() => {
        karte.removeEventListener('pointermove', neige);
        karte.removeEventListener('pointerleave', richte);
      });
    }
  }
  return () => aufraeumen.forEach((schritt) => schritt());
}

// 4b FoodAsu im Bild: Die Handys erscheinen nacheinander.
function einblick() {
  zeige(alle('.einblick-karte'), { y: 50, stagger: 0.07 });
}

// 5 Zähler laufen hoch. Im Quelltext steht immer die Endzahl.
function zaehler() {
  const zahlen = alle('[data-zahl]');
  zeige(alle('.zaehler li'));
  for (const element of zahlen.filter(unterhalb)) {
    const ziel = Number(element.dataset.zahl);
    if (!ziel) continue;
    const stand = { wert: 0 };
    element.textContent = '0';
    gsap.to(stand, {
      wert: ziel,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
      onUpdate: () => (element.textContent = String(Math.round(stand.wert))),
    });
  }
  return () => zahlen.forEach((element) => (element.textContent = element.dataset.zahl));
}

// 6 Rezeptkarten kommen leicht gedreht herein. 7 Fragen erscheinen nacheinander.
function vorschau() {
  const karten = alle('.rezeptkarte').filter(unterhalb);
  karten.forEach((karte, stelle) => {
    gsap.from(karte, {
      y: 70,
      opacity: 0,
      rotate: stelle % 2 ? 4 : -4,
      duration: 0.9,
      ease: 'power3.out',
      delay: stelle * 0.08,
      scrollTrigger: { trigger: karten[0], start: 'top 86%', once: true },
    });
  });
  zeige(alle('.faq details'), { y: 24, stagger: 0.06 });
}

let abfrage;

export function starte() {
  // Stellt jemand später auf "Bewegung reduzieren" um, nimmt GSAP alles zurück, was hier angelegt wurde.
  // Die Abschnitte werden nacheinander in eigenen Schritten eingerichtet, damit das Handy dabei bedienbar bleibt.
  if (abfrage) return;
  const lauf = (abfrage = gsap.matchMedia());
  [kopf, wort, schritte, glas, einblick, zaehler, vorschau].forEach((abschnitt, nummer) => {
    setTimeout(() => {
      if (abfrage === lauf) lauf.add('(prefers-reduced-motion: no-preference)', () => abschnitt());
    }, nummer * 40);
  });
}

// Knopf "Bewegung anhalten": nimmt alles zurück, was starte() angelegt hat. Die Seite steht dann so da wie mit
// "Bewegung reduzieren" (alles sichtbar, Zähler mit Endzahl, Linie voll). starte() richtet die Bewegung neu ein.
export function halte() {
  if (!abfrage) return;
  abfrage.revert();
  abfrage = undefined;
}
