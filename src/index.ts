import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { EnhancedCodeBlock } from "./components/EnhancedCodeBlock";
import Settings from "./components/Settings";

// ── Defaults ─────────────────────────────────────────────────────────────────
if (storage.highlight === undefined) storage.highlight = true;
if (storage.lineNumbers === undefined) storage.lineNumbers = true;
if (storage.copyToast === undefined) storage.copyToast = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
const g = globalThis as any;
const safe = (fn: () => any) => { try { return fn(); } catch { return null; } };
const find = (...p: string[]) => safe(() => findByProps(...p));

function findInTree(tree: any, fn: (x: any) => boolean, depth = 0): any {
  if (!tree || depth > 15) return null;
  if (fn(tree)) return tree;
  if (Array.isArray(tree)) { for (const n of tree) { const r = findInTree(n, fn, depth+1); if (r) return r; } }
  else if (typeof tree === "object") {
    for (const k of ["props","children","_children"]) {
      if (tree[k]) { const r = findInTree(tree[k], fn, depth+1); if (r) return r; }
    }
  }
  return null;
}

function extractCode(content: string) {
  const m = /```(\w*)\n?([\s\S]*?)```/.exec(content);
  return m ? { lang: m[1]||"txt", code: m[2].trim() } : null;
}

// ── Patches ───────────────────────────────────────────────────────────────────
const patches: Array<()=>void> = [];

function patchCodeblock() {
  const components = g?.bunny?.ui?.components ?? g?.vendetta?.ui?.components;
  if (!components?.Codeblock) return;
  const orig = components.Codeblock;
  components.Codeblock = (props: any) => {
    if (!storage.highlight) return orig(props);
    return safe(() => React.createElement(EnhancedCodeBlock, {
      content: props.content ?? props.code ?? "",
      language: props.language ?? props.lang ?? "",
      storage,
    })) ?? orig(props);
  };
  patches.push(() => { components.Codeblock = orig; });
}

function patchContextMenu() {
  const LazyAS = safe(() => findByProps("openLazy","hideActionSheet"));
  const ASRow = safe(() => findByProps("ActionSheetRow")?.ActionSheetRow);
  const MsgStore = safe(() => findByStoreName("MessageStore"));
  const Clip = safe(() => findByProps("setString","getString"));
  if (!LazyAS || !ASRow) return;

  const up = before("openLazy", LazyAS, ([comp, key, msg]) => {
    const message = msg?.message;
    if (key !== "MessageLongPressActionSheet" || !message) return;
    comp.then((inst: any) => {
      let done = false;
      const inner = after("default", inst, (_: any, tree: any) => {
        if (done) return;
        const content: string = safe(() =>
          MsgStore?.getMessage(message.channel_id, message.id)?.content
        ) ?? message.content ?? "";
        const block = extractCode(content);
        if (!block) return;
        const buttons = findInTree(tree, (x: any) =>
          Array.isArray(x) && x.length > 0 && x[0]?.type?.name === "ActionSheetRow"
        );
        if (!buttons) return;
        done = true;
        buttons.splice(0, 0,
          React.createElement(ASRow, {
            label: `⎘  Copy Code · ${block.lang.toUpperCase()}`,
            onPress: () => {
              safe(() => Clip?.setString(block.code));
              LazyAS.hideActionSheet();
              if (storage.copyToast) showToast("✓ Code copied!");
            },
          })
        );
        React.useEffect(() => () => inner(), []);
      });
    });
  });
  patches.push(up);
}

// ── Plugin ────────────────────────────────────────────────────────────────────
export default {
  onLoad() {
    safe(() => patchCodeblock());
    safe(() => patchContextMenu());
    showToast("BetterCodeBlocks ✓");
  },
  onUnload() {
    patches.forEach(u => safe(u));
    patches.length = 0;
    // Restore Codeblock
    const components = g?.bunny?.ui?.components ?? g?.vendetta?.ui?.components;
    if (components) {
      const orig = (patches as any)._cbOrig;
      if (orig) components.Codeblock = orig;
    }
  },
  settings: Settings,
};
