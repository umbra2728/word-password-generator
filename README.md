# Word Password Generator

A Raycast extension that generates memorable word-based passwords, copies them to the clipboard immediately, and shows a toast with the generated value and its final length.

## Repository Layout

This repository contains the Raycast extension package inside `word-password-generator/`.

- Repository root: `word-password-generator/`
- Extension package: `word-password-generator/word-password-generator/`

The extension's `package.json` lives in the nested package directory.

## Download

```bash
git clone git@github.com:umbra2728/word-password-generator.git
cd word-password-generator
```

## Install

### From the repository root

```bash
npm --prefix word-password-generator install
```

### Or from inside the extension package

```bash
cd word-password-generator
npm install
```

## Run in Raycast

### From the repository root

```bash
npm --prefix word-password-generator run dev
```

### Or from inside the extension package

```bash
cd word-password-generator
npm run dev
```

Then open Raycast and search for `Generate Password`.

## How to Use

1. Start the extension in development mode
2. Open Raycast
3. Search for `Generate Password`
4. Run the command
5. Open `Command Preferences` in Raycast to adjust generation settings

## Behavior

- Runs as a Raycast `no-view` command
- Generates the password immediately
- Copies the password to the clipboard
- Shows a success toast with the password and its final length
- Stores settings in Raycast command preferences between runs

## Settings

- **Generation Mode**
  - `Structure`: generate using the configured number of words
  - `Target Length`: keep reselecting words until the final password matches the exact requested length
- **Word Count**: free-form positive integer for the number of words before optional suffixes
- **Separator**: none, `-`, `_`, or `.`
- **Case**: lowercase, uppercase, or capitalized
- **Leet Mode**: deterministic substitutions like `a -> 4` and `o -> 0`
- **Word Length Profile**: short, medium, long, or mixed
- **Target Length**: exact final password length used only in target-length mode
- **Digits / Digit Count**: append random digits to the end, with any non-negative digit count
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

From the repository root:

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

You ran `npm` from the repository root instead of the extension package directory.

Use either:

```bash
npm --prefix word-password-generator install
npm --prefix word-password-generator run dev
```

or:

```bash
cd word-password-generator
npm install
npm run dev
```

### Raycast does not show the command

- Make sure `npm run dev` is still running
- Search for `Generate Password` again in Raycast
- If you changed files, restart the dev command

## Word List

This extension vendors the MIT-licensed [`kklash/wordlist4096`](https://github.com/kklash/wordlist4096) list via `word-password-generator/scripts/vendor-wordlist.mjs` and filters it to lowercase words with lengths from 3 through 8.

To refresh the vendored list:

```bash
cd word-password-generator
node scripts/vendor-wordlist.mjs
```
