# Word Password Generator Design

## Goal
Build a Raycast extension that generates a memorable word-based password and copies it to the clipboard immediately when the command runs.

The first version optimizes for a fast workflow:
- one command
- no intermediate form
- preferences-only configuration
- generated password is copied automatically
- the user gets a short success confirmation that includes the copied password and its length

## Current Project Context
The repository currently contains a single Raycast extension package in `word-password-generator/` with one `no-view` command declared in `word-password-generator/package.json` and a basic generator in `word-password-generator/src/generate-password.ts`.

A similar reference extension exists outside the repo at `/Users/ismailgaleev/word-password-generator-tmp/password-generator`, which shows how Raycast preferences and stored values are used. Another reference exists at `/Users/ismailgaleev/word-password-generator-tmp/base64`, which demonstrates the desired quick `no-view` command pattern that reads state, transforms data, copies to the clipboard, and confirms success.

## Product Shape
### Command Model
The extension will expose a single `no-view` command:
- `Generate Password`

Running the command will:
1. read the current preferences
2. generate a password based on those preferences
3. copy the password to the clipboard
4. show a success HUD or toast containing the password and its character count

There will be no required UI before generation in v1.

### Configuration Model
All configuration lives in Raycast extension preferences so settings persist automatically across sessions.

The design intentionally keeps defaults centralized in one place so they can be tuned at the end of implementation without changing generator logic. The user explicitly requested that default values be finalized last.

## Supported Settings
The first version will support two generation modes.

### Mode 1: Structure Mode
The user controls the password shape directly.

Supported options:
- word count
- separator
- case mode
- leet mode
- word length profile
- optional numeric suffix
- optional symbol suffix
- optional easy-to-type filter
- optional awkward-cluster avoidance

The final password length is whatever naturally results from the chosen structure.

### Mode 2: Target Length Mode
The user supplies a target password length.

In this mode the generator keeps picking different candidate words until the final password matches the requested total length exactly.

All other selected options stay fixed in this mode:
- word count
- separator
- case mode
- leet mode
- enabled suffixes and filters

The generator only changes word choices while searching for an exact-length result. If no exact match exists under the current constraints, the command fails with a short message asking the user to loosen the settings.

The user explicitly chose exact length matching by reselecting words rather than truncating words.

## Password Construction Rules
### Word Source
The generator uses a curated internal word list.

Requirements for the list:
- common, readable words
- short to medium length
- suitable for concatenation
- no duplicates after normalization
- avoid obviously awkward or low-value entries

The generator must not repeat the same word inside one password unless the configuration makes it unavoidable.

### Separators
Supported separator presets should stay simple:
- empty string
- `-`
- `_`
- `.`

Default separator behavior for the design is empty string because the user requested no separator by default.

### Case Modes
Supported case modes:
- lowercase
- uppercase
- capitalized

Mixed or alternating case is intentionally excluded from v1 to keep the feature set simple.

### Leet Mode
Leet transformation is deterministic and all-or-nothing when enabled.

The initial mapping is:
- `a -> 4`
- `e -> 3`
- `i -> 1`
- `o -> 0`
- `s -> 5`
- `t -> 7`

The generator applies the same mapping every time. There is no partial or random leet mode in v1.

### Suffixes
Optional suffix controls:
- append digits
- append one special symbol

Suffixes are appended after the word portion of the password.

## Simplicity and Quality Filters
The generator may apply lightweight filtering to improve usability without turning the extension into a scoring system.

Two optional filters are included in v1:
- `easyToType`: prefer simpler keyboard-friendly words and combinations
- `avoidAwkwardClusters`: reject combinations that create visually or phonetically ugly joins

These are intentionally soft filters, not a full linguistic model.

The extension will not implement a full pronounceability engine, phonetic scoring UI, or multiple advanced quality meters in v1.

## Architecture
Implementation will stay small and split by responsibility.

### Proposed Modules
- `word-password-generator/src/generate-password.ts`
  - entry point for the Raycast command
  - reads preferences
  - invokes the generator
  - copies to clipboard
  - shows success or failure feedback

- `word-password-generator/src/generator/preferences.ts`
  - converts raw Raycast preferences into a normalized internal config
  - validates and defaults preference values

- `word-password-generator/src/generator/build-password.ts`
  - high-level orchestration
  - chooses structure mode vs target-length mode

- `word-password-generator/src/generator/words.ts`
  - internal word list and filtering helpers

- `word-password-generator/src/generator/transforms.ts`
  - case conversion, leet conversion, separator joining, suffix helpers

- `word-password-generator/src/generator/filters.ts`
  - easy-to-type and awkward-cluster checks

- `word-password-generator/src/generator/types.ts`
  - shared types for config and generation results

The exact file split may be adjusted slightly during implementation, but responsibilities should remain separate in this way.

## Generation Flow
### Structure Mode Flow
1. Normalize preferences into internal config.
2. Choose the requested number of words from the filtered word list.
3. Apply word-length profile while selecting candidates.
4. Join words with the configured separator.
5. Apply case transformation.
6. Apply leet transformation if enabled.
7. Append digits and symbol suffixes if enabled.
8. Return the password plus metadata such as final length.

### Target Length Mode Flow
1. Normalize preferences into internal config.
2. Repeatedly build password candidates from allowed words while keeping the configured word count, separator, case, leet mode, and suffix settings unchanged.
3. Measure final candidate length after separator, case, leet, and suffix steps.
4. Accept the first candidate whose length exactly matches the requested target.
5. Stop after a bounded number of attempts and fail clearly if no exact match is possible under the current constraints.
6. Return the accepted password plus metadata.
7. Never truncate words or silently override the user’s other settings in order to hit the target length.

## Feedback and User Messaging
Success messaging should follow the quick-command style shown by the reference Base64 extension.

The command should show:
- copied password value
- final character count

Example shape:
- `Copied password (14 chars)` with the generated password visible in the message field or HUD text

Failure cases should be short and actionable, for example:
- invalid preference combination
- no candidate words satisfy the target length
- clipboard operation failed

## Error Handling
The extension should fail clearly rather than silently.

Handled errors:
- invalid or contradictory preferences
- impossible target length under current constraints
- empty candidate set after filtering
- clipboard copy failure

For target length mode, impossible combinations should not loop forever. The generator should use a bounded retry strategy and then surface a short failure message telling the user to loosen the constraints.

## Testing Strategy
Testing should focus on pure generator behavior, not UI rendering.

Tests should cover:
- structure mode output matches configuration
- target length mode returns exact requested length
- separators are applied correctly
- case modes behave correctly
- deterministic leet mapping behaves correctly
- repeated words are avoided where possible
- filters reject unwanted combinations
- impossible target length combinations fail cleanly

Pure generator logic should live in testable functions independent of Raycast APIs.

## Non-Goals for v1
The first version will not include:
- a preview form
- multiple commands
- password history
- presets UI
- full pronounceability scoring
- random partial leet behavior
- truncating words to hit the target length

## Implementation Constraints
- The extension package lives in `word-password-generator/`.
- The command remains `no-view`.
- Preferences are the only configuration surface in v1.
- Default values will be centralized and tuned at the end of implementation, per user instruction.

## Acceptance Criteria
The feature is complete when:
1. running the command copies a generated word-based password immediately
2. preferences persist between sessions through Raycast
3. structure mode works for the supported options
4. target length mode can match an exact requested length by reselecting words
5. the extension shows the copied password and its length after generation
6. generator logic is covered by automated tests for the main rules and edge cases
