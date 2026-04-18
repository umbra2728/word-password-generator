# Word Password Generator Package

This directory contains the Raycast extension package for the repository.

For the GitHub-visible project overview, installation guide, and usage instructions, see the repository root README:

- [`../README.md`](../README.md)

`Target Length` remains visible in Raycast preferences, but the generator ignores it unless `Generation Mode` is set to `Target Length`.

## Package-Local Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## Word List

To refresh the vendored word list from `kklash/wordlist4096`:

```bash
node scripts/vendor-wordlist.mjs
```
