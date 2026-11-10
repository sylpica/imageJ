// v2 データ整合性・バイアス検証: node tests/validate.mjs
import { readFileSync } from "node:fs";
const dir = new URL("../", import.meta.url).pathname;
global.window = {};
for (const f of ["data-lessons.js", "data-questions.js", "data-docs.js"]) {
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
ok(T.length >= 80, `用語数 ${T.length}`);
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
