# Project CLAUDE.md

## Core Commands
- `npm --prefix word-password-generator install`
- `npm --prefix word-password-generator run lint`
- `npm --prefix word-password-generator run test`
- `npm --prefix word-password-generator run build`
- `cd word-password-generator && npm exec -- tsx --test src/generator/<file>.test.ts`

## Architecture Map
- `word-password-generator/src/generate-password.ts` is the Raycast `no-view` command entry point.
- `word-password-generator/src/generator/` contains pure password-generation logic and tests.
- `word-password-generator/scripts/vendor-wordlist.mjs` refreshes the vendored upstream word list.

## Non-Obvious Conventions and Gotchas
- Keep the Raycast command thin; generator behavior belongs in `src/generator/`.
- Single test file runs should be executed from inside `word-password-generator/` because `npm --prefix ... exec tsx --test ...` resolves paths from the worktree root.
- Do not hand-write the word list; regenerate `src/generator/wordlist.ts` via the vendor script.

## Definition of Done
- Run lint, test, and build after any behavior change.
- Update `word-password-generator/README.md` when preferences or command behavior change.
- Update `.claude/rules/*.md` when commands, testing workflow, or generator constraints change.
