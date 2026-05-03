import strings from "../lang/en.json";

type DeepKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? DeepKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type StringPath = DeepKeys<typeof strings>;

export function t(path: StringPath): string {
  const parts = (path as string).split(".");
  let cur: any = strings;
  for (const p of parts) {
    cur = cur?.[p];
  }
  return typeof cur === "string" ? cur : path;
}
