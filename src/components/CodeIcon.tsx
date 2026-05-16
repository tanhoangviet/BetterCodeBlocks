import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const Svg = findByProps("Svg","Path")?.Svg
  ?? findByProps("default")?.default;

// Fallback: dùng Image với SVG base64
const { Image } = (globalThis as any).bunny?.metro?.common?.ReactNative ?? {};

const SVG_BASE64 = "data:image/svg+xml;base64," + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="16 18 22 12 16 6"/>
  <polyline points="8 6 2 12 8 18"/>
</svg>
`);

export function CodeIcon({ size = 24, color = "#fff" }: { size?: number; color?: string }) {
  // Try SVG component first
  if (Svg) {
    const { Path, Polyline } = findByProps("Svg","Path") ?? {};
    return React.createElement(Svg, {
      width: size, height: size, viewBox: "0 0 24 24",
      fill: "none", stroke: color, strokeWidth: 2,
      strokeLinecap: "round", strokeLinejoin: "round",
    },
      React.createElement(Polyline, { points: "16 18 22 12 16 6" }),
      React.createElement(Polyline, { points: "8 6 2 12 8 18" })
    );
  }
  // Fallback Image
  return Image ? React.createElement(Image, {
    source: { uri: SVG_BASE64 },
    style: { width: size, height: size, tintColor: color },
    resizeMode: "contain",
  }) : null;
}
