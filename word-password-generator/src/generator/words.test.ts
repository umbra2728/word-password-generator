import assert from "node:assert/strict";
import test from "node:test";

import { getWordsForProfile, indexWordsByLength, wordlist } from "./words";

test("wordlist stays normalized and large enough", () => {
  assert.ok(wordlist.length >= 4000);
  assert.ok(wordlist.every((word) => /^[a-z]+$/.test(word)));
  assert.ok(wordlist.every((word) => word.length >= 3 && word.length <= 8));
});

test("medium profile returns only 5-6 letter words", () => {
  const medium = getWordsForProfile("medium");
  assert.ok(medium.length > 0);
  assert.ok(medium.every((word) => word.length >= 5 && word.length <= 6));
});

test("length index exposes buckets from 3 through 8", () => {
  const index = indexWordsByLength(getWordsForProfile("mixed"));
  assert.deepEqual([...index.keys()], [3, 4, 5, 6, 7, 8]);
});
