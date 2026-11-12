// v2 データ整合性・バイアス検証: node tests/validate.mjs
import { readFileSync } from "node:fs";
const dir = new URL("../", import.meta.url).pathname;
global.window = {};
for (const f of ["data-lessons.js", "data-questions.js", "data-docs.js", "data-functions.js"]) {
  eval(readFileSync(dir + f, "utf8"));
}
const D = window.IJDATA2;
D.questionCats = D.questionCats || { basics:1, depth:1, hist:1, thresh:1, filter:1, roi:1, measure:1, fluor:1, valid:1 };
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

const SRCKEYS = new Set(["work","filt","bin","calc","math","hist","tools","plug","bio","subbg","zproj","color","batch","guide","menus","macrofn","fft","ana","proc","macro","macropdf"]);
const FIGS = new Set(["bitdepth","histogram","threshold","gamma","kernel-blur","kernel-median","unsharp","scale","roi-mask","particles","zproj","fft"]);

const L = D.lessons, Q = D.questions, T = D.terms, DOCS = D.docs;
ok(L.length >= 20 && L.length <= 32, `レッスン数 ${L.length}`);
ok(Q.length >= 50 && Q.length <= 70, `問題数 ${Q.length}`);
// 関数リファレンスを公式「Built-in Macro Functions」のスナップショットと照合する（R02/R13）
// ・関数名が公式に実在すること
// ・書式の引数個数（省略可能部 [ ] と可変長 ... を除く）が、公式のいずれかの書式と一致すること
// ・使用例・テンプレート・初期コードが静的チェック（括弧・文字列・コメント）を通り、呼んでいる関数が実在すること
{
  const offLines = readFileSync(new URL("./official-functions.txt", import.meta.url), "utf8").split("\n").filter(l => l && !l.startsWith("#"));
  const offName = s => s.replace(/\s*\(.*$/, "").trim();
  const argc = sig => {
    const m = sig.match(/\((.*)\)/); if (!m) return 0;
    const inner = m[1].replace(/\[[^\]]*\]/g, "").replace(/,?\s*\.\.\.\s*$/, "").trim();
    if (!inner) return 0;
    let depth = 0, n = 1, q = null;
    for (const c of inner) { if (q) { if (c === q) q = null; continue; } if (c === '"' || c === "'") q = c; else if (c === "(") depth++; else if (c === ")") depth--; else if (c === "," && depth === 0) n++; }
    return n;
  };
  const off = new Map();
  for (const l of offLines) { const k = offName(l); if (!off.has(k)) off.set(k, []); off.get(k).push(l); }
  const appSrc = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const grab = name => { const a = appSrc.indexOf("\nfunction " + name + "("); return appSrc.slice(a, appSrc.indexOf("\nfunction ", a + 1)); };
  const pracCheck = new Function(grab("pracCheck") + "; return pracCheck;")();
  const pracSigStatement = new Function(grab("pracSigStatement") + "; return pracSigStatement;")();
  const tplSeg = appSrc.slice(appSrc.indexOf("var MACRO_TEMPLATES"), appSrc.indexOf("\n  ];", appSrc.indexOf("var MACRO_TEMPLATES")) + 5);
  const TPL = new Function(tplSeg + "; return MACRO_TEMPLATES;")();
  const STARTER = new Function(appSrc.slice(appSrc.indexOf("var PRAC_STARTER"), appSrc.indexOf("\nvar prac =")) + "; return PRAC_STARTER;")();
  ok(TPL.length === 10, `テンプレート数 ${TPL.length}`);
  ok(TPL.filter(t => /^【基礎】/.test(t.name)).length === 5, "学習用基礎テンプレートが5種");
  for (const t of TPL) ok(t.prep && Array.isArray(t.guide) && t.guide.length >= 1 && Array.isArray(t.tries) && t.tries.length >= 1, `テンプレート ${t.name} に解説・改造ポイントがある`);
  const refNames = new Set((D.functions || []).map(f => f.name));
  const KW = new Set(["if", "for", "while", "function", "return", "switch", "catch", "do", "else"]);
  const stripStrCom = code => code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
  const calls = code => [...stripStrCom(code).matchAll(/(^|[^A-Za-z0-9_.])([A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)*)\s*\(/g)].map(m => m[2]);
  const userFns = code => new Set([...stripStrCom(code).matchAll(/function\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map(m => m[1]));
  for (const f of (D.functions || [])) {
    ok(off.has(f.name), `関数 ${f.name} が公式一覧に存在しない`);
    if (off.has(f.name)) {
      const counts = off.get(f.name).map(argc);
      const variadic = /\.\.\.\s*\)/.test(f.sig);
      ok(counts.includes(argc(f.sig)) || (variadic && counts.some(n => n <= argc(f.sig))), `関数 ${f.name} の引数個数 ${argc(f.sig)} が公式 [${off.get(f.name).join(" | ")}] と一致しない`);
    }
    const st = pracSigStatement(f.sig);
    ok(!/\[|\.\.\./.test(st) && pracCheck(st) === null, `関数 ${f.name} の挿入用の文が不正: ${st}`);
    if (f.ex) {
      const r = pracCheck(f.ex);
      ok(r === null, `関数 ${f.name} の使用例が静的チェックで警告される: ${JSON.stringify(r)}`);
      const uf = userFns(f.ex);
      for (const c of calls(f.ex)) ok(KW.has(c) || uf.has(c) || off.has(c), `関数 ${f.name} の使用例が公式にない関数 ${c} を呼んでいる`);
    }
  }
  for (const [label, code] of [["初期コード", STARTER], ...TPL.map(t => [t.name, t.code])]) {
    ok(pracCheck(code) === null, `${label} が静的チェックで警告される`);
    const own = userFns(code);
    for (const c of calls(code)) {
      ok(KW.has(c) || own.has(c) || off.has(c), `${label} が公式にない関数 ${c} を呼んでいる`);
      ok(KW.has(c) || own.has(c) || refNames.has(c), `${label} の使用関数 ${c} がリファレンスに無い`);
    }
  }
  // 静的チェック自体の境界ケース（R05）
  const cases = [
    ['print("(");', null], ["print('(');", null], ['s = "a\\"(";', null], ["// ( {\nx = 1;", null], ["/* (\n{ */ y();", null],
    ['a = "x // (";', null], ['x = f(1));', "extra"], ["if (a) { b(;", "open"], ["x = (a];", "mismatch"], ['s = "abc;\nprint(s);', "str"],
    ["/* never closed (", "block"], ["for (i = 0; i < 3; i++) {\n  print(i);\n", "open"]
  ];
  for (const [code, kind] of cases) { const r = pracCheck(code); ok(kind === null ? r === null : (r && r.kind === kind), `静的チェック境界 ${JSON.stringify(code)} → ${JSON.stringify(r)}（期待 ${kind}）`); }
  const r1 = pracCheck("a();\nb(;\n"); ok(r1 && r1.at === 6 && r1.kind === "open", `静的チェックの位置 ${JSON.stringify(r1)}`);
  console.log(`official=${off.size} names checked=${(D.functions || []).length}`);
}
ok(T.length >= 75, `用語数 ${T.length}`);
ok(!T.some(t => /\(\)/.test(t.t)), "用語集に関数系の項目が残っている");
const FN = D.functions || [];
ok(FN.length >= 70 && FN.length <= 120, `関数数 ${FN.length}`);
{
  const names = new Set();
  for (const f of FN) {
    ok(!names.has(f.name), `関数名重複 ${f.name}`); names.add(f.name);
    ok(f.sig && f.sig.indexOf(f.name) === 0, `関数 ${f.name} 書式不正`);
    ok(D.functionCats[f.cat], `関数 ${f.name} カテゴリ不正 ${f.cat}`);
    ok(f.desc && f.desc.length >= 20, `関数 ${f.name} 説明不足`);
    ok("ret" in f && "ex" in f && "note" in f && "ver" in f, `関数 ${f.name} キー欠落`);
  }
  for (const c of Object.keys(D.functionCats)) ok(FN.filter(f => f.cat === c).length >= 3, `関数カテゴリ ${c} が少なすぎる`);
  console.log(`functions=${FN.length}`);
}
ok(DOCS.length === 12, `ドキュメント章数 ${DOCS.length}`);
const docEntries = DOCS.reduce((n, c) => n + c.entries.length, 0);
ok(docEntries >= 45, `ドキュメント項目数 ${docEntries}`);

const lids = new Set(L.map(l => l.id)), tids = new Set(T.map(t => t.t));
for (const l of L) {
  ok(D.lessonCats[l.cat], `レッスン ${l.id} カテゴリ不正 ${l.cat}`);
  ok(l.sections && l.sections.length >= 2, `レッスン ${l.id} セクション不足`);
  for (const s of l.sections) { ok(s.h && s.b && s.b.length, `レッスン ${l.id} セクション欠落`); if (s.fig) ok(FIGS.has(s.fig), `レッスン ${l.id} 図ID不正 ${s.fig}`); }
  for (const r of l.related || []) ok(lids.has(r), `レッスン ${l.id} related 不正 ${r}`);
  for (const n of l.terms || []) ok(tids.has(n), `レッスン ${l.id} 用語参照不正 ${n}`);
  ok(SRCKEYS.has(l.src), `レッスン ${l.id} 出典キー不正 ${l.src}`);
}
ok(lids.size === L.length, "レッスンID重複");
const qids = new Set(), dist = [0, 0, 0, 0];
let longest = 0;
for (const q of Q) {
  ok(!qids.has(q.id), `問題ID重複 ${q.id}`); qids.add(q.id);
  ok(D.questionCats[q.cat], `問題 ${q.id} カテゴリ不正 ${q.cat}`);
  ok(q.c.length === 4 && new Set(q.c).size === 4, `問題 ${q.id} 選択肢不正`);
  ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, `問題 ${q.id} 正解位置不正`);
  ok(Array.isArray(q.w) && q.w.length === 4 && q.w[q.a] === null && q.w.every((w, i) => i === q.a || (typeof w === "string" && w.length > 0)), `問題 ${q.id} 誤答理由不正`);
  ok(q.e && q.e.length >= 20, `問題 ${q.id} 解説不足`);
  ok(lids.has(q.lesson), `問題 ${q.id} レッスン参照不正 ${q.lesson}`);
  ok(SRCKEYS.has(q.src), `問題 ${q.id} 出典キー不正 ${q.src}`);
  dist[q.a]++;
  const lens = q.c.map(c => c.length), max = Math.max(...lens);
  if (lens[q.a] === max && lens.filter(x => x === max).length === 1) longest++;
}
for (const c of Object.keys(D.questionCats)) {
  const n = Q.filter(q => q.cat === c).length;
  ok(n >= 4, `カテゴリ ${c} の問題数 ${n} < 4`);
}
const longestRate = longest / Q.length;
ok(longestRate <= 0.25, `最長正解率 ${(longestRate * 100).toFixed(1)}% > 25%`);
const mean = Q.length / 4;
ok(dist.every(d => Math.abs(d - mean) <= Math.max(2, mean * 0.25)), `正解位置分布 ${dist}`);
console.log(`bias: uniqueLongestCorrect=${longest}/${Q.length} (${(longestRate * 100).toFixed(1)}%) answerDist=${dist}`);

for (const t of T) {
  ok(t.t && t.en && t.d && t.detail, `用語 ${t.t} 必須項目欠落`);
  ok(Array.isArray(t.aliases), `用語 ${t.t} aliases 不正`);
  for (const r of t.related || []) ok(tids.has(r), `用語 ${t.t} related 不正 ${r}`);
  ok(SRCKEYS.has(t.src), `用語 ${t.t} 出典キー不正 ${t.src}`);
}
ok(tids.size === T.length, "用語名重複");
const eids = new Set();
for (const c of DOCS) {
  ok(c.entries.length >= 3, `章 ${c.id} 項目不足`);
  for (const e of c.entries) {
    ok(!eids.has(e.id), `ドキュメント項目ID重複 ${e.id}`); eids.add(e.id);
    ok(/^https:\/\//.test(e.src) && e.srcName && e.version, `項目 ${e.id} 出典情報不足`);
    ok(e.body && e.body.length >= 2, `項目 ${e.id} 本文不足`);
    for (const r of e.lessons || []) ok(lids.has(r), `項目 ${e.id} レッスン参照不正 ${r}`);
    for (const n of e.terms || []) ok(tids.has(n), `項目 ${e.id} 用語参照不正 ${n}`);
  }
}
console.log(`lessons=${L.length} questions=${Q.length} terms=${T.length} docChapters=${DOCS.length} docEntries=${docEntries}`);
if (fails.length) { console.error("VALIDATE FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("ALL CHECKS PASSED");
