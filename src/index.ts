import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
import { semanticColors } from "@vendetta/ui";
import { CodeIcon } from "./components/CodeIcon";

const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const ActionSheetRow = findByProps("ActionSheetRow")?.ActionSheetRow;
const MessageStore = findByStoreName("MessageStore");
const Clipboard = findByProps("setString", "getString");
const { stylesheet } = findByProps("createThemedStyleSheet") ?? {};

const patches: Array<() => void> = [];

const styles = stylesheet?.createThemedStyleSheet?.({
  icon: { width: 24, height: 24, tintColor: semanticColors?.INTERACTIVE_NORMAL },
}) ?? {};

function extractCode(content: string) {
  const m = /```(\w*)\n?([\s\S]*?)```/.exec(content);
  if (!m) return null;
  return { lang: m[1] || "txt", code: m[2].trim() };
}

export default {
  onLoad() {
    if (!LazyActionSheet) return;

    const unpatch = before("openLazy", LazyActionSheet, ([component, key, msg]) => {
      const message = msg?.message;
      if (key !== "MessageLongPressActionSheet" || !message) return;

      component.then((instance: any) => {
        let patched = false;
        const innerUnpatch = after("default", instance, (_: any, comp: any) => {
          if (patched) return;

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

          patched = true;

          buttons.splice(0, 0,
            React.createElement(ActionSheetRow, {
              label: `Copy Code · ${block.lang.toUpperCase()}`,
              icon: React.createElement(ActionSheetRow.Icon, {
                IconComponent: () => React.createElement(CodeIcon, {
                  size: 24,
                  color: "#b8c8d8",
                }),
              }),
              onPress: () => {
                Clipboard?.setString(block.code);
                LazyActionSheet.hideActionSheet();
              },
            })
          );

          React.useEffect(() => () => innerUnpatch(), []);
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
