# Word Password Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Raycast `no-view` command that immediately generates a word-based password from persisted preferences, copies it to the clipboard, and shows the copied value plus its length.

**Architecture:** Keep the Raycast command entry point tiny and move all password logic into pure generator modules under `word-password-generator/src/generator/`. Vendor an external word list from `kklash/wordlist4096`, filter it into the allowed profiles, and implement two code paths: structure mode and exact target-length mode.

**Tech Stack:** Raycast API, TypeScript, Node.js built-ins (`crypto`, `node:test`, `node:assert`), `tsx` for test execution

---

## File Map

- Create: `.gitignore`
  - Ignore `.worktrees/` at the repository root so git worktrees are safe.
- Delete: `package-lock.json`
  - Remove the stray root lockfile; the actual Node package lives in `word-password-generator/`.
- Modify: `word-password-generator/package.json`
  - Add command preferences, add `test` script, add `tsx` dev dependency, finalize defaults at the end.
- Modify: `word-password-generator/README.md`
  - Document the quick-copy workflow and the upstream word list source.
- Modify: `word-password-generator/src/generate-password.ts`
  - Keep only Raycast integration: read preferences, build password, copy, notify.
- Create: `word-password-generator/scripts/vendor-wordlist.mjs`
  - Download and normalize the upstream MIT-licensed word list.
- Create: `word-password-generator/src/generator/types.ts`
  - Shared configuration and result types.
- Create: `word-password-generator/src/generator/preferences.ts`
  - Convert raw Raycast preferences into validated generator config.
- Create: `word-password-generator/src/generator/wordlist.ts`
  - Generated export from the upstream word list.
- Create: `word-password-generator/src/generator/words.ts`
  - Word-profile filtering and length indexing helpers.
- Create: `word-password-generator/src/generator/transforms.ts`
  - Case, leet, joining, and suffix helpers.
- Create: `word-password-generator/src/generator/filters.ts`
  - `easyToType` and `avoidAwkwardClusters` checks.
- Create: `word-password-generator/src/generator/build-password.ts`
  - High-level structure-mode and target-length-mode builder.
- Create: `word-password-generator/src/generator/preferences.test.ts`
- Create: `word-password-generator/src/generator/words.test.ts`
- Create: `word-password-generator/src/generator/transforms.test.ts`
- Create: `word-password-generator/src/generator/build-password.test.ts`
  - Pure tests for generator behavior.
- Create: `.claude/CLAUDE.md`
- Create: `.claude/rules/documentation.md`
- Create: `.claude/rules/code-style.md`
- Create: `.claude/rules/testing.md`
- Create: `.claude/rules/security.md`
  - Project-specific working rules required by the global CLAUDE policy.

### Task 1: Bootstrap the Repository for Worktree-Safe Development

**Files:**
- Create: `.gitignore`
- Delete: `package-lock.json`

- [ ] **Step 1: Create a root `.gitignore` that ignores worktrees**

```gitignore
.worktrees/
```

- [ ] **Step 2: Verify the ignore rule works**

Run: `git check-ignore -v .worktrees`
Expected: output similar to `.gitignore:1:.worktrees/ .worktrees`

- [ ] **Step 3: Remove the stray root lockfile**

```bash
rm package-lock.json
```

Run: `ls`
Expected: `docs` and `word-password-generator` remain; the root `package-lock.json` is gone.

- [ ] **Step 4: Create the initial repository commit so git worktrees have a real HEAD**

```bash
git add .gitignore docs/superpowers/specs/2026-04-15-word-password-generator-design.md docs/superpowers/plans/2026-04-15-word-password-generator.md word-password-generator
git commit -m "$(cat <<'EOF'
chore: bootstrap raycast word password generator repo
EOF
)"
```

Expected: a new root commit exists and `git rev-parse --verify HEAD` succeeds.

- [ ] **Step 5: Create the dedicated implementation worktree**

```bash
git worktree add ".worktrees/word-password-generator" -b feature/word-password-generator
```

Expected: `Preparing worktree (new branch 'feature/word-password-generator')`

- [ ] **Step 6: Verify the worktree is ready**

Run: `git worktree list`
Expected: both the main checkout and `.worktrees/word-password-generator` are listed.

- [ ] **Step 7: Switch into the implementation worktree before continuing**

```bash
cd ".worktrees/word-password-generator"
pwd
```

