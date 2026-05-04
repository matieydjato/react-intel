import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/react-intel": "bin/react-intel.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  shims: false,
  banner: () => {
    // tsup doesn't auto-add a shebang; we add it for the CLI bin only via esbuild.
    return {};
  },
  esbuildOptions(options) {
    options.banner = {
      js: "",
    };
  },
  // Prepend shebang to the bin output after build.
  onSuccess: async () => {
    const fs = await import("node:fs/promises");
    const path = "dist/bin/react-intel.js";
    try {
      const content = await fs.readFile(path, "utf8");
      if (!content.startsWith("#!")) {
        await fs.writeFile(path, `#!/usr/bin/env node\n${content}`);
        await fs.chmod(path, 0o755);
      }
    } catch {
      // ignore if file doesn't exist
    }
  },
});
