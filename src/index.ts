import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
import { EnhancedCodeBlock } from "./components/EnhancedCodeBlock";

const g = globalThis as any;
const bunnyUI = g?.bunny?.ui;
const LazyActionSheet = findByProps("openLazy","hideActionSheet");
const ActionSheetRow = findByProps("ActionSheetRow")?.ActionSheetRow;
const MessageStore = findByStoreName("MessageStore");
const Clipboard = findByProps("setString","getString");
const patches: Array<()=>void> = [];

function extractCode(content: string) {
  const m = /```(\w*)\n?([\s\S]*?)```/.exec(content);
  return m ? { lang: m[1]||"txt", code: m[2].trim() } : null;
}

function patchCodeBlocks(): void {
  const SM = findByProps("defaultRules", "parserFor");
  if (!SM?.defaultRules?.codeBlock) {
    console.error("BCB: Could not find code block parser");
    return;
  }
  const orig = SM.defaultRules.codeBlock.react;
  SM.defaultRules.codeBlock.react = (node: any, output: any, state: any) => {
    if (!storage.enabled) return orig(node, output, state);
    return React.createElement(EnhancedCodeBlock, {
      key: state?.key ?? String(Math.random()),
      code: node.content ?? "",
      lang: node.lang ?? "",
    });
  };
  patches.push(() => { SM.defaultRules.codeBlock.react = orig; });
}

function patchContextMenu() {
  if (!LazyActionSheet || !ActionSheetRow) return;
  const unpatch = before("openLazy", LazyActionSheet, ([component, key, msg]) => {
    const message = msg?.message;
    if (key !== "MessageLongPressActionSheet" || !message) return;
    component.then((instance: any) => {
      let done = false;
      const inner = after("default", instance, (_: any, comp: any) => {
        if (done) return;
        const content: string =
          MessageStore?.getMessage(message.channel_id, message.id)?.content
          ?? message.content ?? "";
        const block = extractCode(content);
        if (!block) return;
        const buttons = findInReactTree(
          comp,
          (x: any) => Array.isArray(x) && x[0]?.type?.name === "ActionSheetRow"
        );
        if (!buttons) return;
        done = true;
        buttons.splice(0, 0,
          React.createElement(ActionSheetRow, {
            label: `⎘  Copy Code · ${block.lang.toUpperCase()}`,
            onPress: () => {
              Clipboard?.setString(block.code);
              LazyActionSheet.hideActionSheet();
            },
          })
        );
        React.useEffect(() => () => inner(), []);
      });
    });
  });
  patches.push(unpatch);
}

export default {
  onLoad() {
    patchCodeblock();
    patchContextMenu();
    showToast("BetterCodeBlocks ✓");
  },
  onUnload() {
    patches.forEach(u => { try { u(); } catch {} });
    patches.length = 0;
  },
};
