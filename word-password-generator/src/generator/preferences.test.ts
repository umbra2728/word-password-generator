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
    /Target length must be at least 15 characters for the current settings/,
  );
});

test("parsePreferences rejects malformed numeric strings", () => {
  assert.throws(
    () =>
      parsePreferences({
        ...structurePrefs,
        wordCount: "3abc",
      }),
    /Word count must be a positive integer/,
  );

  assert.throws(
    () =>
      parsePreferences({
        ...structurePrefs,
        digitCount: "2abc",
      }),
    /Digit count must be a positive integer/,
  );

  assert.throws(
    () =>
      parsePreferences({
        ...structurePrefs,
        generationMode: "targetLength",
        targetLength: "16abc",
      }),
    /Target length must be a positive integer/,
  );
});

test("parsePreferences ignores malformed target length text in structure mode", () => {
  assert.deepEqual(
    parsePreferences({
      ...structurePrefs,
      targetLength: "abc",
    }),
    {
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
    },
  );
});

test("parsePreferences accepts any positive word count", () => {
  assert.equal(
    parsePreferences({
      ...structurePrefs,
      wordCount: "7",
    }).wordCount,
    7,
  );
});

test("parsePreferences accepts non-negative digit counts", () => {
  assert.equal(
    parsePreferences({
      ...structurePrefs,
      digitCount: "0",
    }).digitCount,
    0,
  );

  assert.equal(
    parsePreferences({
      ...structurePrefs,
      digitCount: "12",
    }).digitCount,
    12,
  );
});

test("parsePreferences rejects special symbols outside the manifest domain", () => {
  assert.throws(
    () =>
      parsePreferences({
        ...structurePrefs,
        specialSymbol: "%",
      }),
    /Special symbol must be one of: !, @, #, \$/,
  );
});
