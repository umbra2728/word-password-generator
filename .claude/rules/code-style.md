# Code Style Rules

- Keep `word-password-generator/src/generate-password.ts` thin; move generation logic into `word-password-generator/src/generator/`.
- Prefer small pure functions in `word-password-generator/src/generator/` so they stay testable without Raycast APIs.
- Do not hand-write the word list; refresh it through `word-password-generator/scripts/vendor-wordlist.mjs`.
