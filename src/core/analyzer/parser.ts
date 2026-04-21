import { parse, type ParserOptions } from "@babel/parser";
import type { File } from "@babel/types";
import { readFile } from "node:fs/promises";
import { ParseError } from "../errors.js";

const DEFAULT_PLUGINS: ParserOptions["plugins"] = [
  "jsx",
  "typescript",
  "decorators-legacy",
  "classProperties",
  "topLevelAwait",
];

export interface ParsedSource {
  filePath: string;
  source: string;
  ast: File;
}

export async function parseFile(filePath: string): Promise<ParsedSource> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (err) {
    throw new ParseError(
      `Could not read file: ${filePath}`,
      "Verify the path exists and is readable.",
    );
  }

  try {
    const ast = parse(source, {
      sourceType: "module",
      sourceFilename: filePath,
      plugins: DEFAULT_PLUGINS,
      errorRecovery: false,
    });
    return { filePath, source, ast };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ParseError(
      `Failed to parse ${filePath}: ${message}`,
      "Ensure the file is valid TypeScript/JSX.",
    );
  }
}
