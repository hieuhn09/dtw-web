// Unit tests for the sign-up abuse guards in front of Better-Auth.
// Run: npm run test:signup-guard  (Node's built-in node:test via tsx)
//
// Same asymmetry as bot-detect: a real reader wrongly refused is a lost signup,
// so every REAL fixture must stay allowed; a failing real fixture means the
// RULE is wrong — never weaken the fixture.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canonicalEmail,
  checkFormSignals,
  gmailCanonicalLocal,
  looksLikeDottedGmailBot,
  MIN_FORM_FILL_MS,
  SIGNUP_HEADERS,
} from "./signup-guard";

// Addresses from the Aug–Oct 2026 sign-up wave.
const BOTS = [
  "u.ho.cu.t.o.g7.65@gmail.com",
  "e.l.i.qedij4.10@gmail.com",
  "bac.ox.o.t.oyib.a.6.0@gmail.com",
  "za.wu.m.ece0.3.6@gmail.com",
  "v.i.rgi.es.pi.12@gmail.com",
  "r.ob.e.rt.p.a.bon3@gmail.com",
  "y.o.poki.xak.id.o.87@gmail.com",
  "n.i.co.la.s.d.ust.in@gmail.com",
  "lutzt.e.r.e.ns.3.9@googlemail.com",
  "m.c.o.x.3.472.5@gmail.com",
];

const REAL = [
  "danielaatrian@gmail.com",
  "arch.nhungpham@gmail.com",
  "rathip.3434@gmail.com",
  "john.r.smith@gmail.com", // 2 dots
  "a.b.c.d@gmail.com", // exactly 3 dots — the limit
  "someone@studio.com",
  "first.m.i.last.x.y@company.co", // many dots, not Gmail
];

test("dotted-Gmail bot addresses are flagged", () => {
  for (const email of BOTS) assert.equal(looksLikeDottedGmailBot(email), true, email);
});

test("real addresses are never flagged", () => {
  for (const email of REAL) assert.equal(looksLikeDottedGmailBot(email), false, email);
});

test("Gmail canonicalisation ignores dots, +tag, case and googlemail", () => {
  assert.equal(canonicalEmail("A.B.C+news@Gmail.com"), "abc@gmail.com");
  assert.equal(canonicalEmail("abc@googlemail.com"), "abc@gmail.com");
  assert.equal(gmailCanonicalLocal("a.b.c+x@gmail.com"), "abc");
  assert.equal(gmailCanonicalLocal("x@studio.com"), null);
  // Non-Gmail providers keep their dots.
  assert.equal(canonicalEmail("A.B@Studio.com"), "a.b@studio.com");
});

const h = (init: Record<string, string>) => new Headers(init);

test("form signals: missing headers are refused (direct API call)", () => {
  assert.deepEqual(checkFormSignals(undefined), { ok: false, reason: "missing" });
  assert.deepEqual(checkFormSignals(h({})), { ok: false, reason: "missing" });
  assert.deepEqual(checkFormSignals(h({ [SIGNUP_HEADERS.elapsed]: "abc" })), { ok: false, reason: "missing" });
});

test("form signals: too fast and filled honeypot are refused", () => {
  assert.deepEqual(
    checkFormSignals(h({ [SIGNUP_HEADERS.elapsed]: String(MIN_FORM_FILL_MS - 1) })),
    { ok: false, reason: "too-fast" }
  );
  assert.deepEqual(
    checkFormSignals(h({ [SIGNUP_HEADERS.elapsed]: "9000", [SIGNUP_HEADERS.honeypot]: "spam" })),
    { ok: false, reason: "honeypot" }
  );
});

test("form signals: a human-paced submit with an empty honeypot passes", () => {
  assert.deepEqual(checkFormSignals(h({ [SIGNUP_HEADERS.elapsed]: "9000" })), { ok: true });
  assert.deepEqual(
    checkFormSignals(h({ [SIGNUP_HEADERS.elapsed]: String(MIN_FORM_FILL_MS), [SIGNUP_HEADERS.honeypot]: "" })),
    { ok: true }
  );
});
