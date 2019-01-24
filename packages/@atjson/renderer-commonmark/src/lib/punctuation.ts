/**
 * See https://spec.commonmark.org/0.28/#punctuation-character
 * In Markdown, a punctuation character is an ASCII punctuation character
 * or anything in the Unicode categories Pc, Pd, Pe, Pf, Pi, Po, or Ps
 * NOTE: the union of those categories is NOT the same as the unicode block
 * General Punctuation.
 * See https://http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
 *
 * ES9 provides out-of-the-box support for these unicode categories
 * via Unicode Property Escapes: https://github.com/tc39/proposal-regexp-unicode-property-escapes
 * and once that is more widely supported this file can be removed.
 *  */

export const ASCII_PUNCTUATION = /[!-\/:-@\[-`{-~]/;

// ES9: /\p{Pc}/
export const UNICODE_CONNECTOR_PUNCTUATION = /\u005f\u203f\u2040\u2054\ufe33\ufe34\ufe4d-\ufe4f\uff3f/u;

// ES9: /\p{Pd}/
export const UNICODE_DASH_PUNCTUATION = /\u002d\u058a\u05be\u1400\u1806\u2010-\u2015\u2e17\u2e1a\u301c\u3030\u30a0\ufe31\ufe32\ufe58\ufe63\uff0d/u;

// ES9: /\p{Pe}/
export const UNICODE_CLOSE_PUNCTUATION = /\u0029\u005d\u007d\u0f3b\u0f3d\u169c\u2046\u207e\u208e\u232a\u2769\u276b\u276d\u276f\u2771\u2773\u2775\u27c6\u27e7\u27e9\u27eb\u27ed\u27ef\u2984\u2986\u2988\u298a\u298c\u298e\u2990\u2992\u2994\u2996\u2998\u29d9\u29db\u29fd\u2e23\u2e25\u2e27\u2e29\u3009\u300b\u300d\u300f\u3011\u3015\u3017\u3019\u301b\u301e\u301f\ufd3f\ufe18\ufe36\ufe38\ufe3a\ufe3c\ufe3e\ufe40\ufe42\ufe44\ufe48\ufe5a\ufe5c\ufe5e\uff09\uff3d\uff5d\uff60\uff63/u;

// ES9: /\p{Pf}/
export const UNICODE_FINAL_PUNCTUATION = /\u00bb\u2019\u201d\u203a\u2e03\u2e05\u2e0a\u2e0d\u2e1d\u2e21/u;

// ES9: /\p{Pi}/
export const UNICODE_INITIAL_PUNCTUATION = /\u00ab\u2018\u201b\u201c\u201f\u2039\u2e02\u2e04\u2e09\u2e0c\u2e1c\u2e20/u;

// ES9: /\p{Po}/
export const UNICODE_OTHER_PUNCTUATION = /\u0021-\u0023\u0025-\u0027\u002a\u002c\u002e\u002f\u003a\u003b\u003f\u0040\u005c\u00a1\u00b7\u00bf\u037e\u0387\u055a-\u055f\u0589\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1361-\u1368\u166d\u166e\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u1805\u1807-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cd3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203b-\u203e\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205e\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00\u2e01\u2e06-\u2e08\u2e0b\u2e0e-\u2e16\u2e18\u2e19\u2e1b\u2e1e\u2e1f\u2e2a-\u2e2e\u2e30\u2e31\u3001-\u3003\u303d\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uabeb\ufe10-\ufe16\ufe19\ufe30\ufe45\ufe46\ufe49-\ufe4c\ufe50-\ufe52\ufe54-\ufe57\ufe5f-\ufe61\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff07\uff0a\uff0c\uff0e\uff0f\uff1a\uff1b\uff1f\uff20\uff3c\uff61\uff64\uff65/u;

// ES9: /\p{Ps}/
export const UNICODE_OPEN_PUNCTUATION = /\u0028\u005b\u007b\u0f3a\u0f3c\u169b\u201a\u201e\u2045\u207d\u208d\u2329\u2768\u276a\u276c\u276e\u2770\u2772\u2774\u27c5\u27e6\u27e8\u27ea\u27ec\u27ee\u2983\u2985\u2987\u2989\u298b\u298d\u298f\u2991\u2993\u2995\u2997\u29d8\u29da\u29fc\u2e22\u2e24\u2e26\u2e28\u3008\u300a\u300c\u300e\u3010\u3014\u3016\u3018\u301a\u301d\ufd3e\ufe17\ufe35\ufe37\ufe39\ufe3b\ufe3d\ufe3f\ufe41\ufe43\ufe47\ufe59\ufe5b\ufe5d\uff08\uff3b\uff5b\uff5f\uff62/u;

// ES9: /\p{P}/
export const UNICODE_PUNCTUATION = new RegExp(`[${[
  UNICODE_CONNECTOR_PUNCTUATION,
  UNICODE_DASH_PUNCTUATION,
  UNICODE_CLOSE_PUNCTUATION,
  UNICODE_FINAL_PUNCTUATION,
  UNICODE_INITIAL_PUNCTUATION,
  UNICODE_OTHER_PUNCTUATION,
  UNICODE_OPEN_PUNCTUATION
].map(regex => regex.source).join('')}]`, 'u');

// Whitespace or (possibly escaped) Ascii punctuation or Unicode punctuation
export const WHITESPACE_PUNCTUATION = new RegExp(`((\\s|&nbsp;){1}|(\\\\?${ASCII_PUNCTUATION.source}|${UNICODE_PUNCTUATION.source}))`);
export const BEGINNING_WHITESPACE_PUNCTUATION = new RegExp(`^${WHITESPACE_PUNCTUATION.source}`);
export const ENDING_WHITESPACE_PUNCTUATION = new RegExp(`${WHITESPACE_PUNCTUATION.source}$`);
