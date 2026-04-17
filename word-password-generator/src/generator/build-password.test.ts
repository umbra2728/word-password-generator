import assert from "node:assert/strict";
import test from "node:test";

import { buildPassword } from "./build-password";
import { type GeneratorConfig } from "./types";

const baseConfig: GeneratorConfig = {
  generationMode: "structure",
  wordCount: 3,
  separator: "",
  caseMode: "lowercase",
  leetMode: false,
  wordLengthProfile: "mixed",
  targetLength: null,
  appendDigits: false,
  digitCount: 2,
  appendSymbol: false,
  specialSymbol: "!",
  easyToType: false,
  avoidAwkwardClusters: false,
  maxAttempts: 500,
};

function sequenceRandom(values: number[]) {
  let index = 0;
  return (maximum: number) => {
    const value = values[index] ?? 0;
    index += 1;
    return value % maximum;
  };
}

test("buildPassword picks unique words in structure mode", () => {
  const result = buildPassword(baseConfig, sequenceRandom([0, 1, 2]));
  assert.equal(result.words.length, 3);
  assert.equal(new Set(result.words).size, 3);
  assert.equal(result.length, result.password.length);
});

test("structure mode applies separator, case, leet, digits, and symbol", () => {
  const result = buildPassword(
    {
      ...baseConfig,
      separator: "-",
      caseMode: "uppercase",
      leetMode: true,
      appendDigits: true,
      appendSymbol: true,
    },
    sequenceRandom([0, 1, 2, 4, 5]),
  );

  assert.match(result.password, /^[A-Z0-9-]+[0-9]{2}!$/);
  assert.equal(result.length, result.password.length);
});

test("target length mode preserves the requested separator and exact total length", () => {
  const result = buildPassword(
    {
      ...baseConfig,
      generationMode: "targetLength",
      wordCount: 2,
      separator: "-",
      appendDigits: true,
      digitCount: 2,
      targetLength: 14,
    },
    sequenceRandom([0, 0, 0, 1, 1, 1]),
  );

  assert.equal(result.password.length, 14);
  assert.equal(result.password.includes("-"), true);
  assert.match(result.password, /[0-9]{2}$/);
});

test("target length mode fails clearly when no exact match exists", () => {
  assert.throws(
    () =>
      buildPassword(
        {
          ...baseConfig,
          generationMode: "targetLength",
          wordCount: 3,
          separator: "-",
          wordLengthProfile: "long",
          appendDigits: false,
          appendSymbol: false,
          targetLength: 10,
        },
        sequenceRandom([0]),
      ),
    /No exact-length password found for the current settings/,
  );
});
