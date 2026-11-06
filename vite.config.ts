import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "examples/react-demo",
  plugins: [react()],
  server: { open: true }
});
