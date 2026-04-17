import assert from "node:assert/strict";
import test from "node:test";

import { hasAwkwardJoin, passesQualityFilters } from "./filters";
import { appendOptionalSuffixes, applyCase, applyLeet, joinWords } from "./transforms";

test("applyCase capitalizes every chosen word", () => {
  assert.deepEqual(applyCase(["river", "stone"], "capitalized"), ["River", "Stone"]);
});

test("applyLeet uses deterministic replacements", () => {
  assert.equal(applyLeet("toast"), "70457");
});

test("appendOptionalSuffixes appends digits before symbol", () => {
  const randomInt = () => 4;
  assert.equal(
    appendOptionalSuffixes(
      "riverstone",
      { appendDigits: true, digitCount: 2, appendSymbol: true, specialSymbol: "!" },
      randomInt,
    ),
    "riverstone44!",
  );
});

test("hasAwkwardJoin detects hard consonant clusters", () => {
  assert.equal(hasAwkwardJoin(["mask", "troll"], ""), true);
  assert.equal(hasAwkwardJoin(["river", "stone"], ""), false);
});

test("passesQualityFilters respects both switches", () => {
  assert.equal(passesQualityFilters(["mask", "troll"], "", { easyToType: false, avoidAwkwardClusters: true }), false);
  assert.equal(passesQualityFilters(["river", "stone"], "", { easyToType: true, avoidAwkwardClusters: true }), true);
});

test("joinWords uses the configured separator", () => {
  assert.equal(joinWords(["river", "stone"], "-"), "river-stone");
});
