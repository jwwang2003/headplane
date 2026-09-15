import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { zhCN } from "~/i18n/zh-CN";

/**
 * Translation coverage.
 *
 * English wording is the catalogue key, so an upstream wording change would
 * otherwise silently fall back to English. This test scans `app/` and fails
 * when:
 *
 * 1. a message that is translated at runtime has no zh-CN entry ("missing");
 * 2. a zh-CN entry no longer matches any string in the sources ("unused"),
 *    which is what an upstream wording change looks like from here;
 * 3. an entry is empty.
 *
 * Messages that are translated at runtime are collected from the first
 * argument of `t("...")` calls (including ternary and object-literal
 * arguments) and of the calls whose string argument is translated later at
 * render time: `toast("...")` (the toast provider translates descriptions) and
 * string-valued `data("...")` responses (shown through ErrorBanner; object
 * bodies are consumed by the routes themselves and are not attributed), from
 * string values given to the props that shared components translate
 * themselves, and from `label:` / `desc:` / `title:` / `message:` object
 * properties, which are always UI copy in this code base (option labels, role
 * descriptions, SSH error notices, action and login results). Messages that
 * only reach `t()` through a variable of another shape (form validation
 * errors, loader fields) cannot be attributed, so for them the weaker check
 * applies: the English text must still exist as a string literal somewhere in
 * `app/`. The scanner is a small tokenizer rather than a parser; it skips
 * comments, understands template literals and string concatenation, and only
 * treats a quote as a string opener in code position (not inside JSX text).
 */

const appDir = fileURLToPath(new URL("../../../app/", import.meta.url));

// Props that the shared components translate on their own. Values, children,
// placeholders and option items are never translated by a component.
const translatedProps: Record<string, string[]> = {
  Attribute: ["name", "tooltip"],
  Input: ["label", "description", "errorMessage"],
  NumberInput: ["label", "description"],
  Select: ["label", "description"],
  Switch: ["label"],
  RadioGroup: ["label"],
  "RadioGroup.Radio": ["label"],
  Tabs: ["label"],
  Notice: ["title"],
  StatusBanner: ["title"],
  PageError: ["page"],
  Tooltip: ["content"],
};

// Calls whose first string argument is translated, directly or at render time.
const translatedCalls = ["t", "toast", "data"];

const translatedProperties = ["label", "desc", "title", "message"];

// API routes answer programs, not people: their data() bodies are HTTP
// responses rather than UI copy.
const apiRoutes = /^routes\/util\//;

// Server modules produce diagnostics and log messages, which stay untranslated.
const serverModules = /^server\//;

// Keys that are derived at runtime and therefore never appear verbatim in the
// sources: acl-action.ts reports "Syntax error: <detail>" and the ACL page
// shows the part before the colon as the notice title.
const derivedKeys = new Set(["Syntax error"]);

// A quote after one of these words starts a string even though the previous
// character is a word character.
const keywords = new Set([
  "return",
  "case",
  "from",
  "typeof",
  "void",
  "delete",
  "in",
  "of",
  "instanceof",
  "yield",
  "await",
  "else",
  "do",
  "throw",
]);

interface StringToken {
  start: number;
  end: number;
  value: string;
}

interface ScannedFile {
  path: string;
  source: string;
  /** Source with comments and string contents blanked out (same length). */
  code: string;
  strings: StringToken[];
}

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function listSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listSources(path);
    // The catalogues themselves would make every key look used.
    if (/^i18n\/[a-z]{2}(-[A-Z]{2})?\.ts$/.test(relative(appDir, path))) return [];
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

function isWordChar(char: string) {
  return /[\w$]/.test(char);
}

function opensString(source: string, index: number) {
  let i = index - 1;
  while (i >= 0 && /\s/.test(source[i])) i--;
  if (i < 0) return true;
  const prev = source[i];
  if (prev === ">") return source[i - 1] === "=";
  if (prev === ")" || prev === "]" || prev === "}") return false;
  if (!isWordChar(prev)) return true;
  let start = i;
  while (start > 0 && isWordChar(source[start - 1])) start--;
  return keywords.has(source.slice(start, i + 1));
}

