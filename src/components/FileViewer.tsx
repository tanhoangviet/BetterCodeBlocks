import { React, ReactNative as RN } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { Theme, tokenize, TOKEN_COLOR, EXT_ICON, SUPPORTED_EXT, fmtSize } from "../common";
import { t } from "../i18n";

const { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator, Linking, StyleSheet } = RN;
const Clipboard = findByProps("setString", "getString") ?? { setString: (_: string) => {} };

export type SupportedExt = typeof SUPPORTED_EXT[number];

export function isSupportedFile(filename: string): boolean {
  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  return (SUPPORTED_EXT as readonly string[]).includes(ext);
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Theme.bg },
  nav:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Theme.bgSurf, borderBottomWidth: 1, borderBottomColor: Theme.border, gap: 10 },
  close:  { width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.bgOver, justifyContent: "center", alignItems: "center" },
  closeT: { color: Theme.white, fontSize: 14 },
  titleW: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  fname:  { color: Theme.white, fontSize: 14, fontFamily: "monospace", fontWeight: "600" },
  fmeta:  { color: Theme.muted, fontSize: 11, fontFamily: "monospace", marginTop: 1 },
  acts:   { flexDirection: "row", gap: 8 },
  act:    { width: 34, height: 34, borderRadius: 8, backgroundColor: Theme.bgOver, borderWidth: 1, borderColor: Theme.border, justifyContent: "center", alignItems: "center" },
  actOk:  { borderColor: Theme.success, backgroundColor: "#1e3a2a" },
  actT:   { color: Theme.white, fontSize: 16 },
  actOkT: { color: Theme.success },
  // tabs
  tbBar:  { flexDirection: "row", backgroundColor: Theme.bgSurf, borderBottomWidth: 1, borderBottomColor: Theme.border },
  tab:    { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn:  { borderBottomColor: Theme.accent },
  tabT:   { color: Theme.muted, fontSize: 13, fontFamily: "monospace" },
  tabTOn: { color: Theme.white },
  // code
  body:   { flexDirection: "row", padding: 12 },
  nums:   { paddingRight: 12, borderRightWidth: 1, borderRightColor: Theme.border, marginRight: 12, alignItems: "flex-end" },
  num:    { color: Theme.muted, fontFamily: "monospace", fontSize: 12, lineHeight: 20, minWidth: 28, textAlign: "right" },
  code:   { fontFamily: "monospace", fontSize: 13, lineHeight: 20, color: Theme.plain },
  // info
  infoW:  { padding: 16 },
  row:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Theme.border },
  label:  { color: Theme.muted, fontSize: 13, fontFamily: "monospace" },
  val:    { color: Theme.white, fontSize: 13, fontFamily: "monospace", maxWidth: "60%" },
  dlBtn:  { marginTop: 16, padding: 12, backgroundColor: Theme.bgOver, borderRadius: 8, borderWidth: 1, borderColor: Theme.accent, alignItems: "center" },
  dlBtnT: { color: Theme.accent, fontSize: 13, fontFamily: "monospace" },
  // pill
  pillW:  { marginVertical: 2 },
  pill:   { flexDirection: "row", alignItems: "center", backgroundColor: Theme.bgSurf, borderWidth: 1, borderColor: Theme.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4, gap: 8 },
  pillN:  { color: Theme.white, fontFamily: "monospace", fontSize: 13, flex: 1 },
  vBtn:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: Theme.accent, backgroundColor: "rgba(137,180,250,0.1)" },
  vBtnT:  { color: Theme.accent, fontFamily: "monospace", fontSize: 12 },
});

// ─── FileViewerModal ────────────────────────────────────────────────────────────
interface FileViewerProps {
  visible: boolean;
  filename: string;
  content: string;
  fileSize: number;
  downloadUrl?: string;
  onClose: () => void;
}

