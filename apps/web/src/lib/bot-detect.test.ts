// Unit tests for the client bot gate in front of GA4.
// Run: pnpm --filter web test:bot-detect  (Node's built-in node:test via tsx)
//
// The asymmetry these fixtures encode: a real reader wrongly blocked is lost
// from analytics with no way to recover it, while a bot that slips through is
// only the status quo. So every REAL fixture must stay `block:false`, and a
// failing real fixture means the RULE is wrong — never weaken the fixture.
import { test } from "node:test";
import assert from "node:assert/strict";
import { assessClient, type ClientSignals } from "./bot-detect";

const WIN_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const brands = (chromium: number, extra?: { brand: string; version: string }) => [
  { brand: "Not)A;Brand", version: "8" },
  { brand: "Chromium", version: String(chromium) },
  extra ?? { brand: "Google Chrome", version: String(chromium) },
];

/** A healthy desktop Chrome; fixtures override only what they are about. */
const base = (over: Partial<ClientSignals> = {}): ClientSignals => ({
  ua: WIN_CHROME,
  webdriver: false,
  hasUserAgentData: true,
  brands: brands(141),
  fullVersionListLength: 3,
  screenWidth: 1920,
  screenHeight: 1080,
  languagesLength: 2,
  ...over,
});

const noUaData = (ua: string, over: Partial<ClientSignals> = {}): ClientSignals =>
  base({ ua, hasUserAgentData: false, brands: null, fullVersionListLength: null, ...over });

const REAL: Array<[string, ClientSignals]> = [
  ["Chrome Win 1920x1080", base()],
  [
    "Chrome mac 1470x956",
    base({
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      screenWidth: 1470,
      screenHeight: 956,
    }),
  ],
  [
    "Edge",
    base({
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      brands: brands(141, { brand: "Microsoft Edge", version: "141" }),
    }),
  ],
  [
    "Opera (own major differs from engine major)",
    base({
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0",
      brands: brands(140, { brand: "Opera", version: "124" }),
    }),
  ],
  [
    "Samsung Internet 384x832",
    base({
      ua: "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
      brands: brands(130, { brand: "Samsung Internet", version: "28" }),
      screenWidth: 384,
      screenHeight: 832,
    }),
  ],
  [
    "Chrome Android 412x915",
    base({
      ua: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      screenWidth: 412,
      screenHeight: 915,
    }),
  ],
  [
    "Brave (reduced fullVersionList)",
    base({ brands: brands(141, { brand: "Brave", version: "141" }), fullVersionListLength: 2 }),
  ],
  [
    "iPhone Safari",
    noUaData(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
      { screenWidth: 390, screenHeight: 844 },
    ),
  ],
  [
    "iPad Safari",
    noUaData(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
      { screenWidth: 1024, screenHeight: 1366 },
    ),
  ],
  [
    "mac Safari",
    noUaData(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
      { screenWidth: 1512, screenHeight: 982 },
    ),
  ],
  [
    "Firefox desktop",
    noUaData("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0"),
  ],
  [
    "Firefox Android",
    noUaData("Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0", {
      screenWidth: 412,
      screenHeight: 915,
    }),
  ],
  [
    "Chrome iOS (CriOS)",
    noUaData(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1",
      { screenWidth: 390, screenHeight: 844 },
    ),
  ],
  ["1280x1024 monitor", base({ screenWidth: 1280, screenHeight: 1024 })],
  ["1366x768 laptop", base({ screenWidth: 1366, screenHeight: 768 })],
  ["fullVersionList unavailable (null)", base({ fullVersionListLength: null })],
];

const SUSPECT: Array<[string, ClientSignals, string]> = [
  [
    "Android WebView (Facebook) with empty fullVersionList",
    base({
      ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.7390.97 Mobile Safari/537.36 [FBAN/EMA;FBLC/en_US;FBAV/480.0.0.0;]",
      brands: brands(141, { brand: "Android WebView", version: "141" }),
      fullVersionListLength: 0,
      screenWidth: 412,
      screenHeight: 915,
    }),
    "empty-full-version",
  ],
  [
    "Android WebView (Zalo) without userAgentData",
    noUaData(
      "Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.143 Mobile Safari/537.36 Zalo android/12100709 ZaloTheme/light",
      { screenWidth: 412, screenHeight: 915 },
    ),
    "no-ua-data",
  ],
  ["800x600 alone", base({ screenWidth: 800, screenHeight: 600 }), "default-headless-screen"],
  ["no languages alone", base({ languagesLength: 0 }), "no-languages"],
];

