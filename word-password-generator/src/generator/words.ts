import { type WordLengthProfile } from "./types";
import { wordlist } from "./wordlist";

const profileRanges: Record<WordLengthProfile, readonly [number, number]> = {
  short: [3, 4],
  medium: [5, 6],
  long: [7, 8],
  mixed: [3, 8],
};

export { wordlist };

export function getWordsForProfile(profile: WordLengthProfile): string[] {
  const [minimumLength, maximumLength] = profileRanges[profile];
  return wordlist.filter((word) => word.length >= minimumLength && word.length <= maximumLength);
}

export function indexWordsByLength(words: readonly string[]): Map<number, string[]> {
  const buckets = new Map<number, string[]>();

  for (const word of words) {
    const bucket = buckets.get(word.length);
    if (bucket) {
      bucket.push(word);
    } else {
      buckets.set(word.length, [word]);
    }
  }

  return new Map([...buckets.entries()].sort(([left], [right]) => left - right));
}
