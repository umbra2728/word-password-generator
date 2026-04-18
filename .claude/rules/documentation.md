# Documentation Rules

- Keep the repository root `README.md` as the GitHub-visible entry point for install, run, and usage instructions.
- Keep `word-password-generator/README.md` aligned with package-local commands and point back to the root README for the main overview.
- Document manifest-visible numeric preference behavior when it is non-obvious, including `wordCount` as a free-form positive integer and `digitCount` as a free-form non-negative integer.
- The root README must explain that the extension package lives in `word-password-generator/` and show both `cd word-password-generator` and `npm --prefix word-password-generator ...` workflows.
- Record upstream word list source changes in the README and in this rules directory.
- If command names, scripts, or file paths change, update `.claude/CLAUDE.md` in the same change.
