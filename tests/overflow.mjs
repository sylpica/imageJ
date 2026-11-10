// 全ページ要素単位はみ出し走査: node tests/overflow.mjs
import { createRequire } from "node:module";
const require = createRequire("/home/hatch/workspace/dev/g-ai-master/package.json");
const { chromium } = require("playwright");
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

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

global.window = {};
for (const f of ["data-lessons.js", "data-questions.js", "data-docs.js", "data-functions.js"])
  (0, eval)(fs.readFileSync(path.join(root, f), "utf8").replace(/^window\./, "window."));
// eval 内で window 参照できるよう global 経由にする
const D = global.window.IJDATA2 || {};
if (!D.lessons) { // フォールバック: require 方式
  const w = {}; global.window = w;
  for (const f of ["data-lessons.js", "data-questions.js", "data-docs.js", "data-functions.js"]) {
    const code = fs.readFileSync(path.join(root, f), "utf8");
    new Function("window", code)(w);
  }
  Object.assign(D, w.IJDATA2);
}

const routes = ["#/home", "#/lessons", "#/quiz", "#/docs", "#/functions", "#/terms", "#/search?q=threshold", "#/practice"];
for (const l of D.lessons) routes.push("#/lesson/" + l.id);
for (const c of D.docs) routes.push("#/doc/" + c.id);
for (const t of D.terms) routes.push("#/term/" + encodeURIComponent(t.t));
for (const f of D.functions) routes.push("#/function/" + encodeURIComponent(f.name));

const SCAN = () => {
  const out = { doc: document.documentElement.scrollWidth - window.innerWidth, offenders: [] };
  document.querySelectorAll("#view *").forEach(el => {
    if (el.namespaceURI === "http://www.w3.org/2000/svg") return; // SVGは getBBox による viewBox 検査で別途確認
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === "visible") {
      out.offenders.push(el.tagName + "." + (el.className && el.className.baseVal !== undefined ? "" : String(el.className).split(" ")[0]) + " :: " + (el.textContent || "").trim().slice(0, 40) + ` [${el.scrollWidth}>${el.clientWidth}]`);
    }
    if (el.scrollHeight > el.clientHeight + 2 && cs.overflowY === "hidden" && cs.display !== "-webkit-box") {
      out.offenders.push("VCUT " + el.tagName + "." + String(el.className).split(" ")[0] + " :: " + (el.textContent || "").trim().slice(0, 40));
    }
  });
  return out;
};

const browser = await chromium.launch();
let problems = 0, scanned = 0;
for (const width of [320, 375, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.goto(url);
  await page.waitForSelector(".tiles");
  for (const r of routes) {
    await page.goto(url + r);
    await page.waitForTimeout(30);
    const res = await page.evaluate(SCAN);
    scanned++;
    if (res.doc > 0 || res.offenders.length) {
      problems++;
      console.log(`OVERFLOW [${width}px] ${r} doc=${res.doc}`, res.offenders.slice(0, 4).join(" | "));
    }
  }
  // クイズ全問（320/375のみ）
  if (width !== 1280) {
    await page.goto(url + "#/quiz");
    await page.waitForSelector("#qForm");
    await page.click("#qForm button[type=submit]");
    for (let i = 0; i < 63; i++) {
      await page.waitForSelector(".choice");
      let res = await page.evaluate(SCAN);
      if (res.doc > 0 || res.offenders.length) { problems++; console.log(`OVERFLOW [${width}px] quiz Q${i + 1} doc=${res.doc}`, res.offenders.slice(0, 3).join(" | ")); }
      await page.locator(".choice").first().click();
      await page.waitForSelector(".verdict");
      res = await page.evaluate(SCAN);
      if (res.doc > 0 || res.offenders.length) { problems++; console.log(`OVERFLOW [${width}px] quiz A${i + 1} doc=${res.doc}`, res.offenders.slice(0, 3).join(" | ")); }
      if (i < 62) { await page.click("#qNext"); }
    }
    scanned += 63;
  }
  await page.close();
}
await browser.close();
server.close();
console.log(`scanned=${scanned} problems=${problems}`);
console.log(problems ? "OVERFLOW FOUND" : "OVERFLOW ZERO");
