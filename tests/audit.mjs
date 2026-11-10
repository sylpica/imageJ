// v2 使い倒し監査（Playwright）: node tests/audit.mjs
import { createRequire } from "node:module";
const require = createRequire("/home/hatch/workspace/dev/g-ai-master/package.json");
const { chromium } = require("playwright");

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
// file:// はスクリプト読込が不安定（ERR_FAILED を実測）なため、ローカルHTTPで配信して監査する
const root = "/home/hatch/workspace/dev/imagej";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  const p = path.join(root, rel === "/" ? "index.html" : rel);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(data);
  });
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
let fails = [];
const ok = (c, m) => { if (!c) fails.push(m); else console.log("PASS", m); };

const browser = await chromium.launch();
for (const width of [375, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.goto("about:blank"); await page.goto(url);
  await page.waitForSelector(".tiles");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, `[${width}px] ホーム横溢れなし (${overflow})`);
  ok((await page.locator(".tile").count()) === 6, `[${width}px] ホームのタイル6件`);

  // レッスン一覧→詳細（図つき）→用語ポップアップ→用語詳細
  await page.goto(url + "#/lessons");
  await page.waitForSelector(".card");
  ok((await page.locator(".card").count()) >= 20, `[${width}px] レッスン一覧表示`);
  await page.goto(url + "#/lesson/L02");
  await page.waitForSelector(".fig svg");
  const figVisible = await page.evaluate(() => { const s = document.querySelector(".fig svg"); const r = s.getBoundingClientRect(); return r.width > 100 && r.height > 30; });
  ok(figVisible, `[${width}px] 図解SVGが実際に描画されている`);
  const termBtns = await page.locator("button.term").count();
  ok(termBtns >= 1, `[${width}px] レッスン本文に用語リンク (${termBtns})`);
  if (termBtns) {
    await page.locator("button.term").first().click();
    await page.waitForSelector("#termSheet:not([hidden])");
    ok((await page.locator("#tsTitle").innerText()).length > 0, `[${width}px] 用語ポップアップ表示`);
    await page.click("#tsLink");
    await page.waitForSelector(".term-detail");
    ok(true, `[${width}px] ポップアップから用語詳細へ遷移`);
  }

  // ドキュメント章＋アンカー
  await page.goto(url + "#/doc/D6");
  await page.waitForSelector(".doc-entry");
  ok((await page.locator(".doc-entry").count()) >= 3, `[${width}px] ドキュメント章の項目表示`);
  await page.goto(url + "#/doc/D5/D5-1");
  await page.waitForTimeout(150);
  ok(await page.locator("#D5-1").count() === 1, `[${width}px] ドキュメント項目アンカー存在`);
  // ドキュメントのブックマーク切替
  const bmBefore = await page.locator("#D5-1 [data-docbm]").innerText();
  await page.click("#D5-1 [data-docbm]");
  ok((await page.locator("#D5-1 [data-docbm]").innerText()) !== bmBefore, `[${width}px] ドキュメントブックマーク切替`);

  // 横断検索：表記揺れ・英語・同義語
  for (const [q, expect] of [["しきい値", "閾値"], ["threshold", ""], ["Mean", "Mean"], ["ROI", "ROI"], ["背景補正", "背景"]]) {
    await page.goto(url + "#/search?q=" + encodeURIComponent(q));
    await page.waitForSelector("h1.page");
    const n = await page.locator(".sr-item").count();
    ok(n >= 1, `[${width}px] 検索「${q}」結果 ${n} 件`);
    if (expect) { const txt = await page.locator(".view").innerText(); ok(txt.includes(expect), `[${width}px] 検索「${q}」に ${expect} を含む`); }
  }
  await page.goto(url + "#/search?q=" + encodeURIComponent("存在しない語xyz123"));
  ok((await page.locator(".empty").count()) === 1, `[${width}px] 検索0件の案内表示`);

  // クイズ：開始→回答→解説（誤答理由）→ブックマーク→履歴保持→復習モード
  await page.goto(url + "#/quiz");
  await page.waitForSelector("#qForm");
  await page.click("#qForm button[type=submit]");
  await page.waitForSelector(".choice");
  ok((await page.locator(".choice").count()) === 4, `[${width}px] クイズ開始・選択肢4件`);
  const qtext1 = await page.locator(".qtext").innerText();
  await page.locator(".choice").first().click();
  await page.waitForSelector(".verdict");
  ok((await page.locator(".explain").count()) === 1, `[${width}px] 回答後に解説表示`);
  await page.click("#qBm");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ij-ref-v2") || "{}"));
  ok(stored.bm && stored.bm.length === 1, `[${width}px] 問題ブックマークが保存`);
  ok(stored.hist && Object.keys(stored.hist).length === 1, `[${width}px] 学習履歴が保存`);
  await page.click("#qNext");
  await page.waitForSelector(".choice:not([disabled])");
  const qtext2 = await page.locator(".qtext").innerText();
  ok(qtext1 !== qtext2, `[${width}px] 次の問題へ進み状態を持ち越さない`);
  await page.goto("about:blank"); await page.goto(url + "#/quiz"); // 同一URL goto は再読込されないため blank 経由で完全再読込
  await page.waitForSelector("#qForm");
  const setupTxt = await page.locator(".quiz-setup").innerText();
  ok(setupTxt.includes("回答済み 1 問"), `[${width}px] リロード後も履歴保持 (${setupTxt.split("\n")[0]})`);
  // ブックマークのみモードで1問出題される
  await page.check('input[name="mode"][value="bm"]');
  await page.click("#qForm button[type=submit]");
  await page.waitForSelector(".choice");
  ok(true, `[${width}px] ブックマークのみモードで出題`);

  // 用語集フィルタ
  await page.goto(url + "#/terms");
  await page.waitForSelector(".card");
  await page.fill("#tKw", "LUT");
  await page.waitForTimeout(120);
  ok((await page.locator(".card").count()) >= 1, `[${width}px] 用語集フィルタ LUT`);

  // 全画面の横溢れ総点検
  for (const h of ["#/home", "#/lessons", "#/lesson/L11", "#/lesson/L16", "#/doc/D2", "#/terms", "#/quiz"]) {
    await page.goto(url + h);
    await page.waitForTimeout(200);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(ov <= 0, `[${width}px] ${h} 横溢れなし (${ov})`);
  }
  ok(errors.length === 0, `[${width}px] JSエラーなし ${errors.join(";")}`);
  await page.close();
}
// ---- 追加監査: 入れ子ボタン禁止＋クイズ全問走破 ----
{
  const page = await browser.newPage({ viewport: { width: 375, height: 844 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.goto("about:blank"); await page.goto(url);
  for (const h of ["#/home", "#/lessons", "#/lesson/L09", "#/lesson/L16", "#/doc/D6", "#/doc/D5", "#/terms", "#/term/LUT", "#/functions", "#/function/getPixel", "#/function/run"]) {
    await page.goto(url + h);
    await page.waitForTimeout(150);
    const nested = await page.evaluate(() => document.querySelectorAll("button button, a button, button a").length);
    ok(nested === 0, `[追加] ${h} 入れ子インタラクティブ要素なし (${nested})`);
  }
  // 関数メニュー: 一覧→詳細→検索統合
  await page.goto(url + "#/functions");
  await page.waitForSelector(".card");
  ok((await page.locator(".card").count()) >= 70, `[追加] 関数一覧の表示件数`);
  await page.goto(url + "#/function/getPixel");
  await page.waitForSelector(".fn-sig");
  ok((await page.locator(".fn-sig").innerText()).includes("getPixel"), `[追加] 関数詳細の書式表示`);
  await page.goto(url + "#/search?q=getPixel");
  await page.waitForSelector("h1.page");
  ok((await page.locator(".view").innerText()).includes("関数"), `[追加] 横断検索に関数グループ`);
  // マクロ練習: テンプレート読込→関数詳細→挿入→下書き保持
  await page.goto(url + "#/practice");
  await page.waitForSelector("#macroEd");
  await page.selectOption("#tplSel", "1");
  ok((await page.inputValue("#macroEd")).includes("setAutoThreshold"), `[追加] テンプレート読込`);
  await page.click('[data-ptab="ref"]');
  await page.fill("#pracKw", "getPixel");
  await page.waitForTimeout(80);
  await page.locator("[data-fn='getPixel']").first().click();
  await page.waitForSelector("#insSig");
  await page.click("#insSig");
  ok((await page.inputValue("#macroEd")).includes("getPixel(x, y);"), `[追加] 関数の書式をエディタへ挿入`);
  await page.goto(url + "#/home");
  await page.waitForSelector(".tiles");
  await page.goto(url + "#/practice");
  await page.waitForSelector("#macroEd");
  ok((await page.inputValue("#macroEd")).includes("getPixel(x, y);"), `[追加] 下書きが保持される`);
  // クイズ全問走破（全問モードで最後まで回答→結果画面）
  await page.goto(url + "#/quiz");
  await page.waitForSelector("#qForm");
  await page.click("#qForm button[type=submit]");
  let steps = 0;
  while (steps < 70) {
    const hasChoice = await page.locator(".choice:not([disabled])").count();
    if (hasChoice === 4) {
      const nested = await page.evaluate(() => document.querySelectorAll(".choice button").length);
      ok(nested === 0, `[追加] 選択肢内に入れ子ボタンなし (step ${steps})`);
      await page.locator(".choice").first().click();
      await page.waitForSelector(".verdict");
    }
    const next = page.locator("#qNext");
    if (await next.count()) { await next.click(); steps++; continue; }
    break;
  }
  ok((await page.locator(".result-big").count()) === 1, `[追加] 全問回答して結果画面に到達 (${steps} steps)`);
  const resTxt = await page.locator(".result-big").innerText();
  ok(/\/ 63 問/.test(resTxt), `[追加] 結果画面の総数が全問題数と一致 (${resTxt})`);
  ok(errors.length === 0, `[追加] 全問走破でJSエラーなし ${errors.join(";")}`);
  await page.close();
}
await browser.close();
server.close();
if (fails.length) { console.error("AUDIT FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("AUDIT ALL PASSED");