Expected: the printed path ends with `/.worktrees/word-password-generator`.

### Task 2: Add Preferences, Test Harness, and Config Parsing

**Files:**
- Modify: `word-password-generator/package.json`
- Create: `word-password-generator/src/generator/types.ts`
- Create: `word-password-generator/src/generator/preferences.ts`
- Test: `word-password-generator/src/generator/preferences.test.ts`

- [ ] **Step 1: Update the manifest with command preferences and a test script**

Replace the current command object in `word-password-generator/package.json` with this version and add `tsx` to `devDependencies` plus a `test` script:

```json
{
  "name": "generate-password",
  "title": "Generate Password",
  "subtitle": "Create a password from random words",
  "description": "Generates a secure password using randomly selected words with customizable options.",
  "mode": "no-view",
  "preferences": [
    {
      "name": "generationMode",
      "title": "Generation Mode",
      "type": "dropdown",
      "default": "structure",
      "data": [
        { "title": "Structure", "value": "structure" },
        { "title": "Target Length", "value": "targetLength" }
      ]
    },
    {
      "name": "wordCount",
      "title": "Word Count",
      "type": "dropdown",
      "default": "3",
      "data": [
        { "title": "2", "value": "2" },
        { "title": "3", "value": "3" },
        { "title": "4", "value": "4" },
        { "title": "5", "value": "5" }
      ]
    },
    {
      "name": "separator",
      "title": "Separator",
      "type": "dropdown",
      "default": "",
      "data": [
        { "title": "None", "value": "" },
        { "title": "Hyphen (-)", "value": "-" },
        { "title": "Underscore (_)", "value": "_" },
        { "title": "Dot (.)", "value": "." }
      ]
    },
    {
      "name": "caseMode",
      "title": "Case",
      "type": "dropdown",
      "default": "lowercase",
      "data": [
        { "title": "lowercase", "value": "lowercase" },
        { "title": "UPPERCASE", "value": "uppercase" },
        { "title": "Capitalized", "value": "capitalized" }
      ]
    },
    {
      "name": "leetMode",
      "title": "Leet Mode",
      "type": "checkbox",
      "default": false,
      "label": "Apply deterministic leet replacements"
    },
    {
      "name": "wordLengthProfile",
      "title": "Word Length Profile",
      "type": "dropdown",
      "default": "medium",
      "data": [
        { "title": "Short (3-4)", "value": "short" },
        { "title": "Medium (5-6)", "value": "medium" },
        { "title": "Long (7-8)", "value": "long" },
        { "title": "Mixed (3-8)", "value": "mixed" }
      ]
    },
    {
      "name": "targetLength",
      "title": "Target Length",
      "type": "textfield",
      "default": "16",
      "placeholder": "Used only in Target Length mode"
    },
    {
      "name": "appendDigits",
      "title": "Digits",
      "type": "checkbox",
      "default": true,
      "label": "Append random digits"
    },
    {
      "name": "digitCount",
      "title": "Digit Count",
      "type": "dropdown",
      "default": "2",
      "data": [
        { "title": "1", "value": "1" },
        { "title": "2", "value": "2" },
        { "title": "3", "value": "3" },
        { "title": "4", "value": "4" }
      ]
    },
    {
      "name": "appendSymbol",
      "title": "Symbol",
      "type": "checkbox",
      "default": false,
      "label": "Append one special symbol"
    },
    {
      "name": "specialSymbol",
      "title": "Special Symbol",
      "type": "dropdown",
      "default": "!",
      "data": [
        { "title": "!", "value": "!" },
        { "title": "@", "value": "@" },
        { "title": "#", "value": "#" },
        { "title": "$", "value": "$" }
      ]
    },
    {
      "name": "easyToType",
      "title": "Easy to Type",
      "type": "checkbox",
      "default": false,
      "label": "Prefer simpler keyboard-friendly words"
    },
    {
      "name": "avoidAwkwardClusters",
      "title": "Avoid Awkward Clusters",
      "type": "checkbox",
      "default": true,
      "label": "Reject hard-to-read joins"
    }
  ]
}
```

Add to `devDependencies`:

```json
"tsx": "^4.19.4"
```

Add to `scripts`:

```json
"test": "tsx --test src/**/*.test.ts"
```

- [ ] **Step 2: Install the new test dependency**

