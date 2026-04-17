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
