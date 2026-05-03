// ─── Theme (Catppuccin Mocha) ──────────────────────────────────────────────────
export const Theme = {
  bg:      "#1E1E2E",
  bgSurf:  "#181825",
  bgOver:  "#313244",
  border:  "#45475A",
  plain:   "#CDD6F4",
  keyword: "#CBA6F7",
  string:  "#A6E3A1",
  comment: "#585B70",
  number:  "#FAB387",
  fn:      "#89B4FA",
  type:    "#F9E2AF",
  op:      "#89DCEB",
  punct:   "#BAC2DE",
  accent:  "#89B4FA",
  success: "#A6E3A1",
  muted:   "#6C7086",
  white:   "#CDD6F4",
  error:   "#F38BA8",
} as const;

// ─── Tokenizer ─────────────────────────────────────────────────────────────────
export type TokenType = "keyword"|"string"|"comment"|"number"|"fn"|"type"|"op"|"punct"|"plain";
export interface Token { t: TokenType; v: string; }

type Rule = [RegExp, TokenType];

const RULES: Record<string, Rule[]> = {
  lua: [
    [/^--\[\[[\s\S]*?\]\]/, "comment"], [/^--[^\n]*/, "comment"],
    [/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, "string"],
    [/^\b(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/, "keyword"],
    [/^\b0x[\da-fA-F]+\b|^\b\d+\.?\d*\b/, "number"],
    [/^\b[A-Z][A-Z0-9_]*\b/, "type"], [/^\b[a-zA-Z_]\w*(?=\s*\()/, "fn"],
    [/^[+\-*/%^#&|~<>=]/, "op"],      [/^[{}[\]();:.,]/, "punct"],
  ],
  python: [
    [/^"""[\s\S]*?"""|^'''[\s\S]*?'''/, "string"], [/^#[^\n]*/, "comment"],
    [/^f?"(?:[^"\\]|\\.)*"|^f?'(?:[^'\\]|\\.)*'/, "string"],
    [/^\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/, "keyword"],
    [/^\b\d+\.?\d*\b/, "number"], [/^\b[A-Z][a-zA-Z0-9_]*\b/, "type"],
    [/^\b[a-zA-Z_]\w*(?=\s*\()/, "fn"], [/^[+\-*/%@&|^~<>=!]/, "op"], [/^[{}[\]();:.,]/, "punct"],
  ],
  javascript: [
    [/^\/\*[\s\S]*?\*\//, "comment"], [/^\/\/[^\n]*/, "comment"],
    [/^`[\s\S]*?`|^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, "string"],
    [/^\b(break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|async|await|type|interface|enum|readonly|declare|namespace)\b/, "keyword"],
    [/^\b\d+\.?\d*\b/, "number"], [/^\b[A-Z][a-zA-Z0-9_]*\b/, "type"],
    [/^\b[a-zA-Z_]\w*(?=\s*\()/, "fn"], [/^[+\-*/%&|^~<>=!?]/, "op"], [/^[{}[\]();:.,]/, "punct"],
  ],
  json: [
    [/^"(?:[^"\\]|\\.)*"(?=\s*:)/, "keyword"], [/^"(?:[^"\\]|\\.)*"/, "string"],
    [/^\b(true|false|null)\b/, "type"], [/^-?\b\d+\.?\d*\b/, "number"], [/^[{}[\]:,]/, "punct"],
  ],
  css: [
    [/^\/\*[\s\S]*?\*\//, "comment"], [/^"[^"]*"|^'[^']*'/, "string"],
    [/^#[0-9a-fA-F]{3,8}\b/, "number"], [/^\b\d+\.?\d*(px|em|rem|vh|vw|%|s|ms|deg|fr)?\b/, "number"],
    [/^[a-zA-Z-]+(?=\s*:)/, "keyword"], [/^@[a-zA-Z-]+/, "type"],
    [/^:[a-zA-Z-]+/, "fn"], [/^[{}:;,.]/, "punct"],
  ],
  html: [
    [/^<!--[\s\S]*?-->/, "comment"], [/^"[^"]*"|^'[^']*'/, "string"],
    [/^<\/?\w[\w.-]*/, "keyword"], [/^[\w-]+=/, "fn"], [/^[<>/{}]/, "punct"],
  ],
};
RULES.js = RULES.typescript = RULES.ts = RULES.javascript;
RULES.py = RULES.python;
RULES.htm = RULES.html;

export function tokenize(code: string, lang: string): Token[] {
  const rules = RULES[lang.toLowerCase()];
  if (!rules) return [{ t: "plain", v: code }];
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < code.length) {
    let matched = false;
    for (const [re, type] of rules) {
      const m = re.exec(code.slice(pos));
      if (m) { tokens.push({ t: type, v: m[0] }); pos += m[0].length; matched = true; break; }
    }
    if (!matched) {
      const last = tokens[tokens.length - 1];
      if (last?.t === "plain") last.v += code[pos];
      else tokens.push({ t: "plain", v: code[pos] });
      pos++;
    }
  }
  return tokens;
}

export const TOKEN_COLOR: Record<TokenType, string> = {
  keyword: Theme.keyword, string: Theme.string, comment: Theme.comment,
  number: Theme.number, fn: Theme.fn, type: Theme.type,
  op: Theme.op, punct: Theme.punct, plain: Theme.plain,
};

export const LANG_LABELS: Record<string, string> = {
  lua:"Lua", python:"Python", py:"Python", js:"JavaScript", javascript:"JavaScript",
  ts:"TypeScript", typescript:"TypeScript", css:"CSS", html:"HTML", htm:"HTML",
  json:"JSON", bash:"Bash", sh:"Shell", txt:"Plain Text", "":"Code",
};
export const EXT_ICON: Record<string, string> = {
  lua:"🌙", js:"⚡", ts:"💙", py:"🐍", json:"📋", css:"🎨", html:"🌐", txt:"📄",
};
export const SUPPORTED_EXT = ["lua","js","ts","py","txt","json","css","html","htm"] as const;

export function fmtSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}
