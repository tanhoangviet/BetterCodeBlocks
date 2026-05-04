import { React } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { EnhancedCodeBlock } from "./components/EnhancedCodeBlock";
import { AttachmentPill, isSupportedFile } from "./components/FileViewer";
import { after } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";

const patches: Array<() => void> = [];

function patchCodeblock() {
  // Target: bunny.ui.components.Codeblock (confirmed via evaluate)
  const g = globalThis as any;
  const components = g?.bunny?.ui?.components ?? g?.vendetta?.ui?.components;
  if (components?.Codeblock) {
    const orig = components.Codeblock;
    components.Codeblock = (props: any) =>
      React.createElement(EnhancedCodeBlock, {
        code: props.content ?? props.code ?? "",
        lang: props.language ?? props.lang ?? "",
      });
    patches.push(() => { components.Codeblock = orig; });
    return true;
  }
  return false;
}

function patchAttachments() {
  const AC = findByName("Attachment") ?? findByName("FileAttachment");
  if (!AC) return;
  const up = after("default", AC, (args: any[], res: any) => {
    if (!res) return res;
    try {
      const p = args[0];
      const fn: string = p?.filename ?? p?.name ?? "";
      if (!isSupportedFile(fn)) return res;
      return React.createElement(AttachmentPill, {
        filename: fn, url: p?.url ?? p?.proxy_url ?? "",
        fileSize: p?.size ?? 0, children: res,
      });
    } catch { return res; }
  });
  patches.push(up);
}

export default {
  onLoad() {
    const ok = patchCodeblock();
    patchAttachments();
    showToast(ok ? "BetterCodeBlocks ✓" : "BCB: fallback mode");
  },
  onUnload() {
    patches.forEach(u => { try { u(); } catch {} });
    patches.length = 0;
  },
};
