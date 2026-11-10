// Kennungen der Browser für die Prüfungen der Store-Knöpfe (AP-124): tools/store_knoepfe_pruefen.mjs (Node) und
// tools/store_knoepfe_browser.mjs (Chrome).
// Stand November 2026.
export const KENNUNGEN = {
  'Android Chrome': { userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', maxTouchPoints: 5 },
  'Android eingebaut (WebView)': { userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S921B Build/AP3A.240905.015; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.0;]', maxTouchPoints: 5 },
  'iPhone Safari': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1', maxTouchPoints: 5 },
  'iPhone eingebaut': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0.0', maxTouchPoints: 5 },
  'iPad Desktop-Kennung': { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', maxTouchPoints: 5 },
  Computer: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', maxTouchPoints: 0 },
};