const BOT: Array<[string, ClientSignals, string[]]> = [
  [
    "probe A: HeadlessChrome UA + brand",
    base({
      ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36",
      brands: brands(141, { brand: "HeadlessChrome", version: "141" }),
    }),
    ["headless-ua", "headless-brand"],
  ],
  ["probe B: webdriver true", base({ webdriver: true }), ["webdriver"]],
  [
    "probe C: UA override, Chromium brand major disagrees",
    base({ ua: WIN_CHROME.replace("141.0.0.0", "120.0.0.0"), brands: brands(141) }),
    ["ua-brand-mismatch"],
  ],
  ["probe D: square 1366x1366", base({ screenWidth: 1366, screenHeight: 1366 }), ["impossible-screen"]],
  [
    "probe E: 800x600 + empty fullVersionList + no languages",
    base({ screenWidth: 800, screenHeight: 600, fullVersionListLength: 0, languagesLength: 0 }),
    [],
  ],
  [
    "Chrome 131 at 1280x1200",
    base({ ua: WIN_CHROME.replace("141.0.0.0", "131.0.0.0"), brands: brands(131), screenWidth: 1280, screenHeight: 1200 }),
    ["impossible-screen"],
  ],
  [
    "Chrome 145 at 1366x1366",
    base({ ua: WIN_CHROME.replace("141.0.0.0", "145.0.0.0"), brands: brands(145), screenWidth: 1366, screenHeight: 1366 }),
    ["impossible-screen"],
  ],
  [
    "Chrome 140 at 800x600 with empty fullVersionList",
    base({
      ua: WIN_CHROME.replace("141.0.0.0", "140.0.0.0"),
      brands: brands(140),
      screenWidth: 800,
      screenHeight: 600,
      fullVersionListLength: 0,
    }),
    [],
  ],
  [
    "Lighthouse",
    base({
      ua: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    }),
    ["headless-ua"],
  ],
];

for (const [name, s] of REAL) {
  test(`real user is never blocked: ${name}`, () => {
    const r = assessClient(s);
    assert.equal(r.block, false, `${name}: hard=${r.hard} weak=${r.weak}`);
    assert.equal(r.suspect, false, `${name}: weak=${r.weak}`);
  });
}

for (const [name, s, weak] of SUSPECT) {
  test(`single weak signal is suspect, not blocked: ${name}`, () => {
    const r = assessClient(s);
    assert.equal(r.block, false);
    assert.equal(r.suspect, true);
    assert.deepEqual(r.weak, [weak]);
  });
}

for (const [name, s, hard] of BOT) {
  test(`bot is blocked: ${name}`, () => {
    const r = assessClient(s);
    assert.equal(r.block, true, `${name}: hard=${r.hard} weak=${r.weak}`);
    for (const h of hard) assert.ok(r.hard.includes(h), `${name}: expected ${h} in ${r.hard}`);
    if (hard.length === 0) assert.ok(r.weak.length >= 2);
  });
}

test("zero signals => neither block nor suspect", () => {
  assert.deepEqual(assessClient(base()), { block: false, suspect: false, hard: [], weak: [] });
});

test("garbage input never throws and fails open", () => {
  const garbage: unknown[] = [
    base({ ua: "" }),
    base({ screenWidth: Number.NaN, screenHeight: Number.NaN }),
    base({ brands: null }),
    base({ brands: [{ brand: "Chromium", version: "abc" }] }),
    {},
    null,
    undefined,
    { ua: 42, brands: "x", screenWidth: "800" },
  ];
  for (const g of garbage) {
    const r = assessClient(g as ClientSignals);
    assert.equal(r.block, false, JSON.stringify(g));
  }
});
