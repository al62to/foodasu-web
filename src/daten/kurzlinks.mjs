// Alle eigenen Kurzlinks: die drei aus AP-45 (/fb/, /ig/, /app/, in seite.mjs) und /teilen/ (AP-48, 27.10.2026). /teilen/
// ist der Link, den die App beim Weiterempfehlen und beim Teilen eines Rezepts ohne eigene Rezeptseite mitschickt:
// Quelle "app", Medium "teilen", Kampagne "empfehlung". Er steht in dieser eigenen Datei, damit seite.mjs unverändert
// bleibt (seite.mjs zählt in src/daten/stand.mjs für das Datum der Startseite und von /ueber-foodasu/ in der Sitemap).
import { store, appleZielFuer, KURZLINKS as KURZLINKS_AP45 } from './seite.mjs';

export const KURZLINK_TEILEN = {
  pfad: '/teilen/',
  quelle: 'app',
  medium: 'teilen',
  kampagne: 'empfehlung',
  wofuer: 'Teilen aus der App',
  ziel: `${store.adresse}&referrer=utm_source%3Dapp%26utm_medium%3Dteilen%26utm_campaign%3Dempfehlung`,
};

// Ziel für iPhone und iPad je Kurzlink (AP-88): App Store, mit Kampagnenkennung ct = utm_campaign, sobald der
// Anbieter-Code in seite.mjs steht.
export const KURZLINKS = [...KURZLINKS_AP45, KURZLINK_TEILEN].map((kurzlink) => ({ ...kurzlink, appleZiel: appleZielFuer(kurzlink.kampagne) }));
