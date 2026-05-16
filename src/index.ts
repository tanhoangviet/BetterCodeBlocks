import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";

const g = globalThis as any;
const v = g.bunny || g.vendetta;
const metro = v?.metro;
const find = (...p: string[]) => metro?.findByProps?.(...p);
let unpatch: (() => void) | null = null;

function openUI(lang: string, code: string) {
  const Alerts = v?.ui?.alerts || find("showConfirmationAlert");
  const Clipboard = find("setString");
  const Toasts = v?.ui?.toasts || find("showToast");
  if (!Alerts) return;
  Alerts.showConfirmationAlert({
    title: `📄 code.${lang||"txt"}`,
    content: `⚡ BetterCodeBlocks\nLang: ${(lang||"txt").toUpperCase()}\nSize: ${new TextEncoder().encode(code).length}B\n\n${code.slice(0,300)}${code.length>300?"...":""}`,
    confirmText: "Copy Code",
    cancelText: "Close",
    onConfirm: () => { Clipboard?.setString(code); Toasts?.showToast("✓ Copied!"); },
  });
}

function extract(content: string) {
  const r: {lang:string;code:string}[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let m;
  while((m=re.exec(content))!==null) r.push({lang:m[1]||"txt",code:m[2].trim()});
  return r;
}

export default {
  onLoad() {
    const D = find("dispatch","subscribe");
    if (!D) { showToast("BCB: no Dispatcher"); return; }
    const orig = D.dispatch.bind(D);
    D.dispatch = (e: any) => {
      try {
        if (e?.type==="MESSAGE_CONTEXT_MENU"||e?.type==="MESSAGE_PRESS") {
          const c = e?.message?.content||"";
          if (c.includes("```")) {
            const b = extract(c);
            if (b.length) { openUI(b[0].lang,b[0].code); if(e.type==="MESSAGE_CONTEXT_MENU") return; }
          }
        }
      } catch {}
      return orig(e);
    };
    unpatch = () => { D.dispatch = orig; };
    showToast("BetterCodeBlocks ✓");
  },
  onUnload() { unpatch?.(); unpatch=null; },
};
