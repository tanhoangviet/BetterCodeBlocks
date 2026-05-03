<<<<<<< HEAD
=======
<<<<<<< HEAD
// build.mjs — Bundles plugin into single index.js for Kettu/Bunny
import esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";
=======
>>>>>>> cc42eff (fix: patch both codeBlock and fence rules)
import { readFile, writeFile, mkdir } from "fs/promises";
import { extname } from "path";
import { createHash } from "crypto";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import swc from "@swc/core";
<<<<<<< HEAD

const extensions = [".js",".jsx",".mjs",".ts",".tsx",".cts",".mts"];

=======
>>>>>>> 91227eb (feat: use GitHub Actions to build + correct globals mapping)

const extensions = [".js",".jsx",".mjs",".ts",".tsx",".cts",".mts"];

<<<<<<< HEAD
const SHIMS = {
  "@vendetta/metro/common": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = {
      React: _v&&_v.metro&&_v.metro.common ? _v.metro.common.React : undefined,
      ReactNative: _v&&_v.metro&&_v.metro.common ? _v.metro.common.ReactNative : undefined,
    };
  `,
  "@vendetta/metro": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = {
      findByProps:       _v&&_v.metro ? _v.metro.findByProps       : function(){ return null; },
      findByName:        _v&&_v.metro ? _v.metro.findByName        : function(){ return null; },
      findByDisplayName: _v&&_v.metro ? _v.metro.findByDisplayName : function(){ return null; },
      common:            _v&&_v.metro ? _v.metro.common            : {},
    };
  `,
  "@vendetta/patcher": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    var _p = _v&&_v.patcher ? _v.patcher : {};
    module.exports = {
      before:  _p.before  || function(){ return function(){}; },
      after:   _p.after   || function(){ return function(){}; },
      instead: _p.instead || function(){ return function(){}; },
    };
  `,
  "@vendetta/plugin": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = { storage: _v&&_v.plugin ? _v.plugin.storage : {} };
  `,
  "@vendetta/storage": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = {
      useProxy: _v&&_v.storage ? _v.storage.useProxy : function(s){ return s; },
    };
  `,
  "@vendetta/ui/toasts": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = {
      showToast: _v&&_v.ui&&_v.ui.toasts ? _v.ui.toasts.showToast : function(){},
    };
  `,
  "@vendetta/ui/assets": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = {
      getAssetIDByName: _v&&_v.ui&&_v.ui.assets ? _v.ui.assets.getAssetIDByName : function(){ return 0; },
    };
  `,
  "@vendetta/ui": `
    var _v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
    module.exports = _v&&_v.ui ? _v.ui : {};
  `,
};

const vendettaPlugin = {
  name: "vendetta-shim",
  setup(build) {
    build.onResolve({ filter: /^@vendetta/ }, (args) => ({
      path: args.path,
      namespace: "vendetta-shim",
    }));
    build.onLoad({ filter: /.*/, namespace: "vendetta-shim" }, (args) => ({
      contents: SHIMS[args.path] ?? "module.exports = {};",
      loader: "js",
    }));
=======
>>>>>>> cc42eff (fix: patch both codeBlock and fence rules)
const plugins = [
  nodeResolve({ extensions }),
  commonjs(),
  json(),
  {
    name: "swc",
    async transform(code, id) {
      const ext = extname(id);
      if (!extensions.includes(ext)) return null;
      const ts = ext.includes("ts");
      const tsx = ts ? ext.endsWith("x") : undefined;
      const jsx = !ts ? ext.endsWith("x") : undefined;
      const result = await swc.transform(code, {
        filename: id,
        jsc: {
          externalHelpers: true,
          parser: { syntax: ts ? "typescript" : "ecmascript", tsx, jsx },
        },
        env: {
          targets: "defaults",
          include: ["transform-classes", "transform-arrow-functions"],
        },
      });
      return result.code;
    },
  },
  esbuild({ minify: true }),
];

await mkdir("./dist/BetterCodeBlocks", { recursive: true });
const manifest = JSON.parse(await readFile("./manifest.json"));
const outPath = "./dist/BetterCodeBlocks/index.js";
<<<<<<< HEAD

const bundle = await rollup({
  input: "./src/index.ts",
  onwarn: () => {},
  plugins,
});

await bundle.write({
  file: outPath,
  globals(id) {
    // Official mapping: strip @ and replace / with .
    if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
    if (id === "react") return "window.React";
    return null;
  },
  format: "iife",
  compact: true,
  exports: "named",
});
await bundle.close();

=======

const bundle = await rollup({
  input: "./src/index.ts",
  onwarn: () => {},
  plugins,
});

await bundle.write({
  file: outPath,
  globals(id) {
    // Official mapping: strip @ and replace / with .
    if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
    if (id === "react") return "window.React";
    return null;
>>>>>>> 91227eb (feat: use GitHub Actions to build + correct globals mapping)
  },
  format: "iife",
  compact: true,
  exports: "named",
});
await bundle.close();

<<<<<<< HEAD
const opts = {
  entryPoints: ["src/index.ts"],
  bundle:      true,
  format:      "cjs",
  target:      "es2019",
  outfile:     "dist/index.js",
  plugins:     [vendettaPlugin],
  jsx:         "transform",
  jsxFactory:  "React.createElement",
  jsxFragment: "React.Fragment",
  define:      { "__DEV__": "false" },
  treeShaking: true,
  minify:      !watch,
  logLevel:    "info",
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("Watching...");
} else {
  mkdirSync("dist", { recursive: true });
  await esbuild.build(opts);
  copyFileSync("manifest.json", "dist/manifest.json");
  console.log("Built -> dist/index.js");
}
=======
>>>>>>> cc42eff (fix: patch both codeBlock and fence rules)
const toHash = await readFile(outPath);
manifest.hash = createHash("sha256").update(toHash).digest("hex");
manifest.main = "index.js";
await writeFile("./dist/BetterCodeBlocks/manifest.json", JSON.stringify(manifest));
console.log("Built BetterCodeBlocks!");
<<<<<<< HEAD
=======
>>>>>>> 91227eb (feat: use GitHub Actions to build + correct globals mapping)
>>>>>>> cc42eff (fix: patch both codeBlock and fence rules)
