import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";

const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;
const MessageStore = findByStoreName("MessageStore");
const Clipboard = findByProps("setString", "getString");

const patches: Array<() => void> = [];

function extractCode(content: string): { lang: string; code: string } | null {
  const m = /```(\w*)\n?([\s\S]*?)```/.exec(content);
  if (!m) return null;
  return { lang: m[1] || "txt", code: m[2].trim() };
}

export default {
  onLoad() {
    if (!LazyActionSheet) { showToast("BCB: no ActionSheet"); return; }

    const unpatch = before("openLazy", LazyActionSheet, ([component, key, msg]) => {
      const message = msg?.message;
      if (key !== "MessageLongPressActionSheet" || !message) return;

      component.then((instance: any) => {
        const innerUnpatch = after("default", instance, (_: any, component: any) => {
          React.useEffect(() => () => innerUnpatch(), []);

          const content: string =
            MessageStore?.getMessage(message.channel_id, message.id)?.content ??
            message.content ?? "";

          const block = extractCode(content);
          if (!block) return;

          const buttons = findInReactTree(
            component,
            (x: any) => Array.isArray(x) && x[0]?.type?.name === "ActionSheetRow"
          );
          if (!buttons) return;

          const position = Math.max(
            buttons.findIndex((x: any) => x?.props?.message != null),
            0
          );

          buttons.splice(position, 0,
            React.createElement(ActionSheetRow, {
              label: `⎘ Copy Code (${block.lang.toUpperCase()})`,
              onPress: () => {
                LazyActionSheet.hideActionSheet();
                Clipboard?.setString(block.code);
                showToast("✓ Code copied!");
              },
            })
          );
        });
      });
    });

    patches.push(unpatch);
    showToast("BetterCodeBlocks ✓");
  },
  onUnload() {
    patches.forEach(u => { try { u(); } catch {} });
    patches.length = 0;
  },
};
