import { React } from "@vendetta/metro/common";
import { findByProps, findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";
import { EnhancedCodeBlock } from "./components/EnhancedCodeBlock";
import { AttachmentPill, isSupportedFile } from "./components/FileViewer";
import Settings from "./Settings";
import { t } from "./i18n";

// Default settings
storage.enabled ??= true;
storage.lineNumbers ??= true;

const patches: Array<() => void> = [];

function patchCodeBlocks(): void {
  const SM = findByProps("defaultRules", "parserFor");
  if (!SM?.defaultRules?.codeBlock) return;
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

function patchAttachments(): void {
  const AC = findByName("Attachment") ?? findByName("FileAttachment");
  if (!AC) return;
  const unpatch = after("default", AC, (args: any[], res: any) => {
    if (!res || !storage.enabled) return res;
    try {
      const p = args[0];
      const filename: string = p?.filename ?? p?.name ?? "";
      if (!isSupportedFile(filename)) return res;
      return React.createElement(AttachmentPill, {
        filename,
        url: p?.url ?? p?.proxy_url ?? "",
        fileSize: p?.size ?? 0,
        children: res,
      });
    } catch { return res; }
  });
  patches.push(unpatch);
}

export default {
  onLoad() {
    patchCodeBlocks();
    patchAttachments();
    showToast(t("ui.toastLoaded"));
  },
  onUnload() {
    patches.forEach(u => { try { u(); } catch {} });
    patches.length = 0;
  },
  settings: Settings,
};
