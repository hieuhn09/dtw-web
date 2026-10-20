import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXCLUSIVE_BAND_SIZE,
  EXCLUSIVE_DEFINITION_HREF,
  EXCLUSIVE_FEED_PATH,
  EXCLUSIVE_PAGE_SIZE,
  classifyExclusivePage,
  exclusiveFeedChannel,
  exclusivePageCount,
  exclusivePagePath,
  exclusiveQuery,
  parseExclusivePage,
  pickBandArticles,
  shouldShowExclusiveChip,
} from "./exclusive";
import { buildAtomFeed } from "./feed";
import type { FeedArticle } from "./cms-client";

test("T-QUERY: should build exclusive query {flag:exclusive, content_type:article, sort:-publishedAt, page, limit}", () => {
  assert.deepEqual(exclusiveQuery(2, 12), {
    flag: "exclusive",
    content_type: "article",
    sort: "-publishedAt",
    page: 2,
    limit: 12,
  });
});

test("T-PAGE-PARSE: should accept 1,2,10 and reject 0,02,-1,1.5,abc,empty,9007199254740993", () => {
  assert.equal(parseExclusivePage("1"), 1);
  assert.equal(parseExclusivePage("2"), 2);
  assert.equal(parseExclusivePage("10"), 10);
  for (const bad of ["0", "02", "-1", "1.5", "abc", "", "9007199254740993", "+2", " 2"]) {
    assert.equal(parseExclusivePage(bad), null, bad);
  }
});

test("T-PAGE-PATH: should map page<=1 to /exclusive and page n to /exclusive/page/n", () => {
  assert.equal(exclusivePagePath(1), "/exclusive");
  assert.equal(exclusivePagePath(0), "/exclusive");
  assert.equal(exclusivePagePath(2), "/exclusive/page/2");
});

test("T-PAGE-COUNT: should return at least 1 page and ceil(totalDocs/size) otherwise", () => {
  assert.equal(exclusivePageCount(0, 12), 1);
  assert.equal(exclusivePageCount(12, 12), 1);
  assert.equal(exclusivePageCount(13, 12), 2);
  assert.equal(exclusivePageCount(25, 12), 3);
});

test("T-PAGE-CLASSIFY: should classify page 1 empty as ok and page 2 empty or past-the-end as not-found", () => {
  assert.equal(classifyExclusivePage({ page: 1, totalDocs: 0, docCount: 0 }), "ok");
  assert.equal(classifyExclusivePage({ page: 2, totalDocs: 0, docCount: 0 }), "not-found");
  assert.equal(classifyExclusivePage({ page: 3, totalDocs: 25, docCount: 1 }), "ok");
  assert.equal(classifyExclusivePage({ page: 4, totalDocs: 25, docCount: 1 }), "not-found");
});

test("T-BAND-PICK: should drop the hero lead, return the first 3, tolerate short or empty input, not mutate input", () => {
  const four = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  const snapshot = JSON.stringify(four);
  assert.deepEqual(pickBandArticles(four, 1, 3).map((a) => a.id), [2, 3, 4]);
  assert.deepEqual(pickBandArticles(four, 99, 3).map((a) => a.id), [1, 2, 3]);
  assert.deepEqual(pickBandArticles(four, null, 3).map((a) => a.id), [1, 2, 3]);
  assert.deepEqual(pickBandArticles([{ id: 1 }, { id: 2 }], 1, 3).map((a) => a.id), [2]);
  assert.deepEqual(pickBandArticles([], 1, 3), []);
  assert.equal(JSON.stringify(four), snapshot);
});

test("T-CHIP-ELIGIBLE / T-CHIP-SPONSORED: should show the chip for flagged articles only, never on /exclusive, and also when sponsored", () => {
  assert.equal(shouldShowExclusiveChip({ exclusive: true }), true);
  assert.equal(shouldShowExclusiveChip({ exclusive: false }), false);
  assert.equal(shouldShowExclusiveChip({ exclusive: null }), false);
  assert.equal(shouldShowExclusiveChip({}), false);
  assert.equal(shouldShowExclusiveChip({ exclusive: true }, { onExclusivePage: true }), false);
  const sponsored: { exclusive: boolean; sponsored: boolean } = { exclusive: true, sponsored: true };
  assert.equal(shouldShowExclusiveChip(sponsored), true);
});

test("T-CONSTANTS / T-FEED-CHANNEL: should expose page size 12, band size 3, definition href /trust/editorial#exclusive, feed path /exclusive/rss.xml", () => {
  assert.equal(EXCLUSIVE_PAGE_SIZE, 12);
  assert.equal(EXCLUSIVE_BAND_SIZE, 3);
  assert.equal(EXCLUSIVE_DEFINITION_HREF, "/trust/editorial#exclusive");
  assert.equal(EXCLUSIVE_FEED_PATH, "/exclusive/rss.xml");
  const ch = exclusiveFeedChannel("https://www.opentechwire.com");
  assert.equal(ch.feedPath, "/exclusive/rss.xml");
  assert.equal(ch.sitePath, "/exclusive");
  assert.equal(ch.origin, "https://www.opentechwire.com");
});

test("T-FEED-BUILD: should build a well-formed Atom feed (empty and 2 entries, order kept, no PascalCase brand)", () => {
  const ch = exclusiveFeedChannel("https://www.opentechwire.com");
  const empty = buildAtomFeed(ch, []);
  assert.match(empty, /^<\?xml version="1.0" encoding="utf-8"\?>/);
  assert.ok(
    empty.includes('<link rel="self" type="application/atom+xml" href="https://www.opentechwire.com/exclusive/rss.xml"/>')
  );
  assert.ok(empty.trimEnd().endsWith("</feed>"));
  const mk = (id: number, slug: string, publishedAt: string) =>
    ({ id, slug, title: `T${id}`, dek: "d", publishedAt, updatedAt: publishedAt, author: null, pillar: null, sponsored: false }) as unknown as FeedArticle;
  const xml = buildAtomFeed(ch, [mk(2, "newer", "2026-10-02T00:00:00Z"), mk(1, "older", "2026-10-01T00:00:00Z")]);
  assert.equal((xml.match(/<entry>/g) ?? []).length, 2);
  assert.ok(xml.indexOf("/article/newer") < xml.indexOf("/article/older"));
  // Forbidden casing (invariant #15), built at runtime so a repo-wide grep for
  // the bad spelling stays a clean gate.
  assert.ok(!xml.includes(["Open", "Tech", "Wire"].join("")));
  assert.equal((xml.match(/<entry>/g) ?? []).length, (xml.match(/<\/entry>/g) ?? []).length);
});
