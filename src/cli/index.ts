import { Command } from "commander";
import { runGenerate } from "./commands/generate.js";

export function buildProgram(): Command {
  const program = new Command();

  program
    .name("react-intel")
    .description("Generate tests and Storybook stories from React components.")
    .version("0.1.0")
    .argument("<file>", "Path to a .tsx or .jsx component file")
    .option("--ai", "Enable AI-powered enhancement (mock provider for now)", false)
    .option("-y, --yes", "Overwrite existing files without prompting", false)
    .action(async (file: string, opts: { ai: boolean; yes: boolean }) => {
      const code = await runGenerate(file, opts);
      process.exit(code);
    });

  return program;
}
