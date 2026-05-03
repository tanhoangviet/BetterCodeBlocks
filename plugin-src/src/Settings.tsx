import { React, ReactNative as RN } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { Theme } from "./common";
import { t } from "./i18n";

const { View, Text, Switch, StyleSheet, ScrollView } = RN;

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Theme.bg },
  wrap:   { padding: 16, gap: 12 },
  row:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, backgroundColor: Theme.bgSurf, borderRadius: 10, borderWidth: 1, borderColor: Theme.border },
  left:   { flex: 1, paddingRight: 12 },
  label:  { color: Theme.white, fontSize: 14, fontWeight: "600" },
  desc:   { color: Theme.muted, fontSize: 12, marginTop: 3 },
});

export default function Settings() {
  const s = useProxy(storage);

  const rows = [
    { key: "enabled",     label: t("settings.enabled"),     desc: t("settings.enabledDesc") },
    { key: "lineNumbers", label: t("settings.lineNumbers"), desc: t("settings.lineNumbersDesc") },
  ] as const;

  return React.createElement(ScrollView, { style: S.scroll },
    React.createElement(View, { style: S.wrap },
      ...rows.map(row =>
        React.createElement(View, { key: row.key, style: S.row },
          React.createElement(View, { style: S.left },
            React.createElement(Text, { style: S.label }, row.label),
            React.createElement(Text, { style: S.desc }, row.desc)
          ),
          React.createElement(Switch, {
            value: Boolean(s[row.key]),
            onValueChange: (v: boolean) => { (s as any)[row.key] = v; },
            trackColor: { true: Theme.accent, false: Theme.bgOver },
          })
        )
      )
    )
  );
}
