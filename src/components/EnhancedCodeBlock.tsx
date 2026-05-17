import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { tokenize, getColor, LANG_LABEL, Colors } from "../utils/tokenizer";

const { View, Text, TouchableOpacity, ScrollView, StyleSheet } = (
  (globalThis as any).bunny?.metro?.common?.ReactNative ??
  findByProps("View","Text","ScrollView")
);

const Clipboard = findByProps("setString","getString") ?? { setString: (_: string) => {} };

// ── SVG code icon via unicode ──────────────────────────────────────────────────
const S = StyleSheet.create({
  wrap: {
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    backgroundColor: Colors.bg,
  },
  // Nav bar top
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgSurf,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  langDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  langText: { color: Colors.muted, fontSize: 11, fontFamily: "monospace", letterSpacing: 0.5 },
  // Code area
  codeScroll: { maxHeight: 300 },
  codeInner: { flexDirection: "row", padding: 12 },
  lineNums: {
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    alignItems: "flex-end",
    minWidth: 28,
  },
  lineNum: { color: Colors.muted, fontFamily: "monospace", fontSize: 12, lineHeight: 20, textAlign: "right" },
  codeText: { fontFamily: "monospace", fontSize: 13, lineHeight: 20, color: Colors.text },
  // Bottom nav bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurf,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  barInfo: { flex: 1, color: Colors.muted, fontSize: 10, fontFamily: "monospace", letterSpacing: 0.5 },
  barBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgOver,
  },
  barBtnOk: { borderColor: Colors.success, backgroundColor: "#1e3a2a" },
  barBtnText: { color: Colors.text, fontSize: 11, fontFamily: "monospace" },
  barBtnTextOk: { color: Colors.success },
});

interface Props { content: string; language?: string }

export function EnhancedCodeBlock({ content, language }: Props) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const lang = (language || "").toLowerCase();
  const label = LANG_LABEL[lang] ?? (lang ? lang.toUpperCase() : "Code");
  const lines = content.split("\n");
  const lineCount = lines.length;
  const tokens = tokenize(content, lang);

  const doCopy = () => {
    Clipboard.setString(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return React.createElement(View, { style: S.wrap },

    // ── Top nav bar ──
    React.createElement(View, { style: S.nav },
      React.createElement(View, { style: S.navLeft },
        React.createElement(View, { style: S.langDot }),
        React.createElement(Text, { style: S.langText }, label),
      ),
    ),

    // ── Code area ──
    React.createElement(ScrollView, {
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      style: expanded ? null : S.codeScroll,
    },
      React.createElement(ScrollView, {
        showsVerticalScrollIndicator: true,
        nestedScrollEnabled: true,
      },
        React.createElement(View, { style: S.codeInner },

          // Line numbers
          React.createElement(View, { style: S.lineNums },
            ...lines.map((_, i) =>
              React.createElement(Text, { key: i, style: S.lineNum }, String(i + 1))
            )
          ),

          // Highlighted code
          React.createElement(Text, { selectable: true, style: S.codeText },
            ...tokens.map((tok, i) =>
              React.createElement(Text, {
                key: i,
                style: { color: getColor(tok.t), fontFamily: "monospace" },
              }, tok.v)
            )
          ),
        )
      )
    ),

    // ── Bottom nav bar ──
    React.createElement(View, { style: S.bottomBar },

      // Info: lines + size
      React.createElement(Text, { style: S.barInfo },
        `${lineCount} line${lineCount !== 1 ? "s" : ""}  ·  ${new TextEncoder().encode(content).length}B`
      ),

      // Expand/collapse
      React.createElement(TouchableOpacity, {
        style: S.barBtn,
        onPress: () => setExpanded(e => !e),
        activeOpacity: 0.7,
      },
        React.createElement(Text, { style: S.barBtnText }, expanded ? "▲" : "▼")
      ),

      // Copy button
      React.createElement(TouchableOpacity, {
        style: [S.barBtn, copied && S.barBtnOk],
        onPress: doCopy,
        activeOpacity: 0.7,
      },
        React.createElement(Text, {
          style: [S.barBtnText, copied && S.barBtnTextOk],
        }, copied ? "✓ Copied" : "⎘ Copy")
      ),
    ),
  );
}
