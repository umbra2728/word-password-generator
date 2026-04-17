# Testing Rules

- Use `npm --prefix word-password-generator run test` for the full generator test suite.
- Use `cd word-password-generator && npm exec -- tsx --test src/generator/<file>.test.ts` for single-file tests.
- Cover structure mode, target length mode, transforms, and preference parsing.
- Run `npm --prefix word-password-generator run lint` and `npm --prefix word-password-generator run build` before finishing behavior changes.
