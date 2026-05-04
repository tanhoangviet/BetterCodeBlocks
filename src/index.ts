import { React } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { EnhancedCodeBlock } from "./components/EnhancedCodeBlock";
import { AttachmentPill, isSupportedFile } from "./components/FileViewer";
import { after } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";

const patches: Array<() => void> = [];

function patchCodeblock() {
  const g = globalThis as any;
  const c = g?.bunny?.ui?.components ?? g?.vendetta?.ui?.components;
  if (!c?.Codeblock) return false;
  const orig = c.Codeblock;
  c.Codeblock = (p: any) => React.createElement(EnhancedCodeBlock, {
    code: p.content ?? p.code ?? "",
    lang: p.language ?? p.lang ?? "",
  });
  patches.push(() => { c.Codeblock = orig; });
  return true;
}

function patchAttachments() {
  const AC = findByName("Attachment") ?? findByName("FileAttachment");
  if (!AC) return;
  patches.push(after("default", AC, (args: any[], res: any) => {
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
  }));
}

export default {
  onLoad() {
    showToast(patchCodeblock() ? "BetterCodeBlocks ✓" : "BCB: not found");
    patchAttachments();
  },
  onUnload() {
    patches.forEach(u => { try { u(); } catch {} });
    patches.length = 0;
  },
};
