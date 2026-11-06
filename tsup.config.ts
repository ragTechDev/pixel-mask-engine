import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", canvas: "src/canvas/index.ts", react: "src/react/index.tsx" },
  format: ["esm"],
  dts: true,
  minify: true,
  treeshake: true,
  splitting: true,
  clean: true,
  target: "es2020"
});
