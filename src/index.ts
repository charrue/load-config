/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts
import path from "path";
import { existsSync } from "fs";
import { createRequire } from "module";
import { build } from "esbuild";
import { findUp } from "@charrue/node-toolkit";
import isEqual from "fast-deep-equal";

const _require = createRequire(__dirname);
interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

const bundleConfigFile = async (filename: string) => {
  const result = await build({
    entryPoints: [ filename ],
    outfile: "out.js",
    target: [ "esnext" ],
    absWorkingDir: process.cwd(),
    write: false,
    platform: "node",
    bundle: true,
    format: "cjs",
    metafile: true,
    plugins: [
      {
        name: "externalize-deps",
        setup(buildConfig) {
          buildConfig.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path;
            if (id[0] !== "." && !path.isAbsolute(id)) {
              return {
                external: true,
              };
            }
            return {};
          });
        },
      },
    ],
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  };
};

const loadConfigFromBundledFile = (fileName: string, bundledCode: string) => {
  const extension = path.extname(fileName);
  const defaultLoader = _require.extensions[extension]!;
  _require.extensions[extension] = (module, filename) => {
    if (filename === fileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  delete _require.cache[require.resolve(fileName)];
  const raw = _require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  _require.extensions[extension] = defaultLoader;
  return config;
};

export const loadConfigFromFile = async (configFilePath: string) => {
  const bundled = await bundleConfigFile(configFilePath);
  const { dependencies } = bundled;
  const userConfig = loadConfigFromBundledFile(configFilePath, bundled.code);
  const config = await (typeof userConfig === "function"
    ? userConfig()
    : userConfig);

  return {
    config,
    dependencies,
  };
};

const memoizeOne = (fn: any) => {
  let calledOnce = false;
  let prevArgs: any = null;
  let lastResult: any = null;

  return async (...args: any[]) => {
    if (calledOnce && isEqual(args, prevArgs)) return lastResult;

    lastResult = fn(...args);

    if (lastResult.catch) {
      // eslint-disable-next-line no-return-assign
      lastResult.catch(() => (calledOnce = false));
    }

    calledOnce = true;
    prevArgs = args;

    return lastResult;
  };
};

const _loadConfig = async (filename: string, options: { cwd?: string } = {}) => {
  const { cwd = process.cwd() } = options;
  const tsConfigFile = findUp(`${filename}.ts`, {
    cwd,
    type: "file",
  });
  const jsConfigFile = findUp(`${filename}.js`, {
    cwd,
    type: "file",
  });
  const canUsedConfigFile = tsConfigFile || jsConfigFile;
  if (existsSync(canUsedConfigFile)) {
    const configFromUser = await loadConfigFromFile(canUsedConfigFile);
    return {
      ...configFromUser,
      path: canUsedConfigFile,
    };
  }
  console.warn(`can not find ${filename}.ts or ${filename}.js`);
  return null;
};

export const loadConfig: typeof _loadConfig = memoizeOne(_loadConfig);

export const defineConfig = <T = any>(config: T) => config;
