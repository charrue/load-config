import { defineConfig, languages } from "./defineConfig";

export default defineConfig({
  build: {
    esm: false,
    ext: languages[0],
    dependencies: [ "esbuild" ],
  },
});
