# Project CLAUDE.md

## Core Commands
- `cd word-password-generator && npm install`
- `cd word-password-generator && npm run dev`
- `cd word-password-generator && npm run lint`
- `cd word-password-generator && npm run test`
- `cd word-password-generator && npm run build`
- `npm --prefix word-password-generator install`
- `npm --prefix word-password-generator run dev`
- `npm --prefix word-password-generator run lint`
- `npm --prefix word-password-generator run test`
- `npm --prefix word-password-generator run build`
- `cd word-password-generator && npm exec -- tsx --test src/generator/<file>.test.ts`

## Architecture Map
- `word-password-generator/src/generate-password.ts` is the Raycast `no-view` command entry point.
- `word-password-generator/src/generator/` contains pure password-generation logic and tests.
- `word-password-generator/scripts/vendor-wordlist.mjs` refreshes the vendored upstream word list.

## Non-Obvious Conventions and Gotchas
- The repo root is not the extension package. `package.json` lives in `word-password-generator/`.
- Keep the Raycast command thin; generator behavior belongs in `src/generator/`.
- Single test file runs should be executed from inside `word-password-generator/` because `npm --prefix ... exec tsx --test ...` resolves paths from the worktree root.
- Do not hand-write the word list; regenerate `src/generator/wordlist.ts` via the vendor script.

## Definition of Done
- Run lint, test, and build after any behavior change.
- Update the repository root `README.md` when GitHub-facing install, repo layout, or usage guidance changes.
- Update `word-password-generator/README.md` when package-local commands or package behavior changes.
- Keep the manifest preference field types and `src/generator/preferences.ts` validation rules in sync, including free-form numeric text fields for `wordCount` and `digitCount`.
- Update `.claude/rules/*.md` when commands, testing workflow, or generator constraints change.
