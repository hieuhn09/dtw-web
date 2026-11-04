import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DISTRIBUTED_AUTHOR,
  SINGLE_HOME_PILLAR_SLUGS,
  cardByline,
  firstNonSingleHome,
  isDistributedPillar,
  isSingleHomeDoc,
  isSingleHomePillar,
  pressroomLabel,
  toPillarId,
  withoutSingleHome,
  withoutSingleHomeViews,
} from "./single-home-pillars";

test("should treat exactly 'pressroom' as single-home", () => {
  assert.deepEqual([...SINGLE_HOME_PILLAR_SLUGS], ["pressroom"]);
  assert.equal(isSingleHomePillar("pressroom"), true);
  for (const s of ["Pressroom", " pressroom ", "press", "press-room", "", "latest", undefined, null]) {
    assert.equal(isSingleHomePillar(s), false, String(s));
  }
  assert.equal(isDistributedPillar("pressroom"), true);
  assert.equal(isDistributedPillar("ai"), false);
  assert.equal(isDistributedPillar(null), false);
});

test("should classify raw docs by populated pillar slug and keep bare ids", () => {
  assert.equal(isSingleHomeDoc({ pillar: { slug: "pressroom" } }), true);
  assert.equal(isSingleHomeDoc({ pillar: { slug: "ai" } }), false);
  assert.equal(isSingleHomeDoc({ pillar: 7 }), false);
  assert.equal(isSingleHomeDoc({ pillar: null }), false);
  assert.equal(isSingleHomeDoc({}), false);
});

test("should filter single-home docs and views from aggregates, preserving order", () => {
  const docs = [
    { id: 1, pillar: { slug: "ai" } },
    { id: 2, pillar: { slug: "pressroom" } },
    { id: 3, pillar: 9 },
    { id: 4, pillar: { slug: "latest" } },
  ];
  assert.deepEqual(withoutSingleHome(docs).map((d) => d.id), [1, 3, 4]);
  assert.deepEqual(withoutSingleHome([]), []);
  const views = [
    { id: "a", pillar: "pressroom" },
    { id: "b", pillar: "dev" },
  ];
  assert.deepEqual(withoutSingleHomeViews(views).map((v) => v.id), ["b"]);
});

test("should pick the first non-single-home doc for pinned Latest", () => {
  assert.equal(
    firstNonSingleHome([{ id: 1, pillar: { slug: "pressroom" } }, { id: 2, pillar: { slug: "ai" } }])?.id,
    2,
  );
  assert.equal(firstNonSingleHome([{ id: 1, pillar: { slug: "pressroom" } }]), null);
  assert.equal(firstNonSingleHome([]), null);
});

test("should show no author segment on distributed cards", () => {
  assert.equal(cardByline({ author: "Mei Lin", distributed: false }), "Mei Lin");
  assert.equal(cardByline({ author: "Mei Lin" }), "Mei Lin");
  assert.equal(cardByline({ author: DISTRIBUTED_AUTHOR, distributed: true }), null);
  assert.equal(DISTRIBUTED_AUTHOR, "Opentechwire");
});

test("should label a pressroom article Pressroom in en/vi/id and never fall back to latest", () => {
  assert.equal(toPillarId("pressroom"), "pressroom");
  assert.equal(toPillarId("ai"), "ai");
  assert.equal(toPillarId("asia"), "latest");
  assert.equal(toPillarId(undefined), "latest");
  assert.equal(toPillarId("Pressroom"), "latest");
  assert.equal(pressroomLabel("en"), "Pressroom");
  assert.equal(pressroomLabel("vi"), "Phòng báo chí");
  assert.equal(pressroomLabel("id"), "Ruang Pers");
});
