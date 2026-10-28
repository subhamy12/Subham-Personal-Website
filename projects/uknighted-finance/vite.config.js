import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds the demo into /uknighted-finance at the website root.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../../uknighted-finance",
    emptyOutDir: true,
  },
});
