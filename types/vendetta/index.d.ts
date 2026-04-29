declare module "@vendetta" {
  export const metro: any;
  export const patcher: any;
  export const plugin: any;
  export const ui: any;
}
declare module "@vendetta/metro" {
  export function findByProps(...props: string[]): any;
  export function findByName(name: string, defaultExport?: boolean): any;
  export function findByDisplayName(name: string, defaultExport?: boolean): any;
  export const common: {
    React: typeof import("react");
    ReactNative: any;
    [key: string]: any;
  };
}
declare module "@vendetta/metro/common" {
  import type React from "react";
  export { React };
  export const ReactNative: any;
  export const [key: string]: any;
}
declare module "@vendetta/patcher" {
  export function before(method: string, object: any, patch: Function): () => void;
  export function after(method: string, object: any, patch: Function): () => void;
  export function instead(method: string, object: any, patch: Function): () => void;
}
declare module "@vendetta/storage" {
  export function useProxy<T>(storage: T): T;
}
declare module "@vendetta/plugin" {
  export const storage: Record<string, any>;
}
declare module "@vendetta/ui/toasts" {
  export function showToast(message: string, asset?: number): void;
}
declare module "@vendetta/ui/assets" {
  export function getAssetIDByName(name: string): number;
}
declare module "@vendetta/ui" {
  export * from "@vendetta/ui/toasts";
  export * from "@vendetta/ui/assets";
}
