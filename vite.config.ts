import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "node",
  },
});