function unescape(raw: string) {
  return raw.replace(/\\(.)/gs, (_, char: string) => (char === "n" ? "\n" : char));
}

function scanFile(path: string): ScannedFile {
  const source = readFileSync(path, "utf8");
  const code = source.split("");
  const strings: StringToken[] = [];

  function blank(from: number, to: number) {
    for (let i = from; i < to; i++) if (code[i] !== "\n") code[i] = " ";
  }

  function readString(start: number): number {
    const quote = source[start];
    let i = start + 1;
    while (i < source.length && source[i] !== quote) {
      if (source[i] === "\\") i++;
      i++;
    }
    strings.push({ start, end: i + 1, value: unescape(source.slice(start + 1, i)) });
    blank(start + 1, i);
    return i + 1;
  }

  function readTemplate(start: number): number {
    let i = start + 1;
    let chunkStart = i;
    const chunks: string[] = [];
    let interpolated = false;
    while (i < source.length && source[i] !== "`") {
      if (source[i] === "\\") {
        i += 2;
        continue;
      }
      if (source[i] === "$" && source[i + 1] === "{") {
        chunks.push(source.slice(chunkStart, i));
        blank(chunkStart, i);
        interpolated = true;
        i = scan(i + 2, "}");
        chunkStart = i;
        continue;
      }
      i++;
    }
    chunks.push(source.slice(chunkStart, i));
    blank(chunkStart, i);
    if (!interpolated) strings.push({ start, end: i + 1, value: unescape(chunks.join("")) });
    return i + 1;
  }

  /** Scans code from `from` until `until` (a closing brace) at depth zero. */
  function scan(from: number, until?: string): number {
    let depth = 0;
    let i = from;
    while (i < source.length) {
      const char = source[i];
      const next = source[i + 1];
      if (char === "/" && next === "/") {
        const end = source.indexOf("\n", i);
        const stop = end === -1 ? source.length : end;
        blank(i, stop);
        i = stop;
      } else if (char === "/" && next === "*") {
        const end = source.indexOf("*/", i + 2);
        const stop = end === -1 ? source.length : end + 2;
        blank(i, stop);
        i = stop;
      } else if ((char === '"' || char === "'") && opensString(source, i)) {
        i = readString(i);
      } else if (char === "`") {
        i = readTemplate(i);
      } else {
        if (until) {
          if (char === "{") depth++;
          if (char === "}") {
            if (depth === 0) return i + 1;
            depth--;
          }
        }
        i++;
      }
    }
    return i;
  }

  scan(0);
  return { path, source, code: code.join(""), strings };
}

function stringAt(file: ScannedFile, index: number) {
  return file.strings.find((token) => token.start === index);
}

/** Joins `"a" + "b"` sequences so concatenated constants match their catalogue key. */
function literalsOf(file: ScannedFile): string[] {
  const values: string[] = [];
  let i = 0;
  while (i < file.strings.length) {
    let token = file.strings[i];
    let value = token.value;
    values.push(value);
    let j = i + 1;
    while (j < file.strings.length) {
      const between = file.code.slice(token.end, file.strings[j].start);
      if (!/^\s*\+\s*$/.test(between)) break;
      token = file.strings[j];
      value += token.value;
      values.push(token.value);
      j++;
    }
    if (j > i + 1) values.push(value);
    i = j;
  }
  return values;
}

/** Returns the end (exclusive) of the first call argument starting at `from`. */
function firstArgumentEnd(code: string, from: number) {
  let depth = 0;
  for (let i = from; i < code.length; i++) {
    const char = code[i];
    if ("([{".includes(char)) depth++;
    else if (")]}".includes(char)) {
      if (depth === 0) return i;
      depth--;
    } else if (char === "," && depth === 0) return i;
  }
  return code.length;
}

/** Returns the end (exclusive) of the JSX opening tag starting at `from`. */
function openingTagEnd(code: string, from: number) {
  let depth = 0;
  for (let i = from; i < code.length; i++) {
    const char = code[i];
    if (char === "{") depth++;
    else if (char === "}") depth--;
    else if (char === ">" && depth === 0) return i + 1;
  }
  return code.length;
}

