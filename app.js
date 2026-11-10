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
var store = { hist:{}, bm:[], lessonDone:[], docBm:[], lastDoc:{}, macroDraft:"" };
try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); if (p && typeof p === "object") store = Object.assign(store, p); } } catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }

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
  if (f.note) html += '<div class="box box-caution"><h3>注意</h3><p>' + linkTerms(f.note, 4) + "</p></div>";
  if (f.ver) html += '<p class="meta-line">バージョン要件：' + esc(f.ver) + "</p>";
  html += '<p class="src-line">出典：<a href="https://imagej.net/ij/developer/macro/functions.html" target="_blank" rel="noopener">ImageJ公式「Built-in Macro Functions」</a><wbr>（説明は独自要約）</p></article>';
  var sameCat = FUNCTIONS.filter(function(x){ return x.cat === f.cat && x.name !== f.name; }).slice(0, 8);
  if (sameCat.length) html += '<h2 class="sec">同じ分類の関数</h2><div class="rel-chips">' + sameCat.map(function(x){ return '<a href="#/function/' + encodeURIComponent(x.name) + '">' + esc(x.name) + "</a>"; }).join("") + "</div>";
  view.innerHTML = html;
}

/* ---------- macro practice ---------- */
var MACRO_TEMPLATES = [
{ name: "雛形：開いている画像をすべて測定", code:
"// 開いている画像をすべて測定し、結果をCSVで保存する\n" +
"dir = getDirectory(\"保存先フォルダを選んでください\");\n" +
"ids = newArray(nImages);\n" +
"for (i = 0; i < nImages; i++) {\n" +
"    selectImage(i + 1);\n" +
"    ids[i] = getImageID();\n" +
"}\n" +
"setBatchMode(true);\n" +
"for (i = 0; i < ids.length; i++) {\n" +
"    selectImage(ids[i]);\n" +
"    run(\"Measure\");\n" +
"}\n" +
"saveAs(\"Results\", dir + \"results.csv\");\n" +
"setBatchMode(false);\n" },
{ name: "雛形：粒子カウント", code:
"// 8bit化 → 自動閾値 → 二値化 → 分離 → 粒子解析\n" +
"run(\"8-bit\");\n" +
"setAutoThreshold(\"Otsu dark\");\n" +
"run(\"Convert to Mask\");\n" +
"run(\"Watershed\");\n" +
"run(\"Analyze Particles...\", \"size=10-Infinity circularity=0.00-1.00 show=Outlines summarize\");\n" },
{ name: "雛形：ROI Manager の全ROIを測定", code:
"// ROI Manager に登録した全ROIを順に測定する\n" +
"n = roiManager(\"count\");\n" +
"for (i = 0; i < n; i++) {\n" +
"    roiManager(\"select\", i);\n" +
"    run(\"Measure\");\n" +
"}\n" },
{ name: "雛形：フォルダ一括（スケールバー＋保存）", code:
"// フォルダ内のTIFFを一括処理して別フォルダへ保存する\n" +
"dir = getDirectory(\"画像フォルダを選んでください\");\n" +
"out = getDirectory(\"保存先フォルダを選んでください\");\n" +
"list = getFileList(dir);\n" +
"setBatchMode(true);\n" +
"for (i = 0; i < list.length; i++) {\n" +
"    if (!endsWith(list[i], \".tif\")) continue;\n" +
"    open(dir + list[i]);\n" +
"    run(\"Scale Bar...\", \"width=50 height=8 font=28 color=White background=None location=[Lower Right] bold\");\n" +
"    saveAs(\"Tiff\", out + list[i]);\n" +
"    close();\n" +
"}\n" +
"setBatchMode(false);\n" },
{ name: "雛形：Z投影とチャンネル分割", code:
"// スタックを最大値投影し、チャンネルを分ける\n" +
"run(\"Z Project...\", \"projection=[Max Intensity]\");\n" +
"run(\"Split Channels\");\n" }
];
var prac = { cat: "all", kw: "", fn: null, tab: "code" };
function pracBalance(code){
  var pairs = { "(": 0, "{": 0, "[": 0 }, inStr = false, inCom = false, inBlock = false, esc2 = false;
  for (var i = 0; i < code.length; i++){
    var c = code[i], n = code[i + 1];
    if (inBlock){ if (c === "*" && n === "/"){ inBlock = false; i++; } continue; }
    if (inCom){ if (c === "\n") inCom = false; continue; }
    if (inStr){ if (esc2) esc2 = false; else if (c === "\\") esc2 = true; else if (c === "\"") inStr = false; continue; }
    if (c === "/" && n === "*"){ inBlock = true; i++; continue; }
    if (c === "/" && n === "/"){ inCom = true; continue; }
    if (c === "\""){ inStr = true; continue; }
    if (c === "(") pairs["("]++; else if (c === ")") pairs["("]--;
    else if (c === "{") pairs["{"]++; else if (c === "}") pairs["{"]--;
    else if (c === "[") pairs["["]++; else if (c === "]") pairs["["]--;
  }
  return pairs;
}
function vPractice(){
  setNav("practice");
  if (!store.macroDraft) store.macroDraft =
    "// 右の関数リファレンスを見ながらマクロを書けます\n" +
    "// コード中の関数名をダブルクリックすると、右に説明が出ます\n\n" +
    "title = getTitle();\nprint(title);\nrun(\"Measure\");\n";
  var html = '<h1 class="page">マクロ練習</h1>' +
    '<div class="prac-tabs" role="tablist">' +
      '<button type="button" data-ptab="code" class="' + (prac.tab === "code" ? "on" : "") + '">コード</button>' +
      '<button type="button" data-ptab="ref" class="' + (prac.tab === "ref" ? "on" : "") + '">関数リファレンス</button></div>' +
    '<div class="prac" data-tab="' + prac.tab + '">' +
    '<section class="prac-ed">' +
      '<div class="prac-tools">' +
        '<select id="tplSel" aria-label="テンプレート"><option value="">テンプレート…</option>' +
        MACRO_TEMPLATES.map(function(t, i){ return '<option value="' + i + '">' + esc(t.name) + "</option>"; }).join("") + "</select>" +
        '<button type="button" class="mini-btn" id="btnCopy">コピー</button>' +
        '<button type="button" class="mini-btn" id="btnDl">.ijmで保存</button>' +
        '<button type="button" class="mini-btn" id="btnClear">消去</button>' +
        '<span class="prac-stat" id="pracStat"></span></div>' +
      '<div class="ed-wrap"><pre class="ed-gutter" id="edGutter" aria-hidden="true">1</pre>' +
      '<textarea id="macroEd" spellcheck="false" aria-label="マクロのコード"></textarea></div>' +
    "</section>" +
    '<aside class="prac-ref">' +
      '<div class="prac-ref-tools"><input type="search" id="pracKw" placeholder="関数を検索" value="' + esc(prac.kw) + '" aria-label="関数検索">' +
      '<div class="chips">' + ['<button type="button" class="chip' + (prac.cat === "all" ? " on" : "") + '" data-pcat="all">すべて</button>']
        .concat(Object.keys(FCATS).map(function(c){ return '<button type="button" class="chip' + (prac.cat === c ? " on" : "") + '" data-pcat="' + c + '">' + esc(FCATS[c]) + "</button>"; })).join("") + "</div></div>" +
      '<div class="prac-ref-body" id="pracRefBody"></div>' +
    "</aside></div>" +
    '<p class="foot-note">マクロの実行はこのアプリでは行えません。書いたコードは .ijm で保存し、ImageJ / Fiji の Plugins &gt; Macros &gt; Run… から開くか、.ijm ファイルを Fiji のウィンドウへドラッグ＆ドロップして実行してください。下書きはこの端末に自動保存されます。</p>';
  view.innerHTML = html;
  var ed = document.getElementById("macroEd"), gut = document.getElementById("edGutter"), stat = document.getElementById("pracStat");
  ed.value = store.macroDraft;
  function syncGutter(){
    var n = ed.value.split("\n").length, s = "";
    for (var i = 1; i <= n; i++) s += i + "\n";
    gut.textContent = s; gut.scrollTop = ed.scrollTop;
    var b = pracBalance(ed.value), bal = [];
    if (b["("]) bal.push("( が " + b["("]);
    if (b["{"]) bal.push("{ が " + b["{"]);
    if (b["["]) bal.push("[ が " + b["["]);
    stat.textContent = n + " 行" + (bal.length ? " ／ 括弧の対応（目安）：" + bal.join("、") : "");
  }
  syncGutter();
  ed.addEventListener("input", function(){ store.macroDraft = ed.value; save(); syncGutter(); });
  ed.addEventListener("scroll", function(){ gut.scrollTop = ed.scrollTop; });
  ed.addEventListener("keydown", function(e){
    if (e.key === "Tab"){
      e.preventDefault();
      var s = ed.selectionStart;
      ed.setRangeText("  ", s, ed.selectionEnd, "end");
      ed.dispatchEvent(new Event("input"));
    }
  });
  ed.addEventListener("dblclick", function(){
    var v = ed.value, s = ed.selectionStart, a = s, z = s;
    while (a > 0 && /[A-Za-z0-9_.]/.test(v[a - 1])) a--;
    while (z < v.length && /[A-Za-z0-9_.]/.test(v[z])) z++;
    var word = v.slice(a, z);
    if (word && funcByName(word)){ prac.fn = word; prac.tab = "ref"; vPractice(); }
  });
  document.getElementById("tplSel").addEventListener("change", function(){
    if (this.value === "") return;
    var cur = ed.value;
    var isStarter = cur.indexOf("右の関数リファレンスを見ながら") >= 0 || MACRO_TEMPLATES.some(function(t){ return t.code === cur; });
    if (cur.trim() && !isStarter && !window.confirm("現在のコードをテンプレートで置き換えますか？（下書きも置き換わります）")){ this.value = ""; return; }
    ed.value = MACRO_TEMPLATES[Number(this.value)].code;
    ed.dispatchEvent(new Event("input"));
    this.value = "";
    ed.focus();
  });
  document.getElementById("btnClear").addEventListener("click", function(){ ed.value = ""; ed.dispatchEvent(new Event("input")); ed.focus(); });
  document.getElementById("btnCopy").addEventListener("click", function(){
    var b = this;
    function done(){ b.textContent = "コピーしました"; setTimeout(function(){ b.textContent = "コピー"; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ed.value).then(done, done);
    else { ed.select(); document.execCommand("copy"); done(); }
  });
  document.getElementById("btnDl").addEventListener("click", function(){
    var blob = new Blob([ed.value], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "macro.ijm"; a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  });
  view.querySelectorAll("[data-ptab]").forEach(function(b){ b.addEventListener("click", function(){ prac.tab = b.getAttribute("data-ptab"); vPractice(); }); });
  document.getElementById("pracKw").addEventListener("input", function(){ prac.kw = this.value; prac.fn = null; renderPracRef(); });
  view.querySelectorAll("[data-pcat]").forEach(function(b){ b.addEventListener("click", function(){ prac.cat = b.getAttribute("data-pcat"); prac.fn = null; vPractice(); }); });
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
          '<div class="prac-ins"><button type="button" class="btn" id="insSig">書式を挿入</button>' +
          (f.ex ? '<button type="button" class="btn sub" id="insEx">使用例を挿入</button>' : "") + "</div>";
        document.getElementById("pracBack").addEventListener("click", function(){ prac.fn = null; renderPracRef(); });
        document.getElementById("insSig").addEventListener("click", function(){
          // 書式中の省略可能部 [ ] は落として、そのまま動く形で挿入する
          var s = f.sig.replace(/\[[^\]]*\]/g, "").replace(/,\s*\)/, ")").replace(/\s+/g, " ");
          insertCode(/;$/.test(s) ? s : s + ";");
        });
        var exBtn = document.getElementById("insEx");
        if (exBtn) exBtn.addEventListener("click", function(){ insertCode(f.ex); });
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
  function insertCode(text){
    var s = ed.selectionStart;
    var before = ed.value.slice(0, s);
    var insert = (before && !/\n$/.test(before) ? "\n" : "") + text + "\n";
    ed.setRangeText(insert, s, ed.selectionEnd, "end");
    ed.dispatchEvent(new Event("input"));
    if (window.innerWidth < 860){ prac.tab = "code"; vPractice(); document.getElementById("macroEd").focus(); }
    else ed.focus();
  }
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
  else if (head === "practice") vPractice();
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
