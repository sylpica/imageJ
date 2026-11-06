(function(){
"use strict";
var D = window.IJDATA;
var S = D.S, CATS = D.CATS, LESSONS = D.LESSONS, QUESTIONS = D.QUESTIONS, TERMS = D.TERMS;
var catName = {}; CATS.forEach(function(c){ catName[c[0]] = c[1]; });
var KEY = "imagej-study-v1";
var store = { done:{}, answers:{} };
try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); if (p && typeof p==="object") store = {done:p.done||{}, answers:p.answers||{}}; } } catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }
function esc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
function srcLink(k){ var u = S[k]; return u ? ' <span class="src">出典: <a href="'+esc(u)+'" target="_blank" rel="noopener">公式ドキュメント</a></span>' : ""; }

var state = { view:"lesson", cat:"all", kw:"", lessonIdx:0, quizIdx:0 };

var $ = function(id){ return document.getElementById(id); };
var catFilter = $("catFilter"), kwSearch = $("kwSearch");
catFilter.innerHTML = '<option value="all">すべてのカテゴリ</option>' + CATS.map(function(c){ return '<option value="'+c[0]+'">'+esc(c[1])+'</option>'; }).join("");
$("quizBadge").textContent = QUESTIONS.length + "問";

function filteredLessons(){ return LESSONS.filter(function(l){ return (state.cat==="all"||l.cat===state.cat) && (!state.kw || (l.title+l.lead+l.body.join("")).indexOf(state.kw)>=0); }); }
function filteredQuestions(){ return QUESTIONS.filter(function(q){ return (state.cat==="all"||q.cat===state.cat) && (!state.kw || (q.q+q.e+q.c.join("")).indexOf(state.kw)>=0); }); }
function filteredTerms(){ return TERMS.filter(function(t){ return (state.cat==="all"||t.cat===state.cat) && (!state.kw || (t.t+t.d).indexOf(state.kw)>=0); }); }

function updateProgress(){
  var doneCount = LESSONS.filter(function(l){ return store.done[l.id]; }).length;
  $("progText").textContent = doneCount + " / " + LESSONS.length + " 完了";
  $("progBar").style.width = (LESSONS.length ? (doneCount/LESSONS.length*100) : 0) + "%";
}
function updateCount(){
  var n = state.view==="lesson" ? filteredLessons().length : state.view==="quiz" ? filteredQuestions().length : filteredTerms().length;
  var unit = state.view==="lesson" ? "レッスン" : state.view==="quiz" ? "問" : "語";
  $("countText").textContent = "表示中: " + n + unit;
}

// ---- Lessons ----
function renderLessonList(){
  var list = filteredLessons();
  if (state.lessonIdx >= list.length) state.lessonIdx = Math.max(0, list.length-1);
  $("lessonList").innerHTML = list.length ? list.map(function(l,i){
    return '<li><button type="button" data-i="'+i+'" class="'+(i===state.lessonIdx?"active":"")+'">' +
      (store.done[l.id]?'<span class="check">✓</span>':"") +
      '<span class="t">'+esc(l.title)+'</span><span class="d">'+esc(catName[l.cat])+'</span></button></li>';
  }).join("") : '<li class="empty">該当するレッスンがありません</li>';
  Array.prototype.forEach.call($("lessonList").querySelectorAll("button"), function(b){
    b.addEventListener("click", function(){ state.lessonIdx = parseInt(b.getAttribute("data-i"),10); renderLesson(); });
  });
}
function renderLesson(){
  renderLessonList(); updateCount(); updateProgress();
  var list = filteredLessons();
  var l = list[state.lessonIdx];
  if (!l){ $("lessonTitle").textContent="該当なし"; $("lessonMeta").textContent=""; $("lessonLead").textContent=""; $("lessonBody").innerHTML='<p class="empty">カテゴリや検索条件を変えてください。</p>'; $("prevBtn").disabled = $("nextBtn").disabled = true; $("doneCheck").disabled = true; return; }
  $("lessonMeta").textContent = catName[l.cat] + " ・ " + (state.lessonIdx+1) + " / " + list.length;
  $("lessonTitle").textContent = l.title;
  $("lessonLead").textContent = l.lead;
  $("lessonBody").innerHTML = l.body.map(function(p){ return "<p>"+esc(p)+"</p>"; }).join("") +
    (l.points && l.points.length ? "<p><strong>要点</strong></p><ul>" + l.points.map(function(p){ return "<li>"+esc(p)+"</li>"; }).join("") + "</ul>" : "") +
    "<p>"+srcLink(l.src)+"</p>";
  $("doneCheck").disabled = false;
  $("doneCheck").checked = !!store.done[l.id];
  $("prevBtn").disabled = state.lessonIdx <= 0;
  $("nextBtn").disabled = state.lessonIdx >= list.length-1;
}

