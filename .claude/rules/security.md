# Security Rules

- Use `crypto.randomInt` for all random selection and suffix digits.
- Never log generated passwords to stdout or files.
- Fail fast when target-length constraints are impossible instead of silently changing user settings.