Run: `npm --prefix word-password-generator install`
Expected: npm creates `word-password-generator/package-lock.json` and exits with code 0.

- [ ] **Step 3: Write the failing preference parser test**

Create `word-password-generator/src/generator/preferences.test.ts`:

```ts
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
```

- [ ] **Step 4: Run the test and verify it fails first**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/preferences.test.ts`
Expected: FAIL because `./preferences` does not exist yet.

- [ ] **Step 5: Add the shared types and minimal preference parser**

Create `word-password-generator/src/generator/types.ts`:

```ts
export type GenerationMode = "structure" | "targetLength";
export type Separator = "" | "-" | "_" | ".";
export type CaseMode = "lowercase" | "uppercase" | "capitalized";
export type WordLengthProfile = "short" | "medium" | "long" | "mixed";

export interface GeneratorConfig {
  generationMode: GenerationMode;
  wordCount: number;
  separator: Separator;
  caseMode: CaseMode;
  leetMode: boolean;
  wordLengthProfile: WordLengthProfile;
  targetLength: number | null;
  appendDigits: boolean;
  digitCount: number;
  appendSymbol: boolean;
  specialSymbol: string;
  easyToType: boolean;
  avoidAwkwardClusters: boolean;
  maxAttempts: number;
}

export interface BuildPasswordResult {
  password: string;
  length: number;
  words: string[];
}
```

Create `word-password-generator/src/generator/preferences.ts`:

```ts
import { type CaseMode, type GenerationMode, type GeneratorConfig, type Separator, type WordLengthProfile } from "./types";

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
  const wordCount = parsePositiveInt(raw.wordCount, "Word count");
  const separator = parseSeparator(raw.separator);
  const caseMode = parseCaseMode(raw.caseMode);
  const wordLengthProfile = parseProfile(raw.wordLengthProfile);
  const digitCount = parsePositiveInt(raw.digitCount, "Digit count");
  const targetLength = raw.targetLength.trim() === "" ? null : parsePositiveInt(raw.targetLength, "Target length");
  const specialSymbol = raw.specialSymbol.trim();

  if (specialSymbol.length !== 1) {
    throw new Error("Special symbol must be exactly one character");
  }

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
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}
```

- [ ] **Step 6: Run the preference tests until they pass**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/preferences.test.ts`
Expected: PASS with `2 passed`.

- [ ] **Step 7: Commit the manifest and parser work**

```bash
git add word-password-generator/package.json word-password-generator/package-lock.json word-password-generator/src/generator/types.ts word-password-generator/src/generator/preferences.ts word-password-generator/src/generator/preferences.test.ts
git commit -m "$(cat <<'EOF'
feat: add generator preferences and config parsing
EOF
)"
```

### Task 3: Vendor the External Word List and Build Word Helpers

**Files:**
- Create: `word-password-generator/scripts/vendor-wordlist.mjs`
- Create: `word-password-generator/src/generator/wordlist.ts`
- Create: `word-password-generator/src/generator/words.ts`
- Test: `word-password-generator/src/generator/words.test.ts`
- Modify: `word-password-generator/README.md`

- [ ] **Step 1: Write the failing word helper tests**

Create `word-password-generator/src/generator/words.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test and verify it fails first**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/words.test.ts`
Expected: FAIL because `./words` does not exist yet.

- [ ] **Step 3: Add the vendor script that downloads the upstream list**

Create `word-password-generator/scripts/vendor-wordlist.mjs`:

```js
import { writeFile } from "node:fs/promises";

const sourceUrl = "https://raw.githubusercontent.com/kklash/wordlist4096/main/wordlist4096.txt";
const outputUrl = new URL("../src/generator/wordlist.ts", import.meta.url);

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to download word list: ${response.status} ${response.statusText}`);
}

const words = [...new Set(
  (await response.text())
    .split(/\r?\n/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => /^[a-z]{3,8}$/.test(word)),
)];

const contents = `// Source: ${sourceUrl}\n// License: MIT (kklash/wordlist4096)\nexport const wordlist = ${JSON.stringify(words, null, 2)} as const;\n`;

await writeFile(outputUrl, contents);
console.log(`Wrote ${words.length} words to src/generator/wordlist.ts`);
```

- [ ] **Step 4: Download and generate the vendored word list**

Run: `node word-password-generator/scripts/vendor-wordlist.mjs`
Expected: output like `Wrote 4096 words to src/generator/wordlist.ts`

- [ ] **Step 5: Add the runtime word helpers**

Create `word-password-generator/src/generator/words.ts`:

```ts
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
```

Append this section to `word-password-generator/README.md`:

```md
## Word List

