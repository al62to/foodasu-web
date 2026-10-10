// Einleitungstexte der Themenseiten (AP-22 Teil 1 Nr. 2). Eine Themenseite steht nur im Index der Suchmaschinen,
// wenn sie mindestens sechs Rezepte der Website zeigt und hier einen eigenen Text hat; alle anderen tragen
// "noindex, follow", fehlen in sitemap.xml und bleiben für Besucher erreichbar (src/daten/rezeptseiten.mjs).
//
// Regeln für die Texte:
// - Jeder Text ist für seine Seite geschrieben und nennt nur, was die Daten der Seite belegen. "dabei" nennt die
//   Rezepte, die der Text als Beispiel dieser Seite nennt, "nichtDabei" die Rezepte, von denen er sagt, dass sie
//   fehlen, "jeNach" die Rezepte, die er unter "Je nach Produkt" einordnet. Stimmt eine Angabe nicht mehr mit den
//   Daten überein, bricht der Bau ab.
// - Seiten "Rezepte ohne ..." nennen die Wendung "ohne ... als Zutat laut Zutatenliste".
// - Keine Zahlen von Hand: Die Zahl der Rezepte steht im Vorspann der Seite und kommt aus den Daten.
// - Wortregeln nach Konzept v4, Abschnitt 1: keine Versprechen und keine Aussagen zur Gesundheit; die Einträge heißen
//   wie in der App. Der Hinweis "Maßgeblich ist die Verpackung." steht auf jeder dieser Seiten im Kopfbereich.
export const THEMEN_TEXTE = {
  '/rezepte/ohne-gluten/': {
    text: 'Ohne Gluten als Zutat laut Zutatenliste sind hier vor allem Gerichte aus Gemüse, Hülsenfrüchten, Kartoffeln und Eiern: Dal Tadka aus Indien, Ratatouille aus Frankreich, Rösti aus der Schweiz oder Tortilla española. Kuchen, Nudeln und Paniertes wie Sachertorte, Spaghetti carbonara und Wiener Schnitzel fehlen auf dieser Seite. Bei Brühe, Senf oder Gewürzmischungen kommt es auf das Produkt an; solche Rezepte stehen unten unter „Je nach Produkt“.',
    dabei: ['dal-tadka', 'ratatouille', 'roesti', 'tortilla-espanola'],
    nichtDabei: ['sachertorte', 'spaghetti-carbonara', 'wiener-schnitzel'],
  },
  '/rezepte/ohne-eier/': {
    text: 'Ohne Eier als Zutat laut Zutatenliste kommen hier viele herzhafte Gerichte aus: Pizza Margherita, Paella valenciana, Butter Chicken, Samosa oder Gulyás. Teige aus Mehl, Wasser und Hefe gehören dazu, Spätzle und Tiramisu nicht. Bei fertigem Teig, Brot und Semmelbröseln kommt es auf das Produkt an.',
    dabei: ['pizza-margherita', 'paella-valenciana', 'butter-chicken', 'samosa', 'gulyas'],
    nichtDabei: ['spaetzle', 'tiramisu'],
  },
  '/rezepte/ohne-fisch/': {
    text: 'Fast alle Rezepte dieser Website kommen ohne Fisch als Zutat laut Zutatenliste aus, vom Wiener Schnitzel bis zum Tiramisu. Garnelen stehen in FoodAsu beim Eintrag Krebstiere; deshalb sind die Knoblauchgarnelen hier dabei. Es fehlen die Gerichte mit Sardellen oder Fischsauce: Königsberger Klopse und das Massaman-Curry mit Rindfleisch.',
    dabei: ['wiener-schnitzel', 'tiramisu', 'knoblauchgarnelen'],
    nichtDabei: ['koenigsberger-klopse', 'massaman-curry-mit-rindfleisch'],
  },
  '/rezepte/ohne-erdnuesse/': {
    text: 'Ohne Erdnüsse als Zutat laut Zutatenliste sind fast alle Rezepte dieser Website, darunter Hummus, Bibimbap und Baklava mit Pistazien. Erdnüsse sind in FoodAsu ein eigener Eintrag neben den Nüssen (Schalenfrüchten). Bei Schokolade kommt es auf das Produkt an; deshalb steht die Sachertorte unter „Je nach Produkt“.',
    dabei: ['hummus', 'bibimbap', 'baklava'],
    jeNach: ['sachertorte'],
  },
  '/rezepte/ohne-soja/': {
    text: 'Ohne Soja als Zutat laut Zutatenliste sind hier vor allem Gerichte aus frischen Zutaten: Ratatouille, Guacamole, Moussaka oder Kaiserschmarren. Bei Brühe, Brot, Schokolade und fertigem Teig kommt es auf das Produkt an. Deshalb stehen viele Rezepte unter „Je nach Produkt“, zum Beispiel Wiener Schnitzel und Tiramisu.',
    dabei: ['ratatouille', 'guacamole', 'moussaka', 'kaiserschmarren'],
    jeNach: ['wiener-schnitzel', 'tiramisu'],
  },
  '/rezepte/ohne-milch/': {
    text: 'Ohne Milch als Zutat laut Zutatenliste heißt hier auch: ohne Butter, Sahne, Joghurt und Käse. Dazu gehören Bibimbap, Gulyás, Hummus, Lahmacun und das Massaman-Curry mit Rindfleisch, das mit Kokosmilch gekocht wird. Bei Brühe, Brot und Butterschmalz kommt es auf das Produkt an.',
    dabei: ['bibimbap', 'gulyas', 'hummus', 'lahmacun', 'massaman-curry-mit-rindfleisch'],
  },
  '/rezepte/ohne-nuesse/': {
    text: 'Ohne Nüsse als Zutat laut Zutatenliste: In der App heißt der Eintrag Schalenfrüchte und meint zum Beispiel Mandeln, Haselnüsse, Walnüsse und Pistazien. Erdnüsse sind ein eigener Eintrag; deshalb steht das Massaman-Curry mit Rindfleisch, in dem Erdnüsse sind, auf dieser Seite. Bei Schokolade, Brot und Gewürzmischungen kommt es auf das Produkt an.',
    dabei: ['massaman-curry-mit-rindfleisch'],
  },
  '/rezepte/ohne-sesam/': {
    text: 'Ohne Sesam als Zutat laut Zutatenliste sind die meisten Rezepte hier, von Dal Tadka bis Tiramisu. Es fehlen Hummus, in dem Tahin aus Sesam steckt, und Bibimbap mit Sesam und Sesamöl. Bei Brot, Brötchen und fertigem Teig kommt es auf das Produkt an.',
    dabei: ['dal-tadka', 'tiramisu'],
    nichtDabei: ['hummus', 'bibimbap'],
  },
  '/rezepte/ohne-schweinefleisch/': {
    text: 'Ohne Schweinefleisch als Zutat laut Zutatenliste: Dazu gehören hier Gerichte mit Rind, Kalb, Lamm und Huhn wie Lahmacun, Moussaka, Butter Chicken und Zürcher Geschnetzeltes, dazu die Rezepte ohne Fleisch. Es fehlen die Gerichte mit Speck, Pancetta, Guanciale oder Schweineschulter, zum Beispiel Quiche lorraine und Spaghetti carbonara. Bei Hackfleisch und Gelatine kommt es auf das Produkt an.',
    dabei: ['lahmacun', 'moussaka', 'butter-chicken', 'zuercher-geschnetzeltes'],
    nichtDabei: ['quiche-lorraine', 'spaghetti-carbonara'],
  },
  '/rezepte/ohne-alkohol/': {
    text: 'Ohne Alkohol als Zutat laut Zutatenliste sind die meisten Rezepte hier, auch Süßes wie Sachertorte, Kaiserschmarren und Baklava. Es fehlen die Gerichte, bei denen Wein, Marsala oder Kirschwasser in der Zutatenliste steht, zum Beispiel Tiramisu, Moussaka und Schwarzwälder Kirschtorte.',
    dabei: ['sachertorte', 'kaiserschmarren', 'baklava'],
    nichtDabei: ['tiramisu', 'moussaka', 'schwarzwaelder-kirschtorte'],
  },
  '/rezepte/ohne-gelatine/': {
    text: 'Ohne Gelatine als Zutat laut Zutatenliste sind fast alle Rezepte dieser Website, von Tiramisu bis Sachertorte. Gelatine steht hier nur bei der Schwarzwälder Kirschtorte in der Zutatenliste. Ob in einem Produkt aus dem Laden Gelatine ist, steht auf der Packung.',
    dabei: ['tiramisu', 'sachertorte'],
    nichtDabei: ['schwarzwaelder-kirschtorte'],
  },
  '/rezepte/vegetarisch/': {
    text: 'Vegetarisch laut Zutatenliste sind hier Hauptgerichte wie Dal Tadka, Ratatouille und Tortilla española, dazu Spätzle, Kaiserschmarren und Sachertorte. Bei Käse und Brühe kommt es auf das Produkt an, zum Beispiel beim Mozzarella der Pizza Margherita; solche Rezepte stehen unten unter „Je nach Produkt“.',
    dabei: ['dal-tadka', 'ratatouille', 'tortilla-espanola', 'spaetzle', 'kaiserschmarren', 'sachertorte'],
    jeNach: ['pizza-margherita'],
  },
  '/rezepte/land/deutschland/': {
    text: 'Aus Deutschland stehen hier Königsberger Klopse, Schwäbischer Kartoffelsalat, Spätzle und Schwarzwälder Kirschtorte. Apfelstrudel und Kaiserschmarren sind auch dabei: In den Daten gehören sie zu mehreren Ländern. Bei jeder Zutat steht, ob es dazu einen Hinweis gibt.',
    dabei: ['koenigsberger-klopse', 'schwaebischer-kartoffelsalat', 'spaetzle', 'schwarzwaelder-kirschtorte', 'apfelstrudel', 'kaiserschmarren'],
  },
  '/rezepte/land/oesterreich/': {
    text: 'Aus Österreich stehen hier Wiener Schnitzel, Alt-Wiener Erdäpfelsalat, Kaiserschmarren, Apfelstrudel und Sachertorte. Spätzle sind auch dabei: In den Daten gehören sie zu Deutschland, Österreich und der Schweiz. Jedes Rezept nennt Zutaten, Zubereitung und Nährwerte.',
    dabei: ['wiener-schnitzel', 'alt-wiener-erdaepfelsalat', 'kaiserschmarren', 'apfelstrudel', 'sachertorte', 'spaetzle'],
  },
  '/rezepte/land/italien/': {
    text: 'Aus Italien stehen hier Pizza Margherita, Spaghetti carbonara, Lasagne alla bolognese, Insalata caprese und Tiramisu. Der Apfelstrudel ist auch dabei: In den Daten gehört er zu Österreich, Deutschland und Italien.',
    dabei: ['pizza-margherita', 'spaghetti-carbonara', 'lasagne-alla-bolognese', 'insalata-caprese', 'tiramisu', 'apfelstrudel'],
  },
  '/rezepte/kategorie/hauptgericht/': {
    text: 'Hauptgerichte aus vielen Küchen: vom Wiener Schnitzel über Paella valenciana und Moussaka bis zu Bibimbap und Butter Chicken. Vegetarisch laut Zutatenliste sind davon Dal Tadka, Ratatouille und Tortilla española.',
    dabei: ['wiener-schnitzel', 'paella-valenciana', 'moussaka', 'bibimbap', 'butter-chicken', 'dal-tadka', 'ratatouille', 'tortilla-espanola'],
    vegetarisch: ['dal-tadka', 'ratatouille', 'tortilla-espanola'],
  },
};
