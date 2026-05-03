// build.mjs — Bundles plugin into single index.js for Kettu/Bunny
import esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";

const watch = process.argv.includes("--watch");

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
  },
};

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
