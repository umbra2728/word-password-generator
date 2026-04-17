import crypto from "node:crypto";

import { passesQualityFilters } from "./filters";
import { appendOptionalSuffixes, applyCase, applyLeet, joinWords } from "./transforms";
import { type BuildPasswordResult, type GeneratorConfig } from "./types";
import { getWordsForProfile, indexWordsByLength } from "./words";

export function buildPassword(
  config: GeneratorConfig,
  randomInt: (maximum: number) => number = crypto.randomInt,
): BuildPasswordResult {
  if (config.generationMode === "targetLength") {
    return buildTargetLengthPassword(config, randomInt);
  }

  const candidatePool = getWordsForProfile(config.wordLengthProfile);

  for (let attempt = 0; attempt < config.maxAttempts; attempt += 1) {
    const words = pickUniqueWords(candidatePool, config.wordCount, randomInt);
    if (!passesQualityFilters(words, config.separator, config)) continue;

    return finalize(words, config, randomInt);
  }

  throw new Error("Could not build a password with the current settings");
}

function pickUniqueWords(pool: string[], count: number, randomInt: (maximum: number) => number): string[] {
  if (pool.length < count) {
    throw new Error("Not enough candidate words to satisfy the current settings");
  }

  const chosen = new Set<string>();
  while (chosen.size < count) {
    chosen.add(pool[randomInt(pool.length)]);
  }
  return [...chosen];
}

function finalize(
  words: string[],
  config: GeneratorConfig,
  randomInt: (maximum: number) => number,
): BuildPasswordResult {
  const cased = applyCase(words, config.caseMode);
  const joined = joinWords(cased, config.separator);
  const transformed = config.leetMode ? applyLeet(joined) : joined;
  const password = appendOptionalSuffixes(transformed, config, randomInt);

  return {
    password,
    length: password.length,
    words,
  };
}

function buildTargetLengthPassword(
  config: GeneratorConfig,
  randomInt: (maximum: number) => number,
): BuildPasswordResult {
  const targetLength = config.targetLength;
  if (targetLength === null) {
    throw new Error("Target length is required in Target Length mode");
  }

  const candidatePool = getWordsForProfile(config.wordLengthProfile);
  const fixedSuffixLength =
    config.separator.length * Math.max(config.wordCount - 1, 0) +
    (config.appendDigits ? config.digitCount : 0) +
    (config.appendSymbol ? 1 : 0);
  const targetWordLength = targetLength - fixedSuffixLength;

  if (targetWordLength <= 0) {
    throw new Error("Target length is too short for the current settings");
  }

  const words = pickWordsWithExactTotalLength(candidatePool, config.wordCount, targetWordLength, randomInt, config);
  if (!words) {
    throw new Error("No exact-length password found for the current settings");
  }

  return finalize(words, config, randomInt);
}

function pickWordsWithExactTotalLength(
  pool: string[],
  wordCount: number,
  targetWordLength: number,
  randomInt: (maximum: number) => number,
  config: Pick<GeneratorConfig, "separator" | "easyToType" | "avoidAwkwardClusters" | "maxAttempts">,
): string[] | null {
  const buckets = indexWordsByLength(pool);
  const lengths = [...buckets.keys()];

  let attempts = 0;

  function search(remainingWords: number, remainingLength: number, used: Set<string>): string[] | null {
    attempts += 1;
    if (attempts > config.maxAttempts) return null;
    if (remainingWords === 0) return remainingLength === 0 ? [] : null;

    const candidateLengths = lengths.filter((length) => {
      const minimumRemainder = (remainingWords - 1) * lengths[0];
      const maximumRemainder = (remainingWords - 1) * lengths[lengths.length - 1];
      const nextRemainder = remainingLength - length;
      return nextRemainder >= minimumRemainder && nextRemainder <= maximumRemainder;
    });

    while (candidateLengths.length > 0) {
      const lengthIndex = randomInt(candidateLengths.length);
      const selectedLength = candidateLengths.splice(lengthIndex, 1)[0];
      const bucket = (buckets.get(selectedLength) ?? []).filter((word) => !used.has(word));

      while (bucket.length > 0) {
        const wordIndex = randomInt(bucket.length);
        const word = bucket.splice(wordIndex, 1)[0];
        used.add(word);
        const tail = search(remainingWords - 1, remainingLength - selectedLength, used);
        if (tail) {
          const words = [word, ...tail];
          if (passesQualityFilters(words, config.separator, config)) {
            return words;
          }
        }
        used.delete(word);
      }
    }

    return null;
  }

  return search(wordCount, targetWordLength, new Set());
}
