import chalk from "chalk";

/**
 * Verbose mode: enabled by --verbose CLI flag or by setting the
 * REACT_SPEC_GEN_DEBUG environment variable to a non-empty value.
 * When disabled, `logger.debug()` is a no-op.
 */
let verboseEnabled = Boolean(process.env.REACT_SPEC_GEN_DEBUG);

export const logger = {
  setVerbose(enabled: boolean): void {
    verboseEnabled = enabled || Boolean(process.env.REACT_SPEC_GEN_DEBUG);
  },
  isVerbose(): boolean {
    return verboseEnabled;
  },
  info(msg: string): void {
    console.log(msg);
  },
  success(msg: string): void {
    console.log(chalk.green("✓ ") + msg);
  },
  warn(msg: string): void {
    console.warn(chalk.yellow("! ") + msg);
  },
  error(msg: string): void {
    console.error(chalk.red("✖ ") + msg);
  },
  dim(msg: string): void {
    console.log(chalk.dim(msg));
  },
  debug(msg: string): void {
    if (verboseEnabled) console.log(chalk.gray("[debug] ") + msg);
  },
};
