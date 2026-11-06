// データ整合性テスト: node tests/validate.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../data.js", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const D = sandbox.window.IJDATA;

let fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

ok(D, "IJDATA missing");
const cats = new Set(D.CATS.map(c => c[0]));
ok(cats.size === D.CATS.length, "duplicate category ids");

function checkCommon(items, kind, required) {
  const ids = new Set();
  for (const it of items) {
    ok(it.id || it.t, `${kind}: missing id/term`);
    const key = it.id || it.t;
    ok(!ids.has(key), `${kind}: duplicate id ${key}`);
    ids.add(key);
    ok(cats.has(it.cat), `${kind} ${key}: unknown category ${it.cat}`);
    ok(it.src && D.S[it.src], `${kind} ${key}: source key missing/invalid (${it.src})`);
    for (const f of required) ok(it[f] !== undefined && it[f] !== "", `${kind} ${key}: missing field ${f}`);
  }
}

checkCommon(D.LESSONS, "lesson", ["title", "lead", "body"]);
for (const l of D.LESSONS) {
  ok(Array.isArray(l.body) && l.body.length >= 2, `lesson ${l.id}: body too short`);
  ok(Array.isArray(l.points) && l.points.length >= 2, `lesson ${l.id}: points too short`);
}

checkCommon(D.QUESTIONS, "question", ["q", "c", "e"]);
for (const q of D.QUESTIONS) {
  ok(Array.isArray(q.c) && q.c.length === 4, `question ${q.id}: must have exactly 4 choices`);
  ok(new Set(q.c).size === 4, `question ${q.id}: duplicate choices`);
  ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, `question ${q.id}: answer index out of range (${q.a})`);
  ok(q.e && q.e.length >= 10, `question ${q.id}: explanation too short`);
}

checkCommon(D.TERMS, "term", ["d"]);
for (const t of D.TERMS) ok(t.d.length >= 10, `term ${t.t}: definition too short`);

// 規模の下限（目標）
ok(D.LESSONS.length >= 12, `lessons ${D.LESSONS.length} < 12`);
ok(D.QUESTIONS.length >= 60, `questions ${D.QUESTIONS.length} < 60`);
ok(D.TERMS.length >= 60, `terms ${D.TERMS.length} < 60`);

// 全カテゴリに各コンテンツが存在する
for (const c of cats) {
  ok(D.LESSONS.some(l => l.cat === c), `category ${c}: no lessons`);
  ok(D.QUESTIONS.some(q => q.cat === c), `category ${c}: no questions`);
  ok(D.TERMS.some(t => t.cat === c), `category ${c}: no terms`);
}

// 出典URLは http(s) で始まる
for (const [k, u] of Object.entries(D.S)) ok(/^https?:\/\//.test(u), `source ${k}: bad URL`);

console.log(`lessons=${D.LESSONS.length} questions=${D.QUESTIONS.length} terms=${D.TERMS.length} categories=${cats.size}`);
if (fails.length) { console.error("FAIL:\n" + fails.map(f => " - " + f).join("\n")); process.exit(1); }
console.log("ALL CHECKS PASSED");
