import { buildProgram } from "../src/cli/index.js";

buildProgram().parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