// ---- Quiz ----
function renderQuiz(){
  updateCount();
  var list = filteredQuestions();
  if (state.quizIdx >= list.length) state.quizIdx = Math.max(0, list.length-1);
  var q = list[state.quizIdx];
  var answered = 0, correct = 0;
  QUESTIONS.forEach(function(x){ if (store.answers[x.id] !== undefined){ answered++; if (store.answers[x.id] === x.a) correct++; } });
  $("quizScore").textContent = answered ? ("回答 " + answered + " / " + QUESTIONS.length + "問 ・ 正解 " + correct + "問 ・ 正答率 " + Math.round(correct/answered*100) + "%") : "未回答";
  if (!q){ $("quizMeta").textContent="四択問題"; $("quizBody").innerHTML='<p class="empty">該当する問題がありません。カテゴリや検索条件を変えてください。</p>'; $("quizPrev").disabled = $("quizNext").disabled = true; return; }
  $("quizMeta").textContent = "四択問題 ・ " + catName[q.cat] + " ・ " + (state.quizIdx+1) + " / " + list.length;
  var my = store.answers[q.id];
  var html = "<p><strong>Q. "+esc(q.q)+"</strong></p><div class=\"choices\">";
  q.c.forEach(function(choice,i){
    var cls = "choice";
    if (my !== undefined){ cls += (i===q.a ? " correct" : (i===my ? " wrong" : "")); }
    html += '<button type="button" class="'+cls+'" data-i="'+i+'" '+(my!==undefined?"disabled":"")+'>'+String.fromCharCode(65+i)+". "+esc(choice)+"</button>";
  });
  html += "</div>";
  if (my !== undefined){
    html += '<div class="feedback '+(my===q.a?"ok":"ng")+'"><strong>'+(my===q.a?"正解！":"不正解。正解は「"+esc(q.c[q.a])+"」")+'</strong><br>'+esc(q.e)+"<br>"+srcLink(q.src)+"</div>";
  }
  $("quizBody").innerHTML = html;
  Array.prototype.forEach.call($("quizBody").querySelectorAll(".choice"), function(b){
    b.addEventListener("click", function(){
      store.answers[q.id] = parseInt(b.getAttribute("data-i"),10); save(); renderQuiz();
    });
  });
  $("quizPrev").disabled = state.quizIdx <= 0;
  $("quizNext").disabled = state.quizIdx >= list.length-1;
}

// ---- Glossary ----
function renderGloss(){
  updateCount();
  var list = filteredTerms();
  $("glossBody").innerHTML = list.length ? list.map(function(t){
    return '<div class="gloss-item"><h3>'+esc(t.t)+' <span class="cat">'+esc(catName[t.cat])+'</span></h3><p>'+esc(t.d)+srcLink(t.src)+"</p></div>";
  }).join("") : '<p class="empty">該当する用語がありません。カテゴリや検索条件を変えてください。</p>';
}

// ---- View switching ----
function show(view){
  state.view = view;
  $("lessonView").hidden = view!=="lesson";
  $("quizView").hidden = view!=="quiz";
  $("glossView").hidden = view!=="gloss";
  [["btnLesson","lesson"],["btnQuiz","quiz"],["btnGloss","gloss"]].forEach(function(pair){
    var on = pair[1]===view; $(pair[0]).classList.toggle("active", on); $(pair[0]).setAttribute("aria-pressed", on?"true":"false");
  });
  if (view==="lesson") renderLesson(); else if (view==="quiz") renderQuiz(); else renderGloss();
}
$("btnLesson").addEventListener("click", function(){ show("lesson"); });
$("btnQuiz").addEventListener("click", function(){ show("quiz"); });
$("btnGloss").addEventListener("click", function(){ show("gloss"); });
$("backLesson2").addEventListener("click", function(){ show("lesson"); });

catFilter.addEventListener("change", function(){ state.cat = catFilter.value; state.lessonIdx = 0; state.quizIdx = 0; if (state.view==="lesson") renderLesson(); else if (state.view==="quiz") renderQuiz(); else renderGloss(); });
kwSearch.addEventListener("input", function(){ state.kw = kwSearch.value.trim(); state.lessonIdx = 0; state.quizIdx = 0; if (state.view==="lesson") renderLesson(); else if (state.view==="quiz") renderQuiz(); else renderGloss(); });

$("prevBtn").addEventListener("click", function(){ if (state.lessonIdx>0){ state.lessonIdx--; renderLesson(); } });
$("nextBtn").addEventListener("click", function(){ var n = filteredLessons().length; if (state.lessonIdx<n-1){ state.lessonIdx++; renderLesson(); } });
$("doneCheck").addEventListener("change", function(){ var l = filteredLessons()[state.lessonIdx]; if (!l) return; if ($("doneCheck").checked) store.done[l.id]=1; else delete store.done[l.id]; save(); renderLesson(); });
$("resetBtn").addEventListener("click", function(){ store = {done:{}, answers:{}}; save(); renderLesson(); if (state.view==="quiz") renderQuiz(); });

$("quizPrev").addEventListener("click", function(){ if (state.quizIdx>0){ state.quizIdx--; renderQuiz(); } });
$("quizNext").addEventListener("click", function(){ var n = filteredQuestions().length; if (state.quizIdx<n-1){ state.quizIdx++; renderQuiz(); } });
$("quizRetry").addEventListener("click", function(){ store.answers = {}; save(); state.quizIdx = 0; renderQuiz(); });

document.addEventListener("keydown", function(ev){
  if (ev.target && (ev.target.tagName==="INPUT" || ev.target.tagName==="SELECT" || ev.target.tagName==="TEXTAREA")) return;
  if (state.view==="quiz" && /^[1-4]$/.test(ev.key)){
    var list = filteredQuestions(); var q = list[state.quizIdx];
    if (q && store.answers[q.id]===undefined){ store.answers[q.id] = parseInt(ev.key,10)-1; save(); renderQuiz(); }
  }
});

show("lesson");
})();
