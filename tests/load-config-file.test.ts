import path from "path";
import { describe, expect, test } from "vitest";
import { loadConfigFromFile, loadConfig } from "../src/index";

describe("loadConfigFile", () => {
  const mockConfigFile = path.resolve(__dirname, "./mocks/toolkit.config.ts");
  test("aa", async () => {
    await expect(loadConfigFromFile(mockConfigFile))
      .resolves
      .toHaveProperty("config", {
        build: {
          esm: false,
          ext: "js",
          dependencies: [ "esbuild" ],
        },
      });
  });

  test("loadConfig", async () => {
    const config = await loadConfig("toolkit.config", { cwd: path.resolve(__dirname, "./mocks") });
    expect(config)
      .toEqual({
        build: {
          esm: false,
          ext: "js",
          dependencies: [ "esbuild" ],
        },
      });

    const newConfig = await loadConfig("toolkit.config", { cwd: path.resolve(__dirname, "./mocks") });
    expect(newConfig).toBe(config);
  });
});
