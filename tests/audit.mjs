// 使い倒し監査（Playwright）: node tests/audit.mjs
import { createRequire } from "node:module";
const require = createRequire("/home/hatch/workspace/dev/g-ai-master/package.json");
const { chromium } = require("playwright");

const url = "file:///home/hatch/workspace/dev/imagej/index.html";
let fails = [];
const ok = (c, m) => { if (!c) fails.push(m); else console.log("PASS", m); };

const browser = await chromium.launch();
for (const width of [375, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, `[${width}px] 横溢れなし (overflow=${overflow})`);
  ok(await page.locator("#lessonTitle").innerText() !== "", `[${width}px] レッスン初期表示`);
  const headerH = await page.evaluate(() => document.querySelector(".top").offsetHeight);
  ok(headerH <= 52, `[${width}px] ヘッダー高さ ${headerH}px <= 52px`);

  // レッスン遷移往復＋連打
  for (let i = 0; i < 5; i++) await page.click("#nextBtn");
  for (let i = 0; i < 3; i++) await page.click("#prevBtn");
  ok((await page.locator("#lessonMeta").innerText()).includes("3 /"), `[${width}px] 前後遷移の往復で位置が正しい`);
  await page.click("#nextBtn"); await page.click("#nextBtn");
  // 完了チェック→リロード保持
  await page.check("#doneCheck");
  await page.reload();
  const prog = await page.locator("#progText").innerText();
  ok(prog.startsWith("1 /"), `[${width}px] 完了がリロード後も保持 (${prog})`);
  // カテゴリ絞り込み即反映
  await page.selectOption("#catFilter", "filter");
  const cnt = await page.locator("#countText").innerText();
  ok(cnt.includes("1"), `[${width}px] カテゴリ絞り込み即反映 (${cnt})`);
  await page.selectOption("#catFilter", "all");
  // 検索絞り込み
  await page.fill("#kwSearch", "存在しないキーワードxyz");
  ok((await page.locator("#lessonTitle").innerText()) === "該当なし", `[${width}px] 検索0件で空状態表示`);
  await page.fill("#kwSearch", "");

  // クイズ: 回答→フィードバック→次へで状態持ち越しなし
  await page.click("#btnQuiz");
  await page.click(".choice >> nth=0");
  ok(await page.locator(".feedback").count() === 1, `[${width}px] 回答後にフィードバック表示`);
  const score1 = await page.locator("#quizScore").innerText();
  ok(score1.includes("回答 1"), `[${width}px] スコア合計表示 (${score1})`);
  // 連打しても二重回答しない（disabled）
  await page.click("#quizNext");
  ok(await page.locator(".choice:not([disabled])").count() === 4, `[${width}px] 次の問題に前回の選択を持ち越さない`);
  // キーボード回答 1-4
  await page.keyboard.press("2");
  ok(await page.locator(".feedback").count() === 1, `[${width}px] キーボード(2)で回答できる`);
  await page.reload();
  await page.click("#btnQuiz");
  ok((await page.locator("#quizScore").innerText()).includes("回答 2"), `[${width}px] 回答がリロード後も保持`);
  // やり直しで回答リセット
  await page.click("#quizRetry");
  ok((await page.locator("#quizScore").innerText()) === "未回答", `[${width}px] やり直しで回答リセット`);
  // タブ往復連打
  for (let i = 0; i < 10; i++) { await page.click("#btnGloss"); await page.click("#btnLesson"); await page.click("#btnQuiz"); }
  ok(errors.length === 0, `[${width}px] タブ連打でJSエラーなし ${errors.join(";")}`);
  // 用語集検索
  await page.click("#btnGloss");
  await page.fill("#kwSearch", "Otsu");
  ok(await page.locator(".gloss-item").count() >= 1, `[${width}px] 用語検索が効く`);
  await page.fill("#kwSearch", "");
  // 進捗リセット
  await page.click("#btnLesson");
  await page.click("#resetBtn");
  ok((await page.locator("#progText").innerText()).startsWith("0 /"), `[${width}px] 進捗リセットが効く`);
  ok(errors.length === 0, `[${width}px] 全体でJSエラーなし ${errors.join(";")}`);
  await page.close();
}
await browser.close();
if (fails.length) { console.error("AUDIT FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("AUDIT ALL PASSED");
