import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { Colors } from "../utils/tokenizer";

const RN = (globalThis as any).bunny?.metro?.common?.ReactNative ?? findByProps("View","Text","Switch","ScrollView");
const { View, Text, Switch, ScrollView, TouchableOpacity, StyleSheet } = RN;

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  wrap: { padding: 16, gap: 12 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontFamily: "monospace", fontSize: 10, letterSpacing: 2,
    color: Colors.accent, textTransform: "uppercase", marginBottom: 8,
    paddingLeft: 4,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.bgSurf, borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 6,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  rowDesc: { color: Colors.muted, fontSize: 12, marginTop: 3 },
  chip: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4,
  },
  chipBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgOver,
  },
  chipBtnActive: { borderColor: Colors.accent, backgroundColor: "#1a2a4a" },
  chipText: { color: Colors.muted, fontFamily: "monospace", fontSize: 12 },
  chipTextActive: { color: Colors.accent },
  footer: {
    marginTop: 20, padding: 14, backgroundColor: Colors.bgSurf,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center",
  },
  footerText: { color: Colors.muted, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 },
});

const LANGS = ["lua","py","js","ts","json","css","html"];

export default function Settings() {
  const s = useProxy(storage);

  const toggle = (key: string) => { (s as any)[key] = !(s as any)[key]; };

  const rows = [
    { key: "highlight",   title: "Syntax Highlighting", desc: "Color tokens in code blocks" },
    { key: "lineNumbers", title: "Line Numbers",         desc: "Show line numbers on the left" },
    { key: "copyToast",   title: "Copy Toast",           desc: "Show toast when code is copied" },
  ];

  return React.createElement(ScrollView, { style: S.scroll },
    React.createElement(View, { style: S.wrap },

      // ── Features ──
      React.createElement(View, { style: S.section },
        React.createElement(Text, { style: S.sectionTitle }, "Features"),
        ...rows.map(r =>
          React.createElement(View, { key: r.key, style: S.row },
            React.createElement(View, { style: S.rowLeft },
              React.createElement(Text, { style: S.rowTitle }, r.title),
              React.createElement(Text, { style: S.rowDesc }, r.desc),
            ),
            React.createElement(Switch, {
              value: !!(s as any)[r.key],
              onValueChange: () => toggle(r.key),
              trackColor: { true: Colors.accent, false: Colors.bgOver },
            })
          )
        )
      ),

      // ── Supported Languages ──
      React.createElement(View, { style: S.section },
        React.createElement(Text, { style: S.sectionTitle }, "Supported Languages"),
        React.createElement(View, { style: S.chip },
          ...LANGS.map(l =>
            React.createElement(View, { key: l, style: S.chipBtn },
              React.createElement(Text, { style: S.chipText }, l.toUpperCase())
            )
          )
        )
      ),

      // ── Footer ──
      React.createElement(View, { style: S.footer },
        React.createElement(Text, { style: S.footerText }, "BetterCodeBlocks · by tanhoangviet"),
        React.createElement(Text, { style: [S.footerText, { marginTop: 2 }] }, "MIT License")
      )
    )
  );
}
