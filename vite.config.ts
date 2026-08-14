import { defineConfig } from "vite";

// Relative base so the build works from any GitHub Pages sub-path
// (user.github.io/xml-tools/) without hardcoding the repo name.
export default defineConfig({
  base: "./",
});
