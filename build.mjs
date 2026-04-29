// build.mjs — Bundles plugin into single index.js for Kettu/Bunny
import esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";

const watch = process.argv.includes("--watch");

const VENDETTA_EXTERNALS = [
  "@vendetta",
  "@vendetta/metro",
  "@vendetta/metro/common",
  "@vendetta/patcher",
  "@vendetta/storage",
  "@vendetta/plugin",
  "@vendetta/ui/toasts",
  "@vendetta/ui/assets",
  "@vendetta/ui",
];

/** @type {import("esbuild").BuildOptions} */
const opts = {
  entryPoints:  ["src/index.ts"],
  bundle:       true,
  format:       "cjs",
  target:       "es2019",
  outfile:      "dist/index.js",
  external:     VENDETTA_EXTERNALS,
  jsx:          "transform",
  jsxFactory:   "React.createElement",
  jsxFragment:  "React.Fragment",
  define:       { "__DEV__": "false" },
  treeShaking:  true,
  minify:       !watch,
  logLevel:     "info",
  banner: {
    // Shim vendetta/bunny APIs so the bundle resolves them at runtime
    js: `
const _vApi = (typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {}));
const _require = (id) => {
  if (id === "@vendetta/metro/common") return _vApi?.metro?.common ?? {};
  if (id === "@vendetta/metro")        return _vApi?.metro ?? {};
  if (id === "@vendetta/patcher")      return _vApi?.patcher ?? {};
  if (id === "@vendetta/storage")      return _vApi?.plugin?.storage ?? {};
  if (id === "@vendetta/plugin")       return _vApi?.plugin ?? {};
  if (id === "@vendetta/ui/toasts")    return _vApi?.ui?.toasts ?? {};
  if (id === "@vendetta/ui/assets")    return _vApi?.ui?.assets ?? {};
  if (id === "@vendetta/ui")           return _vApi?.ui ?? {};
  if (id === "react")                  return _vApi?.metro?.common?.React ?? {};
  if (id === "react-native")           return _vApi?.metro?.common?.ReactNative ?? {};
  return {};
};
`.trim(),
  },
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("👀 Watching...");
} else {
  mkdirSync("dist", { recursive: true });
  await esbuild.build(opts);

  // Also copy manifest to dist/
  copyFileSync("manifest.json", "dist/manifest.json");

  console.log("✅ Built → dist/index.js + dist/manifest.json");
}
