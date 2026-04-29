// deploy.mjs — Copies built files to the GitHub Pages repo and pushes
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

// ── Config — change SITE_DIR to your actual path ──────────────────────────────
const PLUGIN_NAME = "BetterCodeBlocks";
const SITE_DIR    = resolve(process.env.HOME, "tanhoangviet.github.io");
const OUT_DIR     = resolve(SITE_DIR, "plugins", PLUGIN_NAME);

// ── Copy files ────────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
copyFileSync("dist/index.js",    `${OUT_DIR}/index.js`);
copyFileSync("dist/manifest.json", `${OUT_DIR}/manifest.json`);
console.log(`✅ Copied to ${OUT_DIR}`);

// ── Git push ──────────────────────────────────────────────────────────────────
try {
  execSync(`cd "${SITE_DIR}" && git add plugins/ && git commit -m "chore: update ${PLUGIN_NAME}" && git push`, { stdio: "inherit" });
  console.log("🚀 Pushed to GitHub Pages!");
} catch (e) {
  console.log("ℹ️  Nothing to push or git error:", e.message);
}