function stringsWithin(file: ScannedFile, start: number, end: number) {
  return file.strings.filter((token) => token.start >= start && token.start < end);
}

interface Usage {
  file: string;
  via: string;
}

function collect(files: ScannedFile[]) {
  const required = new Map<string, Usage[]>();
  const literals = new Set<string>();
  let dynamicCalls = 0;

  function require(key: string, usage: Usage) {
    const normalized = normalize(key);
    if (!normalized) return;
    const usages = required.get(normalized) ?? [];
    usages.push(usage);
    required.set(normalized, usages);
  }

  for (const file of files) {
    const name = relative(appDir, file.path);
    for (const literal of literalsOf(file)) literals.add(normalize(literal));

    const call = new RegExp(String.raw`(?<![\w$])(${translatedCalls.join("|")})\(`, "g");
    for (const match of file.code.matchAll(call)) {
      const start = match.index + match[0].length;
      const end = firstArgumentEnd(file.code, start);
      const tokens = stringsWithin(file, start, end);
      if (tokens.length === 0 && match[1] === "t") dynamicCalls++;
      if (
        match[1] === "data" &&
        (apiRoutes.test(name) || !/^\s*["']/.test(file.code.slice(start, end)))
      )
        continue;
      for (const token of tokens) require(token.value, { file: name, via: `${match[1]}()` });
    }

    for (const [component, props] of Object.entries(translatedProps)) {
      const tag = new RegExp(String.raw`<${component.replace(".", String.raw`\.`)}(?![\w.])`, "g");
      for (const match of file.code.matchAll(tag)) {
        const end = openingTagEnd(file.code, match.index);
        const attribute = new RegExp(String.raw`\b(${props.join("|")})=(\{\s*)?`, "g");
        const tagCode = file.code.slice(match.index, end);
        for (const found of tagCode.matchAll(attribute)) {
          const at = match.index + found.index + found[0].length;
          const token = stringAt(file, at);
          if (!token) continue;
          if (found[2] && !/^\s*\}/.test(file.code.slice(token.end, end))) continue;
          require(token.value, { file: name, via: `<${component} ${found[1]}>` });
        }
      }
    }

    if (serverModules.test(name)) continue;
    const property = new RegExp(String.raw`\b(${translatedProperties.join("|")}):\s*`, "g");
    for (const match of file.code.matchAll(property)) {
      const token = stringAt(file, match.index + match[0].length);
      if (token) require(token.value, { file: name, via: `${match[1]}:` });
    }
  }

  return { required, literals, dynamicCalls };
}

describe("zh-CN translation coverage", () => {
  const files = listSources(appDir).map(scanFile);
  const { required, literals, dynamicCalls } = collect(files);
  const keys = Object.keys(zhCN);

  it("scans the application sources", () => {
    expect(files.length).toBeGreaterThan(50);
    expect(required.size).toBeGreaterThan(100);
    console.info(
      `i18n coverage: ${keys.length} zh-CN entries, ${required.size} attributed messages, ` +
        `${literals.size} string literals, ${dynamicCalls} dynamic t() calls`,
    );
  });

  it("has a zh-CN entry for every message that is translated at runtime", () => {
    const missing = [...required.entries()]
      .filter(([key]) => !Object.hasOwn(zhCN, key))
      .map(([key, usages]) => `${JSON.stringify(key)} (${usages[0].via} in ${usages[0].file})`);
    expect(missing, `Messages without a zh-CN entry:\n${missing.join("\n")}`).toEqual([]);
  });

  it("has no zh-CN entry whose English wording no longer exists in the sources", () => {
    const unused = keys.filter(
      (key) => !required.has(key) && !literals.has(key) && !derivedKeys.has(key),
    );
    expect(
      unused,
      `zh-CN entries whose English wording was not found in app/:\n${unused.join("\n")}`,
    ).toEqual([]);
  });

  it("has no empty or whitespace-only translations", () => {
    const empty = keys.filter((key) => normalize(zhCN[key]).length === 0);
    expect(empty).toEqual([]);
  });

  it("normalizes keys the same way the runtime lookup does", () => {
    const denormalized = keys.filter((key) => key !== normalize(key));
    expect(denormalized).toEqual([]);
  });
});
