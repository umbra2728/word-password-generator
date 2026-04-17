import {
  type CaseMode,
  type GenerationMode,
  type GeneratorConfig,
  type Separator,
  type WordLengthProfile,
} from "./types";

export interface RawPreferences {
  generationMode: string;
  wordCount: string;
  separator: string;
  caseMode: string;
  leetMode: boolean;
  wordLengthProfile: string;
  targetLength: string;
  appendDigits: boolean;
  digitCount: string;
  appendSymbol: boolean;
  specialSymbol: string;
  easyToType: boolean;
  avoidAwkwardClusters: boolean;
}

const maxAttempts = 500;
const allowedWordCounts = new Set([2, 3, 4, 5]);
const allowedDigitCounts = new Set([0, 1, 2, 3, 4]);
const allowedSpecialSymbols = new Set(["!", "@", "#", "$"]);
const separators = new Set<Separator>(["", "-", "_", "."]);
const caseModes = new Set<CaseMode>(["lowercase", "uppercase", "capitalized"]);
const profiles = new Set<WordLengthProfile>(["short", "medium", "long", "mixed"]);
const minimumProfileLengths: Record<WordLengthProfile, number> = {
  short: 3,
  medium: 5,
  long: 7,
  mixed: 3,
};

export function parsePreferences(raw: RawPreferences): GeneratorConfig {
  const generationMode = parseGenerationMode(raw.generationMode);
  const wordCount = parseWordCount(raw.wordCount);
  const separator = parseSeparator(raw.separator);
  const caseMode = parseCaseMode(raw.caseMode);
  const wordLengthProfile = parseProfile(raw.wordLengthProfile);
  const digitCount = parseDigitCount(raw.digitCount);
  const targetLength = generationMode === "targetLength" ? parseTargetLength(raw.targetLength) : null;
  const specialSymbol = parseSpecialSymbol(raw.specialSymbol);

  if (generationMode === "targetLength") {
    if (targetLength === null) {
      throw new Error("Target length is required in Target Length mode");
    }

    const minimumLength =
      wordCount * minimumProfileLengths[wordLengthProfile] +
      separator.length * Math.max(wordCount - 1, 0) +
      (raw.appendDigits ? digitCount : 0) +
      (raw.appendSymbol ? 1 : 0);

    if (targetLength < minimumLength) {
      throw new Error(`Target length must be at least ${minimumLength} characters for the current settings`);
    }
  }

  return {
    generationMode,
    wordCount,
    separator,
    caseMode,
    leetMode: raw.leetMode,
    wordLengthProfile,
    targetLength: generationMode === "targetLength" ? targetLength : null,
    appendDigits: raw.appendDigits,
    digitCount,
    appendSymbol: raw.appendSymbol,
    specialSymbol,
    easyToType: raw.easyToType,
    avoidAwkwardClusters: raw.avoidAwkwardClusters,
    maxAttempts,
  };
}

function parseGenerationMode(value: string): GenerationMode {
  if (value === "structure" || value === "targetLength") return value;
  throw new Error(`Unsupported generation mode: ${value}`);
}

function parseWordCount(value: string): number {
  const parsed = parsePositiveInt(value, "Word count");
  if (allowedWordCounts.has(parsed)) return parsed;
  throw new Error("Word count must be one of: 2, 3, 4, 5");
}

function parseDigitCount(value: string): number {
  const parsed = parseNonNegativeInt(value, "Digit count");
  if (allowedDigitCounts.has(parsed)) return parsed;
  throw new Error("Digit count must be one of: 0, 1, 2, 3, 4");
}

function parseSpecialSymbol(value: string): string {
  const normalized = value.trim();
  if (allowedSpecialSymbols.has(normalized)) return normalized;
  throw new Error("Special symbol must be one of: !, @, #, $");
}

function parseTargetLength(value: string): number {
  const normalized = value.trim();
  if (normalized === "") {
    throw new Error("Target length is required in Target Length mode");
  }

  return parsePositiveInt(normalized, "Target length");
}

function parseSeparator(value: string): Separator {
  if (separators.has(value as Separator)) return value as Separator;
  throw new Error(`Unsupported separator: ${value}`);
}

function parseCaseMode(value: string): CaseMode {
  if (caseModes.has(value as CaseMode)) return value as CaseMode;
  throw new Error(`Unsupported case mode: ${value}`);
}

function parseProfile(value: string): WordLengthProfile {
  if (profiles.has(value as WordLengthProfile)) return value as WordLengthProfile;
  throw new Error(`Unsupported word length profile: ${value}`);
}

function parsePositiveInt(value: string, label: string): number {
  const parsed = parseNonNegativeInt(value, label);
  if (parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return parsed;
}

function parseNonNegativeInt(value: string, label: string): number {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${label} must be a positive integer`);
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return parsed;
}
