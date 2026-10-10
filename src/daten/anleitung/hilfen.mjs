// Bausteine für die Kapitel von "So geht's" (src/daten/anleitung/*.mjs).
//
// foto(datei, unterschrift, alt): ein Bildschirmfoto der App. "datei" ist der Name aus
// C:/Users/ali/foodasu-play/So_gehts_Bilder ohne Endung (Bereich, Thema, Schritt). Die Web-Fassungen baut
// tools/sogehts_fotos.py; Maße und der Satz, was das Bild zeigt, stehen danach in src/daten/sogehts_fotos.json.
// Fehlt "alt", gilt dieser Satz als Bildbeschreibung.
export const foto = (datei, unterschrift, alt) => ({ datei, unterschrift, ...(alt ? { alt } : {}) });

// Verweis im Fließtext: Text davor, Linktext, Ziel, Text danach.
export const link = (vor, text, ziel, nach = '.') => ({ vor, text, ziel, nach });