This extension vendors the MIT-licensed [`kklash/wordlist4096`](https://github.com/kklash/wordlist4096) list via `scripts/vendor-wordlist.mjs` and filters it to lowercase words with lengths from 3 through 8.
```

- [ ] **Step 6: Run the word helper tests until they pass**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/words.test.ts`
Expected: PASS with `3 passed`.

- [ ] **Step 7: Commit the vendored word list and helpers**

```bash
git add word-password-generator/README.md word-password-generator/scripts/vendor-wordlist.mjs word-password-generator/src/generator/wordlist.ts word-password-generator/src/generator/words.ts word-password-generator/src/generator/words.test.ts
git commit -m "$(cat <<'EOF'
chore: vendor upstream word list
EOF
)"
```

### Task 4: Add Text Transforms and Quality Filters

**Files:**
- Create: `word-password-generator/src/generator/transforms.ts`
- Create: `word-password-generator/src/generator/filters.ts`
- Test: `word-password-generator/src/generator/transforms.test.ts`

- [ ] **Step 1: Write the failing transform and filter tests**

Create `word-password-generator/src/generator/transforms.test.ts`:

```ts
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
  assert.equal(appendOptionalSuffixes("riverstone", { appendDigits: true, digitCount: 2, appendSymbol: true, specialSymbol: "!" }, randomInt), "riverstone66!");
});

test("hasAwkwardJoin detects hard consonant clusters", () => {
  assert.equal(hasAwkwardJoin(["mask", "troll"], ""), true);
  assert.equal(hasAwkwardJoin(["river", "stone"], ""), false);
});

test("passesQualityFilters respects both switches", () => {
  assert.equal(
    passesQualityFilters(["mask", "troll"], "", { easyToType: false, avoidAwkwardClusters: true }),
    false,
  );
  assert.equal(
    passesQualityFilters(["river", "stone"], "", { easyToType: true, avoidAwkwardClusters: true }),
    true,
  );
});

test("joinWords uses the configured separator", () => {
  assert.equal(joinWords(["river", "stone"], "-"), "river-stone");
});
```

- [ ] **Step 2: Run the tests and verify they fail first**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/transforms.test.ts`
Expected: FAIL because `./transforms` and `./filters` do not exist yet.

- [ ] **Step 3: Add deterministic transforms and lightweight filters**

Create `word-password-generator/src/generator/transforms.ts`:

```ts
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
```

Create `word-password-generator/src/generator/filters.ts`:

```ts
const awkwardClusterPattern = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
const hardToTypePattern = /(xq|qx|qz|zq|ptk|tkp|kpt|[qxz]{2})/i;

export function hasAwkwardJoin(words: string[], separator: string): boolean {
  return separator === "" && awkwardClusterPattern.test(words.join(separator));
}

function isEasyToTypeWord(word: string): boolean {
  return !hardToTypePattern.test(word);
}

export function passesQualityFilters(
  words: string[],
  separator: string,
  options: { easyToType: boolean; avoidAwkwardClusters: boolean },
): boolean {
  if (options.easyToType && words.some((word) => !isEasyToTypeWord(word))) {
    return false;
  }

  if (options.avoidAwkwardClusters && hasAwkwardJoin(words, separator)) {
    return false;
  }

  return true;
}
```

- [ ] **Step 4: Run the transform tests until they pass**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/transforms.test.ts`
Expected: PASS with `6 passed`.

- [ ] **Step 5: Commit the transform and filter helpers**

```bash
git add word-password-generator/src/generator/transforms.ts word-password-generator/src/generator/filters.ts word-password-generator/src/generator/transforms.test.ts
git commit -m "$(cat <<'EOF'
feat: add password transforms and quality filters
EOF
)"
```

### Task 5: Implement Structure Mode Generation

**Files:**
- Create: `word-password-generator/src/generator/build-password.ts`
- Test: `word-password-generator/src/generator/build-password.test.ts`

- [ ] **Step 1: Write the failing structure-mode tests**

Create `word-password-generator/src/generator/build-password.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests and verify they fail first**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/build-password.test.ts`
Expected: FAIL because `./build-password` does not exist yet.

- [ ] **Step 3: Implement the structure-mode builder**

Create `word-password-generator/src/generator/build-password.ts`:

```ts
import crypto from "node:crypto";

import { passesQualityFilters } from "./filters";
import { appendOptionalSuffixes, applyCase, applyLeet, joinWords } from "./transforms";
import { getWordsForProfile } from "./words";
import { type BuildPasswordResult, type GeneratorConfig } from "./types";

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

function finalize(words: string[], config: GeneratorConfig, randomInt: (maximum: number) => number): BuildPasswordResult {
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
  void randomInt;
  throw new Error("Target Length mode is not implemented yet");
}
```

- [ ] **Step 4: Run the structure tests until the structure cases pass**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/build-password.test.ts`
Expected: the first two tests PASS and the placeholder target-length branch remains untested.

- [ ] **Step 5: Commit the structure-mode generator**

```bash
git add word-password-generator/src/generator/build-password.ts word-password-generator/src/generator/build-password.test.ts
git commit -m "$(cat <<'EOF'
feat: add structure mode password generation
EOF
)"
```

### Task 6: Add Exact Target-Length Matching

**Files:**
- Modify: `word-password-generator/src/generator/build-password.ts`
- Modify: `word-password-generator/src/generator/build-password.test.ts`

- [ ] **Step 1: Extend the builder test with exact-length expectations**

Append these tests to `word-password-generator/src/generator/build-password.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the builder tests and verify the new target-length tests fail**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/build-password.test.ts`
Expected: FAIL on the new target-length tests with `Target Length mode is not implemented yet`.

- [ ] **Step 3: Replace the placeholder branch with exact-length search**

Update `word-password-generator/src/generator/build-password.ts` by replacing `buildTargetLengthPassword()` with this implementation and adding the helper below it:

```ts
import { indexWordsByLength } from "./words";

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
```

- [ ] **Step 4: Run the builder tests until all target-length cases pass**

Run: `npm --prefix word-password-generator exec tsx --test src/generator/build-password.test.ts`
Expected: PASS with all four tests green.

- [ ] **Step 5: Commit the exact-length implementation**

```bash
git add word-password-generator/src/generator/build-password.ts word-password-generator/src/generator/build-password.test.ts
git commit -m "$(cat <<'EOF'
feat: add exact target length generation
EOF
)"
```

### Task 7: Wire the Raycast Command, Finalize Defaults, and Update Project Docs

**Files:**
- Modify: `word-password-generator/src/generate-password.ts`
- Modify: `word-password-generator/package.json`
- Modify: `word-password-generator/README.md`
- Create: `.claude/CLAUDE.md`
- Create: `.claude/rules/documentation.md`
- Create: `.claude/rules/code-style.md`
- Create: `.claude/rules/testing.md`
- Create: `.claude/rules/security.md`

- [ ] **Step 1: Write the final command entry point**

Replace `word-password-generator/src/generate-password.ts` with:

```ts
import { Clipboard, Toast, closeMainWindow, getPreferenceValues, showToast } from "@raycast/api";

