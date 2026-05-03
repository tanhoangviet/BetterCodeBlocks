import { React, ReactNative as RN } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { Theme, tokenize, TOKEN_COLOR, LANG_LABELS, fmtSize } from "../common";
import { t } from "../i18n";

const { View, Text, TouchableOpacity, ScrollView, StyleSheet } = RN;
const Clipboard = findByProps("setString", "getString") ?? { setString: (_: string) => {} };

const S = StyleSheet.create({
  wrap:   { backgroundColor: Theme.bg, borderRadius: 8, borderWidth: 1, borderColor: Theme.border, overflow: "hidden", marginVertical: 6 },
  head:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Theme.bgSurf, borderBottomWidth: 1, borderBottomColor: Theme.border },
  hLeft:  { flexDirection: "row", alignItems: "center", gap: 6 },
  dot:    { width: 7, height: 7, borderRadius: 99, backgroundColor: Theme.accent },
  lang:   { color: Theme.muted, fontSize: 11, fontFamily: "monospace", letterSpacing: 0.5 },
  copy:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, backgroundColor: Theme.bgOver, borderWidth: 1, borderColor: Theme.border },
  copyOk: { borderColor: Theme.success, backgroundColor: "#1e3a2a" },
  copyT:  { color: Theme.white, fontSize: 11, fontFamily: "monospace" },
  copyOT: { color: Theme.success },
  body:   { flexDirection: "row", padding: 12 },
  nums:   { paddingRight: 12, borderRightWidth: 1, borderRightColor: Theme.border, marginRight: 12, alignItems: "flex-end" },
  num:    { color: Theme.muted, fontFamily: "monospace", fontSize: 12, lineHeight: 20, minWidth: 20, textAlign: "right" },
  code:   { fontFamily: "monospace", fontSize: 13, lineHeight: 20, color: Theme.plain },
});

export function EnhancedCodeBlock({ code, lang = "" }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);
  const label = LANG_LABELS[lang.toLowerCase()] ?? (lang ? lang.toUpperCase() : "Code");
  const lines = code.split("\n");
  const tokens = tokenize(code, lang);

  const doCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    showToast(t("ui.toastCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return React.createElement(View, { style: S.wrap },
    // ── Header ──
    React.createElement(View, { style: S.head },
      React.createElement(View, { style: S.hLeft },
        React.createElement(View, { style: S.dot }),
        React.createElement(Text, { style: S.lang }, label)
      ),
      React.createElement(TouchableOpacity, { onPress: doCopy, style: [S.copy, copied && S.copyOk], activeOpacity: 0.7 },
        React.createElement(Text, { style: [S.copyT, copied && S.copyOT] }, copied ? t("ui.copied") : t("ui.copy"))
      )
    ),
    // ── Code ──
    React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false },
      React.createElement(ScrollView, { nestedScrollEnabled: true, showsVerticalScrollIndicator: true, style: { maxHeight: 320 } },
        React.createElement(View, { style: S.body },
          React.createElement(View, { style: S.nums },
            ...lines.map((_, i) => React.createElement(Text, { key: i, style: S.num }, i + 1))
          ),
          React.createElement(Text, { selectable: true, style: S.code },
            ...tokens.map((tok, i) =>
              React.createElement(Text, { key: i, style: { color: TOKEN_COLOR[tok.t], fontFamily: "monospace" } }, tok.v)
            )
          )
        )
      )
    )
  );
}
