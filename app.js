(function(){
"use strict";
var D2 = window.IJDATA2 || {};
var LESSONS = D2.lessons || [], QUESTIONS = D2.questions || [],
    TERMS = D2.terms || [], DOCS = D2.docs || [],
    FUNCTIONS = D2.functions || [], FCATS = D2.functionCats || {},
    LCATS = D2.lessonCats || {}, QCATS = D2.questionCats || {}, TCATS = D2.termCats || {};
if (!Object.keys(TCATS).length) TCATS = { basics:"基礎", types:"画像の種類", roi:"ROI", measure:"測定と校正", threshold:"閾値と二値化", filter:"フィルタ", hist:"ヒストグラムと表示", calc:"画像演算", macro:"マクロ", plugin:"プラグイン", flow:"実務" };
if (!Object.keys(QCATS).length) QCATS = { basics:"画像の基礎", depth:"ビット深度と型", hist:"ヒストグラムと画素値", thresh:"閾値と二値化", filter:"フィルタと周波数", roi:"ROI・マスク・校正", measure:"測定と粒子解析", fluor:"背景補正と蛍光", valid:"妥当性と再現性" };
var SRC = {
  work:"https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
  filt:"https://imagejdocu.list.lu/gui/process/filters",
  bin:"https://imagejdocu.list.lu/gui/process/binary",
  calc:"https://imagejdocu.list.lu/gui/process/image_calculator",
  math:"https://imagejdocu.list.lu/gui/process/math",
  hist:"https://imagejdocu.list.lu/gui/analyze/histogramme",
  tools:"https://imagejdocu.list.lu/gui/analyze/tools",
  plug:"https://imagej.net/ij/docs/menus/plugins.html",
  bio:"https://imagej.net/formats/bio-formats",
  subbg:"https://imagejdocu.list.lu/gui/process/subtract_background",
  zproj:"https://imagej.net/imaging/z-functions",
  color:"https://imagej.net/mbf/colour_image_processi.htm",
  batch:"https://imagej.github.io/imagej-wiki-static/Batch_mode.html",
  fft:"https://imagejdocu.list.lu/gui/process/fft",
  ana:"https://imagej.net/ij/docs/menus/analyze.html",
  proc:"https://imagej.net/ij/docs/guide/146-29.html",
  macro:"https://imagej.net/ij/developer/macro/macros.html",
  macropdf:"https://imagej.net/ij/developer/macro/functions.html",
  guide:"https://imagej.net/ij/docs/guide/146.html",
  menus:"https://imagej.net/ij/docs/menus/",
  macrofn:"https://imagej.net/ij/developer/macro/functions.html"
};
function srcUrl(k){ return SRC[k] || null; }

/* ---------- store ---------- */
var KEY = "ij-ref-v2";
var store = { hist:{}, bm:[], lessonDone:[], docBm:[], lastDoc:{}, macroDraft:null };
// 保存データが壊れていても起動できるよう、既知のキーは型が合うものだけ取り込む
try {
  var raw = localStorage.getItem(KEY);
  if (raw) {
    var p = JSON.parse(raw);
    if (p && typeof p === "object" && !Array.isArray(p)) Object.keys(p).forEach(function(k){
      var v = p[k], d = store[k];
      if (!(k in store)) store[k] = v;
      else if (k === "macroDraft") { if (typeof v === "string") store[k] = v; }
      else if (Array.isArray(d) ? Array.isArray(v) : (v && typeof v === "object" && !Array.isArray(v))) store[k] = v;
    });
    Object.keys(store.hist).forEach(function(k){ var h = store.hist[k]; if (!h || typeof h !== "object") delete store.hist[k]; });
  }
} catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); return true; } catch(e){ return false; } }

/* ---------- utils ---------- */
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function norm(s){
  s = String(s == null ? "" : s).normalize("NFKC").toLowerCase();
  s = s.replace(/[ぁ-ん]/g, function(c){ return String.fromCharCode(c.charCodeAt(0) + 0x60); });
  return s.replace(/\s+/g, " ").trim();
}
function lessonById(id){ for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i]; return null; }
function questionById(id){ for (var i = 0; i < QUESTIONS.length; i++) if (QUESTIONS[i].id === id) return QUESTIONS[i]; return null; }
function termByName(name){ for (var i = 0; i < TERMS.length; i++) if (TERMS[i].t === name) return TERMS[i]; return null; }
function docChap(id){ for (var i = 0; i < DOCS.length; i++) if (DOCS[i].id === id) return DOCS[i]; return null; }

