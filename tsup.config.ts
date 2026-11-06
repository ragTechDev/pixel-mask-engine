import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", canvas: "src/canvas/index.ts", react: "src/react/index.tsx" },
  format: ["esm"],
  // tsup injects `baseUrl`, which TypeScript 6 deprecates. Remove this once the
  // build moves to tsdown (issue #6).
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  minify: true,
  treeshake: true,
  splitting: true,
  clean: true,
  target: "es2020"
});