export function FileViewerModal({ visible, filename, content, fileSize, downloadUrl, onClose }: FileViewerProps) {
  const [tab, setTab] = React.useState<"code" | "info">("code");
  const [copied, setCopied] = React.useState(false);
  const ext = (filename.split(".").pop() ?? "txt").toLowerCase();
  const lines = content.split("\n");
  const tokens = tokenize(content, ext);

  const doCopy = () => {
    Clipboard.setString(content);
    setCopied(true);
    showToast(t("ui.toastCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return React.createElement(Modal, { visible, animationType: "slide", presentationStyle: "pageSheet", onRequestClose: onClose },
    React.createElement(SafeAreaView, { style: S.safe },
      // Navbar
      React.createElement(View, { style: S.nav },
        React.createElement(TouchableOpacity, { onPress: onClose, style: S.close },
          React.createElement(Text, { style: S.closeT }, t("ui.closeIcon"))
        ),
        React.createElement(View, { style: S.titleW },
          React.createElement(Text, { style: { fontSize: 20 } }, EXT_ICON[ext] ?? "📄"),
          React.createElement(View, null,
            React.createElement(Text, { style: S.fname, numberOfLines: 1 }, filename),
            React.createElement(Text, { style: S.fmeta }, `${fmtSize(fileSize)}  ·  ${lines.length} ${t("info.lines").toLowerCase()}`)
          )
        ),
        React.createElement(View, { style: S.acts },
          React.createElement(TouchableOpacity, { onPress: doCopy, style: [S.act, copied && S.actOk], activeOpacity: 0.7 },
            React.createElement(Text, { style: [S.actT, copied && S.actOkT] }, copied ? t("ui.copiedIcon") : t("ui.copyIcon"))
          ),
          downloadUrl && React.createElement(TouchableOpacity, { onPress: () => Linking.openURL(downloadUrl!), style: S.act, activeOpacity: 0.7 },
            React.createElement(Text, { style: S.actT }, t("ui.downloadIcon"))
          )
        )
      ),
      // Tab bar
      React.createElement(View, { style: S.tbBar },
        (["code", "info"] as const).map(id =>
          React.createElement(TouchableOpacity, { key: id, style: [S.tab, tab === id && S.tabOn], onPress: () => setTab(id) },
            React.createElement(Text, { style: [S.tabT, tab === id && S.tabTOn] },
              id === "code" ? t("ui.tabCode") : t("ui.tabInfo")
            )
          )
        )
      ),
      // Content
      tab === "code"
        ? React.createElement(ScrollView, { style: { flex: 1 }, horizontal: true, showsHorizontalScrollIndicator: false },
            React.createElement(ScrollView, { nestedScrollEnabled: true, showsVerticalScrollIndicator: true },
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
        : React.createElement(ScrollView, { style: { flex: 1 } },
            React.createElement(View, { style: S.infoW },
              ...[
                [t("info.fileName"), filename],
                [t("info.extension"), `.${ext}`],
                [t("info.size"), fmtSize(fileSize)],
                [t("info.lines"), String(lines.length)],
              ].map(([l, v]) =>
                React.createElement(View, { key: l, style: S.row },
                  React.createElement(Text, { style: S.label }, l),
                  React.createElement(Text, { style: S.val }, v)
                )
              ),
              downloadUrl && React.createElement(TouchableOpacity, { style: S.dlBtn, onPress: () => Linking.openURL(downloadUrl!) },
                React.createElement(Text, { style: S.dlBtnT }, t("ui.openBrowser"))
              )
            )
          )
    )
  );
}

// ─── AttachmentPill ─────────────────────────────────────────────────────────────
export function AttachmentPill({
  filename, url, fileSize, children,
}: { filename: string; url: string; fileSize: number; children?: any }) {
  const [visible, setVisible] = React.useState(false);
  const [content, setContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const ext = (filename.split(".").pop() ?? "").toLowerCase();

  const open = async () => {
    if (content) { setVisible(true); return; }
    setLoading(true);
    try {
      const r = await fetch(url);
      setContent(await r.text());
      setVisible(true);
    } catch { showToast(t("ui.failedLoad")); }
    finally { setLoading(false); }
  };

  return React.createElement(View, { style: S.pillW },
    children,
    React.createElement(View, { style: S.pill },
      React.createElement(Text, { style: { fontSize: 16 } }, EXT_ICON[ext] ?? "📄"),
      React.createElement(Text, { style: S.pillN, numberOfLines: 1 }, filename),
      loading
        ? React.createElement(ActivityIndicator, { size: "small", color: Theme.accent })
        : React.createElement(TouchableOpacity, { onPress: open, style: S.vBtn, activeOpacity: 0.75 },
            React.createElement(Text, { style: S.vBtnT }, t("ui.viewCode"))
          )
    ),
    content != null && React.createElement(FileViewerModal, {
      visible, filename, content, fileSize, downloadUrl: url, onClose: () => setVisible(false),
    })
  );
}
