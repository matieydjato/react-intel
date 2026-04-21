import { access, writeFile } from "node:fs/promises";
import { IOError } from "../core/errors.js";

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function writeFileSafe(path: string, content: string): Promise<void> {
  try {
    await writeFile(path, content, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new IOError(`Failed to write ${path}: ${message}`);
  }
}