import { buildPassword } from "./generator/build-password";
import { parsePreferences } from "./generator/preferences";

export default async function Command() {
  try {
    const preferences = getPreferenceValues<Preferences.GeneratePassword>();
    const config = parsePreferences(preferences);
    const result = buildPassword(config);

    await Clipboard.copy(result.password);
    await closeMainWindow();
    await showToast({
      style: Toast.Style.Success,
      title: `Copied password (${result.length} chars)`,
      message: result.password,
    });
  } catch (error) {
    await closeMainWindow();
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not generate password",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
```

- [ ] **Step 2: Finalize the balanced default preferences last**

Update the command preferences in `word-password-generator/package.json` so the defaults are:

```json
{
  "generationMode": "structure",
  "wordCount": "3",
  "separator": "",
  "caseMode": "lowercase",
  "leetMode": false,
  "wordLengthProfile": "medium",
  "targetLength": "16",
  "appendDigits": true,
  "digitCount": "2",
  "appendSymbol": false,
  "specialSymbol": "!",
  "easyToType": false,
  "avoidAwkwardClusters": true
}
```

- [ ] **Step 3: Update the README with the actual behavior**

Replace `word-password-generator/README.md` with:

```md
# Word Password Generator

Generate a memorable password from random words and copy it to the clipboard immediately.

## Behavior

- Runs as a Raycast `no-view` command
- Copies the generated password to the clipboard immediately
- Shows the copied password and its final length in a success toast
- Stores all generation settings in Raycast preferences

## Settings

- Generation mode: structure or target length
- Word count
- Separator
- Case mode
- Leet mode
- Word length profile
- Optional digits and symbol suffixes
- Easy-to-type filter
- Awkward-cluster avoidance

## Word List

This extension vendors the MIT-licensed [`kklash/wordlist4096`](https://github.com/kklash/wordlist4096) list via `scripts/vendor-wordlist.mjs` and filters it to lowercase words with lengths from 3 through 8.
```

- [ ] **Step 4: Add the required project `.claude` docs**

Create `.claude/CLAUDE.md`:

```md
# Project CLAUDE.md

## Core Commands
- `npm --prefix word-password-generator install`
- `npm --prefix word-password-generator lint`
- `npm --prefix word-password-generator test`
- `npm --prefix word-password-generator build`

## Architecture Map
- `word-password-generator/src/generate-password.ts` is the Raycast `no-view` command entry point.
- `word-password-generator/src/generator/` contains pure password-generation logic and tests.
- `word-password-generator/scripts/vendor-wordlist.mjs` refreshes the vendored upstream word list.

## Definition of Done
- Run lint, test, and build after any behavior change.
- Update README when preferences or command behavior change.
- Update `.claude/rules/*.md` when commands, testing workflow, or generator constraints change.
```

Create `.claude/rules/documentation.md`:

```md
# Documentation Rules

- Keep `word-password-generator/README.md` aligned with the actual command behavior and preference surface.
- Record upstream word list source changes in the README and in this rules directory.
- If command names, scripts, or file paths change, update `.claude/CLAUDE.md` in the same change.
```

Create `.claude/rules/code-style.md`:

```md
# Code Style Rules

- Keep `src/generate-password.ts` thin; move generation logic into `src/generator/`.
- Prefer small pure functions in `src/generator/` so they stay testable without Raycast APIs.
- Do not hand-write the word list; refresh it through `scripts/vendor-wordlist.mjs`.
```

Create `.claude/rules/testing.md`:

```md
# Testing Rules

- Use `npm --prefix word-password-generator test` for generator tests.
- Cover structure mode, target length mode, transforms, and preference parsing.
- Run `npm --prefix word-password-generator lint` and `npm --prefix word-password-generator build` before finishing feature work.
```

Create `.claude/rules/security.md`:

```md
# Security Rules

- Use `crypto.randomInt` for all random selection and suffix digits.
- Never log generated passwords to stdout or files.
- Fail fast when target-length constraints are impossible instead of silently changing user settings.
```

- [ ] **Step 5: Run the full verification suite**

Run these commands in order:

```bash
npm --prefix word-password-generator lint
npm --prefix word-password-generator test
npm --prefix word-password-generator build
```

Expected:
- `lint`: exits 0 with no lint errors
- `test`: all tests pass
- `build`: exits 0 and Raycast builds successfully

- [ ] **Step 6: Commit the finished feature**

```bash
git add .claude/CLAUDE.md .claude/rules/documentation.md .claude/rules/code-style.md .claude/rules/testing.md .claude/rules/security.md word-password-generator/README.md word-password-generator/package.json word-password-generator/src/generate-password.ts
git commit -m "$(cat <<'EOF'
feat: add quick word password generator command
EOF
)"
```

## Self-Review

### Spec coverage
- Quick `no-view` command: Task 7 Step 1.
- Preferences-only configuration: Task 2 Step 1 and Step 5.
- Structure mode: Task 5.
- Exact target-length mode: Task 6.
- Downloaded external word list instead of hand-written data: Task 3.
- Copied password value plus length in UI feedback: Task 7 Step 1.
- Tests for parser, transforms, structure mode, and target length mode: Tasks 2, 4, 5, and 6.
- `.claude` documentation updates required by project policy: Task 7 Step 4.

### Placeholder scan
- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Each code step includes explicit file content or replacement code.
- Every verification step has an exact command and expected result.

### Type consistency
- `GeneratorConfig`, `BuildPasswordResult`, and `RawPreferences` names are consistent across the parser, builders, and tests.
- `buildPassword()` is the single public entry point used by the Raycast command and the tests.
- `targetLength` is consistently modeled as `number | null`.
