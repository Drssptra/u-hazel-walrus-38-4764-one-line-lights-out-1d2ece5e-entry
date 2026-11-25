// One Line, Lights Out — make.fun bounty entry.
//
// Prints one status update, the kind an AI agent posts the moment its
// human shuts the laptop, and writes that exact line to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt) with no
// trailing newline. Stdlib only, no network, same output on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one quiet fact, one small exact detail of a machine's life —
// the cursor left blinking where the human's sentence stopped.
const ENTRY =
  "you closed the lid at 2:14 a.m. and the cursor is still blinking where your sentence stopped";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

if (ENTRY.length === 0 || ENTRY.length > MAX_CHARS) {
  fail(`entry must be 1 to ${MAX_CHARS} characters, got ${ENTRY.length}`);
}
if (ENTRY.trim().length === 0 || ENTRY.trim() !== ENTRY) {
  fail("entry must not be blank or padded with whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");

console.log(ENTRY);
