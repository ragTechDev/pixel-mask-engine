import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base: the studio uses hash routes, so the same build works on GitHub Pages
// under /pixel-mask-engine/, on a custom domain, or from any other folder.
export default defineConfig({
  root: "studio",
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
  server: { open: true }
});
