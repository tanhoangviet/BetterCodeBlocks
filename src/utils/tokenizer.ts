// Catppuccin Mocha token colors
export const Colors = {
  bg:      "#1e1e2e",
  bgSurf:  "#181825",
  bgOver:  "#313244",
  border:  "#45475a",
  text:    "#cdd6f4",
  keyword: "#cba6f7",
  string:  "#a6e3a1",
  comment: "#6c7086",
  number:  "#fab387",
  fn:      "#89b4fa",
  type:    "#f9e2af",
  op:      "#89dceb",
  punct:   "#bac2de",
  accent:  "#89b4fa",
  success: "#a6e3a1",
  muted:   "#6c7086",
};

export type TokenType = "keyword"|"string"|"comment"|"number"|"fn"|"type"|"op"|"punct"|"plain";
export interface Token { t: TokenType; v: string }

type Rule = [RegExp, TokenType];

const RULES: Record<string, Rule[]> = {
  lua: [
    [/^--\[\[[\s\S]*?\]\]/, "comment"], [/^--[^\n]*/, "comment"],
    [/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, "string"],
    [/^\b(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/, "keyword"],
    [/^\b0x[\da-fA-F]+\b|^\b\d+\.?\d*\b/, "number"],
    [/^\b[A-Z][A-Z0-9_]*\b/, "type"], [/^\b[a-zA-Z_]\w*(?=\s*\()/, "fn"],
    [/^[+\-*/%^#&|~<>=]/, "op"], [/^[{}[\]();:.,]/, "punct"],
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
    [/^\b(break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|async|await|type|interface|enum|readonly)\b/, "keyword"],
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
RULES.py = RULES.python;
RULES.js = RULES.ts = RULES.typescript = RULES.javascript;
RULES.htm = RULES.html;

const TC: Record<TokenType, string> = {
  keyword: Colors.keyword, string: Colors.string, comment: Colors.comment,
  number: Colors.number, fn: Colors.fn, type: Colors.type,
  op: Colors.op, punct: Colors.punct, plain: Colors.text,
};
export const getColor = (t: TokenType) => TC[t] ?? Colors.text;

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

export const LANG_LABEL: Record<string, string> = {
  lua:"Lua", py:"Python", python:"Python", js:"JavaScript", javascript:"JavaScript",
  ts:"TypeScript", typescript:"TypeScript", css:"CSS", html:"HTML", htm:"HTML",
  json:"JSON", bash:"Bash", sh:"Shell", txt:"Text", "":"Code",
};
