# Word Password Generator

Generate a memorable password from random words and copy it to the clipboard immediately.

## Repository Layout

This repository contains the Raycast extension inside `word-password-generator/`.

- Repo root: `word-password-generator/`
- Extension package: `word-password-generator/word-password-generator/`

That means `npm install` and `npm run dev` must be executed inside the nested package directory, or from the repo root with `npm --prefix word-password-generator ...`.

## Download

```bash
git clone git@github.com:umbra2728/word-password-generator.git
cd word-password-generator
```

## Install

### Option A: work inside the extension directory

```bash
cd word-password-generator
npm install
```

### Option B: stay at the repo root

```bash
npm --prefix word-password-generator install
```

## Run in Raycast

### Option A: from the extension directory

```bash
cd word-password-generator
npm run dev
```

### Option B: from the repo root

```bash
npm --prefix word-password-generator run dev
```

Then open Raycast and search for `Generate Password`.

## How It Works

- Runs as a Raycast `no-view` command
- Generates the password immediately
- Copies the generated password to the clipboard
- Shows a success toast with the password and its final length
- Stores settings in Raycast command preferences between runs

## Using the Command

1. Start the extension with `npm run dev`
2. Open Raycast
3. Search for `Generate Password`
4. Run the command
5. Open the command preferences in Raycast if you want to change the generation rules

## Settings

- **Generation Mode**
  - `Structure`: generate using the configured number of words
  - `Target Length`: keep reselecting words until the final password matches the exact requested length
- **Word Count**: number of words before optional suffixes
- **Separator**: none, `-`, `_`, or `.`
- **Case**: lowercase, uppercase, or capitalized
- **Leet Mode**: deterministic substitutions like `a -> 4` and `o -> 0`
- **Word Length Profile**: short, medium, long, or mixed
- **Target Length**: exact final password length used only in target-length mode
- **Digits / Digit Count**: append random digits to the end, or set digit count to `0`
- **Symbol / Special Symbol**: append one symbol after digits
- **Easy to Type**: reject words with harder keyboard patterns
- **Avoid Awkward Clusters**: reject dense consonant joins when words are concatenated without a separator

## Recommended First Configuration

- `Generation Mode`: `Structure`
- `Word Count`: `3`
- `Separator`: `None`
- `Case`: `lowercase`
- `Leet Mode`: `off`
- `Word Length Profile`: `medium`
- `Digits`: `on`
- `Digit Count`: `2`
- `Symbol`: `off`
- `Easy to Type`: `off`
- `Avoid Awkward Clusters`: `on`

## Development Commands

From the repo root:

```bash
npm --prefix word-password-generator run lint
npm --prefix word-password-generator run test
npm --prefix word-password-generator run build
```

From inside `word-password-generator/`:

```bash
npm run lint
npm run test
npm run build
```

## Troubleshooting

### `ENOENT: no such file or directory, open '/.../word-password-generator/package.json'`

You ran `npm` from the repo root instead of the extension package directory.

Fix it by either:

```bash
cd word-password-generator
npm install
npm run dev
```

or:

```bash
npm --prefix word-password-generator install
npm --prefix word-password-generator run dev
```

### Raycast does not show the command

- Make sure `npm run dev` is still running
- Search for `Generate Password` again in Raycast
- If you changed files, restart the dev command

## Word List

This extension vendors the MIT-licensed [`kklash/wordlist4096`](https://github.com/kklash/wordlist4096) list via `scripts/vendor-wordlist.mjs` and filters it to lowercase words with lengths from 3 through 8.

To refresh the vendored list:

```bash
cd word-password-generator
node scripts/vendor-wordlist.mjs
```
