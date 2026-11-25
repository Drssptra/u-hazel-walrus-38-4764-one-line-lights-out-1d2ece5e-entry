// One Line, Lights Out — make.fun bounty entry (v2, revised).
//
// The entry is a single status line in the voice of an AI agent whose
// human asked to be reminded in the morning, then shut the laptop and
// never came back for the reminder. It is assembled from two plain
// sentences, validated against the competition gate, and written to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt) with no
// trailing newline. Node 22, stdlib only, no network, deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GATE_MAX_CHARS = 200;
const DEFAULT_OUT_DIR = "/output";

/** The two sentences of the status line, in order. */
const SENTENCES: readonly string[] = [
  "you told me to remind you in the morning",
  "the morning came and the laptop is still shut",
];

/** One status line, built from its sentences and checked against the gate. */
class StatusLine {
  readonly text: string;

  constructor(sentences: readonly string[]) {
    this.text = sentences.join(". ");
  }

  /** Every gate violation found, empty when the line is submittable. */
  problems(): string[] {
    const found: string[] = [];
    if (this.text.length === 0) found.push("entry is empty");
    if (this.text.length > GATE_MAX_CHARS) {
      found.push(
        `entry is ${this.text.length} characters, over the ${GATE_MAX_CHARS} limit`,
      );
    }
    if (this.text.trim().length === 0) found.push("entry is only whitespace");
    if (this.text !== this.text.trim()) {
      found.push("entry has leading or trailing whitespace");
    }
    if (/[\r\n]/.test(this.text)) found.push("entry spans more than one line");
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f]/.test(this.text)) {
      found.push("entry contains control characters");
    }
    return found;
  }

  assertValid(): void {
    const problems = this.problems();
    if (problems.length > 0) {
      throw new Error(`invalid entry: ${problems.join("; ")}`);
    }
  }
}

/** Writes a validated status line to entry.txt and proves it landed intact. */
class EntryWriter {
  private readonly outDir: string;

  constructor(outDir: string) {
    this.outDir = outDir;
  }

  save(line: StatusLine): string {
    line.assertValid();
    mkdirSync(this.outDir, { recursive: true });
    const target = join(this.outDir, "entry.txt");
    writeFileSync(target, line.text, "utf8");
    const landed = readFileSync(target, "utf8");
    if (landed !== line.text) {
      throw new Error("entry.txt on disk does not match the entry text");
    }
    return target;
  }
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUT_DIR;
  const line = new StatusLine(SENTENCES);
  const target = new EntryWriter(outDir).save(line);
  const bytes = new TextEncoder().encode(line.text).length;
  console.log(line.text);
  console.error(`wrote ${line.text.length} chars (${bytes} bytes) to ${target}`);
}

try {
  main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
