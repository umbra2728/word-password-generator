import { type CaseMode } from "./types";

const leetMap = new Map<string, string>([
  ["a", "4"],
  ["e", "3"],
  ["i", "1"],
  ["o", "0"],
  ["s", "5"],
  ["t", "7"],
]);

export function applyCase(words: string[], caseMode: CaseMode): string[] {
  switch (caseMode) {
    case "lowercase":
      return words.map((word) => word.toLowerCase());
    case "uppercase":
      return words.map((word) => word.toUpperCase());
    case "capitalized":
      return words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
  }
}

export function joinWords(words: string[], separator: string): string {
  return words.join(separator);
}

export function applyLeet(value: string): string {
  return value.replace(/[aeiost]/gi, (letter) => leetMap.get(letter.toLowerCase()) ?? letter);
}

export function appendOptionalSuffixes(
  base: string,
  options: { appendDigits: boolean; digitCount: number; appendSymbol: boolean; specialSymbol: string },
  randomInt: (maximum: number) => number,
): string {
  const digitSuffix = options.appendDigits
    ? Array.from({ length: options.digitCount }, () => String(randomInt(10))).join("")
    : "";
  const symbolSuffix = options.appendSymbol ? options.specialSymbol : "";
  return `${base}${digitSuffix}${symbolSuffix}`;
}
