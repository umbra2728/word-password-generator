import assert from "node:assert/strict";
import test from "node:test";

import { parsePreferences, type RawPreferences } from "./preferences";

const structurePrefs: RawPreferences = {
  generationMode: "structure",
  wordCount: "3",
  separator: "-",
  caseMode: "capitalized",
  leetMode: false,
  wordLengthProfile: "medium",
  targetLength: "16",
  appendDigits: true,
  digitCount: "2",
  appendSymbol: false,
  specialSymbol: "!",
  easyToType: true,
  avoidAwkwardClusters: true,
};

test("parsePreferences normalizes structure mode", () => {
  assert.deepEqual(parsePreferences(structurePrefs), {
    generationMode: "structure",
    wordCount: 3,
    separator: "-",
    caseMode: "capitalized",
    leetMode: false,
    wordLengthProfile: "medium",
    targetLength: null,
    appendDigits: true,
    digitCount: 2,
    appendSymbol: false,
    specialSymbol: "!",
    easyToType: true,
    avoidAwkwardClusters: true,
    maxAttempts: 500,
  });
});

test("parsePreferences rejects impossible target length floors", () => {
  assert.throws(
    () =>
      parsePreferences({
        ...structurePrefs,
        generationMode: "targetLength",
        wordCount: "2",
        wordLengthProfile: "long",
        appendDigits: false,
        appendSymbol: false,
        targetLength: "10",
      }),
    /Target length must be at least 14 characters for the current settings/,
  );
});
