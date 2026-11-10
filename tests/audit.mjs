// v2 使い倒し監査（Playwright）: node tests/audit.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// playwright はローカル node_modules → グローバル（NODE_PATH）の順に解決する
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require(require.resolve("playwright", { paths: (process.env.NODE_PATH || "").split(":").filter(Boolean) }))); }

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
// file:// はスクリプト読込が不安定（ERR_FAILED を実測）なため、ローカルHTTPで配信して監査する
const root = new URL("../", import.meta.url).pathname;
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
  // 括弧チェック: ブロックコメント内の括弧を数えない（ステータス表示で確認）
  await page.fill("#macroEd", "/* ( */ x()");
  await page.waitForTimeout(80);
  const statOk = await page.locator("#pracStat").innerText();
  ok((await page.locator("#pracIssue").count()) === 0, `[追加] 括弧チェックがブロックコメントを無視 (${statOk})`);
  await page.fill("#macroEd", "for (i = 0; i < 3; i++) {");
  await page.waitForTimeout(80);
  const statNg = await page.locator("#pracStat").innerText();
  ok(statNg.includes("1行目の { が閉じていません"), `[追加] 未閉じ括弧は位置つきで警告される (${statNg})`);
  // 省略可能部つき書式の挿入: [ ] を落として挿入される
  await page.click('[data-ptab="ref"]');
  await page.fill("#pracKw", "getHistogram");
  await page.waitForTimeout(80);
  await page.locator("[data-fn='getHistogram']").first().click();
  await page.waitForSelector("#insSig");
  await page.click("#insSig");
  const edVal = await page.inputValue("#macroEd");
  ok(edVal.includes("getHistogram(values, counts, nBins);") && !edVal.includes("[, histMin"), `[追加] 省略可能部を落として挿入`);
  // テンプレート上書き確認: 編集済みコードでは確認ダイアログが出て、拒否すると保持される
  await page.fill("#macroEd", "x = 1; // my code");
  let dialogSeen = false;
  page.once("dialog", async d => { dialogSeen = true; await d.dismiss(); });
  await page.selectOption("#tplSel", "0");
  await page.waitForTimeout(150);
  ok(dialogSeen && (await page.inputValue("#macroEd")).includes("my code"), `[追加] テンプレート上書き前に確認し拒否で保持`);
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
// ---- マクロ練習モード監査（AUDIT5）: 挿入位置・データ保全・書き出し・堅牢性・キーボード ----
for (const width of [375, 1280]) {
  const W = `[練習 ${width}px]`;
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.goto("about:blank"); await page.goto(url + "#/practice");
  await page.waitForSelector("#macroEd");
  const narrow = width < 860;
  const toRef = async () => { if (narrow) await page.click('[data-ptab="ref"]'); };
  const openFn = async name => { await toRef(); await page.fill("#pracKw", name); await page.locator(`[data-fn='${name}']`).first().click(); await page.waitForSelector("#insSig"); };
  const val = () => page.inputValue("#macroEd");
  const sel = () => page.evaluate(() => { const e = document.getElementById("macroEd"); return e.value.slice(e.selectionStart, e.selectionEnd); });
  const setCode = async (code, caret) => {
    await page.evaluate(([c, k]) => { const e = document.getElementById("macroEd"); e.value = c; e.dispatchEvent(new Event("input")); e.focus(); e.setSelectionRange(k, k); e.dispatchEvent(new Event("select")); }, [code, caret]);
  };
  // 実行できないことの明示と、実行ボタンが無いこと（R01）
  const foot = await page.locator(".foot-note").innerText();
  ok(foot.includes("実行はこのアプリでは行えません") && foot.includes("Fiji") && foot.includes("文字化け"), `${W} 実行不可と実行手順の明示`);
  ok((await page.locator(".prac-tools button, .prac-tools select, .prac-ins button", { hasText: /実行|Run/ }).count()) === 0, `${W} 実行できるかのようなボタンが無い`);
  // 初期コード：未編集なら確認なしでテンプレート適用
  let dialogs = 0;
  page.on("dialog", async d => { dialogs++; await d.dismiss(); });
  await page.selectOption("#tplSel", "2");
  ok(dialogs === 0 && (await val()).includes("roiManager(\"count\")"), `${W} 未編集の初期コードは確認なしでテンプレート適用`);
  // 初期コメントを残したまま書き足した場合も、テンプレートで無言上書きしない（旧判定の欠陥の回帰）
  await page.goto(url + "#/home"); await page.evaluate(() => localStorage.clear()); await page.goto(url + "#/practice"); await page.waitForSelector("#macroEd");
  const starter = await val();
  await setCode(starter + "myVar = 42;\n", starter.length);
  dialogs = 0;
  await page.selectOption("#tplSel", "0");
  await page.waitForTimeout(100);
  ok(dialogs === 1 && (await val()).includes("myVar = 42;"), `${W} 初期コメント＋書き足しはテンプレート上書き前に確認（拒否で保持）`);
  // 消去：編集済みなら確認し、拒否で保持
  dialogs = 0;
  await page.click("#btnClear");
  await page.waitForTimeout(100);
  ok(dialogs === 1 && (await val()).includes("myVar = 42;"), `${W} 消去前に確認し拒否で保持`);
  // 書式挿入：行の途中にカーソルがあっても行を壊さず次の行へ、引数部分を選択状態で挿入（R04）
  await setCode("a = 1;\n    b = 2;\n", 10);
  await openFn("getPixel");
  await page.click("#insSig");
  ok((await val()) === "a = 1;\n    b = 2;\n    getPixel(x, y);\n" && (await sel()) === "x, y", `${W} 書式は行を壊さず次行にインデントを揃えて挿入し引数を選択 (${JSON.stringify(await val())})`);
  // 選択した引数をそのまま上書き入力できる
  await page.keyboard.type("10, 20");
  ok((await val()).includes("getPixel(10, 20);"), `${W} 選択された引数を上書き入力できる`);
  // 空行では、その位置に挿入
  await setCode("x = 1;\n\ny = 2;", 7);
  await openFn("getWidth");
  await page.click("#insEx");
  ok((await val()) === "x = 1;\nw = getWidth();\ny = 2;", `${W} 空行への使用例挿入 (${JSON.stringify(await val())})`);
  // 選択範囲は置き換える
  await page.evaluate(() => { const e = document.getElementById("macroEd"); e.value = "v = PLACE;"; e.dispatchEvent(new Event("input")); e.focus(); e.setSelectionRange(4, 9); e.dispatchEvent(new Event("select")); });
  await openFn("nImages");
  await page.click("#insSig");
  ok((await val()) === "v = nImages;;", `${W} 選択範囲は置き換え (${JSON.stringify(await val())})`);
  // 可変長・省略可能部は落として挿入
  await setCode("", 0);
  for (const name of ["roiManager", "makePolygon", "print", "getHistogram"]) { await openFn(name); await page.click("#insSig"); }
  const ins = await val();
  ok(!/\.\.\.|\[,/.test(ins) && ins.includes('roiManager("command");') && ins.includes("print(arg1, arg2);"), `${W} 可変長・省略可能部を落として挿入 (${JSON.stringify(ins)})`);
  ok((await page.locator("#pracIssue").count()) === 0, `${W} 挿入後のコードに括弧警告なし`);
  // 取り消し：テンプレート適用は Ctrl+Z で戻せる
  await setCode("keep = 1;\n", 10);
  page.removeAllListeners("dialog");
  page.on("dialog", async d => { await d.accept(); });
  await page.selectOption("#tplSel", "4");
  await page.focus("#macroEd");
  await page.keyboard.press("Control+z");
  ok((await val()) === "keep = 1;\n", `${W} テンプレート適用を Ctrl+Z で取り消せる (${JSON.stringify(await val())})`);
  page.removeAllListeners("dialog");
  page.on("dialog", async d => { await d.dismiss(); });
  // 関数名ダブルクリック：説明が出て、カーソルは単語の後ろ（以後の挿入が単語を消さない）
  await setCode("title = getTitle();\n", 0);
  const box = await page.locator("#macroEd").boundingBox();
  await page.evaluate(() => { const e = document.getElementById("macroEd"); e.focus(); e.setSelectionRange(10, 10); });
  await page.locator("#macroEd").dispatchEvent("dblclick");
  await page.waitForSelector("#insSig");
  ok((await page.locator(".prac-ref .fn-sig").innerText()) === "getTitle()" && (await sel()) === "", `${W} ダブルクリックで説明表示しカーソルは単語の後ろ`);
  await page.click("#insSig");
  ok((await val()) === "title = getTitle();\ngetTitle();\n", `${W} ダブルクリック後の挿入が元の単語を壊さない (${JSON.stringify(await val())})`);
  // 分類チップ・タブ切替でエディタを作り直さない（カーソル保持）
  const edHandle = await page.$("#macroEd");
  await toRef();
  await page.click('[data-pcat="math"]');
  if (narrow) await page.click('[data-ptab="code"]');
  ok(await page.evaluate(h => h === document.getElementById("macroEd"), edHandle), `${W} 分類切替・タブ切替でエディタが再生成されない`);
  // 他画面へ移動して戻ってもカーソル位置と下書きを保持
  await setCode("line1\nline2\nline3\n", 8);
  await page.waitForTimeout(500);
  await page.goto(url + "#/functions"); await page.waitForSelector(".card");
  await page.goto(url + "#/practice"); await page.waitForSelector("#macroEd");
  ok((await val()) === "line1\nline2\nline3\n" && (await page.evaluate(() => document.getElementById("macroEd").selectionStart)) === 8, `${W} 画面遷移後も下書きとカーソル位置を保持`);
  // 再読込でも下書きが復元される
  await page.reload(); await page.waitForSelector("#macroEd");
  ok((await val()) === "line1\nline2\nline3\n", `${W} 再読込後に下書きを復元`);
  // 関数詳細ページから練習モードへ
  await page.goto(url + "#/function/getStatistics"); await page.waitForSelector(".fn-sig");
  await page.click('a[href="#/practice/getStatistics"]');
  await page.waitForSelector("#insSig");
  ok((await page.locator(".prac-ref .fn-sig").innerText()).startsWith("getStatistics(") && (await val()) === "line1\nline2\nline3\n", `${W} 関数ページ→練習で説明表示・下書き保持`);
  // 静的チェックの位置表示と移動
  if (narrow) await page.click('[data-ptab="code"]');
  await setCode("a = 1;\nif (a) {\n  print('(');\n", 0);
  const issue = await page.locator("#pracIssue").innerText();
  ok(issue === "2行目の { が閉じていません", `${W} 括弧警告が位置を示す (${issue})`);
  await page.click("#pracIssue");
  ok((await sel()) === "{", `${W} 警告クリックで該当文字を選択`);
  await setCode('s = "abc;\nprint(s);\n', 0);
  ok((await page.locator("#pracIssue").innerText()) === "1行目の文字列が閉じていません", `${W} 閉じていない文字列を検出`);
  // 特殊文字（日本語・絵文字・引用符）と .ijm 書き出し（R07/R11）
  const special = "// 日本語コメント 🧪 (\nmsg = \"引用符 \\\" と ( の入った文字列 😀\";\nprint(msg, 'single (');\n";
  await setCode(special, 0);
  ok((await page.locator("#pracIssue").count()) === 0, `${W} 特殊文字入りの正しいコードに誤警告なし`);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#btnDl")]);
  const dlPath = await dl.path();
  const bytes = fs.readFileSync(dlPath);
  ok(dl.suggestedFilename() === "macro.ijm", `${W} 保存ファイル名 macro.ijm`);
  ok(bytes.toString("utf8") === special && !(bytes[0] === 0xEF && bytes[1] === 0xBB) && !bytes.includes(13), `${W} 書き出し内容が一致（UTF-8・BOMなし・LF）`);
  // 長大なコード（2万行）の貼り付け
  const big = Array.from({ length: 20000 }, (_, i) => `x${i} = getPixel(${i % 100}, ${i % 50}); // (${i})`).join("\n");
  const t0 = Date.now();
  await setCode(big, 0);
  const st = await page.locator("#pracStat").innerText();
  ok(st.startsWith("20000 行") && (await page.locator("#pracIssue").count()) === 0 && Date.now() - t0 < 5000, `${W} 2万行でも行数・括弧チェックが動作 (${Date.now() - t0}ms)`);
  // 保存失敗の表示（容量超過など）
  await page.evaluate(() => { Storage.prototype._set = Storage.prototype.setItem; Storage.prototype.setItem = function(){ throw new Error("QuotaExceededError"); }; });
  await setCode("q = 1;\n", 0);
  await page.waitForTimeout(600);
  ok((await page.locator("#pracStat").innerText()).includes("下書きを保存できませんでした"), `${W} 保存失敗を表示`);
  await page.evaluate(() => { Storage.prototype.setItem = Storage.prototype._set; });
  await setCode("q = 2;\n", 0);
  await page.waitForTimeout(600);
  ok(!(await page.locator("#pracStat").innerText()).includes("保存できません"), `${W} 保存回復で表示が消える`);
  // キーボード：Tab はインデント、Esc→Tab でフォーカス移動（キーボードトラップ回避）
  await setCode("", 0);
  await page.focus("#macroEd");
  await page.keyboard.press("Tab");
  ok((await val()) === "    " && (await page.evaluate(() => document.activeElement.id)) === "macroEd", `${W} Tab でインデント`);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  ok((await page.evaluate(() => document.activeElement.id)) !== "macroEd", `${W} Esc→Tab でエディタから抜けられる`);
  // 壊れた保存データでも起動できる（R06）
  await page.waitForTimeout(600);
  await page.evaluate(() => localStorage.setItem("ij-ref-v2", JSON.stringify({ hist: { Q01: null, Q02: 5 }, bm: "x", lessonDone: {}, macroDraft: 5 })));
  await page.reload();
  for (const h of ["#/home", "#/practice", "#/quiz", "#/lessons"]) { await page.goto(url + h); await page.waitForTimeout(150); }
  await page.goto(url + "#/practice"); await page.reload(); await page.waitForSelector("#macroEd");
  ok((await val()).includes("右の関数リファレンスを見ながら"), `${W} 型の壊れた保存データでも起動し初期コード表示`);
  await page.evaluate(() => localStorage.setItem("ij-ref-v2", "{broken json"));
  await page.goto(url + "#/home"); await page.reload(); await page.waitForSelector(".tiles");
  ok(true, `${W} 不正JSONの保存データでも起動`);
  // 375px でもはみ出しなし
  await page.goto(url + "#/practice"); await page.waitForSelector("#macroEd");
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ov <= 0, `${W} 練習画面の横溢れなし (${ov})`);
  ok(errors.length === 0, `${W} JSエラーなし ${errors.join(" | ")}`);
  await ctx.close();
}

await browser.close();
server.close();
if (fails.length) { console.error("AUDIT FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("AUDIT ALL PASSED");