/* ---------- term linking ---------- */
var TERM_PAT = null, TERM_MAP = {};
(function buildTermIndex(){
  var names = [];
  TERMS.forEach(function(t){
    [t.t, t.en].concat(t.aliases || []).forEach(function(n){
      if (!n || n.length < 2) return;
      var k = norm(n);
      if (!TERM_MAP[k]) { TERM_MAP[k] = t; names.push(n); }
    });
  });
  names.sort(function(a, b){ return b.length - a.length; });
  if (names.length){
    var pat = names.map(function(n){ return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|");
    TERM_PAT = new RegExp("(" + pat + ")", "gi");
  }
})();
/* テキスト中の用語をボタン化する。1ブロック内で同じ用語は1回だけ、全体で最大 limit 個 */
function linkTerms(text, limit){
  var safe = esc(text);
  if (!TERM_PAT) return safe;
  var used = {}, count = 0, out = "", last = 0, m;
  TERM_PAT.lastIndex = 0;
  while ((m = TERM_PAT.exec(safe)) !== null){
    var t = TERM_MAP[norm(m[1])];
    if (!t || used[t.t] || count >= (limit || 6)) continue;
    used[t.t] = 1; count++;
    out += safe.slice(last, m.index) + '<button type="button" class="term" data-term="' + esc(t.t) + '">' + m[1] + "</button>";
    last = m.index + m[1].length;
  }
  return out + safe.slice(last);
}
function paras(arr, limit){ return (arr || []).map(function(p){ return "<p>" + linkTerms(p, limit) + "</p>"; }).join(""); }
function openTerm(name){
  var t = termByName(name); if (!t) return;
  document.getElementById("tsTitle").textContent = t.t;
  document.getElementById("tsEn").textContent = t.en || "";
  document.getElementById("tsDef").textContent = t.d || "";
  var vs = document.getElementById("tsVs");
  vs.textContent = t.vs ? ("混同注意：" + t.vs) : ""; vs.style.display = t.vs ? "" : "none";
  document.getElementById("tsLink").href = "#/term/" + encodeURIComponent(t.t);
  document.getElementById("termSheet").hidden = false;
  document.getElementById("tsClose").focus();
}
function closeTerm(){ document.getElementById("termSheet").hidden = true; }
document.addEventListener("click", function(ev){
  var b = ev.target.closest ? ev.target.closest("button.term") : null;
  if (b) { openTerm(b.getAttribute("data-term")); }
});
document.getElementById("tsClose").addEventListener("click", closeTerm);
document.getElementById("termSheet").addEventListener("click", function(ev){ if (ev.target === this) closeTerm(); });
document.addEventListener("keydown", function(ev){ if (ev.key === "Escape") closeTerm(); });

/* ---------- figures (inline SVG) ---------- */
function figSVG(id){
  var W = 640, H = 210, s = "";
  function txt(x, y, str, size, anchor, fill){ return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" text-anchor="' + (anchor || "middle") + '" fill="' + (fill || "#33475e") + '">' + esc(str) + "</text>"; }
  function rect(x, y, w, h, fill, stroke){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '"' : "") + "/>"; }
  if (id === "bitdepth"){
    var steps = [2, 16, 256], labels = ["1-bit（2階調）", "4-bit（16階調）", "8-bit（256階調）"];
    for (var r = 0; r < 3; r++){
      var y = 18 + r * 62, n = steps[r];
      for (var i = 0; i < n; i++){ var g = Math.round(255 * i / (n - 1)); s += rect(150 + i * (440 / n), y, 440 / n + 0.5, 34, "rgb(" + g + "," + g + "," + g + ")"); }
      s += txt(140, y + 22, labels[r], 13, "end");
    }
    return { svg: s, cap: "階調数が増えるほど明暗の段差は滑らかになる。ビット深度は「表せる値の細かさ」であり、表示の拡大縮小とは別物。" };
  }
  if (id === "histogram" || id === "threshold"){
    var bars = [4,9,16,26,38,52,66,78,86,80,64,50,38,27,18,11,6,3,2,1];
    var bw = 440 / bars.length;
    for (var i2 = 0; i2 < bars.length; i2++){ var h = bars[i2] * 1.55; s += rect(100 + i2 * bw, 175 - h, bw - 1.5, h, "#7fb6bf"); }
    s += rect(98, 175, 444, 1.5, "#8494a9");
    s += txt(100, 196, "0（暗）", 12, "middle") + txt(542, 196, "画素値（明）", 12, "middle");
    if (id === "threshold"){
      var tx = 100 + bw * 11.5;
      s += '<line x1="' + tx + '" y1="18" x2="' + tx + '" y2="175" stroke="#b3261e" stroke-width="2.5"/>' + txt(tx, 16, "閾値 T", 13, "middle", "#b3261e");
      for (var j = 0; j < 20; j++) s += rect(100 + j * bw, 182, bw - 1.5, 12, j < 11.5 ? "#ffffff" : "#1a2332", "#c9d2de");
      s += txt(560, 192, "二値化結果", 11, "start");
      return { svg: s, cap: "ヒストグラムは画素値の分布。閾値 T を境に画素を2クラスへ分けるのが二値化で、元の階調情報は失われる。" };
    }
    var mx = 100 + bw * 9.2;
    s += '<line x1="' + mx + '" y1="18" x2="' + mx + '" y2="175" stroke="#0f5e6b" stroke-width="2"/>' + txt(mx, 16, "Mean（平均）", 12, "middle", "#0f5e6b");
    return { svg: s, cap: "ヒストグラムの横軸は画素値、縦軸はその値を持つ画素数。Mean や StdDev はこの分布の要約統計量。" };
  }
  if (id === "gamma"){
    function curve(g, col, lab, ly){
      var pts = [];
      for (var x = 0; x <= 40; x++){ var px = 120 + x * 10, py = 175 - Math.pow(x / 40, g) * 155; pts.push(px + "," + py.toFixed(1)); }
      return '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + col + '" stroke-width="2.5"/>' + txt(528, ly, lab, 13, "start", col);
    }
    s += rect(120, 20, 400, 155, "none", "#c9d2de") + txt(320, 196, "入力", 12) + txt(105, 100, "出力", 12, "end");
    s += curve(0.5, "#b3261e", "γ=0.5（明るく）", 60) + curve(1, "#8494a9", "γ=1（直線）", 104) + curve(2, "#0f5e6b", "γ=2（暗く）", 150);
    return { svg: s, cap: "ガンマ補正は出力＝入力^γ の冪乗変換。γ<1で中間調が持ち上がり、γ>1で沈む。" };
  }
  if (id === "kernel-blur" || id === "kernel-median"){
    var vals = [[42,45,44],[47,210,49],[43,46,45]], cx = 250;
    for (var r2 = 0; r2 < 3; r2++) for (var c2 = 0; c2 < 3; c2++){
      var hot = (r2 === 1 && c2 === 1);
      s += rect(cx + c2 * 46, 30 + r2 * 46, 44, 44, hot ? "#fbeae8" : "#eef3f6", "#8494a9") + txt(cx + c2 * 46 + 22, 30 + r2 * 46 + 28, vals[r2][c2], 14);
    }
    s += txt(150, 100, id === "kernel-blur" ? "平均フィルタ" : "メディアンフィルタ", 14, "middle");
    s += txt(470, 92, id === "kernel-blur" ? "中心は周囲との平均" : "中心は9値の中央値", 13, "start");
    s += txt(470, 112, id === "kernel-blur" ? "＝ 約 68（ノイズも混ざる）" : "＝ 46（飛び値に強い）", 13, "start");
    return { svg: s, cap: id === "kernel-blur" ? "平均化はノイズを減らすが輪郭もぼかす。飛び値（210）も結果に混入する。" : "中央値は飛び値をほぼ無視できるため、輪郭を保ちながら孤立ノイズを除去できる。" };
  }
  if (id === "unsharp"){
    var cols = ["#dfe7ee", "#c3d2de", "#9db4c6", "#5f7f96", "#2c4a61", "#12242f"];
    function strip(x, arr, lab){ var o = txt(x + 66, 30, lab, 12.5); for (var i3 = 0; i3 < arr.length; i3++) o += rect(x + i3 * 22, 44, 21, 60, arr[i3]); return o; }
    s += strip(30, cols, "元画像（輪郭）") + txt(178, 74, "−", 22) + strip(196, ["#c3d2de","#c3d2de","#b7c8d6","#b7c8d6","#c3d2de","#c3d2de"], "ぼかし") + txt(344, 74, "＝", 22) + strip(362, ["#ffffff","#ffffff","#8d8d8d","#404040","#ffffff","#ffffff"], "差分（輪郭成分）");
    s += txt(320, 140, "アンシャープマスク： 元画像 ＋ 差分×強さ で輪郭を強調する", 13.5);
    s += txt(320, 164, "強すぎると輪郭の両側にハロー（光背）が出る", 12.5, "middle", "#b3261e");
    return { svg: s, cap: "Unsharp Mask は「ぼかしとの差分＝高周波成分」を元画像へ加えて輪郭を際立たせる処理。" };
  }
  if (id === "scale"){
    s += rect(110, 60, 420, 2, "#1a2332");
    for (var k = 0; k <= 10; k++) s += rect(110 + k * 42, 54, 2, k % 5 === 0 ? 14 : 9, "#1a2332");
    s += txt(320, 44, "420 ピクセル", 13.5) + txt(320, 96, "空間校正： 1 ピクセル = 0.21 µm なら、この幅は 88.2 µm", 13.5);
    s += txt(320, 128, "校正は「ピクセル数 ↔ 実寸」の換算表。未校正の測定値はピクセル単位のままになる", 12.5, "middle", "#b3261e");
    return { svg: s, cap: "Set Scale で既知の長さをピクセル数に対応付けると、以降の測定が実寸単位で返る。" };
  }
  if (id === "roi-mask"){
    var panels = [["ROI", "領域の指定そのもの。画素は持たない"], ["マスク", "0/255の二値画像として領域を表す"], ["オーバーレイ", "元画像の上に重ねる表示層。画素値は不変"]];
    for (var p = 0; p < 3; p++){
      var x0 = 36 + p * 204;
      s += rect(x0, 30, 180, 110, "#eef3f6", "#8494a9");
      if (p === 0) s += '<ellipse cx="' + (x0 + 90) + '" cy="85" rx="52" ry="34" fill="none" stroke="#b3261e" stroke-width="2.5"/>';
      if (p === 1){ s += rect(x0, 30, 180, 110, "#ffffff") + '<ellipse cx="' + (x0 + 90) + '" cy="85" rx="52" ry="34" fill="#1a2332"/>'; }
      if (p === 2){ s += '<ellipse cx="' + (x0 + 90) + '" cy="85" rx="52" ry="34" fill="rgba(179,38,30,.30)"/>'; s += rect(x0, 30, 180, 110, "none", "#8494a9"); }
      s += txt(x0 + 90, 162, panels[p][0], 14) + txt(x0 + 90, 182, panels[p][1], 10.5);
    }
    return { svg: s, cap: "ROI は「場所の指定」、マスクは「二値画像」、オーバーレイは「表示上の重ね合わせ」。役割が異なる。" };
  }
  if (id === "particles"){
    function circ(cx, cy, r, fill){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="#33475e"/>'; }
    s += circ(150, 70, 34, "#9db4c6") + circ(205, 70, 34, "#9db4c6") + circ(178, 108, 30, "#9db4c6") + txt(178, 168, "接触した粒子は1個に数えられる", 12.5);
    s += txt(320, 96, "Watershed →", 15, "middle", "#0f5e6b");
    s += circ(452, 66, 30, "#9db4c6") + circ(505, 96, 28, "#9db4c6") + circ(448, 116, 26, "#9db4c6") + txt(478, 168, "距離マップの峰で分離し3個に", 12.5);
    return { svg: s, cap: "Watershed は距離マップの極大点を種に接触粒子を分ける。凹凸の多い粒子では過分割になる。" };
  }
  if (id === "zproj"){
    for (var z = 0; z < 4; z++){ s += rect(90 + z * 26, 34 + z * 26, 110, 78, "rgba(127,182,191," + (0.25 + z * 0.2) + ")", "#33475e") + '<circle cx="' + (130 + z * 26) + '" cy="' + (66 + z * 26) + '" r="13" fill="rgba(179,38,30,.5)"/>'; }
    s += txt(330, 100, "→", 26) + txt(330, 128, "Z Project", 12.5);
    s += rect(400, 40, 150, 105, "#dfeef1", "#33475e") + '<circle cx="452" cy="78" r="15" fill="rgba(179,38,30,.75)"/><circle cx="492" cy="106" r="11" fill="rgba(179,38,30,.45)"/>';
    s += txt(475, 168, "最大値投影では各位置の最大が残る", 12);
    return { svg: s, cap: "Z投影はスタックを1枚へ要約する。方式（最大/平均/合計…）で結果の意味が変わる。" };
  }
  if (id === "fft"){
    s += '<circle cx="320" cy="98" r="74" fill="#eef3f6" stroke="#8494a9"/>';
    [56, 38, 20].forEach(function(r){ s += '<circle cx="320" cy="98" r="' + r + '" fill="none" stroke="#7fb6bf" stroke-dasharray="3 3"/>'; });
    s += '<line x1="246" y1="98" x2="394" y2="98" stroke="#c9d2de"/><line x1="320" y1="24" x2="320" y2="172" stroke="#c9d2de"/>';
    s += '<circle cx="320" cy="98" r="5" fill="#b3261e"/>' + txt(320, 192, "中心＝低周波（大まかな構造）／ 外側＝高周波（細部・ノイズ）", 12.5);
    return { svg: s, cap: "FFT の周波数画像では中心ほど低周波。周期的なノイズは中心から離れた点や線として現れる。" };
  }
  return null;
}
function figHTML(fig){
  if (!fig) return "";
  var f = figSVG(fig); if (!f) return "";
  return '<figure class="fig"><svg viewBox="0 0 640 210" role="img" aria-label="図解">' + f.svg + "</svg><figcaption>" + esc(f.cap) + "</figcaption></figure>";
}

/* ---------- shared bits ---------- */
var view = document.getElementById("view");
function srcLine(k){
  var u = srcUrl(k); if (!u) return "";
  return '<p class="src-line">出典：<a href="' + esc(u) + '" target="_blank" rel="noopener">公式ドキュメント</a>（一次情報で確認済み）</p>';
}
function relLessons(ids){
  if (!ids || !ids.length) return "";
  var items = ids.map(function(id){ var l = lessonById(id); return l ? '<a href="#/lesson/' + l.id + '">' + esc(l.title) + "</a>" : ""; }).join("");
  return items ? '<h2 class="sec">関連レッスン</h2><div class="rel-chips">' + items + "</div>" : "";
}
function relTerms(names){
  if (!names || !names.length) return "";
  var items = names.map(function(n){ var t = termByName(n); return t ? '<button type="button" class="term" data-term="' + esc(t.t) + '">' + esc(t.t) + "</button>" : ""; }).join(" ");
  return items ? '<h2 class="sec">関連用語</h2><p>' + items + "</p>" : "";
}
function setNav(name){
  document.querySelectorAll("[data-nav]").forEach(function(a){ a.classList.toggle("on", a.getAttribute("data-nav") === name); });
}

/* ---------- home ---------- */
function vHome(){
  setNav("home");
  var doneL = store.lessonDone.length;
  var seen = Object.keys(store.hist).length;
  var wrong = Object.keys(store.hist).filter(function(k){ return store.hist[k].lastWrong; }).length;
  view.innerHTML =
    '<div class="tiles">' +
    '<a class="tile" href="#/lessons"><span class="n">' + LESSONS.length + '</span><b>レッスン</b></a>' +
    '<a class="tile" href="#/quiz"><span class="n">' + QUESTIONS.length + '</span><b>問題</b></a>' +
    '<a class="tile" href="#/docs"><span class="n">' + DOCS.reduce(function(n, c){ return n + c.entries.length; }, 0) + '</span><b>ドキュメント</b></a>' +
    '<a class="tile" href="#/functions"><span class="n">' + FUNCTIONS.length + '</span><b>関数</b></a>' +
    '<a class="tile" href="#/practice"><span class="n">✎</span><b>マクロ練習</b></a>' +
    '<a class="tile" href="#/terms"><span class="n">' + TERMS.length + '</span><b>用語集</b></a></div>' +
    '<h2 class="sec">実務の疑問から引く</h2><div class="quick"><ul>' +
    '<li><a href="#/doc/D6">Threshold と Convert to Mask は何が違う？</a></li>' +
    '<li><a href="#/doc/D5">Mean Gray Value は何を表す？／測定の単位がおかしいとき</a></li>' +
    '<li><a href="#/doc/D8">背景補正で信号が変わるのはなぜ？</a></li>' +
    '<li><a href="#/doc/D6">Analyze Particles で数が合わないとき</a></li>' +
    '<li><a href="#/doc/D2">ビット深度を下げると何が失われる？</a></li></ul></div>' +
    '<h2 class="sec">あなたの記録</h2><div class="quick" style="padding-top:14px"><p style="margin:0">完了レッスン ' + doneL + " / " + LESSONS.length + "　・　解いた問題 " + seen + " 問" + (wrong ? "　・　復習待ち " + wrong + ' 問（<a href="#/quiz">問題モードで復習</a>）' : "") + "</p></div>" +
    '<p class="notice">ドキュメント本文は公式資料をもとにした独自の要約・解説です（翻訳・転載ではありません）。学習記録はこの端末内にのみ保存されます。</p>';
}

/* ---------- lessons ---------- */
var lessonFilter = { cat: "all", kw: "" };
function vLessons(){
  setNav("lessons");
  var cats = Object.keys(LCATS);
  var chips = ['<button type="button" class="chip' + (lessonFilter.cat === "all" ? " on" : "") + '" data-lcat="all">すべて</button>']
    .concat(cats.map(function(c){ return '<button type="button" class="chip' + (lessonFilter.cat === c ? " on" : "") + '" data-lcat="' + c + '">' + esc(LCATS[c]) + "</button>"; })).join("");
  var list = LESSONS.filter(function(l){
    return (lessonFilter.cat === "all" || l.cat === lessonFilter.cat) &&
      (!lessonFilter.kw || norm(l.title + l.lead + l.sections.map(function(s){ return s.h + s.b.join(""); }).join("")).indexOf(norm(lessonFilter.kw)) >= 0);
  });
  view.innerHTML = '<h1 class="page">レッスン</h1>' +
    '<div class="toolbar"><input type="search" id="lKw" placeholder="レッスン内を検索" value="' + esc(lessonFilter.kw) + '" aria-label="レッスン検索"></div>' +
    '<div class="chips">' + chips + "</div>" +
    (list.length ? '<div class="card-list">' + list.map(function(l){
      return '<a class="card" href="#/lesson/' + l.id + '"><span class="tag">' + esc(LCATS[l.cat] || "") + "</span> " +
        (store.lessonDone.indexOf(l.id) >= 0 ? '<span class="done-mark">✓完了</span> ' : "") +
        "<b>" + esc(l.title) + "</b><p>" + esc(l.lead) + "</p></a>";
    }).join("") + "</div>" : '<div class="empty">該当するレッスンがありません。</div>');
  document.getElementById("lKw").addEventListener("input", function(){ lessonFilter.kw = this.value; vLessons(); var el = document.getElementById("lKw"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
  view.querySelectorAll("[data-lcat]").forEach(function(b){ b.addEventListener("click", function(){ lessonFilter.cat = b.getAttribute("data-lcat"); vLessons(); }); });
}
function vLesson(id){
  setNav("lessons");
  var l = lessonById(id);
  if (!l){ view.innerHTML = '<div class="empty">レッスンが見つかりません。<a href="#/lessons">一覧へ</a></div>'; return; }
  var idx = LESSONS.indexOf(l);
  var done = store.lessonDone.indexOf(l.id) >= 0;
  var html = '<p class="crumb"><a href="#/lessons">レッスン</a> ＞ ' + esc(LCATS[l.cat] || "") + "</p>" +
    '<article class="article"><p class="meta-line">' + esc(LCATS[l.cat] || "") + "</p><h1>" + esc(l.title) + "</h1>" +
    '<p class="lead">' + linkTerms(l.lead, 8) + "</p>";
  l.sections.forEach(function(s){
    html += "<h2>" + esc(s.h) + "</h2>" + paras(s.b, 8) + figHTML(s.fig);
  });
  if (l.points && l.points.length) html += '<div class="box box-points"><h3>要点</h3><ul>' + l.points.map(function(p){ return "<li>" + linkTerms(p, 4) + "</li>"; }).join("") + "</ul></div>";
  if (l.mistakes && l.mistakes.length) html += '<div class="box box-mistakes"><h3>よくある誤解・失敗</h3><ul>' + l.mistakes.map(function(p){ return "<li>" + linkTerms(p, 4) + "</li>"; }).join("") + "</ul></div>";
  html += srcLine(l.src) + "</article>";
  html += relLessons(l.related) + relTerms(l.terms);
  html += '<div class="pager">' +
    (idx > 0 ? '<a class="btn" href="#/lesson/' + LESSONS[idx - 1].id + '">← 前のレッスン</a>' : "<span></span>") +
    '<label class="done"><input type="checkbox" id="lDone" ' + (done ? "checked" : "") + "> 完了にする</label>" +
    (idx < LESSONS.length - 1 ? '<a class="btn primary" href="#/lesson/' + LESSONS[idx + 1].id + '">次のレッスン →</a>' : '<a class="btn" href="#/lessons">一覧へ戻る</a>') + "</div>";
  view.innerHTML = html;
  document.getElementById("lDone").addEventListener("change", function(){
    var i = store.lessonDone.indexOf(l.id);
    if (this.checked && i < 0) store.lessonDone.push(l.id);
    if (!this.checked && i >= 0) store.lessonDone.splice(i, 1);
    save();
  });
}

/* ---------- docs ---------- */
function vDocs(){
  setNav("docs");
  view.innerHTML = '<h1 class="page">ドキュメント</h1>' +
    '<div class="card-list">' + DOCS.map(function(c){
      return '<a class="card" href="#/doc/' + c.id + '"><b>' + esc(c.title) + "</b><p>" + esc(c.intro) + "</p><p>全 " + c.entries.length + " 項目</p></a>";
    }).join("") + "</div>";
}
function vDoc(id, anchor){
  setNav("docs");
  var c = docChap(id);
  if (!c){ view.innerHTML = '<div class="empty">章が見つかりません。<a href="#/docs">一覧へ</a></div>'; return; }
  var toc = DOCS.map(function(x){ return '<a href="#/doc/' + x.id + '"' + (x.id === id ? ' style="font-weight:800;color:var(--acc)"' : "") + ">" + esc(x.title) + "</a>"; }).join("");
  var html = '<p class="crumb"><a href="#/docs">ドキュメント</a> ＞ ' + esc(c.title) + '</p><div class="two-col">' +
    '<aside class="toc"><h2 class="sec" style="margin-top:0">章一覧</h2>' + toc + "</aside><div>" +
    '<article class="article"><h1>' + esc(c.title) + '</h1><p class="lead">' + linkTerms(c.intro, 6) + "</p>";
  c.entries.forEach(function(e){
    var bm = store.docBm.indexOf(e.id) >= 0;
    html += '<section class="doc-entry" id="' + esc(e.id) + '"><p class="doc-menu">' + esc(e.menu || "") +
      ' <button type="button" class="bm-btn" data-docbm="' + esc(e.id) + '" aria-label="ブックマーク" style="width:34px;height:34px;font-size:16px;vertical-align:middle">' + (bm ? "★" : "☆") + "</button></p>" +
      "<h3>" + esc(e.title) + "</h3>" + paras(e.body, 8);
    if (e.points && e.points.length) html += '<div class="box box-points"><h3>要点・読み方</h3><ul>' + e.points.map(function(p){ return "<li>" + linkTerms(p, 4) + "</li>"; }).join("") + "</ul></div>";
    if (e.caution) html += '<div class="box box-caution"><h3>注意</h3><p>' + linkTerms(e.caution, 4) + "</p></div>";
    html += '<p class="src-line">出典：<a href="' + esc(e.src) + '" target="_blank" rel="noopener">' + esc(e.srcName) + "</a>" + (e.version ? "／" + esc(e.version) : "") + "<wbr>（本文は独自要約・解説）</p>";
    html += relLessons(e.lessons);
    html += "</section>";
  });
  html += "</article></div></div>";
  view.innerHTML = html;
  view.querySelectorAll("[data-docbm]").forEach(function(b){
    b.addEventListener("click", function(){
      var eid = b.getAttribute("data-docbm"), i = store.docBm.indexOf(eid);
      if (i >= 0) store.docBm.splice(i, 1); else store.docBm.push(eid);
      save(); b.textContent = store.docBm.indexOf(eid) >= 0 ? "★" : "☆";
    });
  });
  if (anchor){ var el = document.getElementById(anchor); if (el) setTimeout(function(){ el.scrollIntoView(); }, 30); }
}

/* ---------- functions ---------- */
function funcByName(name){ for (var i = 0; i < FUNCTIONS.length; i++) if (FUNCTIONS[i].name === name) return FUNCTIONS[i]; return null; }
var funcFilter = { cat: "all", kw: "" };
function vFunctions(){
  setNav("functions");
  var cats = Object.keys(FCATS);
  var chips = ['<button type="button" class="chip' + (funcFilter.cat === "all" ? " on" : "") + '" data-fcat="all">すべて</button>']
    .concat(cats.map(function(c){ return '<button type="button" class="chip' + (funcFilter.cat === c ? " on" : "") + '" data-fcat="' + c + '">' + esc(FCATS[c]) + "</button>"; })).join("");
  var kw = norm(funcFilter.kw);
  var list = FUNCTIONS.filter(function(f){
    if (funcFilter.cat !== "all" && f.cat !== funcFilter.cat) return false;
    if (!kw) return true;
    return norm(f.name + " " + f.sig + " " + f.desc).indexOf(kw) >= 0;
  });
  view.innerHTML = '<h1 class="page">関数リファレンス</h1>' +
    '<div class="toolbar"><input type="search" id="fKw" placeholder="関数を検索（例：getPixel、threshold）" value="' + esc(funcFilter.kw) + '" aria-label="関数検索"></div>' +
    '<div class="chips">' + chips + "</div>" +
    (list.length ? '<div class="card-list">' + list.map(function(f){
      return '<a class="card" href="#/function/' + encodeURIComponent(f.name) + '"><span class="tag">' + esc(FCATS[f.cat] || "") + '</span> <b class="fn-name">' + esc(f.sig) + "</b><p>" + esc(f.desc.split("。")[0]) + "。</p></a>";
    }).join("") + "</div>" : '<div class="empty">該当する関数がありません。</div>');
  document.getElementById("fKw").addEventListener("input", function(){ funcFilter.kw = this.value; vFunctions(); var el = document.getElementById("fKw"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
  view.querySelectorAll("[data-fcat]").forEach(function(b){ b.addEventListener("click", function(){ funcFilter.cat = b.getAttribute("data-fcat"); vFunctions(); }); });
}
function vFunction(name){
  setNav("functions");
  var f = funcByName(name);
  if (!f){ view.innerHTML = '<div class="empty">関数が見つかりません。<a href="#/functions">関数一覧へ</a></div>'; return; }
  var html = '<p class="crumb"><a href="#/functions">関数リファレンス</a> ＞ ' + esc(FCATS[f.cat] || "") + '</p><article class="article">' +
    '<p class="meta-line">' + esc(FCATS[f.cat] || "") + '</p><h1 class="fn-name">' + esc(f.name) + "</h1>" +
    '<p class="fn-sig">' + esc(f.sig) + "</p>" + paras([f.desc], 6);
  if (f.ret) html += '<div class="box box-points"><h3>戻り値</h3><p>' + linkTerms(f.ret, 4) + "</p></div>";
  if (f.ex) html += '<h2>使用例</h2><pre class="code">' + esc(f.ex) + "</pre>";
  html += '<p><a class="btn small" href="#/practice/' + encodeURIComponent(f.name) + '">マクロ練習で書く</a></p>';
  if (f.note) html += '<div class="box box-caution"><h3>注意</h3><p>' + linkTerms(f.note, 4) + "</p></div>";
  if (f.ver) html += '<p class="meta-line">バージョン要件：' + esc(f.ver) + "</p>";
  html += '<p class="src-line">出典：<a href="https://imagej.net/ij/developer/macro/functions.html" target="_blank" rel="noopener">ImageJ公式「Built-in Macro Functions」</a><wbr>（説明は独自要約）</p></article>';
  var sameCat = FUNCTIONS.filter(function(x){ return x.cat === f.cat && x.name !== f.name; }).slice(0, 8);
  if (sameCat.length) html += '<h2 class="sec">同じ分類の関数</h2><div class="rel-chips">' + sameCat.map(function(x){ return '<a href="#/function/' + encodeURIComponent(x.name) + '">' + esc(x.name) + "</a>"; }).join("") + "</div>";
  view.innerHTML = html;
}

/* ---------- macro practice ---------- */
var MACRO_TEMPLATES = [
    {name:"【基礎】変数と計算・Logへの出力",
      code:"// 変数・演算・文字列\na = 3;\nb = 4;\nprint(\"a + b = \" + (a + b));\nprint(\"a / b = \" + (a / b));\nname = \"sample\";\nprint(name + \".tif\");",
      prep:"準備は不要。画像を開かなくても実行できます。結果は Log ウィンドウに出ます。",
      guide:["マクロの第一歩です。変数は宣言なしでそのまま使え、文の終わりには ; を付けます。print は Log ウィンドウへの出力で、計算結果の確認に使います。", "数値同士の + は加算ですが、文字列が混ざると連結になります。\"a / b = \" + (a / b) の括弧は、連結より先に割り算を計算させるためのものです。"],
      tries:["a と b の値を変えて、割り算の結果が小数になることを確認する", "print の行を増やして、自分の名前やファイル名を連結して出す"]},
    {name:"【基礎】条件分岐と繰り返し",
      code:"// 条件分岐と繰り返し\nfor (i = 1; i <= 5; i++) {\n  if (i % 2 == 0) {\n    print(i + \" は偶数\");\n  } else {\n    print(i + \" は奇数\");\n  }\n}",
      prep:"準備は不要。結果は Log ウィンドウに出ます。",
      guide:["for は「初期化; 条件; 更新」の3点セットで繰り返し回数を制御します。if / else は条件で処理を振り分けます。% は割り算の余りで、偶数・奇数の判定の定番です。", "== は比較（等しいか）で、= の代入と意味がまったく違う点に注意してください。条件の中では必ず == を使います。"],
      tries:["繰り返しを i <= 10 に広げる", "% 2 を % 3 に変えて、3で割り切れる数だけ印を付ける"]},
    {name:"【基礎】配列と合計・平均",
      code:"// 配列の合計と平均\nvalues = newArray(12, 7, 25, 3);\nsum = 0;\nfor (i = 0; i < values.length; i++) {\n  sum += values[i];\n}\nprint(\"合計 = \" + sum);\nprint(\"平均 = \" + (sum / values.length));",
      prep:"準備は不要。結果は Log ウィンドウに出ます。",
      guide:["newArray で値の並び（配列）を作ります。要素は values[0] のように番号（0始まり）で取り出し、values.length が要素数です。", "合計を数えながら積み上げる書き方は、測定値の平均やヒストグラムの集計など、実務の集計処理の土台になります。sum += x は sum = sum + x の省略形です。"],
      tries:["配列の値を自分の測定値に置き換えて平均を出す", "最大値を求める処理を追加する（if で max と比べる）"]},
    {name:"【基礎】関数の定義",
      code:"// 関数の定義と呼び出し\nfunction circleArea(r) {\n  return PI * r * r;\n}\nfor (r = 1; r <= 3; r++) {\n  print(\"r=\" + r + \" の面積 = \" + circleArea(r));\n}",
      prep:"準備は不要。結果は Log ウィンドウに出ます。",
      guide:["function 名前（引数） { ... } で、処理に名前を付けて再利用できるようにします。return で計算結果を呼び出し側へ返します。PI は円周率の組み込み定数です。", "同じ計算を何度も書く代わりに関数にまとめると、直す場所が1か所で済みます。面積から半径を出すような換算にも同じ型が使えます。"],
      tries:["半径の範囲を r <= 5 に広げる", "円周を求める関数 circleLength(r) を追加する"]},
    {name:"【基礎】開いている画像の情報を調べる",
      code:"// 開いている画像の情報\nif (nImages == 0) {\n  print(\"画像が開かれていません\");\n} else {\n  print(\"タイトル: \" + getTitle());\n  print(\"幅: \" + getWidth() + \" px\");\n  print(\"高さ: \" + getHeight() + \" px\");\n  print(\"スライス数: \" + nSlices);\n  print(\"ビット深度: \" + bitDepth());\n}",
      prep:"任意の画像を1枚開いておく（開かなくても、メッセージが出るだけです）。",
      guide:["画像を対象にするマクロの入り口の型です。nImages は開いている画像の数で、0のときは画像前提の処理をせずに終わります。", "getTitle、getWidth、getHeight、nSlices、bitDepth は、アクティブな画像から情報を読む関数です。スライス数はスタックの枚数、ビット深度は画素値の分解能を表します。"],
      tries:["スタック画像を開いてスライス数の表示を確認する", "画像を開かずに実行して、nImages == 0 の分岐を確認する"]},
    {name:"雛形：開いている画像をすべて測定",
      code:"// 開いている画像をすべて測定し、結果をCSVで保存する\ndir = getDirectory(\"保存先フォルダを選んでください\");\nids = newArray(nImages);\nfor (i = 0; i < nImages; i++) {\n    selectImage(i + 1);\n    ids[i] = getImageID();\n}\nsetBatchMode(true);\nfor (i = 0; i < ids.length; i++) {\n    selectImage(ids[i]);\n    run(\"Measure\");\n}\nsaveAs(\"Results\", dir + \"results.csv\");\nsetBatchMode(false);\n",
      prep:"測定したい画像を1枚以上開いておく。",
      guide:["開いている画像を順に選んで Measure（測定）を実行し、結果表をCSVに保存するバッチ処理の型です。setBatchMode(true) で画面の再描画を止めて高速化し、saveAs(\"Results\", ...) で結果表を保存します。", "画像の切り替えは selectImage、測定項目の設定は Set Measurements 側の担当です。測定前にスケール（Set Scale）と測定項目を確認しておくのが実務の前提です。"],
      tries:["Measure の前に run(\"Set Scale...\") を入れて校正を自動化する", "結果表ではなく各画像のヒストグラムも記録するよう getHistogram を追加する"]},
    {name:"雛形：粒子カウント",
      code:"// 8bit化 → 自動閾値 → 二値化 → 分離 → 粒子解析\nrun(\"8-bit\");\nsetAutoThreshold(\"Otsu dark\");\nrun(\"Convert to Mask\");\nrun(\"Watershed\");\nrun(\"Analyze Particles...\", \"size=10-Infinity circularity=0.00-1.00 show=Outlines summarize\");\n",
      prep:"数えたい対象が写った画像を1枚開いておく。",
      guide:["粒子解析（Analyze Particles）の定番フローです。8-bit 化→自動閾値（Otsu）で二値化→Convert to Mask でマスク化→Watershed でくっついた粒子を分離→Analyze Particles で数えます。", "閾値処理の方法と、対象の大きさ（size）の範囲が結果を大きく左右します。元の画像は別名で残し、二値化した画像で作業するのが安全です。"],
      tries:["size=10-Infinity の下限を変えて、小さなノイズがどう消えるか見る", "setAutoThreshold の Otsu を Default や Huang に変えて数え比べる"]},
    {name:"雛形：ROI Manager の全ROIを測定",
      code:"// ROI Manager に登録した全ROIを順に測定する\nn = roiManager(\"count\");\nfor (i = 0; i < n; i++) {\n    roiManager(\"select\", i);\n    run(\"Measure\");\n}\n",
      prep:"ROI Manager に複数の ROI を登録しておく（なければ ROI を描いて Add）。",
      guide:["ROI Manager に登録された全 ROI を1つずつ選択して測定する型です。roiManager(\"count\") で件数、roiManager(\"select\", i) で選択を切り替えます。", "結果表には ROI ごとの行が並びます。ROI は画像に対する関心領域で、測定は選択中の ROI に対して行われる点がポイントです。"],
      tries:["測定の前に roiManager(\"deselect\") を入れる行と入れない行で結果を比べる", "run(\"Measure\") の後に getResult で値を取り出して print する"]},
    {name:"雛形：フォルダ一括（スケールバー＋保存）",
      code:"// フォルダ内のTIFFを一括処理して別フォルダへ保存する\ndir = getDirectory(\"画像フォルダを選んでください\");\nout = getDirectory(\"保存先フォルダを選んでください\");\nlist = getFileList(dir);\nsetBatchMode(true);\nfor (i = 0; i < list.length; i++) {\n    if (!endsWith(list[i], \".tif\")) continue;\n    open(dir + list[i]);\n    run(\"Scale Bar...\", \"width=50 height=8 font=28 color=White background=None location=[Lower Right] bold\");\n    saveAs(\"Tiff\", out + list[i]);\n    close();\n}\nsetBatchMode(false);\n",
      prep:"処理したい画像フォルダを用意する（TIFF画像を想定）。",
      guide:["フォルダ内のファイルを getFileList で列挙し、拡張子でふるい分けて開き、スケールバーを焼き込んで別名で保存する、バッチ処理の代表型です。", "endsWith で拡張子を判定し、open と saveAs(\"Tiff\", ...) で読み書きします。処理結果は元フォルダとは別の出力フォルダに保存すると元データを壊しません。"],
      tries:["対象を .tif だけでなく .jpg にも広げる（endsWith の条件を増やす）", "スケールバーの width を画像のスケールに合わせて変える"]},
    {name:"雛形：Z投影とチャンネル分割",
      code:"// スタックを最大値投影し、チャンネルを分ける\nrun(\"Z Project...\", \"projection=[Max Intensity]\");\nrun(\"Split Channels\");\n",
      prep:"スタック画像（複数スライス）を1つ開いておく。",
      guide:["スタックを Z投影（最大値）で1枚に圧縮してから、チャンネルを分割する型です。run の引数 projection=[Max Intensity] が投影方法の指定です。", "蛍光画像では、最大値投影は各画素で最も明るいスライスを拾うため、焦点の合った信号を集めやすい一方、ノイズも拾いやすい点に注意します。"],
      tries:["projection を Sum Slices に変えて、明るさの出方を比べる", "Split Channels の前にチャンネル数を print で確認する"]}
  ];
var PRAC_STARTER =
  "// 右の関数リファレンスを見ながらマクロを書けます\n" +
  "// コード中の関数名をダブルクリックすると、右に説明が出ます\n\n" +
  "title = getTitle();\nprint(title);\nrun(\"Measure\");\n";
var prac = { cat: "all", kw: "", fn: null, tab: "code", selS: null, selE: null, scroll: 0 };
// 括弧・文字列・コメントの静的チェック（ImageJ マクロの字句規則に合わせる）：
// 文字列は " と ' の両方で囲め、行をまたがない。// と /* */ はコメント。
// 問題がなければ null、あれば最初の問題を位置つきで返す。
function pracCheck(code){
  var OPEN = { "(": 1, "{": 1, "[": 1 }, CLOSE = { ")": "(", "}": "{", "]": "[" };
  var stack = [], q = null, strAt = -1, inCom = false, inBlock = false, blockAt = -1, bs = false;
  for (var i = 0; i < code.length; i++){
    var c = code[i], n = code[i + 1];
    if (inBlock){ if (c === "*" && n === "/"){ inBlock = false; i++; } continue; }
    if (inCom){ if (c === "\n") inCom = false; continue; }
    if (q){
      if (c === "\n" || c === "\r") return { kind: "str", at: strAt };
      if (bs) bs = false; else if (c === "\\") bs = true; else if (c === q) q = null;
      continue;
    }
    if (c === "/" && n === "*"){ inBlock = true; blockAt = i; i++; continue; }
    if (c === "/" && n === "/"){ inCom = true; i++; continue; }
    if (c === "\"" || c === "'"){ q = c; strAt = i; continue; }
    if (OPEN[c]) stack.push({ ch: c, at: i });
    else if (CLOSE[c]){
      var top = stack.pop();
      if (!top) return { kind: "extra", ch: c, at: i };
      if (top.ch !== CLOSE[c]) return { kind: "mismatch", ch: c, at: i, open: top.ch, openAt: top.at };
    }
  }
  if (q) return { kind: "str", at: strAt };
  if (inBlock) return { kind: "block", at: blockAt };
  if (stack.length){ var t = stack[stack.length - 1]; return { kind: "open", ch: t.ch, at: t.at, more: stack.length - 1 }; }
  return null;
}
function pracLine(code, at){ return code.slice(0, at).split("\n").length; }
function pracIssueText(code, r){
  var L = pracLine(code, r.at);
  if (r.kind === "extra") return L + "行目の " + r.ch + " に対応する開き括弧がありません";
  if (r.kind === "mismatch") return L + "行目の " + r.ch + " が " + pracLine(code, r.openAt) + "行目の " + r.open + " と対応していません";
  if (r.kind === "open") return L + "行目の " + r.ch + " が閉じていません" + (r.more ? "（ほかに " + r.more + " 個）" : "");
  if (r.kind === "str") return L + "行目の文字列が閉じていません";
  return L + "行目の /* が閉じていません";
}
// 書式から挿入用の文を作る：省略可能部 [ ] と可変長の「, ...」を落とし、末尾に ; を付ける
function pracSigStatement(sig){
  var s = sig.replace(/\[[^\]]*\]/g, "").replace(/,\s*\.\.\.\s*\)/, ")").replace(/,\s*\)/, ")").replace(/\s+/g, " ").trim();
  return /;$/.test(s) ? s : s + ";";
}
function pracIsPristine(code){
  return !code.trim() || code === PRAC_STARTER || MACRO_TEMPLATES.some(function(t){ return t.code === code; });
}
var pracSaveTimer = null, pracSaveFailed = false;
function pracFlush(){
  if (pracSaveTimer){ clearTimeout(pracSaveTimer); pracSaveTimer = null; }
  pracSaveFailed = !save();
}
window.addEventListener("pagehide", function(){ if (pracSaveTimer) pracFlush(); });
document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden" && pracSaveTimer) pracFlush(); });
function vPractice(){
  setNav("practice");
  var draft = typeof store.macroDraft === "string" ? store.macroDraft : PRAC_STARTER;
  var html = '<h1 class="page">マクロ練習</h1>' +
    '<div class="prac-tabs" role="tablist">' +
      '<button type="button" role="tab" data-ptab="code">コード</button>' +
      '<button type="button" role="tab" data-ptab="ref">関数リファレンス</button></div>' +
    '<div class="prac" id="pracRoot">' +
    '<section class="prac-ed">' +
      '<div class="prac-tools">' +
        '<select id="tplSel" aria-label="テンプレート"><option value="">テンプレート…</option>' +
        MACRO_TEMPLATES.map(function(t, i){ return '<option value="' + i + '">' + esc(t.name) + "</option>"; }).join("") + "</select>" +
        '<button type="button" class="mini-btn" id="btnCopy">コピー</button>' +
        '<button type="button" class="mini-btn" id="btnDl">.ijmで保存</button>' +
        '<button type="button" class="mini-btn" id="btnClear">消去</button>' +
        '<span class="prac-stat" id="pracStat"></span></div>' +
      '<div class="ed-wrap"><pre class="ed-gutter" id="edGutter" aria-hidden="true">1</pre>' +
      '<textarea id="macroEd" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="マクロのコード"></textarea></div>' +
      '<div id="pracGuide"></div>' +
    "</section>" +
    '<aside class="prac-ref">' +
      '<div class="prac-ref-tools"><input type="search" id="pracKw" placeholder="関数を検索" value="' + esc(prac.kw) + '" aria-label="関数検索">' +
      '<div class="chips">' + ['<button type="button" class="chip" data-pcat="all">すべて</button>']
        .concat(Object.keys(FCATS).map(function(c){ return '<button type="button" class="chip" data-pcat="' + c + '">' + esc(FCATS[c]) + "</button>"; })).join("") + "</div></div>" +
      '<div class="prac-ref-body" id="pracRefBody"></div>' +
    "</aside></div>" +
    '<section class="prac-sim" id="pracSim">' +
      '<div class="sim-head"><h2>実行シミュレーション</h2>' +
      '<div class="sim-modes" role="group" aria-label="シミュレーションの表示方法">' +
        '<button type="button" class="chip" data-simode="button">実行ボタンで表示</button>' +
        '<button type="button" class="chip" data-simode="auto">自動で表示</button></div>' +
      '<button type="button" class="btn" id="simRun">説明を実行</button>' +
      '<span class="sim-state" id="simState" role="status"></span></div>' +
      '<div id="simOut" class="sim-out"></div>' +
    "</section>" +
    '<p class="foot-note">マクロの実行はこのアプリでは行えません。「実行シミュレーション」はモデル画像を前提にコードの動きを言葉で説明するもので、実際の実行結果ではありません。書いたコードは .ijm で保存し、Fiji ではファイルをウィンドウへドラッグ＆ドロップ（または File &gt; Open…）してスクリプトエディタで開き、［Run］で実行してください。ImageJ の Plugins &gt; Macros &gt; Run… でも実行できますが、文字列中の日本語は文字化けします。エディタ内の Tab はインデントになり、Esc の後の Tab でフォーカスが移ります。下書きはこの端末に自動保存されます。</p>';
  view.innerHTML = html;
  var root = document.getElementById("pracRoot");
  var ed = document.getElementById("macroEd"), gut = document.getElementById("edGutter"), stat = document.getElementById("pracStat");
  ed.value = draft;
  function showGuide(idx){
    var box = document.getElementById("pracGuide");
    if (!box) return;
    if (idx == null || !MACRO_TEMPLATES[idx]){ box.innerHTML = ""; return; }
    var t = MACRO_TEMPLATES[idx];
    box.innerHTML = '<div class="prac-guide"><h2>' + esc(t.name) + " ― 解説</h2>" +
      '<p class="pg-prep">' + linkTerms(t.prep) + "</p>" +
      t.guide.map(function(p){ return "<p>" + linkTerms(p) + "</p>"; }).join("") +
      "<h3>改造ポイント</h3><ul>" + t.tries.map(function(x){ return "<li>" + linkTerms(x) + "</li>"; }).join("") + "</ul></div>";
  }
  var initTpl = MACRO_TEMPLATES.findIndex(function(t){ return t.code === ed.value; });
  if (initTpl >= 0) showGuide(initTpl);
  if (prac.selS != null && prac.selS <= ed.value.length) ed.setSelectionRange(prac.selS, Math.min(prac.selE, ed.value.length));
  function remember(){ prac.selS = ed.selectionStart; prac.selE = ed.selectionEnd; prac.scroll = ed.scrollTop; }
  function setTab(t){
    prac.tab = t; root.setAttribute("data-tab", t);
    view.querySelectorAll("[data-ptab]").forEach(function(b){
      var on = b.getAttribute("data-ptab") === t;
      b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  function setCat(c){
    prac.cat = c;
    view.querySelectorAll("[data-pcat]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-pcat") === c); });
  }
  function refresh(){
    var v = ed.value, n = v.split("\n").length, s = "";
    for (var i = 1; i <= n; i++) s += i + "\n";
    gut.textContent = s; gut.scrollTop = ed.scrollTop;
    var r = pracCheck(v);
    stat.innerHTML = esc(n + " 行") +
      (r ? ' <button type="button" class="prac-issue" id="pracIssue" data-at="' + r.at + '">' + esc(pracIssueText(v, r)) + "</button>" : "") +
      (pracSaveFailed ? ' <span class="prac-warn">下書きを保存できませんでした</span>' : "");
    var ib = document.getElementById("pracIssue");
    if (ib) ib.addEventListener("click", function(){
      var at = Number(this.getAttribute("data-at"));
      ed.focus(); ed.setSelectionRange(at, at + 1); remember();
    });
  }
  function onInput(){
    store.macroDraft = ed.value; remember();
    if (pracSaveTimer) clearTimeout(pracSaveTimer);
    pracSaveTimer = setTimeout(function(){ var was = pracSaveFailed; pracFlush(); if (was !== pracSaveFailed) refresh(); }, 400);
    refresh();
    simOnInput();
  }
  // 範囲 [s, e) を text で置き換える。execCommand が使える環境では Ctrl+Z で取り消せる
  function edReplace(text, s, e){
    var before = ed.value, expect = before.slice(0, s) + text + before.slice(e);
    if (expect === before) return;
    ed.focus(); ed.setSelectionRange(s, e);
    try { document.execCommand(text ? "insertText" : "delete", false, text); } catch(_){}
    if (ed.value !== expect){
      ed.value = expect; ed.setSelectionRange(s + text.length, s + text.length);
      ed.dispatchEvent(new Event("input"));
    }
  }
  setTab(prac.tab); setCat(prac.cat);
  refresh();
  ed.scrollTop = prac.scroll || 0; gut.scrollTop = ed.scrollTop;
  ed.addEventListener("input", onInput);
  ["select", "keyup", "mouseup", "blur"].forEach(function(ev){ ed.addEventListener(ev, remember); });
  ed.addEventListener("scroll", function(){ gut.scrollTop = ed.scrollTop; prac.scroll = ed.scrollTop; });
  var escArmed = false;
  ed.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ escArmed = true; return; }
    if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && !escArmed){
      e.preventDefault();
      edReplace("    ", ed.selectionStart, ed.selectionEnd);
      return;
    }
    escArmed = false;
  });
  ed.addEventListener("dblclick", function(){
    var v = ed.value, s = ed.selectionStart, a = s, z = s;
    while (a > 0 && /[A-Za-z0-9_.]/.test(v[a - 1])) a--;
    while (z < v.length && /[A-Za-z0-9_.]/.test(v[z])) z++;
    var word = v.slice(a, z).replace(/^\.+|\.+$/g, "");
    if (word && funcByName(word)){
      // 調べるための選択で、後の挿入が単語を置き換えないよう、カーソルを単語の後ろに置く
      ed.setSelectionRange(z, z); remember();
      prac.fn = word; renderPracRef(); setTab("ref");
    }
  });
  document.getElementById("tplSel").addEventListener("change", function(){
    if (this.value === "") return;
    var idx = this.value, t = MACRO_TEMPLATES[Number(idx)];
    this.value = "";
    if (!pracIsPristine(ed.value) && !window.confirm("現在のコードをテンプレートで置き換えますか？")) return;
    edReplace(t.code, 0, ed.value.length);
    ed.setSelectionRange(0, 0); ed.scrollTop = 0; remember();
    showGuide(Number(idx));
  });
  document.getElementById("btnClear").addEventListener("click", function(){
    if (!pracIsPristine(ed.value) && !window.confirm("コードをすべて消去しますか？")) return;
    edReplace("", 0, ed.value.length);
  });
  document.getElementById("btnCopy").addEventListener("click", function(){
    var b = this;
    function done(){ b.textContent = "コピーしました"; setTimeout(function(){ b.textContent = "コピー"; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ed.value).then(done, done);
    else { ed.select(); document.execCommand("copy"); done(); }
  });
  document.getElementById("btnDl").addEventListener("click", function(){
    // UTF-8（BOMなし）・LF改行のテキストとして保存する
    var blob = new Blob([ed.value], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "macro.ijm";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  });
  view.querySelectorAll("[data-ptab]").forEach(function(b){ b.addEventListener("click", function(){ setTab(b.getAttribute("data-ptab")); }); });
  document.getElementById("pracKw").addEventListener("input", function(){ prac.kw = this.value; prac.fn = null; renderPracRef(); });
  view.querySelectorAll("[data-pcat]").forEach(function(b){ b.addEventListener("click", function(){ setCat(b.getAttribute("data-pcat")); prac.fn = null; renderPracRef(); }); });
  renderPracRef();
  function renderPracRef(){
    var body = document.getElementById("pracRefBody");
    if (!body) return;
    if (prac.fn){
      var f = funcByName(prac.fn);
      if (f){
        body.innerHTML = '<button type="button" class="mini-btn" id="pracBack">← 一覧</button>' +
          '<p class="fn-sig">' + esc(f.sig) + "</p><p>" + linkTerms(f.desc, 4) + "</p>" +
          (f.ret ? '<div class="box box-points"><h3>戻り値</h3><p>' + esc(f.ret) + "</p></div>" : "") +
          (f.ex ? '<h3>使用例</h3><pre class="code">' + esc(f.ex) + "</pre>" : "") +
          (f.note ? '<div class="box box-caution"><h3>注意</h3><p>' + esc(f.note) + "</p></div>" : "") +
          (f.ver ? '<p class="meta-line">バージョン要件：' + esc(f.ver) + "</p>" : "") +
          '<div class="prac-ins"><button type="button" class="btn" id="insSig">書式を挿入</button>' +
          (f.ex ? '<button type="button" class="btn sub" id="insEx">使用例を挿入</button>' : "") + "</div>";
        body.scrollTop = 0;
        document.getElementById("pracBack").addEventListener("click", function(){ prac.fn = null; renderPracRef(); });
        document.getElementById("insSig").addEventListener("click", function(){
          var st = pracSigStatement(f.sig), p = st.indexOf("("), q = st.lastIndexOf(")");
          // 引数部分を選択状態にして、そのまま上書き入力できるようにする
          insertCode(st, p >= 0 && q > p + 1 ? [p + 1, q] : null);
        });
        var exBtn = document.getElementById("insEx");
        if (exBtn) exBtn.addEventListener("click", function(){ insertCode(f.ex, null); });
        return;
      }
      prac.fn = null;
    }
    var kw = norm(prac.kw);
    var list = FUNCTIONS.filter(function(f){
      if (prac.cat !== "all" && f.cat !== prac.cat) return false;
      if (!kw) return true;
      return norm(f.name + " " + f.sig + " " + f.desc).indexOf(kw) >= 0;
    });
    body.innerHTML = list.length ? list.map(function(f){
      return '<button type="button" class="fn-row" data-fn="' + esc(f.name) + '"><b class="fn-name">' + esc(f.sig) + "</b><span>" + esc(f.desc.split("。")[0]) + "。</span></button>";
    }).join("") : '<div class="empty">該当する関数がありません。</div>';
    body.querySelectorAll("[data-fn]").forEach(function(b){ b.addEventListener("click", function(){ prac.fn = b.getAttribute("data-fn"); renderPracRef(); }); });
  }
  // 選択範囲があればそれを置き換える。選択がなければ、カーソル行を壊さないよう
  // 空行ならその位置に、そうでなければ行末の次の行に、行のインデントを揃えて挿入する。
  function insertCode(text, selRel){
    var v = ed.value, s = ed.selectionStart, e = ed.selectionEnd, insert = text, lead = 0;
    // 直前の挿入で自動選択した引数部分は「利用者の選択」ではないので、置き換えずに次の行へ挿入する
    var auto = prac.autoSel && prac.autoSel[0] === s && prac.autoSel[1] === e && prac.autoSel[2] === v;
    if (auto) e = s;
    prac.autoSel = null;
    if (s === e){
      var ls = v.lastIndexOf("\n", s - 1) + 1, le = v.indexOf("\n", s); if (le < 0) le = v.length;
      var line = v.slice(ls, le), indent = (line.match(/^[ \t]*/) || [""])[0];
      var body2 = text.split("\n").join("\n" + indent);
      if (!line.trim()){ s = ls + indent.length; e = le; insert = body2; }
      else { s = e = le; insert = "\n" + indent + body2; lead = 1 + indent.length; }
    }
    edReplace(insert, s, e);
    if (selRel){ ed.setSelectionRange(s + lead + selRel[0], s + lead + selRel[1]); prac.autoSel = [ed.selectionStart, ed.selectionEnd, ed.value]; }
    else ed.setSelectionRange(s + insert.length, s + insert.length);
    remember();
    if (window.innerWidth < 860) setTab("code");
    ed.focus();
  }
  /* --- 実行シミュレーションの配線 --- */
  var simMode = store.simMode === "auto" ? "auto" : "button";
  var simRan = false, simDirty = false, simTimer = null;
  var simOut = document.getElementById("simOut");
  var simRunBtn = document.getElementById("simRun");
  var simState = document.getElementById("simState");
  function simJump(ln){
    if (!ln) return;
    var v = ed.value, pos = 0, cur = 1;
    while (cur < ln){ var nl = v.indexOf("\n", pos); if (nl < 0) break; pos = nl + 1; cur++; }
    var end = v.indexOf("\n", pos); if (end < 0) end = v.length;
    if (window.innerWidth < 860) setTab("code");
    ed.focus(); ed.setSelectionRange(pos, end); remember();
  }
  function runSim(){
    var r = null;
    try { r = simRunProgram(ed.value); } catch (err) { r = null; }
    if (!r){ simOut.innerHTML = '<p class="sim-note">説明を生成できませんでした。コードを少し変えて試してください。</p>'; return; }
    simOut.innerHTML = simRender(r);
    simRan = true; simDirty = false;
    simState.textContent = "診断 " + r.diags.length + " 件／ステップ " + r.steps.length + " 件";
    simOut.querySelectorAll("[data-simline]").forEach(function(b){
      b.addEventListener("click", function(){ simJump(Number(b.getAttribute("data-simline"))); });
    });
  }
  function setSimMode(m){
    simMode = m; store.simMode = m; save();
    view.querySelectorAll("[data-simode]").forEach(function(b){
      var on = b.getAttribute("data-simode") === m;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    simRunBtn.style.display = m === "button" ? "" : "none";
    if (m === "auto") runSim();
    else simState.textContent = simRan ? "ボタンで実行するモードです" : "";
  }
  function simOnInput(){
    if (simMode === "auto"){
      if (simTimer) clearTimeout(simTimer);
      simTimer = setTimeout(runSim, 600);
    } else if (simRan && !simDirty){
      simDirty = true;
      simState.textContent = "コードが変更されました（再実行で更新）";
    }
  }
  view.querySelectorAll("[data-simode]").forEach(function(b){ b.addEventListener("click", function(){ setSimMode(b.getAttribute("data-simode")); }); });
  simRunBtn.addEventListener("click", runSim);
  view.querySelectorAll("[data-simode]").forEach(function(b){
    var on = b.getAttribute("data-simode") === simMode;
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  simRunBtn.style.display = simMode === "button" ? "" : "none";
  if (simMode === "auto") runSim();
  else simOut.innerHTML = '<p class="sim-note">［説明を実行］を押すと、コードが何をするかを手順つきで説明します。</p>';
}


/* ---------- macro simulation ----------
   実行はせず、コードを解釈して「何が起きるか」を自然言語で説明するモデル。
   画像はモデル画像 demo.tif（512×512・8bit・画素値の分布つき）を前提にする。
   解釈できない構文・値は「実行時に決まる」として正直に落とす。 */
function simErr(line, text, cause){ return { __simErr: 1, line: line, text: text, cause: cause || "" }; }
var SIM_UNK = { __unk: 1 };
function simIsUnk(v){ return v === SIM_UNK || (v && typeof v === "object" && v.__unk === 1); }
function simFmt(v){
  if (simIsUnk(v)) return "（実行時に決まる値）";
  if (typeof v === "number"){
    if (v !== v) return "NaN";
    if (!isFinite(v)) return v > 0 ? "Infinity" : "-Infinity";
    return String(Math.round(v * 10000) / 10000);
  }
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)){
    var s = v.slice(0, 6).map(simFmt).join(", ");
    return "[" + s + (v.length > 6 ? ", …（全" + v.length + "件）" : "") + "]";
  }
  return String(v);
}
function simLex(code){
  var toks = [], i = 0, line = 1, n = code.length;
  function push(k, v, at){ toks.push({ k: k, v: v, line: line, at: at }); }
  while (i < n){
    var c = code[i], c2 = code[i + 1];
    if (c === "\n"){ line++; i++; continue; }
    if (c === " " || c === "\t" || c === "\r"){ i++; continue; }
    if (c === "/" && c2 === "/"){ while (i < n && code[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*"){
      var bl = line; i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")){ if (code[i] === "\n") line++; i++; }
      if (i >= n) throw simErr(bl, "ブロックコメント /* が閉じていません", "コメントの終わりの */ が必要です。");
      i += 2; continue;
    }
    if (c === "\"" || c === "'"){
      var q = c, s = "", sl = line, closed = false; i++;
      while (i < n){
        var ch = code[i];
        if (ch === "\n") break;
        if (ch === "\\" && i + 1 < n){ var e = code[i + 1]; s += e === "n" ? "\n" : e === "t" ? "\t" : e; i += 2; continue; }
        if (ch === q){ closed = true; i++; break; }
        s += ch; i++;
      }
      if (!closed) throw simErr(sl, "文字列が閉じていません", "文字列は行の中で " + q + " で閉じる必要があります。");
      push("str", s, i); continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(c2 || ""))){
      var m = /^\d+\.?\d*(?:[eE][+-]?\d+)?|^\.\d+(?:[eE][+-]?\d+)?/.exec(code.slice(i));
      push("num", parseFloat(m[0]), i); i += m[0].length; continue;
    }
    if (/[A-Za-z_$]/.test(c)){
      var w = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(code.slice(i))[0];
      push("id", w, i); i += w.length; continue;
    }
    var three = code.substr(i, 3), two = code.substr(i, 2);
    if (["++", "--", "+=", "-=", "*=", "/=", "==", "!=", "<=", ">=", "&&", "||"].indexOf(two) >= 0){ push("op", two, i); i += 2; continue; }
    if ("+-*/%=<>!?:(){}[];,.".indexOf(c) >= 0){ push("op", c, i); i++; continue; }
    throw simErr(line, "解釈できない文字「" + c + "」があります", "マクロの文法で使えない文字です。全角文字の混入も確認してください。");
  }
  toks.push({ k: "eof", v: "", line: line, at: n });
  return toks;
}
function simParse(code){
  var toks = simLex(code), pos = 0;
  function peek(){ return toks[pos]; }
  function next(){ return toks[pos++]; }
  function isOp(v){ var t = toks[pos]; return t.k === "op" && t.v === v; }
  function expect(v){
    var t = next();
    if (t.k !== "op" || t.v !== v) throw simErr(t.line, "文法エラー：「" + v + "」が必要な位置に「" + (t.v || "文末") + "」があります", "括弧や区切りの対応を確認してください。");
    return t;
  }
  function optSemi(){ if (isOp(";")) next(); }
  var KW = { "if": 1, "else": 1, "for": 1, "while": 1, "do": 1, "function": 1, "return": 1, "break": 1, "continue": 1 };
  function parseProgram(endBrace){
    var out = [];
    while (peek().k !== "eof" && !(endBrace && isOp("}"))){
      var st = parseStmt();
      if (st) out.push(st);
    }
    return out;
  }
  function parseBlockOrStmt(){
    if (isOp("{")){ next(); var b = parseProgram(true); expect("}"); return { t: "block", body: b, line: toks[pos - 1].line }; }
    return parseStmt();
  }
  function parseStmt(){
    var t = peek();
    if (isOp(";")){ next(); return null; }
    if (isOp("{")) return parseBlockOrStmt();
    if (t.k === "id" && t.v === "function"){
      next(); var nm = next(); if (nm.k !== "id") throw simErr(t.line, "function の後に関数名が必要です", "");
      expect("("); var ps = [];
      if (!isOp(")")){ for (;;){ var p = next(); if (p.k !== "id") throw simErr(p.line, "引数名が不正です", ""); ps.push(p.v); if (isOp(",")){ next(); continue; } break; } }
      expect(")"); var body = parseBlockOrStmt();
      return { t: "funcdef", name: nm.v, params: ps, body: body.t === "block" ? body.body : [body], line: t.line };
    }
    if (t.k === "id" && t.v === "if"){
      next(); expect("("); var c1 = parseExpr(); expect(")");
      var then = parseBlockOrStmt(), els = null;
      if (peek().k === "id" && peek().v === "else"){ next(); els = parseBlockOrStmt(); }
      return { t: "if", cond: c1, then: then, els: els, line: t.line };
    }
    if (t.k === "id" && t.v === "for"){
      next(); expect("(");
      var init = isOp(";") ? null : parseExpr(); expect(";");
      var cond = isOp(";") ? null : parseExpr(); expect(";");
      var inc = isOp(")") ? null : parseExpr(); expect(")");
      return { t: "for", init: init, cond: cond, inc: inc, body: parseBlockOrStmt(), line: t.line };
    }
    if (t.k === "id" && t.v === "while"){
      next(); expect("("); var cw = parseExpr(); expect(")");
      return { t: "while", cond: cw, body: parseBlockOrStmt(), line: t.line };
    }
    if (t.k === "id" && t.v === "do"){
      next(); var bd = parseBlockOrStmt();
      var w = next(); if (!(w.k === "id" && w.v === "while")) throw simErr(w.line, "do の後には while が必要です", "");
      expect("("); var cd = parseExpr(); expect(")"); optSemi();
      return { t: "do", cond: cd, body: bd, line: t.line };
    }
    if (t.k === "id" && t.v === "return"){
      next(); var v = null;
      if (!isOp(";") && !isOp("}") && peek().k !== "eof") v = parseExpr();
      optSemi(); return { t: "return", v: v, line: t.line };
    }
    if (t.k === "id" && (t.v === "break" || t.v === "continue")){ next(); optSemi(); return { t: t.v, line: t.line }; }
    var e = parseExpr(); optSemi();
    return { t: "expr", e: e, line: t.line };
  }
  function parseExpr(){ return parseAssign(); }
  function parseAssign(){
    var l = parseTernary();
    var t = peek();
    if (t.k === "op" && ["=", "+=", "-=", "*=", "/="].indexOf(t.v) >= 0){
      next(); var r = parseAssign();
      if (l.t !== "var" && l.t !== "index") throw simErr(t.line, "代入の左側は変数か配列要素にしてください", "計算結果などには代入できません。");
      return { t: "assign", op: t.v, target: l, v: r, line: t.line };
    }
    return l;
  }
  function parseTernary(){
    var c = parseBinary(0);
    if (isOp("?")){ next(); var a = parseExpr(); expect(":"); var b = parseTernary(); return { t: "tern", c: c, a: a, b: b, line: c.line }; }
    return c;
  }
  var LEVELS = [["||"], ["&&"], ["==", "!="], ["<", "<=", ">", ">="], ["+", "-"], ["*", "/", "%"]];
  function parseBinary(lv){
    if (lv >= LEVELS.length) return parseUnary();
    var l = parseBinary(lv + 1);
    for (;;){
      var t = peek();
      if (t.k === "op" && LEVELS[lv].indexOf(t.v) >= 0){ next(); var r = parseBinary(lv + 1); l = { t: "bin", op: t.v, l: l, r: r, line: t.line }; }
      else break;
    }
    return l;
  }
  function parseUnary(){
    var t = peek();
    if (t.k === "op" && (t.v === "!" || t.v === "-" || t.v === "+")){ next(); return { t: "un", op: t.v, e: parseUnary(), line: t.line }; }
    if (t.k === "op" && (t.v === "++" || t.v === "--")){ next(); return { t: "pre", op: t.v, e: parseUnary(), line: t.line }; }
    return parsePostfix();
  }
  function parsePostfix(){
    var e = parsePrimary();
    for (;;){
      var t = peek();
      if (t.k === "op" && t.v === "["){ next(); var ix = parseExpr(); expect("]"); e = { t: "index", obj: e, ix: ix, line: t.line }; continue; }
      if (t.k === "op" && t.v === "."){
        next(); var m = next(); if (m.k !== "id") throw simErr(m.line, "「.」の後に名前が必要です", "");
        if (m.v === "length" && !isOp("(")){ e = { t: "length", obj: e, line: t.line }; continue; }
        if (e.t === "var"){ e = { t: "path", parts: [e.name, m.v], line: t.line }; continue; }
        if (e.t === "path"){ e.parts.push(m.v); continue; }
        throw simErr(t.line, "この「.」の使い方は解釈できませんでした", "配列・文字列の長さは .length で取れます。");
      }
      if (t.k === "op" && t.v === "("){
        next(); var args = [];
        if (!isOp(")")){ for (;;){ args.push(parseExpr()); if (isOp(",")){ next(); continue; } break; } }
        expect(")");
        var name = null;
        if (e.t === "var") name = e.name; else if (e.t === "path") name = e.parts.join(".");
        if (name == null) throw simErr(t.line, "この呼び出しは解釈できませんでした", "関数名の後の引数リストにしてください。");
        e = { t: "call", name: name, args: args, line: t.line }; continue;
      }
      if (t.k === "op" && (t.v === "++" || t.v === "--")){ next(); e = { t: "post", op: t.v, e: e, line: t.line }; continue; }
      break;
    }
    return e;
  }
  function parsePrimary(){
    var t = next();
    if (t.k === "num") return { t: "num", v: t.v, line: t.line };
    if (t.k === "str") return { t: "str", v: t.v, line: t.line };
    if (t.k === "id"){
      if (t.v === "true") return { t: "num", v: 1, line: t.line };
      if (t.v === "false") return { t: "num", v: 0, line: t.line };
      if (KW[t.v]) throw simErr(t.line, "キーワード「" + t.v + "」の位置が不正です", "文の構造を確認してください。");
      return { t: "var", name: t.v, line: t.line };
    }
    if (t.k === "op" && t.v === "("){ var e = parseExpr(); expect(")"); return e; }
    throw simErr(t.line, "解釈できない式です（「" + (t.v || "文末") + "」の付近）", "式の書き方を確認してください。");
  }
  var prog = parseProgram(false);
  return prog;
}


/* --- モデル画像 --- */
function simDemoImage(){
  return { title: "demo.tif", w: 512, h: 512, bit: 8, channels: 1, slices: 1, frames: 1,
    slice: 1, buckets: [[0, 29, 52], [30, 99, 13], [100, 149, 9], [150, 199, 11], [200, 255, 15]],
    thr: null, mapOps: [], spatial: false, pix: {}, kind: "グレースケール" };
}
function simImgMean(img){
  if (!img.buckets) return SIM_UNK;
  var m = 0; img.buckets.forEach(function(b){ m += (b[0] + b[1]) / 2 * b[2] / 100; });
  return m;
}
function simImgStd(img){
  if (!img.buckets) return SIM_UNK;
  var mean = simImgMean(img), v = 0;
  img.buckets.forEach(function(b){ var mid = (b[0] + b[1]) / 2; v += (mid - mean) * (mid - mean) * b[2] / 100 + (b[1] - b[0]) * (b[1] - b[0]) / 12 * b[2] / 100; });
  return Math.sqrt(v);
}
function simImgRange(img){
  if (!img.buckets) return null;
  return [img.buckets[0][0], img.buckets[img.buckets.length - 1][1]];
}
function simApplyOps(img, v){
  for (var i = 0; i < img.mapOps.length; i++) v = img.mapOps[i].f(v);
  return v;
}
function simImgRangeNow(img){ return simImgRange(img); }
/* 値変換を1つ適用：変化表用の合成列へ積み、分布（buckets）にも畳み込む */
function simPushOp(img, f){
  img.mapOps.push({ f: f });
  if (!img.buckets) return;
  img.buckets = img.buckets.map(function(b){
    var a = f(b[0]), c = f(b[1]);
    return [Math.min(a, c), Math.max(a, c), b[2]];
  }).sort(function(x, y){ return x[0] - y[0]; });
}
/* 画素値 lo..hi が全体に占める割合（%）。現在の値変換をサンプル点で近似する */
function simImgPct(img, lo, hi){
  if (!img.buckets) return SIM_UNK;
  var inside = 0, steps = 24;
  img.buckets.forEach(function(b){
    var hit = 0;
    for (var i = 0; i < steps; i++){
      var v = b[0] + (b[1] - b[0]) * (i + 0.5) / steps;
      if (v >= lo && v <= hi) hit++;
    }
    inside += b[2] * hit / steps;
  });
  return inside;
}
function simOtsu(img){
  if (!img.buckets) return SIM_UNK;
  var hist = new Array(256).fill(0), total = 0;
  img.buckets.forEach(function(b){
    var per = b[2] / (b[1] - b[0] + 1);
    for (var v = b[0]; v <= b[1]; v++){ hist[v] += per; total += per; }
  });
  var sum = 0; for (var i = 0; i < 256; i++) sum += i * hist[i];
  var sumB = 0, wB = 0, best = -1, thr = 0;
  for (var t = 0; t < 256; t++){
    wB += hist[t]; if (!wB) continue;
    var wF = total - wB; if (!wF) break;
    sumB += t * hist[t];
    var mF = (sum - sumB) / wF, mB = sumB / wB;
    var between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best){ best = between; thr = t; }
  }
  return thr;
}
/* --- 静的チェック（未知の関数・引数の数・関数の重複など） --- */
var SIM_ARITY_OVERRIDE = { run: { min: 1, max: 2 }, print: { min: 1, max: Infinity }, log: { min: 1, max: Infinity }, newArray: { min: 0, max: Infinity }, exit: { min: 0, max: 1 }, getStatistics: { min: 1, max: 6 }, showMessage: { min: 1, max: 2 }, waitForUser: { min: 0, max: 2 }, call: { min: 1, max: Infinity } };
function simArity(sig){
  var m = /\(([\s\S]*)\)/.exec(sig); if (!m) return null;
  var inner = m[1].trim(); if (!inner) return { min: 0, max: 0 };
  var variadic = /\.\.\./.test(inner);
  var reqPart = inner.replace(/\[[^\]]*\]/g, "");
  function cnt(s){
    if (!s.trim()) return 0;
    var d = 0, c = 1;
    for (var i = 0; i < s.length; i++){ var ch = s[i]; if (ch === "(" || ch === "[") d++; else if (ch === ")" || ch === "]") d--; else if (ch === "," && d === 0) c++; }
    return c;
  }
  return { min: cnt(reqPart.replace(/,\s*\.\.\./, "")), max: variadic ? Infinity : cnt(inner.replace(/\[|\]/g, "")) };
}
function simStaticChecks(prog, funcs){
  var diags = [], seenFn = {};
  Object.keys(funcs).forEach(function(n){ seenFn[n] = 1; });
  function walkExpr(e, line){
    if (!e) return;
    switch (e.t){
      case "call": {
        var name = e.name;
        if (funcs[name]){
          if (e.args.length !== funcs[name].params.length)
            diags.push({ sev: "err", line: e.line, text: "関数 " + name + " の引数の数が違います", cause: "定義は " + funcs[name].params.length + " 個の引数ですが、" + e.args.length + " 個渡しています。" });
        } else if (!funcByName(name) && !SIM_EXTRA[name]){
          diags.push({ sev: "err", line: e.line, text: "「" + name + "」は定義されていない関数です", cause: "関数リファレンスにも、このコード内の function 定義にもありません。綴り違いか、定義のし忘れの可能性があります。ImageJ ではここでエラーになり止まります。" });
        } else {
          var f = funcByName(name), ar = SIM_ARITY_OVERRIDE[name] || simArity(f.sig);
          if (ar && (e.args.length < ar.min || e.args.length > ar.max))
            diags.push({ sev: "err", line: e.line, text: name + " の引数の数が違います", cause: "書式は " + f.sig + " で、引数は " + (ar.max === Infinity ? ar.min + " 個以上" : ar.min === ar.max ? ar.min + " 個" : ar.min + "〜" + ar.max + " 個") + "ですが、" + e.args.length + " 個渡しています。" });
        }
        e.args.forEach(function(a){ walkExpr(a, line); });
        break;
      }
      case "bin": walkExpr(e.l, line); walkExpr(e.r, line); break;
      case "un": case "pre": case "post": walkExpr(e.e, line); break;
      case "assign": walkExpr(e.target, line); walkExpr(e.v, line); break;
      case "index": walkExpr(e.obj, line); walkExpr(e.ix, line); break;
      case "length": walkExpr(e.obj, line); break;
      case "tern": walkExpr(e.c, line); walkExpr(e.a, line); walkExpr(e.b, line); break;
    }
  }
  function walkStmt(st, inFunc, inLoop){
    switch (st.t){
      case "funcdef": break; /* 本体は呼び出し時に動的に見る */
      case "expr": walkExpr(st.e, st.line); break;
      case "block": st.body.forEach(function(s){ walkStmt(s, inFunc, inLoop); }); break;
      case "if": walkExpr(st.cond, st.line); walkStmt(st.then, inFunc, inLoop); if (st.els) walkStmt(st.els, inFunc, inLoop); break;
      case "for": walkExpr(st.init, st.line); walkExpr(st.cond, st.line); walkExpr(st.inc, st.line); walkStmt(st.body, inFunc, true); break;
      case "while": case "do": walkExpr(st.cond, st.line); walkStmt(st.body, inFunc, true); break;
      case "return": if (!inFunc) diags.push({ sev: "err", line: st.line, text: "return が関数の外にあります", cause: "return は function の中でのみ使えます。" }); walkExpr(st.v, st.line); break;
      case "break": case "continue": if (!inLoop) diags.push({ sev: "err", line: st.line, text: st.t + " が繰り返しの外にあります", cause: st.t + " は for / while の中でのみ使えます。" }); break;
    }
  }
  var fnNames = {};
  prog.forEach(function(st){
    if (st.t === "funcdef"){
      if (fnNames[st.name]) diags.push({ sev: "warn", line: st.line, text: "関数 " + st.name + " が2回定義されています", cause: "ImageJ では後に定義した方で上書きされます。意図しない上書きに注意してください。" });
      fnNames[st.name] = 1;
    }
  });
  prog.forEach(function(st){ walkStmt(st, false, false); });
  return diags;
}


/* --- 式の短い表記（ステップ説明用） --- */
function simExprStr(e){
  if (!e) return "";
  switch (e.t){
    case "num": return simFmt(e.v);
    case "str": return "\"" + e.v + "\"";
    case "var": return e.name;
    case "path": return e.parts.join(".");
    case "length": return simExprStr(e.obj) + ".length";
    case "index": return simExprStr(e.obj) + "[" + simExprStr(e.ix) + "]";
    case "bin": return simExprStr(e.l) + " " + e.op + " " + simExprStr(e.r);
    case "un": return e.op + simExprStr(e.e);
    case "pre": case "post": return e.op + simExprStr(e.e);
    case "assign": return simExprStr(e.target) + " " + e.op + " " + simExprStr(e.v);
    case "call": return e.name + "(" + e.args.map(simExprStr).join(", ") + ")";
    case "tern": return simExprStr(e.c) + " ? … : …";
  }
  return "…";
}
/* --- 実行シミュレーション本体 --- */
function simRunProgram(code){
  var out = { diags: [], steps: [], log: [], vars: [], img: null, mapping: null, halted: false, premise: "" };
  var bc = pracCheck(code);
  if (bc){
    out.diags.push({ sev: "err", line: pracLine(code, bc.at), text: pracIssueText(code, bc), cause: "括弧や文字列が閉じていないと、ImageJ でも読み込めずエラーになります。まずここを直してください。" });
    return out;
  }
  var prog;
  try { prog = simParse(code); }
  catch (e){
    if (e && e.__simErr){ out.diags.push({ sev: "err", line: e.line, text: e.text, cause: e.cause }); return out; }
    throw e;
  }
  var funcs = {};
  prog.forEach(function(st){ if (st.t === "funcdef") funcs[st.name] = st; });
  out.diags = simStaticChecks(prog, funcs);
  var S = {
    funcs: funcs, steps: out.steps, diags: out.diags, log: out.log,
    images: [simDemoImage()], active: 0, results: [], roi: null, roiList: [],
    batch: false, scopes: [Object.create(null)], suppress: 0, depth: 0,
    halt: false, divWarned: false, stepCap: false
  };
  function step(line, text){
    if (S.suppress > 0 || S.stepCap) return;
    if (S.steps.length >= 300){ S.stepCap = true; S.steps.push({ line: line, text: "（ステップが多いため、以降の説明は省略します）" }); return; }
    S.steps.push({ line: line, text: text });
  }
  function rwarn(line, text, cause){ S.diags.push({ sev: "warn", line: line, text: text, cause: cause || "" }); }
  function img(){ return S.active >= 0 ? S.images[S.active] : null; }
  function needImg(line, what){
    var im = img();
    if (!im) throw simErr(line, what + " には画像が必要ですが、開かれている画像がありません", "open で画像を開くか、画像を開いた状態で実行する前提にしてください。ImageJ ではここでエラーになり止まります。");
    return im;
  }
  function readVar(node){
    var name = node.name;
    if (name === "PI") return Math.PI;
    if (name === "nImages") return S.images.length;
    if (name === "nSlices"){ var im = img(); return im ? im.slices : 0; }
    if (name === "nResults") return S.results.length;
    for (var i = S.scopes.length - 1; i >= 0; i--)
      if (Object.prototype.hasOwnProperty.call(S.scopes[i], name)) return S.scopes[i][name];
    throw simErr(node.line, "変数 " + name + " は、まだ値が代入されていません", "ImageJ では「Undefined variable」というエラーで止まります。使う前に代入してください。");
  }
  function writeVar(name, v){
    if (name === "PI" || name === "nImages" || name === "nSlices" || name === "nResults")
      throw simErr(0, name + " は組み込みの名前で、代入できません", "別の変数名を使ってください。");
    for (var i = S.scopes.length - 1; i >= 0; i--)
      if (Object.prototype.hasOwnProperty.call(S.scopes[i], name)){ S.scopes[i][name] = v; return; }
    S.scopes[0][name] = v; /* 関数の外でも使える全体変数になる（ImageJ の仕様） */
  }
  function truthy(v){
    if (simIsUnk(v)) return null;
    if (typeof v === "string") return v.length > 0;
    return !!v && v !== 0;
  }
  function num(v, line){
    if (simIsUnk(v)) return SIM_UNK;
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string"){ var x = parseFloat(v); if (!isNaN(x) && v.trim() !== "") return x; }
    throw simErr(line || 0, "数値が必要な場所で、数値でない値が使われています", "文字列の連結には + を、計算には数値を使ってください。");
  }
  function ev(e){ return evExpr(e); }
  function evExpr(e){
    switch (e.t){
      case "num": return e.v;
      case "str": return e.v;
      case "var": return readVar(e);
      case "length": {
        var o = evExpr(e.obj);
        if (simIsUnk(o)) return SIM_UNK;
        if (Array.isArray(o) || typeof o === "string") return o.length;
        throw simErr(e.line, ".length は配列か文字列にだけ使えます", "");
      }
      case "index": {
        var ob = evExpr(e.obj), ix = evExpr(e.ix);
        if (simIsUnk(ob) || simIsUnk(ix)) return SIM_UNK;
        ix = num(ix, e.line);
        if (Array.isArray(ob)){
          if (ix < 0 || ix >= ob.length) throw simErr(e.line, "配列の範囲外（" + ix + "）を読もうとしています", "配列の要素数は " + ob.length + " で、番号は 0〜" + (ob.length - 1) + " です。ImageJ ではここでエラーになり止まります。");
          return ob[ix];
        }
        return SIM_UNK;
      }
      case "un": {
        var u = evExpr(e.e);
        if (e.op === "!"){ var t = truthy(u); return t === null ? SIM_UNK : (t ? 0 : 1); }
        var un = num(u, e.line); return simIsUnk(un) ? SIM_UNK : (e.op === "-" ? -un : un);
      }
      case "pre": case "post": {
        var tgt = e.e, cur = evExpr(tgt), nn = num(cur, e.line);
        if (simIsUnk(nn)) return SIM_UNK;
        var nv = nn + (e.op === "++" ? 1 : -1);
        setTarget(tgt, nv, e.line);
        return e.t === "pre" ? nv : nn;
      }
      case "bin": return evBin(e);
      case "tern": {
        var c = truthy(evExpr(e.c));
        if (c === null) return SIM_UNK;
        return evExpr(c ? e.a : e.b);
      }
      case "assign": {
        var rv = evExpr(e.v);
        if (e.op !== "="){
          var cur2 = evExpr(e.target);
          rv = evBin({ t: "bin", op: e.op.charAt(0), l: { t: "lit", v: cur2 }, r: { t: "lit", v: rv }, line: e.line });
        }
        setTarget(e.target, rv, e.line);
        return rv;
      }
      case "call": return evCall(e);
    }
    if (e.t === "lit") return e.v;
    throw simErr(e.line || 0, "この式は解釈できませんでした", "対応していない構文のため、説明を省略します。");
  }
  function setTarget(tgt, v, line){
    if (tgt.t === "var"){ writeVar(tgt.name, v); return; }
    if (tgt.t === "index"){
      var ob = evExpr(tgt.obj), ix = num(evExpr(tgt.ix), line);
      if (!Array.isArray(ob)) throw simErr(line, "配列でないものに要素代入はできません", "");
      if (ix < 0 || ix >= ob.length) throw simErr(line, "配列の範囲外（" + ix + "）へ代入しようとしています", "配列の要素数は " + ob.length + " で、番号は 0〜" + (ob.length - 1) + " です。");
      ob[ix] = v; return;
    }
    throw simErr(line, "代入先が不正です", "");
  }
  function evBin(e){
    if (e.op === "&&" || e.op === "||"){
      var lt = truthy(evExpr(e.l));
      if (lt !== null && ((e.op === "&&" && !lt) || (e.op === "||" && lt))) return lt ? 1 : 0;
      var rt = truthy(evExpr(e.r));
      if (lt === null || rt === null) return SIM_UNK;
      return (e.op === "&&" ? (lt && rt) : (lt || rt)) ? 1 : 0;
    }
    var l = evExpr(e.l), r = evExpr(e.r);
    if (e.op === "+"){
      if (typeof l === "string" || typeof r === "string"){
        if (simIsUnk(l) || simIsUnk(r)) return SIM_UNK;
        return simFmt(l) + simFmt(r);
      }
      var a1 = num(l, e.line), a2 = num(r, e.line);
      return (simIsUnk(a1) || simIsUnk(a2)) ? SIM_UNK : a1 + a2;
    }
    if (e.op === "==" || e.op === "!="){
      if (simIsUnk(l) || simIsUnk(r)) return SIM_UNK;
      var eq = (typeof l === "string" || typeof r === "string") ? String(l) === String(r) : num(l, e.line) === num(r, e.line);
      return (e.op === "==") === eq ? 1 : 0;
    }
    var x = num(l, e.line), y = num(r, e.line);
    if (simIsUnk(x) || simIsUnk(y)) return SIM_UNK;
    switch (e.op){
      case "-": return x - y;
      case "*": return x * y;
      case "/":
        if (y === 0 && !S.divWarned){ S.divWarned = true; rwarn(e.line, "0 で割り算しています", "ImageJ では結果が Infinity（または NaN）になり、そのまま計算が進みます。意図した割り算か確認してください。"); }
        return x / y;
      case "%": return x % y;
      case "<": return x < y ? 1 : 0;
      case "<=": return x <= y ? 1 : 0;
      case ">": return x > y ? 1 : 0;
      case ">=": return x >= y ? 1 : 0;
    }
    return SIM_UNK;
  }
  /* 変数名で値を受け取る組み込み関数 */
  var REF_FNS = { getThreshold: 99, getMinAndMax: 99, getStatistics: 99, getHistogram: 2, getDimensions: 99, getVoxelSize: 99, getSelectionBounds: 99, "Stack.getDimensions": 99, "Stack.getPosition": 99, "Color.getLut": 99 };
  function evCall(e){
    var name = e.name;
    if (S.funcs[name]){
      var fn = S.funcs[name];
      var vals = e.args.map(function(a){ return evExpr(a); });
      if (S.depth >= 50) throw simErr(e.line, "関数 " + name + " の呼び出しが深すぎます", "自分自身を呼び続ける無限再帰の可能性があります。");
      step(e.line, "関数 " + name + "(" + vals.map(simFmt).join(", ") + ") を実行します");
      var scope = Object.create(null);
      fn.params.forEach(function(p, i){ scope[p] = i < vals.length ? vals[i] : SIM_UNK; });
      S.scopes.push(scope); S.depth++;
      var ret = SIM_UNK;
      try { execBlock(fn.body); }
      catch (ex){ if (ex && ex.__ret){ ret = ex.v; } else throw ex; }
      S.scopes.pop(); S.depth--;
      step(e.line, name + " の結果：" + simFmt(ret) + " が返ります");
      return ret;
    }
    var argVals = [], argRefs = [];
    e.args.forEach(function(a, i){
      if (REF_FNS[name] && i < REF_FNS[name] && a.t === "var"){ argRefs[i] = a.name; argVals[i] = null; }
      else { argRefs[i] = null; argVals[i] = evExpr(a); }
    });
    return simBuiltin(S, e, argVals, argRefs, { step: step, warn: rwarn, img: img, needImg: needImg, num: num, truthy: truthy });
  }
  function execBlock(stmts){ for (var i = 0; i < stmts.length; i++) execStmt(stmts[i]); }
  function execStmt(st){
    if (S.halt) return;
    switch (st.t){
      case "funcdef": return;
      case "block": execBlock(st.body); return;
      case "expr": {
        var v = evExpr(st.e);
        if (st.e.t === "assign" && st.e.target.t === "var")
          step(st.line, st.e.target.name + " に " + simFmt(v) + " を代入します");
        else if (st.e.t === "assign" && st.e.target.t === "index")
          step(st.line, simExprStr(st.e.target) + " に " + simFmt(v) + " を代入します");
        return;
      }
      case "if": {
        var c = truthy(evExpr(st.cond));
        if (c === null){
          step(st.line, "条件（" + simExprStr(st.cond) + "）は実行時の値で決まります。ここでは「真」の側で説明します");
          execStmt(st.then);
        } else {
          step(st.line, "条件（" + simExprStr(st.cond) + "）は" + (c ? "真" : "偽") + " → " + (c ? "中身を実行します" : st.els ? "else 側を実行します" : "中身は実行されません"));
          if (c) execStmt(st.then); else if (st.els) execStmt(st.els);
        }
        return;
      }
      case "for": case "while": case "do": execLoop(st); return;
      case "return": throw { __ret: 1, v: st.v ? evExpr(st.v) : SIM_UNK };
      case "break": throw { __brk: 1 };
      case "continue": throw { __cnt: 1 };
    }
  }
  function execLoop(st){
    var isDo = st.t === "do", count = 0, capped = false;
    S.suppress++;
    try { if (st.init) evExpr(st.init); } finally { S.suppress--; }
    step(st.line, (st.t === "for" ? "for" : st.t) + " の繰り返しに入ります" + (st.init ? "（" + simExprStr(st.init) + "）" : ""));
    for (;;){
      if (count >= 10000){ capped = true; break; }
      var go = true;
      if (!isDo || count > 0){
        if (st.cond){ var c = truthy(evExpr(st.cond)); if (c === null){ if (count === 0){ step(st.line, "繰り返しの条件は実行時の値で決まるため、1回分だけ説明します"); } else break; } else if (!c) break; }
      }
      count++;
      var record = count === 1;
      if (!record) S.suppress++;
      try { execStmt(st.body); }
      catch (ex){
        if (ex && ex.__brk){ if (!record) S.suppress--; break; }
        if (ex && ex.__cnt){ /* 次の周回へ（suppress の戻しは下で1回だけ） */ }
        else { if (!record) S.suppress--; throw ex; }
      }
      if (!record) S.suppress--;
      if (count === 2) step(st.line, "（2回目以降の繰り返しは、説明を省略します）");
      S.suppress++;
      try { if (st.inc) evExpr(st.inc); } finally { S.suppress--; }
      if (S.halt) break;
    }
    if (capped) throw simErr(st.line, "繰り返しが 10,000 回を超えました", "条件がいつまでも真になる無限ループの可能性があります。終了条件を確認してください。");
    step(st.line, "繰り返しは全 " + count + " 回で終了します");
  }
  try { execBlock(prog); }
  catch (ex){
    if (ex && ex.__halt){ out.exited = true; }
    else if (ex && ex.__simErr){
      out.diags.push({ sev: "err", line: ex.line, text: ex.text, cause: ex.cause, runtime: 1 });
      out.halted = true;
      step(ex.line, "ここで止まります：" + ex.text);
    } else if (ex && (ex.__ret || ex.__brk || ex.__cnt)){
      out.diags.push({ sev: "err", line: 0, text: "return / break / continue の位置が不正です", cause: "対応する関数や繰り返しの外で使われています。" });
    } else throw ex;
  }
  /* 静的診断と実行時エラーが同じ内容なら、静的側を落とす */
  var rtLines = {};
  out.diags.forEach(function(d){ if (d.runtime) rtLines[d.line + "|" + d.text] = 1; });
  out.diags = out.diags.filter(function(d){ return d.runtime || !rtLines[d.line + "|" + d.text]; });
  out.log = S.log;
  var g = S.scopes[0];
  Object.keys(g).forEach(function(k){ out.vars.push({ name: k, value: simFmt(g[k]) }); });
  var im = S.active >= 0 ? S.images[S.active] : null;
  if (im){
    var rng = simImgRangeNow(im), mn = simImgMean(im);
    out.img = { title: im.title, w: im.w, h: im.h, bit: im.bit, channels: im.channels, slices: im.slices,
      thr: im.thr, mean: simIsUnk(mn) ? null : Math.round(mn * 10) / 10, range: rng, count: S.images.length, results: S.results.length };
    if (im.bit === 8 && im.mapOps.length && !im.spatial){
      out.mapping = [0, 32, 64, 96, 128, 160, 192, 224, 255].map(function(v){ return [v, Math.round(Math.max(0, Math.min(255, simApplyOps(im, v))))]; });
    }
  } else out.img = { none: 1, results: S.results.length };
  out.premise = "前提：モデル画像 demo.tif（512×512・8ビット、暗い背景に明るい対象がある分布）が1枚開かれているものとして説明します。数値はモデルによる目安で、実際の画像では変わります。";
  return out;
}


/* --- シミュレーション結果の表示 --- */
function simRender(r){
  if (!r.steps.length && !r.diags.length)
    return '<p class="sim-note">コードが空か、説明できる処理がありませんでした。</p>';
  var h = "";
  if (r.premise) h += '<p class="sim-premise">' + esc(r.premise) + "</p>";
  if (r.diags.length){
    h += '<div class="sim-diags">' + r.diags.map(function(d){
      return '<div class="sim-diag ' + (d.sev === "err" ? "err" : "warn") + '">' +
        (d.line ? '<button type="button" class="sim-ln" data-simline="' + d.line + '">' + d.line + "行</button>" : '<span class="sim-ln sim-ln-x">全体</span>') +
        '<div class="sim-diag-body"><p class="sim-diag-t">' + (d.sev === "err" ? "エラー：" : "注意：") + esc(d.text) + "</p>" +
        (d.cause ? '<p class="sim-diag-c">' + esc(d.cause) + "</p>" : "") + "</div></div>";
    }).join("") + "</div>";
  }
  if (r.steps.length){
    h += '<ol class="sim-steps">' + r.steps.map(function(s){
      return '<li><button type="button" class="sim-ln" data-simline="' + s.line + '">' + s.line + "</button><span>" + linkTerms(s.text, 4) + "</span></li>";
    }).join("") + "</ol>";
  }
  h += '<div class="sim-final"><h3>終わったときの状態</h3>';
  if (r.img && !r.img.none){
    h += '<p>画像：「' + esc(r.img.title) + "」" +
      (typeof r.img.w === "number" ? "（" + r.img.w + "×" + r.img.h + "、" + r.img.bit + "ビット" + (r.img.channels > 1 ? "、チャンネル " + r.img.channels : "") + (r.img.slices > 1 ? "、スライス " + r.img.slices : "") + "）" : "（寸法は不明）") +
      (r.img.thr ? "、閾値 " + r.img.thr[0] + "〜" + r.img.thr[1] : "") +
      (r.img.mean != null ? "、画素値の平均 約 " + r.img.mean : "") +
      (r.img.range ? "、範囲 " + r.img.range[0] + "〜" + r.img.range[1] : "") +
      "。開いている画像 " + r.img.count + " 枚、結果表 " + r.img.results + " 行</p>";
  } else if (r.img){
    h += "<p>画像は開かれていません。結果表 " + r.img.results + " 行</p>";
  }
  if (r.mapping){
    h += '<p class="sim-map-t">画素値の変化（元の値 → 今の値）</p><div class="sim-map">' +
      r.mapping.map(function(m){ return '<span class="sim-chip">' + m[0] + " → " + m[1] + "</span>"; }).join("") + "</div>";
  }
  if (r.vars && r.vars.length){
    h += '<div class="sim-vars">' + r.vars.map(function(v){ return '<span class="sim-chip"><b>' + esc(v.name) + "</b> = " + esc(v.value) + "</span>"; }).join("") + "</div>";
  }
  if (r.log && r.log.length){
    h += '<h3>Log ウィンドウの出力</h3><pre class="sim-log">' + esc(r.log.join("\n")) + "</pre>";
  }
  h += "</div>";
  return h;
}
/* リファレンス97件に無いが ImageJ マクロに実在する組み込み（誤検出防止） */
var SIM_EXTRA = { sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, sinh: 1, cosh: 1, tanh: 1, sqr: 1, minOf: 1, maxOf: 1, toString: 1, getInfo: 1, isNaN: 1 };
function simHist256(img){
  var hist = new Array(256).fill(0);
  if (!img.buckets) return null;
  img.buckets.forEach(function(b){
    var per = b[2] / (b[1] - b[0] + 1);
    for (var v = b[0]; v <= b[1]; v++) hist[v] += per;
  });
  return hist;
}
function simStats(img){
  var hist = simHist256(img);
  if (!hist) return null;
  var total = 0, sum = 0, min = null, max = null, i;
  for (i = 0; i < 256; i++){ if (hist[i] > 0){ if (min === null) min = i; max = i; } total += hist[i]; sum += i * hist[i]; }
  if (!total) return null;
  var mean = sum / total, v = 0;
  for (i = 0; i < 256; i++) v += (i - mean) * (i - mean) * hist[i];
  return { area: (typeof img.w === "number" && typeof img.h === "number") ? img.w * img.h : SIM_UNK, mean: mean, std: Math.sqrt(v / total), min: min, max: max };
}
function simBuiltin(S, e, args, refs, H){
  var name = e.name, line = e.line, step = H.step, warn = H.warn;
  var img = function(){ return H.img(); };
  var needImg = function(what){ return H.needImg(line, what); };
  var f0 = funcByName(name);
  function descStep(extra){
    step(line, name + "：" + (f0 ? f0.desc.split("。")[0] + "。" : "組み込みの処理を実行します。") + (extra || ""));
  }
  switch (name){
    case "print": case "log": {
      var txt = args.map(function(a){ return simFmt(a); }).join("");
      if (S.log.length < 200) S.log.push(txt);
      else if (S.log.length === 200) S.log.push("（Log 出力が200行を超えたため、以降は省略します）");
      step(line, "Log に「" + txt + "」と出力します");
      return SIM_UNK;
    }
    case "run": return simRunCmd(S, args.length ? args[0] : "", args.length > 1 ? args[1] : "", line, H);
    case "getTitle": { var im = needImg("getTitle()"); step(line, "画像のタイトル「" + im.title + "」を取得します"); return im.title; }
    case "getWidth": { var im2 = needImg("getWidth()"); step(line, "画像の幅 " + (typeof im2.w === "number" ? im2.w + " px" : "（不明）") + " を取得します"); return typeof im2.w === "number" ? im2.w : SIM_UNK; }
    case "getHeight": { var im3 = needImg("getHeight()"); step(line, "画像の高さ " + (typeof im3.h === "number" ? im3.h + " px" : "（不明）") + " を取得します"); return typeof im3.h === "number" ? im3.h : SIM_UNK; }
    case "getImageID": { needImg("getImageID()"); step(line, "画像ID " + (-(S.active + 1)) + " を取得します（モデル上の番号）"); return -(S.active + 1); }
    case "bitDepth": { var im4 = needImg("bitDepth()"); step(line, "ビット深度 " + im4.bit + " を取得します"); return im4.bit; }
    case "isOpen": {
      var found = false;
      if (typeof args[0] === "string") found = S.images.some(function(x){ return x.title === args[0]; });
      else if (typeof args[0] === "number") found = args[0] < 0 ? (-args[0] - 1) < S.images.length : (args[0] - 1) < S.images.length && args[0] > 0;
      step(line, "画像「" + simFmt(args[0]) + "」が開かれているか → " + (found ? "開かれています" : "開かれていません"));
      return found ? 1 : 0;
    }
    case "selectImage": {
      var a = args[0], idx = -1;
      if (typeof a === "number") idx = a > 0 ? a - 1 : -a - 1;
      else if (typeof a === "string"){ idx = S.images.findIndex(function(x){ return x.title === a; }); }
      if (idx < 0 || idx >= S.images.length) throw simErr(line, "selectImage で、存在しない画像が指定されています", "開いている画像は " + S.images.length + " 枚です。番号（1始まり）か画像ID（負数）を確認してください。");
      S.active = idx;
      step(line, "画像「" + S.images[idx].title + "」をアクティブにします");
      return SIM_UNK;
    }
    case "selectWindow": {
      var ix = S.images.findIndex(function(x){ return x.title === args[0]; });
      if (ix < 0){ warn(line, "ウィンドウ「" + simFmt(args[0]) + "」が見つかりません", "結果表や Log など画像以外のウィンドウの可能性もあります。モデルでは画像だけを対象にしています。"); return SIM_UNK; }
      S.active = ix; step(line, "ウィンドウ「" + args[0] + "」を前に出します"); return SIM_UNK;
    }
    case "open": {
      var path = String(args[0]), base = path.split(/[\\/]/).pop();
      var nim = { title: base, w: null, h: null, bit: 8, channels: 1, slices: 1, frames: 1, slice: 1, buckets: null, thr: null, mapOps: [], spatial: false, pix: {}, kind: "開いた画像" };
      S.images.push(nim); S.active = S.images.length - 1;
      step(line, "ファイル「" + base + "」を開きます（寸法や分布は実際のファイル依存のため、この先の数値は目安として扱います）");
      return SIM_UNK;
    }
    case "close": {
      var im5 = img();
      if (!im5){ warn(line, "close() ですが、開いている画像がありません", ""); return SIM_UNK; }
      step(line, "画像「" + im5.title + "」を閉じます（保存の確認は出ない前提です）");
      S.images.splice(S.active, 1);
      if (S.active >= S.images.length) S.active = S.images.length - 1;
      return SIM_UNK;
    }
    case "saveAs": {
      if (String(args[0]).toLowerCase() === "results") step(line, "結果表（" + S.results.length + " 行）を「" + simFmt(args[1]) + "」に保存します");
      else step(line, "画像を " + simFmt(args[0]) + " 形式で「" + simFmt(args[1]) + "」に保存します（元の画像データは変わりません）");
      return SIM_UNK;
    }
    case "getDirectory": step(line, "フォルダ選択ダイアログが開きます（モデルでは選択したものとして進みます）"); return "/（選択したフォルダ）/";
    case "getFileList": step(line, "フォルダ内のファイル一覧を取得します（モデルでは3件として進みます）"); return ["image1.tif", "image2.tif", "memo.txt"];
    case "getVersion": step(line, "ImageJ のバージョン文字列を取得します（モデルでは 1.54 系として扱います）"); return "1.54p";
    case "getArgument": step(line, "マクロへの引数を取得します（この練習では引数なし＝空文字列です）"); return "";
    case "requires": step(line, "ImageJ のバージョン要件 " + simFmt(args[0]) + " を確認します"); return SIM_UNK;
    case "exit": step(line, "マクロはここで終了します" + (args[0] ? "（メッセージ：" + simFmt(args[0]) + "）" : "")); S.halt = true; throw { __halt: 1 };
    case "eval": step(line, "渡された文字列をマクロとして実行します（中身の説明は省略します）"); return SIM_UNK;
    case "call": step(line, "Java の機能を呼び出します（内容の説明は省略します）"); return SIM_UNK;
    case "waitForUser": step(line, "ダイアログでユーザーの操作を待ち、一時停止します"); return SIM_UNK;
    case "showMessage": step(line, "メッセージ「" + simFmt(args[args.length - 1]) + "」を表示して止まります"); return SIM_UNK;
    case "showStatus": step(line, "ステータスバーに「" + simFmt(args[0]) + "」と表示します"); return SIM_UNK;
    case "showProgress": step(line, "進捗バーを " + simFmt(args[0]) + " の割合で表示します"); return SIM_UNK;
    case "setBatchMode":
      S.batch = !!H.truthy(args[0]);
      step(line, "バッチモードを " + (S.batch ? "オン（画面を描かず高速に処理）" : "オフ（通常表示）") + " にします");
      return SIM_UNK;
    case "setOption": step(line, "オプション「" + simFmt(args[0]) + "」を設定します"); return SIM_UNK;
    case "updateResults": step(line, "結果表の表示を更新します"); return SIM_UNK;
    case "newArray": {
      if (args.length === 1 && typeof args[0] === "number"){ var arr = []; for (var i = 0; i < args[0]; i++) arr.push(0); step(line, "要素数 " + args[0] + " の配列（中身はすべて 0）を作ります"); return arr; }
      step(line, "配列 " + simFmt(args) + " を作ります"); return args.slice();
    }
    case "Array.sort": { var ar = args[0]; if (Array.isArray(ar)) ar.sort(function(x, y){ return x < y ? -1 : x > y ? 1 : 0; }); step(line, "配列を小さい順に並べ替えます"); return ar; }
    case "lengthOf": return typeof args[0] === "string" || Array.isArray(args[0]) ? args[0].length : SIM_UNK;
    case "indexOf": return typeof args[0] === "string" ? args[0].indexOf(String(args[1])) : SIM_UNK;
    case "substring": return typeof args[0] === "string" ? (args.length > 2 ? args[0].substring(args[1], args[2]) : args[0].substring(args[1])) : SIM_UNK;
    case "startsWith": return typeof args[0] === "string" && args[0].indexOf(String(args[1])) === 0 ? 1 : 0;
    case "endsWith": return typeof args[0] === "string" && args[0].slice(-String(args[1]).length) === String(args[1]) ? 1 : 0;
    case "replace": return typeof args[0] === "string" ? args[0].split(String(args[1])).join(String(args[2])) : SIM_UNK;
    case "split": {
      if (typeof args[0] !== "string") return SIM_UNK;
      var dl = String(args[1] || " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split("").join("|");
      return args[0].split(new RegExp(dl)).filter(function(s){ return s.trim() !== ""; }).map(function(s){ return s.trim(); });
    }
    case "parseInt": { var pi = parseInt(args[0], 10); return isNaN(pi) ? SIM_UNK : pi; }
    case "parseFloat": { var pf = parseFloat(args[0]); return isNaN(pf) ? SIM_UNK : pf; }
    case "d2s": return typeof args[0] === "number" ? args[0].toFixed(Math.min(10, Math.max(0, args[1] || 0))) : SIM_UNK;
    case "abs": return typeof args[0] === "number" ? Math.abs(args[0]) : SIM_UNK;
    case "floor": return typeof args[0] === "number" ? Math.floor(args[0]) : SIM_UNK;
    case "round": return typeof args[0] === "number" ? Math.round(args[0]) : SIM_UNK;
    case "sqrt": return typeof args[0] === "number" ? Math.sqrt(args[0]) : SIM_UNK;
    case "pow": return typeof args[0] === "number" && typeof args[1] === "number" ? Math.pow(args[0], args[1]) : SIM_UNK;
    case "exp": return typeof args[0] === "number" ? Math.exp(args[0]) : SIM_UNK;
    case "atan2": return typeof args[0] === "number" && typeof args[1] === "number" ? Math.atan2(args[0], args[1]) : SIM_UNK;
    case "Math.min": case "Math.max": case "minOf": case "maxOf": {
      var ns = args.filter(function(x){ return typeof x === "number"; });
      if (ns.length !== args.length) return SIM_UNK;
      return (name === "Math.min" || name === "minOf") ? Math.min.apply(null, ns) : Math.max.apply(null, ns);
    }
    case "random": step(line, "乱数を使うため、この値は実行のたびに変わります"); return SIM_UNK;
    case "sin": case "cos": case "tan": case "asin": case "acos": case "atan": case "sinh": case "cosh": case "tanh":
      return typeof args[0] === "number" ? Math[name](args[0]) : SIM_UNK;
    case "sqr": return typeof args[0] === "number" ? args[0] * args[0] : SIM_UNK;
    case "toString": return simFmt(args[0]);
    case "isNaN": return typeof args[0] === "number" && isNaN(args[0]) ? 1 : 0;
    case "getInfo": return SIM_UNK;
    case "setThreshold": {
      var im6 = needImg("setThreshold"); var lo = args[0], hi = args[1];
      im6.thr = [lo, hi];
      var pct = simImgPct(im6, lo, hi);
      step(line, "閾値を " + simFmt(lo) + "〜" + simFmt(hi) + " に設定します。この範囲の画素が「対象（前景）」として選ばれます" + (simIsUnk(pct) ? "" : "（モデル画像では全体の約 " + Math.round(pct) + "%）") + "。この時点では画素値そのものは変わりません");
      return SIM_UNK;
    }
    case "setAutoThreshold": {
      var im7 = needImg("setAutoThreshold");
      var method = String(args[0] || "Default"), dark = /dark/i.test(method) || args.some(function(x){ return typeof x === "string" && /dark/i.test(x); });
      var t = simOtsu(im7);
      if (simIsUnk(t)){ step(line, "自動閾値（" + method + "）で閾値を決めます（値は画像依存です）"); im7.thr = null; return SIM_UNK; }
      im7.thr = dark ? [t + 1, 255] : [0, t];
      var pct2 = simImgPct(im7, im7.thr[0], im7.thr[1]);
      step(line, "自動閾値（" + method + "）で閾値 " + (dark ? (t + 1) + "〜255" : "0〜" + t) + " が選ばれます" + (simIsUnk(pct2) ? "" : "（モデルでは前景は全体の約 " + Math.round(pct2) + "%）") + "。方法が " + method.split(" ")[0] + " 以外の場合や実際の画像では値は前後します");
      return SIM_UNK;
    }
    case "getThreshold": {
      var im8 = needImg("getThreshold");
      if (refs[0]) S.scopes[0][refs[0]] = im8.thr ? im8.thr[0] : -1;
      if (refs[1]) S.scopes[0][refs[1]] = im8.thr ? im8.thr[1] : -1;
      step(line, im8.thr ? "現在の閾値 " + im8.thr[0] + "〜" + im8.thr[1] + " を変数に入れます" : "閾値は設定されていないため、変数には -1 が入ります");
      return SIM_UNK;
    }
    case "resetThreshold": { var im9 = needImg("resetThreshold"); im9.thr = null; step(line, "閾値の設定を解除します"); return SIM_UNK; }
    case "setMinAndMax": { needImg("setMinAndMax"); step(line, "表示の明るさ範囲を " + simFmt(args[0]) + "〜" + simFmt(args[1]) + " にします（見た目だけの変更で、画素値は変わりません）"); return SIM_UNK; }
    case "getMinAndMax": {
      var imA = needImg("getMinAndMax"); var rg = simImgRangeNow(imA);
      if (refs[0]) S.scopes[0][refs[0]] = rg ? rg[0] : SIM_UNK;
      if (refs[1]) S.scopes[0][refs[1]] = rg ? rg[1] : SIM_UNK;
      step(line, "画素値の範囲 " + (rg ? rg[0] + "〜" + rg[1] : "（不明）") + " を変数に入れます"); return SIM_UNK;
    }
    case "getStatistics": {
      var imB = needImg("getStatistics"); var st = simStats(imB);
      var names = ["面積", "平均", "最小値", "最大値", "標準偏差"];
      var vals = st ? [st.area, Math.round(st.mean * 100) / 100, st.min, st.max, Math.round(st.std * 100) / 100] : [SIM_UNK, SIM_UNK, SIM_UNK, SIM_UNK, SIM_UNK];
      for (var gi = 0; gi < 5; gi++) if (refs[gi]) writeRef(S, refs[gi], vals[gi]);
      if (refs[5]){ var h256 = simHist256(imB); writeRef(S, refs[5], h256 ? h256.map(function(p){ return Math.round(p / 100 * (st ? st.area : 0)); }) : SIM_UNK); }
      step(line, "画像全体の統計（" + names.map(function(nm, i){ return nm + " " + simFmt(vals[i]); }).join("、") + (typeof (st && st.area) === "number" ? "" : "") + "）を変数に入れます" + (imB.buckets ? "" : "（分布が不明な画像のため、値は目安です）"));
      return SIM_UNK;
    }
    case "getHistogram": {
      var imC = needImg("getHistogram");
      var nBins = typeof args[2] === "number" ? args[2] : 256;
      var hist = simHist256(imC), total = (typeof imC.w === "number" && typeof imC.h === "number") ? imC.w * imC.h : 262144;
      if (!hist){
        if (refs[0]) writeRef(S, refs[0], SIM_UNK);
        if (refs[1]) writeRef(S, refs[1], SIM_UNK);
        step(line, "ヒストグラムを取得します（この画像は分布が不明なため、値は実行時に決まります）");
        return SIM_UNK;
      }
      var counts = [], values = [], per = 256 / nBins;
      for (var bi = 0; bi < nBins; bi++){
        var acc = 0; for (var bj = 0; bj < per; bj++) acc += hist ? hist[Math.floor(bi * per + bj)] || 0 : 0;
        counts.push(Math.round(acc / 100 * total)); values.push(Math.round(bi * per));
      }
      var csum = counts.reduce(function(a, b){ return a + b; }, 0);
      if (csum !== total && counts.length){ var mi = 0; counts.forEach(function(cv, i2){ if (cv > counts[mi]) mi = i2; }); counts[mi] += total - csum; }
      if (refs[0]) writeRef(S, refs[0], values);
      if (refs[1]) writeRef(S, refs[1], counts);
      step(line, "ヒストグラム（" + nBins + " 区間）を取得します。画素値ごとの画素数が分かります");
      return SIM_UNK;
    }
    case "getDimensions": case "Stack.getDimensions": {
      var imD = needImg(name);
      var dv = [imD.w, imD.h, imD.channels, imD.slices, imD.frames];
      for (var di = 0; di < 5; di++) if (refs[di]) writeRef(S, refs[di], typeof dv[di] === "number" ? dv[di] : SIM_UNK);
      step(line, "画像の寸法（幅 " + simFmt(dv[0]) + "、高さ " + simFmt(dv[1]) + "、チャンネル " + dv[2] + "、スライス " + dv[3] + "、フレーム " + dv[4] + "）を変数に入れます");
      return SIM_UNK;
    }
    case "getVoxelSize": {
      needImg(name);
      ["1", "1", "1"].forEach(function(_, vi){ if (refs[vi]) writeRef(S, refs[vi], 1); });
      if (refs[3]) writeRef(S, refs[3], "pixel");
      step(line, "ボクセルサイズを取得します（未校正の前提では 1×1×1 pixel です）"); return SIM_UNK;
    }
    case "setVoxelSize": needImg(name); step(line, "ボクセルサイズ（画素の実寸）を設定します。以後の測定はこの校正で換算されます"); return SIM_UNK;
    case "makeRectangle": case "makeOval": {
      var imE = needImg(name);
      S.roi = { type: name === "makeRectangle" ? "rectangle" : "oval", x: args[0], y: args[1], w: args[2], h: args[3] };
      step(line, "位置 (" + simFmt(args[0]) + ", " + simFmt(args[1]) + ") に " + simFmt(args[2]) + "×" + simFmt(args[3]) + " の" + (name === "makeRectangle" ? "矩形" : "楕円") + " ROI を作成します");
      return SIM_UNK;
    }
    case "makeLine": needImg(name); S.roi = { type: "line", x: args[0], y: args[1], w: Math.abs(args[2] - args[0]), h: Math.abs(args[3] - args[1]) }; step(line, "(" + simFmt(args[0]) + ", " + simFmt(args[1]) + ") から (" + simFmt(args[2]) + ", " + simFmt(args[3]) + ") へ直線 ROI を作成します"); return SIM_UNK;
    case "makePolygon": needImg(name); S.roi = { type: "polygon", x: args[0], y: args[1], w: SIM_UNK, h: SIM_UNK }; step(line, "頂点 " + Math.floor(args.length / 2) + " 個の多角形 ROI を作成します"); return SIM_UNK;
    case "makeSelection": needImg(name); S.roi = { type: "selection", x: 0, y: 0, w: SIM_UNK, h: SIM_UNK }; step(line, "点の集まりから ROI を作成します"); return SIM_UNK;
    case "selectionType": {
      if (!S.roi){ step(line, "ROI は選択されていません（-1 が返ります）"); return -1; }
      var codes = { rectangle: 0, oval: 1, polygon: 2, point: 9 };
      if (codes[S.roi.type] === undefined){ step(line, "選択中の ROI の種類コードを取得します"); return SIM_UNK; }
      step(line, "選択中の ROI は " + S.roi.type + "（コード " + codes[S.roi.type] + "）です"); return codes[S.roi.type];
    }
    case "getSelectionBounds": {
      var imF = needImg(name);
      var b = S.roi ? [S.roi.x, S.roi.y, S.roi.w, S.roi.h] : [0, 0, imF.w, imF.h];
      for (var si = 0; si < 4; si++) if (refs[si]) writeRef(S, refs[si], b[si]);
      step(line, S.roi ? "ROI の外接矩形（x " + simFmt(b[0]) + "、y " + simFmt(b[1]) + "、幅 " + simFmt(b[2]) + "、高さ " + simFmt(b[3]) + "）を変数に入れます" : "ROI がないため、画像全体の範囲を変数に入れます");
      return SIM_UNK;
    }
    case "roiManager": return simRoiManager(S, e, args, H);
    case "setSlice": {
      var imG = needImg("setSlice"); var nn = args[0];
      if (typeof nn === "number" && (nn < 1 || nn > imG.slices)) warn(line, "setSlice(" + nn + ") はスライス数 " + imG.slices + " の範囲外です", "ImageJ では範囲外の指定は無視されるか、端に寄せられます。");
      else { imG.slice = nn; step(line, "表示スライスを " + nn + " 枚目に切り替えます"); }
      return SIM_UNK;
    }
    case "getSliceNumber": { var imH = needImg("getSliceNumber"); step(line, "現在のスライス番号 " + imH.slice + " を取得します"); return imH.slice; }
    case "Stack.getPosition": {
      var imI = needImg(name);
      if (refs[0]) writeRef(S, refs[0], 1); if (refs[1]) writeRef(S, refs[1], imI.slice); if (refs[2]) writeRef(S, refs[2], 1);
      step(line, "スタック内の現在位置（チャンネル 1、スライス " + imI.slice + "、フレーム 1）を変数に入れます"); return SIM_UNK;
    }
    case "Stack.setPosition": { var imJ = needImg(name); if (typeof args[1] === "number" && args[1] >= 1 && args[1] <= imJ.slices) imJ.slice = args[1]; step(line, "スタックの表示位置を切り替えます"); return SIM_UNK; }
    case "getPixel": {
      var imK = needImg("getPixel");
      var key = args[0] + "," + args[1];
      if (Object.prototype.hasOwnProperty.call(imK.pix, key)){ step(line, "(" + args[0] + ", " + args[1] + ") の画素値 " + imK.pix[key] + "（このコードで書き込んだ値）を読みます"); return imK.pix[key]; }
      step(line, "(" + simFmt(args[0]) + ", " + simFmt(args[1]) + ") の画素値を読みます（値は画像依存です）");
      return SIM_UNK;
    }
    case "setPixel": {
      var imL = needImg("setPixel");
      if (typeof imL.w === "number" && (args[0] < 0 || args[0] >= imL.w || args[1] < 0 || args[1] >= imL.h)){ warn(line, "setPixel の座標が画像の範囲外です", "範囲外への書き込みは ImageJ では無視されます。"); return SIM_UNK; }
      imL.pix[args[0] + "," + args[1]] = args[2];
      step(line, "(" + simFmt(args[0]) + ", " + simFmt(args[1]) + ") の画素値を " + simFmt(args[2]) + " に書き換えます");
      return SIM_UNK;
    }
    case "changeValues": {
      var imM = needImg("changeValues");
      simPushOp(imM, function(v){ return v >= args[0] && v <= args[1] ? args[2] : v; });
      step(line, "画素値が " + simFmt(args[0]) + "〜" + simFmt(args[1]) + " の画素を、すべて " + simFmt(args[2]) + " に置き換えます");
      return SIM_UNK;
    }
    case "getResult": {
      var row = S.results[args[1]];
      if (!row || row[args[0]] === undefined){ warn(line, "getResult で結果表にない値が指定されています", "行番号や列名を確認してください。モデルでは値を返せません。"); return SIM_UNK; }
      step(line, "結果表の " + args[1] + " 行目「" + args[0] + "」= " + simFmt(row[args[0]]) + " を取得します");
      return row[args[0]];
    }
    case "setResult": {
      var ri = args[1];
      while (S.results.length <= ri) S.results.push({ Label: img() ? img().title : "" });
      S.results[ri][args[0]] = args[2];
      step(line, "結果表の " + ri + " 行目に「" + args[0] + "」= " + simFmt(args[2]) + " を書き込みます");
      return SIM_UNK;
    }
    case "getResultLabel": { var rr = S.results[args[0]]; step(line, "結果表 " + simFmt(args[0]) + " 行目のラベルを取得します"); return rr ? rr.Label : SIM_UNK; }
    case "getProfile": needImg("getProfile"); step(line, "選択中の直線や ROI に沿った画素値の並び（プロファイル）を取得します（値は画像依存です）"); return SIM_UNK;
    case "File.exists": step(line, "ファイル「" + simFmt(args[0]) + "」があるか調べます（結果は実行環境に依存します）"); return SIM_UNK;
    case "Color.getLut": { for (var ci = 0; ci < 3; ci++) if (refs[ci]) writeRef(S, refs[ci], new Array(256).fill(0).map(function(_, i){ return i; })); step(line, "現在の表示 LUT（色の対応表）を変数に入れます"); return SIM_UNK; }
  }
  if (name.indexOf("Dialog.") === 0){
    if (name === "Dialog.create") step(line, "入力ダイアログを作り始めます");
    else if (name === "Dialog.show") step(line, "ダイアログが表示され、ユーザーの入力を待ちます（モデルでは既定値で進むものとして扱います）");
    else if (name === "Dialog.getNumber" || name === "Dialog.getString" || name === "Dialog.getChoice"){ step(line, "ダイアログの入力値を取得します（値は入力依存です）"); return SIM_UNK; }
    else step(line, "ダイアログに項目を追加します");
    return SIM_UNK;
  }
  if (name.indexOf("File.") === 0){ step(line, "ファイル操作（" + name + "）を行います（内容は実行環境に依存します）"); return SIM_UNK; }
  if (!f0 && !SIM_EXTRA[name]) throw simErr(line, "「" + name + "」は定義されていない関数です", "関数リファレンスにも、このコード内の function 定義にもありません。綴り違いか、定義のし忘れの可能性があります。");
  descStep();
  return SIM_UNK;
}
function writeRef(S, name, v){ S.scopes[0][name] = v; }
function simRoiManager(S, e, args, H){
  var cmd = String(args[0] || "").toLowerCase(), line = e.line, step = H.step, warn = H.warn;
  if (cmd === "count"){ step(line, "ROI Manager の登録数は " + S.roiList.length + " 件です"); return S.roiList.length; }
  if (cmd === "select"){
    var ix = args[1];
    if (typeof ix !== "number" || ix < 0 || ix >= S.roiList.length){ warn(line, "roiManager(\"select\", " + simFmt(ix) + ") の番号が登録数 " + S.roiList.length + " の範囲外です", "ImageJ では選択が変わらないか、エラーになります。ループの上限と登録数を確認してください。"); return SIM_UNK; }
    S.roi = S.roiList[ix]; step(line, "ROI Manager の " + ix + " 番目の ROI を選択します"); return SIM_UNK;
  }
  if (cmd === "add"){
    if (!S.roi){ warn(line, "roiManager(\"add\") ですが、選択中の ROI がありません", "先に ROI を描くか makeRectangle などで作成してください。"); return SIM_UNK; }
    S.roiList.push(S.roi); step(line, "現在の ROI を ROI Manager に登録します（登録数は " + S.roiList.length + " 件になります）"); return SIM_UNK;
  }
  if (cmd === "reset"){ S.roiList = []; step(line, "ROI Manager の登録をすべて消します"); return SIM_UNK; }
  if (cmd === "deselect"){ S.roi = null; step(line, "ROI の選択を解除します"); return SIM_UNK; }
  if (cmd === "measure"){
    S.roiList.forEach(function(r){ S.results.push(simResultRow(S, r)); });
    step(line, "登録された全 ROI（" + S.roiList.length + " 件）を測定し、結果表に行を追加します"); return SIM_UNK;
  }
  step(line, "ROI Manager の操作「" + simFmt(args[0]) + "」を行います"); return SIM_UNK;
}
function simResultRow(S, roi){
  var im = S.images[S.active];
  var st = im ? simStats(im) : null;
  return { Label: im ? im.title : "", Area: roi && typeof roi.w === "number" && typeof roi.h === "number" ? roi.w * roi.h : (st ? st.area : SIM_UNK), Mean: st ? Math.round(st.mean * 100) / 100 : SIM_UNK, Min: st ? st.min : SIM_UNK, Max: st ? st.max : SIM_UNK };
}


/* --- run() コマンドの説明と効果 --- */
function simFoldOps(img){
  if (!img.buckets || !img.mapOps.length){ img.mapOps = []; return; }
  img.buckets = img.buckets.map(function(b){
    var a = simApplyOps(img, b[0]), c = simApplyOps(img, b[1]);
    return [Math.min(a, c), Math.max(a, c), b[2]];
  }).sort(function(x, y){ return x[0] - y[0]; });
  img.mapOps = [];
}
var SIM_CMD_KEYS = ["8-bit", "16-bit", "32-bit", "RGB Color", "Convert to Mask", "Make Binary", "Invert", "Measure", "Analyze Particles", "Watershed", "Gaussian Blur", "Median", "Mean", "Despeckle", "Sharpen", "Find Edges", "Remove Outliers", "Unsharp Mask", "Convolve", "Subtract Background", "Z Project", "Split Channels", "Merge Channels", "Duplicate", "Close All", "Close", "Crop", "Scale", "Rotate 90 Degrees Right", "Rotate 90 Degrees Left", "Flip Horizontally", "Flip Vertically", "Set Scale", "Set Measurements", "Scale Bar", "Enhance Contrast", "Apply LUT", "Threshold", "Erode", "Dilate", "Fill Holes", "Skeletonize", "Outline", "Distance Map", "Find Maxima", "Plot Profile", "Histogram", "FFT", "Bandpass Filter", "Select All", "Select None", "Restore Selection", "Create Selection", "Draw", "Fill", "Clear", "Grays", "Fire", "Ice", "Spectrum", "Add", "Subtract", "Multiply", "Divide", "Min", "Max", "AND", "OR", "XOR", "Gamma", "Log", "Exp", "Square", "Square Root", "Abs", "Stack to Images", "Images to Stack", "Line Width", "Properties", "Rotate", "Translate", "Canvas Size", "Enlarge", "Save", "Straighten", "Interpolate"];
function simLev(a, b){
  var d = [], i, j;
  for (i = 0; i <= b.length; i++) d.push([i]);
  for (j = 0; j <= a.length; j++) d[0][j] = j;
  for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1));
  return d[b.length][a.length];
}
function simRunCmd(S, cmdRaw, opt, line, H){
  var step = H.step, warn = H.warn;
  function img(){ return H.img(); }
  function needImg(what){ return H.needImg(line, what); }
  if (typeof cmdRaw !== "string"){ step(line, "run() のコマンドが実行時の値で決まります（説明は省略します）"); return SIM_UNK; }
  var cmd = cmdRaw.trim(), base = cmd.replace(/\.\.\.$/, "").trim();
  opt = typeof opt === "string" ? opt : "";
  function optNum(key){ var m = new RegExp(key + "=([0-9.]+)").exec(opt); return m ? parseFloat(m[1]) : null; }
  function mathOp(label, f, desc){
    var im = needImg("run(\"" + cmd + "\")");
    simPushOp(im, f);
    step(line, desc);
    return SIM_UNK;
  }
  switch (base){
    case "8-bit": case "16-bit": case "32-bit": {
      var im = needImg("run(\"" + cmd + "\")"), target = parseInt(base, 10);
      if (im.bit === target){ step(line, "すでに " + target + " ビットなので、画素値は変わりません"); return SIM_UNK; }
      if (target === 32){ im.bit = 32; im.buckets = null; step(line, "32 ビット（浮動小数）に変換します。画素値は 0.0〜1.0 のような実数で扱われ、分布のモデル計算はここまでとします"); return SIM_UNK; }
      var from = Math.pow(2, im.bit) - 1, to = Math.pow(2, target) - 1;
      if (im.buckets) im.buckets = im.buckets.map(function(b){ return [Math.round(b[0] / from * to), Math.round(b[1] / from * to), b[2]]; });
      im.mapOps = [];
      im.bit = target;
      step(line, target + " ビットに変換します。画素値は 0〜" + to + " の範囲に換算され、" + (target < 16 ? "階調は粗くなります" : "より細かい階調で表されます"));
      return SIM_UNK;
    }
    case "RGB Color": { var im2 = needImg("run"); step(line, "RGB カラーに変換します（表示・保存用）。解析の測定は通常、グレースケールのまま行います"); im2.kind = "RGB"; return SIM_UNK; }
    case "Convert to Mask": case "Make Binary": {
      var im3 = needImg("run(\"" + cmd + "\")");
      if (!im3.thr){ im3.thr = [0, 127]; step(line, "閾値が未設定のため、ImageJ が自動で決めた閾値（モデルでは 0〜127 を前景として計算）を使います"); }
      var fg = simImgPct(im3, im3.thr[0], im3.thr[1]);
      var lo = im3.thr[0], hi = im3.thr[1];
      if (im3.buckets && !simIsUnk(fg)) im3.buckets = [[0, 0, Math.round((100 - fg) * 10) / 10], [255, 255, Math.round(fg * 10) / 10]];
      im3.mapOps.push({ f: function(v){ return v >= lo && v <= hi ? 255 : 0; } });
      im3.kind = "2値（マスク）"; im3.thr = null;
      step(line, "二値化します。閾値 " + lo + "〜" + hi + " の画素は 255（白）、それ以外はすべて 0（黒）になります" + (simIsUnk(fg) ? "" : "（モデルでは白が全体の約 " + Math.round(fg) + "%）") + "。中間の灰色は消えます");
      return SIM_UNK;
    }
    case "Invert": {
      var im4 = needImg("run(\"Invert\")"), mx = Math.pow(2, im4.bit) - 1;
      simPushOp(im4, function(v){ return mx - v; });
      step(line, "画素値を反転します（" + mx + " − 値）。たとえば暗い画素 30 は " + (mx - 30) + " に、明るい画素 200 は " + (mx - 200) + " になります");
      return SIM_UNK;
    }
    case "Measure": {
      var im5 = needImg("run(\"Measure\")");
      var row = simResultRow(S, S.roi);
      S.results.push(row);
      step(line, "測定を実行し、結果表に1行追加します" + (S.roi ? "（対象は選択中の ROI）" : "（対象は画像全体）") + "。モデルでは 面積 " + simFmt(row.Area) + "、平均 " + simFmt(row.Mean) + "、最小 " + simFmt(row.Min) + "、最大 " + simFmt(row.Max) + " です（測定項目は Set Measurements の設定に依存します）");
      return SIM_UNK;
    }
    case "Analyze Particles": {
      var im6 = needImg("run(\"Analyze Particles\")");
      var mSz = /size=([0-9.]+)-([0-9.]+|Infinity)/.exec(opt);
      if (im6.kind !== "2値（マスク）" && !im6.thr) warn(line, "Analyze Particles の前に閾値設定（または二値化）がありません", "閾値がないと対象を背景と区別できず、正しく数えられません。setAutoThreshold や setThreshold を前に置いてください。");
      step(line, "粒子解析を実行します。二値化された白い連結領域を1つずつ数え、大きさや形状を結果表に出します" + (mSz ? "（対象の大きさは " + mSz[1] + "〜" + mSz[2] + "）" : "") + (/summarize/.test(opt) ? "。summarize 指定のため、件数などの要約が Summary 表にも出ます" : "") + "。件数そのものは画像依存のため、モデルでは算出できません");
      return SIM_UNK;
    }
    case "Watershed": {
      var im7 = needImg("run(\"Watershed\")");
      if (im7.kind !== "2値（マスク）") warn(line, "Watershed は二値画像に使う処理です", "先に Convert to Mask などで二値化してください。");
      step(line, "くっついた粒子を、細いくびれの部分で切り離します（距離変換を使った分離処理）");
      return SIM_UNK;
    }
    case "Gaussian Blur": { var im8 = needImg("run"); im8.spatial = true; var sg = optNum("sigma"); step(line, "ガウスぼかしをかけます" + (sg ? "（sigma=" + sg + "）" : "") + "。画素が周囲となじみ、細かいノイズが減る一方、輪郭も少し甘くなります"); return SIM_UNK; }
    case "Median": case "Mean": { var im9 = needImg("run"); im9.spatial = true; var rd = optNum("radius"); step(line, (base === "Median" ? "メディアン" : "平均") + "フィルタをかけます" + (rd ? "（半径 " + rd + "）" : "") + "。ノイズが減ります"); return SIM_UNK; }
    case "Despeckle": { var imA = needImg("run"); imA.spatial = true; step(line, "孤立したノイズ画素を取り除きます（メディアンフィルタ相当）"); return SIM_UNK; }
    case "Sharpen": { var imB = needImg("run"); imB.spatial = true; step(line, "輪郭を強調します。ノイズも目立ちやすくなります"); return SIM_UNK; }
    case "Find Edges": { var imC = needImg("run"); imC.spatial = true; step(line, "明るさの変化が大きい場所（輪郭）だけを抽出します。平らな部分はほぼ黒になります"); return SIM_UNK; }
    case "Remove Outliers": { var imD = needImg("run"); imD.spatial = true; step(line, "周囲から極端に外れた画素（飛び値ノイズ）だけを周囲の値で置き換えます"); return SIM_UNK; }
    case "Unsharp Mask": { var imE = needImg("run"); imE.spatial = true; step(line, "アンシャープマスクで輪郭を強調します"); return SIM_UNK; }
    case "Convolve": { var imF = needImg("run"); imF.spatial = true; step(line, "指定したカーネルで畳み込み（フィルタ処理）をします"); return SIM_UNK; }
    case "Subtract Background": { var imG = needImg("run"); imG.spatial = true; var rb = optNum("rolling"); step(line, "背景のムラ（シェーディング）を推定して差し引きます" + (rb ? "（rolling ball 半径 " + rb + "）" : "") + "。対象の明るさが均一な背景の上にそろいます"); return SIM_UNK; }
    case "Z Project": {
      var imH = needImg("run(\"Z Project\")");
      var proj = /projection=\[([^\]]+)\]/.exec(opt), pn = proj ? proj[1] : "Max Intensity";
      if (imH.slices <= 1){ step(line, "Z 投影（" + pn + "）ですが、スライスが1枚なので結果はほぼ元の画像と同じです"); return SIM_UNK; }
      imH.slices = 1;
      step(line, "スタックを Z 方向に投影して1枚にします（" + pn + "）" + (pn.indexOf("Max") >= 0 ? "。各画素で最も明るいスライスの値が残り、焦点の合った信号を拾いやすい反面、ノイズの最大値も拾います" : pn.indexOf("Sum") >= 0 ? "。各画素でスライスの合計になり、全体に明るくなります" : "。各画素でスライスの平均を取ります"));
      return SIM_UNK;
    }
    case "Split Channels": {
      var imI = needImg("run(\"Split Channels\")");
      if (imI.channels <= 1){ step(line, "チャンネル分割ですが、この画像はチャンネルが1つなので分割されません（実際の複合画像ではチャンネルごとの画像に分かれます）"); return SIM_UNK; }
      var parts = [];
      for (var ci = 0; ci < imI.channels; ci++){ var cp = Object.assign({}, imI, { title: "C" + (ci + 1) + "-" + imI.title, channels: 1, pix: {}, buckets: imI.buckets ? imI.buckets.slice() : null, mapOps: imI.mapOps.slice() }); parts.push(cp); }
      S.images.splice.apply(S.images, [S.active, 1].concat(parts)); S.active = S.active;
      step(line, "チャンネルごとに " + parts.length + " 枚の画像へ分割します");
      return SIM_UNK;
    }
    case "Merge Channels...": step(line, "複数チャンネルを1枚の複合画像に合成します"); return SIM_UNK;
    case "Duplicate": {
      var imJ = needImg("run(\"Duplicate\")");
      var tm = /title=([^\s]+)/.exec(opt);
      var dup = Object.assign({}, imJ, { title: tm ? tm[1] : imJ.title + "-1", pix: {}, buckets: imJ.buckets ? imJ.buckets.slice() : null, mapOps: imJ.mapOps.slice() });
      S.images.push(dup);
      step(line, "画像のコピー「" + dup.title + "」を作ります（元画像は変わりません）");
      return SIM_UNK;
    }
    case "Close All": S.images = []; S.active = -1; step(line, "開いている画像をすべて閉じます"); return SIM_UNK;
    case "Close": {
      var imK = img();
      if (imK){ step(line, "画像「" + imK.title + "」を閉じます"); S.images.splice(S.active, 1); if (S.active >= S.images.length) S.active = S.images.length - 1; }
      return SIM_UNK;
    }
    case "Crop": {
      var imL = needImg("run(\"Crop\")");
      if (S.roi && typeof S.roi.w === "number"){ imL.w = S.roi.w; imL.h = S.roi.h; step(line, "ROI の範囲で切り抜きます（新しい大きさは " + imL.w + "×" + imL.h + "）"); S.roi = null; }
      else step(line, "切り抜きですが、ROI がないため変化はありません");
      return SIM_UNK;
    }
    case "Scale": { var imM = needImg("run"); var fx = optNum("x"); if (fx && typeof imM.w === "number"){ imM.w = Math.round(imM.w * fx); imM.h = Math.round(imM.h * fx); } step(line, "画像を拡大・縮小します" + (fx ? "（倍率 " + fx + "、新しい大きさ " + imM.w + "×" + imM.h + "）" : "")); imM.spatial = true; return SIM_UNK; }
    case "Rotate 90 Degrees Right": case "Rotate 90 Degrees Left": { var imN = needImg("run"); var tmp = imN.w; imN.w = imN.h; imN.h = tmp; step(line, "画像を90度回転します（幅と高さが入れ替わります）"); return SIM_UNK; }
    case "Flip Horizontally": case "Flip Vertically": needImg("run"); step(line, "画像を" + (base.indexOf("Horizontally") >= 0 ? "左右" : "上下") + "に反転します（画素値そのものは変わりません）"); return SIM_UNK;
    case "Set Scale": { var ds = optNum("distance"), kn = optNum("known"); step(line, "スケール校正を設定します" + (ds && kn ? "（" + ds + " px = " + kn + " 単位）" : "") + "。以後の測定結果は実寸で出ます"); return SIM_UNK; }
    case "Set Measurements": step(line, "測定する項目（面積・平均・重心など）を設定します。以後の Measure の結果表に反映されます"); return SIM_UNK;
    case "Scale Bar": { var bw = optNum("width"); step(line, "スケールバーを画像に焼き込みます" + (bw ? "（幅 " + bw + " 単位）" : "") + "。画素として描かれるため、後から消せません"); return SIM_UNK; }
    case "Enhance Contrast": {
      var imO = needImg("run(\"Enhance Contrast\")");
      var rg = simImgRange(imO);
      if (rg && rg[1] > rg[0]){ var mn2 = rg[0], sc = 255 / (rg[1] - rg[0]); simPushOp(imO, function(v){ return (v - mn2) * sc; }); }
      step(line, "コントラストを広げます。最も暗い画素が 0、最も明るい画素が 255 付近になるよう画素値を引き伸ばします");
      return SIM_UNK;
    }
    case "Apply LUT": step(line, "現在の表示 LUT（色の対応）を画素値に適用します。閾値が設定されている場合は、その見た目が画素値に焼き込まれます"); return SIM_UNK;
    case "Threshold": warn(line, "run(\"Threshold...\") はダイアログを開く操作です", "マクロでは通常、setThreshold や setAutoThreshold で数値を直接指定します。"); step(line, "Threshold ダイアログが開きます"); return SIM_UNK;
    case "Erode": case "Dilate": case "Fill Holes": case "Skeletonize": case "Outline": case "Distance Map": {
      var imP = needImg("run(\"" + cmd + "\")");
      if (imP.kind !== "2値（マスク）") warn(line, cmd + " は二値画像向けの処理です", "先に二値化してください。グレースケールでは意図しない結果になります。");
      var txts = { "Erode": "白い領域の輪郭を1画素ずつ削ります（細い部分は消えます）", "Dilate": "白い領域の輪郭を1画素ずつ広げます（近い粒子はくっつきます）", "Fill Holes": "白い領域の中の黒い穴を埋めます", "Skeletonize": "白い領域を1画素幅の骨格（中心線）まで細くします", "Outline": "白い領域の輪郭線だけを残します", "Distance Map": "各画素について、背景までの距離を明るさにした画像に変換します" };
      step(line, txts[base]); return SIM_UNK;
    }
    case "Find Maxima": needImg("run"); step(line, "局所的に最も明るい点（極大点）を検出します。件数は画像とノイズ許容値に依存するため、モデルでは算出できません"); return SIM_UNK;
    case "Plot Profile": needImg("run"); step(line, "プロファイルのグラフが新しいウィンドウに表示されます"); return SIM_UNK;
    case "Histogram": needImg("run"); step(line, "ヒストグラムのウィンドウが新しく開きます"); return SIM_UNK;
    case "FFT": case "Bandpass Filter": { var imQ = needImg("run"); imQ.spatial = true; step(line, "周波数領域での処理（" + base + "）を行います。周期的なノイズの除去などに使います"); return SIM_UNK; }
    case "Select All": { var imR = needImg("run"); S.roi = { type: "rectangle", x: 0, y: 0, w: imR.w, h: imR.h }; step(line, "画像全体を ROI として選択します"); return SIM_UNK; }
    case "Select None": S.roi = null; step(line, "ROI の選択を解除します"); return SIM_UNK;
    case "Restore Selection": step(line, "直前の ROI を復元します"); return SIM_UNK;
    case "Create Selection": step(line, "閾値の範囲から、輪郭に沿った ROI を作成します"); return SIM_UNK;
    case "Draw": step(line, "現在の ROI の輪郭を画像に描き込みます"); return SIM_UNK;
    case "Fill": step(line, "現在の ROI の中を前景色で塗りつぶします"); return SIM_UNK;
    case "Clear": step(line, "現在の ROI の中を背景色で消去します"); return SIM_UNK;
    case "Grays": case "Fire": case "Ice": case "Spectrum": step(line, "表示 LUT を「" + base + "」に変えます（見た目だけの変更で、画素値は変わりません）"); return SIM_UNK;
    case "Add": return mathOp(base, function(v){ return v + (optNum("value") || 0); }, "全画素に " + (optNum("value") || 0) + " を足します。255 を超えた分は 255 で止まります（8ビットの場合）");
    case "Subtract": return mathOp(base, function(v){ return v - (optNum("value") || 0); }, "全画素から " + (optNum("value") || 0) + " を引きます。0 未満は 0 で止まります");
    case "Multiply": return mathOp(base, function(v){ return v * (optNum("value") || 1); }, "全画素に " + (optNum("value") || 1) + " を掛けます。明るさ全体が比例して変わります");
    case "Divide": return mathOp(base, function(v){ return v / (optNum("value") || 1); }, "全画素を " + (optNum("value") || 1) + " で割ります");
    case "Gamma": { var gv = optNum("value") || 1; return mathOp(base, function(v){ return 255 * Math.pow(Math.max(0, v) / 255, gv); }, "ガンマ補正（値 " + gv + "）をかけます。中間の明るさが" + (gv < 1 ? "持ち上がり" : "沈み") + "、黒と白の端はほぼ変わりません"); }
    case "Min": return mathOp(base, function(v){ return Math.min(v, optNum("value") || 0); }, "画素値を " + (optNum("value") || 0) + " 以下に切りそろえます（それより明るい画素はすべてその値になります）");
    case "Max": return mathOp(base, function(v){ return Math.max(v, optNum("value") || 0); }, "画素値を " + (optNum("value") || 0) + " 以上に切りそろえます");
    case "AND": case "OR": case "XOR": step(line, "画素値にビット演算（" + base + "）を行います"); return SIM_UNK;
    case "Log": return mathOp(base, function(v){ return v > 0 ? 32.8 * Math.log(v) : 0; }, "画素値に対数変換をかけます。暗い部分の差が広がります");
    case "Exp": return mathOp(base, function(v){ return Math.exp(v / 32.8); }, "画素値に指数変換をかけます。明るい部分の差が広がります");
    case "Square": return mathOp(base, function(v){ return v * v / 255; }, "画素値を2乗します（明るい部分ほど差が広がります）");
    case "Square Root": return mathOp(base, function(v){ return Math.sqrt(Math.max(0, v)) * 16; }, "画素値の平方根を取ります（暗い部分の差が広がります）");
    case "Abs": return mathOp(base, function(v){ return Math.abs(v); }, "画素値の絶対値を取ります");
    case "Stack to Images": step(line, "スタックをスライスごとの別画像にばらします"); return SIM_UNK;
    case "Images to Stack": step(line, "開いている画像を1つのスタックにまとめます"); return SIM_UNK;
    case "Line Width": step(line, "線の太さの初期設定を変えます"); return SIM_UNK;
    case "Properties": step(line, "画像のプロパティ（寸法・単位など）のダイアログが開きます"); return SIM_UNK;
    case "Rotate": { var imS = needImg("run"); imS.spatial = true; step(line, "画像を任意の角度で回転します。はみ出し部分は切り取られ、隅には背景が入ります"); return SIM_UNK; }
    case "Translate": step(line, "画像をずらします（ずれた分、反対側には背景が入ります）"); return SIM_UNK;
    case "Canvas Size": step(line, "キャンバス（画像の枠）の大きさを変えます"); return SIM_UNK;
    case "Enlarge": step(line, "ROI を指定量だけ拡大・縮小します"); return SIM_UNK;
    case "Save": step(line, "画像を現在のファイル名で上書き保存します"); return SIM_UNK;
    case "Straighten": step(line, "選択した直線が水平になるよう画像を回転・切り抜きします"); return SIM_UNK;
    case "Interpolate": step(line, "ROI の輪郭をなめらかに補間します"); return SIM_UNK;
  }
  var best = null, bestD = 3;
  SIM_CMD_KEYS.forEach(function(k){ var d = simLev(base.toLowerCase(), k.toLowerCase()); if (d < bestD){ bestD = d; best = k; } });
  if (best) warn(line, "コマンド「" + cmd + "」は見つかりませんでした", "もしかして「" + best + "」ですか。ImageJ では存在しないコマンド名だとエラーになります。");
  step(line, "メニューコマンド「" + cmd + "」を実行します" + (opt ? "（オプション：" + opt + "）" : "") + "（このコマンドの詳しい説明は未収録のため、一般的な説明に留めます）");
  return SIM_UNK;
}

/* ---------- terms ---------- */
var termFilter = { cat: "all", kw: "" };
function vTerms(){
  setNav("terms");
  var cats = Object.keys(TCATS);
  var chips = ['<button type="button" class="chip' + (termFilter.cat === "all" ? " on" : "") + '" data-tcat="all">すべて</button>']
    .concat(cats.map(function(c){ return '<button type="button" class="chip' + (termFilter.cat === c ? " on" : "") + '" data-tcat="' + c + '">' + esc(TCATS[c]) + "</button>"; })).join("");
  var kw = norm(termFilter.kw);
  var list = TERMS.filter(function(t){
    if (termFilter.cat !== "all" && t.cat !== termFilter.cat) return false;
    if (!kw) return true;
    return norm(t.t + " " + (t.en || "") + " " + (t.aliases || []).join(" ") + " " + t.d).indexOf(kw) >= 0;
  });
  view.innerHTML = '<h1 class="page">用語集</h1>' +
    '<div class="toolbar"><input type="search" id="tKw" placeholder="用語を検索（例：しきい値、LUT）" value="' + esc(termFilter.kw) + '" aria-label="用語検索"></div>' +
    '<div class="chips">' + chips + "</div>" +
    (list.length ? '<div class="card-list">' + list.map(function(t){
      return '<a class="card" href="#/term/' + encodeURIComponent(t.t) + '"><span class="tag">' + esc(TCATS[t.cat] || "") + "</span> <b>" + esc(t.t) + "</b> <span style='color:var(--faint);font-size:13px'>" + esc(t.en || "") + "</span><p>" + esc(t.d) + "</p></a>";
    }).join("") + "</div>" : '<div class="empty">該当する用語がありません。</div>');
  document.getElementById("tKw").addEventListener("input", function(){ termFilter.kw = this.value; vTerms(); var el = document.getElementById("tKw"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
  view.querySelectorAll("[data-tcat]").forEach(function(b){ b.addEventListener("click", function(){ termFilter.cat = b.getAttribute("data-tcat"); vTerms(); }); });
}
function vTerm(name){
  setNav("terms");
  var t = termByName(name);
  if (!t){ view.innerHTML = '<div class="empty">用語が見つかりません。<a href="#/terms">用語集へ</a></div>'; return; }
  var html = '<p class="crumb"><a href="#/terms">用語集</a> ＞ ' + esc(TCATS[t.cat] || "") + '</p><article class="article term-detail">' +
    '<p class="meta-line">' + esc(TCATS[t.cat] || "") + "</p><h1>" + esc(t.t) + "</h1>" +
    '<p class="ts-en">' + esc(t.en || "") + (t.aliases && t.aliases.length ? "　／　別名：" + t.aliases.map(esc).join("、") : "") + "</p>" +
    '<p class="lead">' + linkTerms(t.d, 4) + "</p>";
  if (t.detail) html += paras([t.detail], 8);
  if (t.vs) html += '<div class="vs-box"><span class="kv">混同しやすい用語との違い</span><p style="margin:4px 0 0">' + linkTerms(t.vs, 6) + "</p></div>";
  if (t.ex) html += '<div class="box box-points"><h3>ImageJでの例</h3><p>' + linkTerms(t.ex, 6) + "</p></div>";
  html += srcLine(t.src) + "</article>" + relTerms(t.related);
  view.innerHTML = html;
}

/* ---------- quiz ---------- */
var quiz = null; /* {list:[{q, order:[choiceIdx...], correctPos}], i, answered:{}, score} */
function wrongIds(){ return QUESTIONS.filter(function(q){ var h = store.hist[q.id]; return h && h.lastWrong; }).map(function(q){ return q.id; }); }
function vQuizSetup(){
  setNav("quiz");
  var cats = Object.keys(QCATS);
  var wrong = wrongIds().length;
  view.innerHTML = '<h1 class="page">問題</h1>' +
    '<div class="quiz-setup"><form id="qForm">' +
    '<fieldset><legend>モード</legend><div class="radio-row">' +
    '<label><input type="radio" name="mode" value="all" checked> 全問</label>' +
    '<label><input type="radio" name="mode" value="cat"> カテゴリ別</label>' +
    '<label><input type="radio" name="mode" value="bm"> ブックマークのみ（' + store.bm.length + '問）</label>' +
    '<label><input type="radio" name="mode" value="wrong"> 間違い復習（' + wrong + '問）</label></div></fieldset>' +
    '<fieldset id="catFs" hidden><legend>カテゴリ</legend><div class="radio-row">' +
    cats.map(function(c, i){ return '<label><input type="radio" name="qcat" value="' + c + '"' + (i === 0 ? " checked" : "") + "> " + esc(QCATS[c]) + "</label>"; }).join("") + "</div></fieldset>" +
    '<p><button type="submit" class="btn primary">演習をはじめる</button></p></form>' +
    '<p class="score-line">学習履歴：回答済み ' + Object.keys(store.hist).length + " 問 / 全 " + QUESTIONS.length + " 問" +
    '　<button type="button" class="btn ghost small" id="histReset">履歴と進捗をリセット</button></p></div>';
  var form = document.getElementById("qForm");
  form.addEventListener("change", function(){
    var mode = form.querySelector('input[name="mode"]:checked').value;
    document.getElementById("catFs").hidden = mode !== "cat";
  });
  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var mode = form.querySelector('input[name="mode"]:checked').value;
    var pool = QUESTIONS;
    if (mode === "cat"){ var c = form.querySelector('input[name="qcat"]:checked').value; pool = QUESTIONS.filter(function(q){ return q.cat === c; }); }
    if (mode === "bm") pool = QUESTIONS.filter(function(q){ return store.bm.indexOf(q.id) >= 0; });
    if (mode === "wrong") pool = QUESTIONS.filter(function(q){ var h = store.hist[q.id]; return h && h.lastWrong; });
    if (!pool.length){ alert("対象の問題がありません。"); return; }
    startQuiz(pool);
  });
  document.getElementById("histReset").addEventListener("click", function(){
    if (!confirm("学習履歴・ブックマーク・完了記録をすべて消します。よろしいですか？")) return;
    store = { hist:{}, bm:[], lessonDone:[], docBm:[], lastDoc:{} }; save(); vQuizSetup();
  });
}
function startQuiz(pool){
  quiz = { list: shuffle(pool).map(function(q){
      var order = shuffle([0, 1, 2, 3]);
      return { q: q, order: order, correctPos: order.indexOf(q.a) };
    }), i: 0, picked: {}, score: 0 };
  vQuizRun();
}
function vQuizRun(){
  setNav("quiz");
  if (!quiz) { vQuizSetup(); return; }
  if (quiz.i >= quiz.list.length) { vQuizResult(); return; }
  var item = quiz.list[quiz.i], q = item.q;
  var picked = quiz.picked[quiz.i];
  var bm = store.bm.indexOf(q.id) >= 0;
  var html = '<p class="crumb"><a href="#/quiz">問題</a> ＞ ' + esc(QCATS[q.cat] || "") + '</p><div class="qcard">' +
    '<div class="qhead"><span>' + (quiz.i + 1) + " / " + quiz.list.length + " 問</span>" +
    '<button type="button" class="bm-btn' + (bm ? " on" : "") + '" id="qBm" aria-label="この問題をブックマーク">' + (bm ? "★" : "☆") + "</button></div>" +
    '<p class="qtext">' + linkTerms(q.q, 6) + '</p><div class="choices">';
  item.order.forEach(function(ci, pos){
    var cls = "choice", mark = "";
    if (picked != null){
      if (pos === item.correctPos) cls += " right";
      else if (pos === picked) cls += " wrong";
      mark = pos === item.correctPos ? "◯ " : (pos === picked ? "× " : "");
    } else if (false) {}
    html += '<button type="button" class="choice' + (picked != null && pos === picked && pos !== item.correctPos ? "" : "") + cls.slice(6) + '" data-pos="' + pos + '"' + (picked != null ? " disabled" : "") + '><span class="mk">' + "ABCD"[pos] + '</span><span>' + mark + esc(q.c[ci]).replace(/（/g, "<wbr>（") + "</span></button>";
  });
  html += "</div>";
  if (picked != null){
    var ok = picked === item.correctPos;
    html += '<p class="verdict ' + (ok ? "ok" : "ng") + '">' + (ok ? "正解" : "不正解") + "</p>" +
      '<div class="explain"><h3>解説</h3><p>' + linkTerms(q.e, 8) + "</p>";
    if (q.w){
      html += "<h3>誤答の理由</h3><ul class='wlist'>";
      item.order.forEach(function(ci, pos){
        if (pos === item.correctPos) return;
        var w = q.w[ci];
        if (w) html += "<li>「" + esc(q.c[ci]) + "」― " + linkTerms(w, 3) + "</li>";
      });
      html += "</ul>";
    }
    if (q.lesson && lessonById(q.lesson)) html += '<p><a href="#/lesson/' + q.lesson + '">関連レッスン：' + esc(lessonById(q.lesson).title) + "</a></p>";
    html += srcLine(q.src) + "</div>";
  }
  html += '<div class="qfoot"><span class="score-line">正解 ' + quiz.score + " / 回答 " + Object.keys(quiz.picked).length + "</span>" +
    (quiz.i > 0 ? '<button type="button" class="btn" id="qPrev">← 前へ</button>' : "<span></span>") +
    (picked != null ? '<button type="button" class="btn primary" id="qNext">' + (quiz.i === quiz.list.length - 1 ? "結果を見る" : "次の問題 →") + "</button>" : "") + "</div></div>";
  view.innerHTML = html;
  var bmBtn = document.getElementById("qBm");
  bmBtn.addEventListener("click", function(){
    var i = store.bm.indexOf(q.id);
    if (i >= 0) store.bm.splice(i, 1); else store.bm.push(q.id);
    save(); vQuizRun();
  });
  view.querySelectorAll(".choice").forEach(function(b){
    b.addEventListener("click", function(){
      var pos = Number(b.getAttribute("data-pos"));
      if (quiz.picked[quiz.i] != null) return;
      quiz.picked[quiz.i] = pos;
      var ok = pos === item.correctPos;
      if (ok) quiz.score++;
      var h = store.hist[q.id] || { seen: 0, correct: 0, lastWrong: false };
      h.seen++; if (ok) h.correct++; h.lastWrong = !ok;
      store.hist[q.id] = h; save();
      vQuizRun();
    });
  });
  var prev = document.getElementById("qPrev"); if (prev) prev.addEventListener("click", function(){ quiz.i--; vQuizRun(); });
  var next = document.getElementById("qNext"); if (next) next.addEventListener("click", function(){ quiz.i++; vQuizRun(); });
}
function vQuizResult(){
  var total = quiz.list.length, score = quiz.score;
  var wrongList = quiz.list.filter(function(it, i){ return quiz.picked[i] !== it.correctPos; });
  view.innerHTML = '<div class="qcard"><p class="result-big">' + score + " / " + total + " 問 正解</p>" +
    "<p>正答率 " + Math.round(score / total * 100) + "%</p>" +
    (wrongList.length ? '<h2 class="sec">間違えた問題</h2><div class="card-list">' + wrongList.map(function(it){
      return '<div class="card"><b>' + esc(it.q.q) + "</b><p>正解：「" + esc(it.q.c[it.q.a]) + "」</p></div>";
    }).join("") + "</div>" : "<p>全問正解です。</p>") +
    '<div class="qfoot"><a class="btn" href="#/quiz">モード選択に戻る</a><a class="btn primary" href="#/lessons">レッスンで復習する</a></div></div>';
  quiz = null;
}

/* ---------- search ---------- */
var SYN = {};
TERMS.forEach(function(t){
  var keys = [t.t].concat(t.aliases || []);
  if (t.en) keys.push(t.en);
  keys.forEach(function(k){ var n = norm(k); if (n) (SYN[n] = SYN[n] || []).push(t.t); });
});
function expandQuery(q){
  var terms = norm(q).split(" ").filter(Boolean);
  var matched = [];
  terms.forEach(function(t){
    if (TERM_MAP[t]) { if (matched.indexOf(TERM_MAP[t]) < 0) matched.push(TERM_MAP[t]); return; }
    if (t.length >= 3) Object.keys(TERM_MAP).forEach(function(k){
      if (k.indexOf(t) === 0 || t.indexOf(k) === 0){ var tm = TERM_MAP[k]; if (matched.indexOf(tm) < 0) matched.push(tm); }
    });
  });
  var expanded = terms.slice();
  function push(n){ n = norm(n); if (n && expanded.indexOf(n) < 0) expanded.push(n); }
  matched.forEach(function(tm){
    [tm.t, tm.en].concat(tm.aliases || []).forEach(function(name){
      push(name);
      var stem = norm(name).replace(/（.*）$/, "").replace(/\(.*\)$/, "").replace(/(処理|法|化)$/, "");
      if (stem.length >= 2) push(stem);
    });
  });
  return expanded;
}
function snippet(text, terms){
  var n = norm(text), pos = -1;
  terms.forEach(function(t){ var i = n.indexOf(t); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
  if (pos < 0) pos = 0;
  var start = Math.max(0, pos - 30), out = (start > 0 ? "…" : "") + text.slice(start, start + 110) + (start + 110 < text.length ? "…" : "");
  var safe = esc(out);
  terms.forEach(function(t){
    if (!t) return;
    var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    safe = safe.replace(re, "<mark>$1</mark>");
  });
  return safe;
}
function doSearch(q){
  var terms = expandQuery(q), rawTerms = norm(q).split(" ").filter(Boolean);
  var R = { terms: [], lessons: [], docs: [], questions: [], functions: [] };
  function scoreText(titleHit, bodyText){
    var s = 0, nt = norm(bodyText);
    terms.forEach(function(t){ if (nt.indexOf(t) >= 0) s += 3; });
    rawTerms.forEach(function(t){ if (nt.indexOf(t) >= 0) s += 2; });
    return s + (titleHit || 0);
  }
  TERMS.forEach(function(t){
    var hay = t.t + " " + (t.en || "") + " " + (t.aliases || []).join(" ") + " " + t.d + " " + (t.detail || "");
    var s = scoreText(rawTerms.some(function(x){ return norm(t.t) === x || (t.aliases || []).some(function(a){ return norm(a) === x; }); }) ? 12 : 0, hay);
    if (s > 0) R.terms.push({ t: t, s: s });
  });
  LESSONS.forEach(function(l){
    var body = l.sections.map(function(x){ return x.b.join(" "); }).join(" ");
    var s = scoreText(rawTerms.some(function(x){ return norm(l.title).indexOf(x) >= 0; }) ? 10 : 0, l.title + " " + l.lead + " " + body);
    if (s > 0) R.lessons.push({ l: l, s: s, body: l.lead + " " + body });
  });
  DOCS.forEach(function(c){
    c.entries.forEach(function(e){
      var body = e.body.join(" ") + " " + (e.points || []).join(" ");
      var s = scoreText(rawTerms.some(function(x){ return norm(e.title).indexOf(x) >= 0; }) ? 10 : 0, e.title + " " + (e.menu || "") + " " + body);
      if (s > 0) R.docs.push({ c: c, e: e, s: s, body: body });
    });
  });
  QUESTIONS.forEach(function(qq){
    var hay = qq.q + " " + qq.c.join(" ") + " " + qq.e;
    var s = scoreText(0, hay);
    if (s > 0) R.questions.push({ q: qq, s: s, body: qq.q });
  });
  FUNCTIONS.forEach(function(f){
    var hay = f.name + " " + f.sig + " " + f.desc;
    var s = scoreText(rawTerms.some(function(x){ return norm(f.name) === x; }) ? 12 : 0, hay);
    if (s > 0) R.functions.push({ f: f, s: s, body: f.desc });
  });
  Object.keys(R).forEach(function(k){ R[k].sort(function(a, b){ return b.s - a.s; }); R[k] = R[k].slice(0, 8); });
  return { R: R, terms: terms };
}
function vSearch(q){
  setNav("");
  var res = doSearch(q), R = res.R, total = R.terms.length + R.lessons.length + R.docs.length + R.questions.length + R.functions.length;
  var html = '<h1 class="page">検索結果</h1><p class="page-sub">「' + esc(q) + '」― ' + total + " 件</p>";
  if (!total) html += '<div class="empty">見つかりませんでした。表記を変える（例：しきい値／閾値／threshold）、または短い語で試してください。</div>';
  if (R.terms.length) html += '<div class="sr-group"><h2 class="sec">用語</h2>' + R.terms.map(function(r){
    return '<a class="sr-item" href="#/term/' + encodeURIComponent(r.t.t) + '"><span class="sr-kind">用語</span><b>' + esc(r.t.t) + "</b> <span style='color:var(--faint);font-size:13px'>" + esc(r.t.en || "") + "</span><p>" + snippet(r.t.d, res.terms) + "</p></a>";
  }).join("") + "</div>";
  if (R.docs.length) html += '<div class="sr-group"><h2 class="sec">ドキュメント</h2>' + R.docs.map(function(r){
    return '<a class="sr-item" href="#/doc/' + r.c.id + "/" + r.e.id + '"><span class="sr-kind">文書</span><b>' + esc(r.e.title) + "</b><p>" + snippet(r.body, res.terms) + "</p></a>";
  }).join("") + "</div>";
  if (R.lessons.length) html += '<div class="sr-group"><h2 class="sec">レッスン</h2>' + R.lessons.map(function(r){
    return '<a class="sr-item" href="#/lesson/' + r.l.id + '"><span class="sr-kind">レッスン</span><b>' + esc(r.l.title) + "</b><p>" + snippet(r.body, res.terms) + "</p></a>";
  }).join("") + "</div>";
  if (R.questions.length) html += '<div class="sr-group"><h2 class="sec">問題</h2>' + R.questions.map(function(r){
    return '<a class="sr-item" href="#/quiz"><span class="sr-kind">問題</span><b>' + esc(r.q.q) + "</b><p>" + snippet(r.q.e, res.terms) + "</p></a>";
  }).join("") + "</div>";
  if (R.functions.length) html += '<div class="sr-group"><h2 class="sec">関数</h2>' + R.functions.map(function(r){
    return '<a class="sr-item" href="#/function/' + encodeURIComponent(r.f.name) + '"><span class="sr-kind">関数</span><b>' + esc(r.f.sig) + "</b><p>" + snippet(r.body, res.terms) + "</p></a>";
  }).join("") + "</div>";
  view.innerHTML = html;
}
document.getElementById("globalSearch").addEventListener("submit", function(ev){
  ev.preventDefault();
  var q = document.getElementById("gsInput").value.trim();
  if (q) location.hash = "#/search?q=" + encodeURIComponent(q);
});

/* ---------- router ---------- */
function route(){
  closeTerm();
  var hash = location.hash || "#/home";
  var parts = hash.replace(/^#\//, "").split("/");
  var head = parts[0];
  window.scrollTo(0, 0);
  if (head === "" || head === "home") vHome();
  else if (head === "lessons") vLessons();
  else if (head === "lesson" && parts[1]) vLesson(parts[1]);
  else if (head === "quiz") { quiz ? vQuizRun() : vQuizSetup(); }
  else if (head === "docs") vDocs();
  else if (head === "doc" && parts[1]) vDoc(parts[1], parts[2] || null);
  else if (head === "practice"){
    if (parts[1] && funcByName(decodeURIComponent(parts[1]))){ prac.fn = decodeURIComponent(parts[1]); prac.tab = "ref"; prac.kw = ""; }
    vPractice();
  }
  else if (head === "functions") vFunctions();
  else if (head === "function" && parts[1]) vFunction(decodeURIComponent(parts[1]));
  else if (head === "terms") vTerms();
  else if (head === "term" && parts[1]) vTerm(decodeURIComponent(parts[1]));
  else if (head.indexOf("search") === 0){
    var m = /[?&]q=([^&]*)/.exec(hash);
    vSearch(m ? decodeURIComponent(m[1]) : "");
  }
  else vHome();
  view.focus({ preventScroll: true });
}
window.addEventListener("hashchange", route);
route();
})();
