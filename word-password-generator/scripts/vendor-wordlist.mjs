import { writeFile } from "node:fs/promises";

const sourceUrl = "https://raw.githubusercontent.com/kklash/wordlist4096/main/wordlist4096.txt";
const outputUrl = new URL("../src/generator/wordlist.ts", import.meta.url);

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to download word list: ${response.status} ${response.statusText}`);
}

const words = [
  ...new Set(
    (await response.text())
      .split(/\r?\n/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => /^[a-z]{3,8}$/.test(word)),
  ),
];

const contents = `// Source: ${sourceUrl}\n// License: MIT (kklash/wordlist4096)\nexport const wordlist = ${JSON.stringify(words, null, 2)} as const;\n`;

await writeFile(outputUrl, contents);
console.log(`Wrote ${words.length} words to src/generator/wordlist.ts`);
