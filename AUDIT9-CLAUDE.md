# AUDIT9-CLAUDE — マクロ機能 第3ラウンド独立監査（報告のみ）

- 監査日: 2026-11-12（セッション日付）
- 対象: sylpica/imageJ main `dfa7c98`（作業ブランチ claude/festive-cerf-g1rdm5、未改変）
- 監査者: Claude Code（session_01VCQ3xtDEAqTtZNSWXchHkN）。モデル表示は開始時・終了時とも `claude-opus-5-5`（get_session の session_context.model / last_served_model で確認）。途中で Opus 以外への切り替えは確認されなかった。
- フェーズ: 報告のみ。コード修正・PR・マージはしていない。コミットはこのファイル1つだけ。
- AUDIT7.md / AUDIT8.md の結論は前提にせず、下記の一次資料と実物コードで検証した。

## 0. 検証方法と制約（先に読むこと）

| 項目 | 状況 |
|---|---|
| ImageJ ソース | GitHub ミラー `imagej/ImageJ` を `--depth 1` で取得（commit `a376e43`、2026-10-23、`ImageJ.VERSION = "1.54u"`）。行番号はすべてこの版のもの |
| 公式 Built-in Macro Functions | 同リポジトリ同梱の `functions.html`（ページ表記 "Last updated 2025-09-02"）。imagej.net 本体は**この環境のネットワーク許可外**で取得不可（プロキシ 403、WebFetch も ENOTFOUND） |
| 本物の ImageJ での実行突合 | ソースのコンパイルは通ったが、**ImageJ 本体の実行は自動モードの権限判定で拒否**されたため未実施。以下の「ImageJ の実際の挙動」は**ソース読解による**もの（実行未確認）。Java 標準ライブラリの丸め挙動（DecimalFormat）だけは自作の小テストで実測した |
| シミュレータの検査 | app.js を Node 上で読み込み（DOM はスタブ）、`simRunProgram` / `pracCheck` を直接呼んで出力を確認 |
| 画面の検査 | Playwright（同梱 Chromium）でローカル配信したサイトを操作・実測。公開サイト https://sylpica.github.io/imageJ/ は main と同一内容である前提で、**公開URL自体へのアクセスは未実施** |
| 資料の出典リンク | imagej.net / imagejdocu.list.lu / imagej.github.io がいずれも到達不可のため、**リンク切れ確認と原典との照合は未確認** |

## H. 既存テストの実行結果

| テスト | 結果 |
|---|---|
| `node tests/validate.mjs` | ALL CHECKS PASSED（official=580 / names checked=104 / functions=104、lessons=28 questions=63 terms=80 docChapters=12 docEntries=51、bias: uniqueLongestCorrect=4/63（6.3%）answerDist=16,16,16,15） |
| `node tests/audit.mjs` | AUDIT ALL PASSED（PASS 248 件、失敗 0） |
| `node tests/overflow.mjs` | scanned=822 problems=0（OVERFLOW ZERO） |

注意: 既存テストはいずれも通るが、下記 Q-1（クイズの正解キー誤り）、S-1〜S-4（シミュレータの誤診断・誤値）を検出できていない。validate.mjs は正解位置の偏りは検査するが、正解の妥当性は検査していない。

## 総合判定: **不合格**

高 4 件・中 9 件・低 16 件。とくに Q-1（正しい選択肢を選ぶと不正解になる問題が4問）と S-1（公式に実在する正しいコードが「エラーで止まる」と判定される）は学習アプリとして直接の誤教示になる。

---

## 指摘一覧（深刻度順）

### 高

#### Q-1（高）クイズ4問で正解キーが誤った選択肢を指している
- 該当: `data-questions.js` 31行 B05、64行 F06、75行 M01、85行 FL03。判定ロジック `app.js:2643`（`correctPos: order.indexOf(q.a)`）、結果画面 `app.js:2716`（`q.c[q.a]` を正解として表示）。
- 実態（データから機械的に確認）:

| ID | `a` が指す選択肢（アプリ上の「正解」） | 本来の正解（解説 e と一致する選択肢） |
|---|---|---|
| B05 | 「全スライスが同じサイズなら、ビット深度は混在してよい」 | 「全スライスが同じサイズ・同じビット深度でなければならない」 |
| F06 | 「画像の圧縮率を周波数ごとに示したもの」 | 「画像に含まれる周波数成分の強さの分布」 |
| M01 | 「ヒストグラムのビンの数のこと」 | 「選択内のグレー値の合計であり、Area × Mean に等しい」 |
| FL03 | 「16-bit画像では半径を必ず65,536に設定する」 | 「8-bitやRGBでは…16-bitでは0.2〜5程度が典型値」 |

- 誤答理由 `w` も旧い並び順のまま（例 M01: `w[0]`「ピクセル数の平方根ではありません」は `c[1]` 向けの文）。選択肢配列 `c` だけが並べ替えられ、`a` と `w` が更新されなかったと推定される。`git log` 上は v2 導入コミット `6dc8fa3` 時点から同じ状態。
- 根拠: 各問の解説文 `e`（アプリ自身の記述）と、スタックの同一型・同一寸法（ij/ImageStack.java 104–114 の addSlice は追加画像を convertType で既存の型へ変換し、寸法が違えば既存寸法のキャンバスへ挿入するため、スタック内で型・寸法が混在しない）、Integrated Density の定義（functions.html / Analyze>Set Measurements）。
- 再現: #/quiz →「カテゴリ別：測定と粒子解析」→ M01 で「選択内のグレー値の合計…」を選ぶ。
- 期待: 正解。実際: 「不正解」と表示され、「ヒストグラムのビンの数のことである」が◯になる。誤答理由欄の対応もずれる。

#### S-1（高）公式に実在する関数・名前空間が「未代入の変数」「未定義のメソッド」として止まる
- 該当: 参照引数（書き込み先の変数）を取る関数の未実装時の扱い（`app.js:1408` で未代入エラー）、名前空間表 `SIM_NS`（`app.js:1826`）に Fit / Image / Property / RoiManager が無い、静的チェックの `mcall` 判定（`app.js:1310` 付近）。
- 再現と結果（すべて halted=true）:
  - `getRawStatistics(n, m); print("ok");` → 「変数 n は、まだ値が代入されていません」
  - `getPixelSize(u, pw, ph);` / `getCursorLoc(x,y,z,f);` / `getLine(x1,y1,x2,y2,w);` / `getSelectionCoordinates(xs, ys);` / `getLut(r,g,b);` / `getDateAndTime(year, month, dow, dom, h, mi, s, ms);` / `getLocationAndSize(...)` / `getDisplayedArea(...)` / `Roi.getBounds(...)` / `Roi.getCoordinates(...)` / `Stack.getStatistics(...)` → 同種の未代入エラー
  - `Fit.doFit("Straight Line", newArray(1,2,3), newArray(2,4,6)); print(Fit.p(1));` → 「「doFit」は定義されていないメソッドです」「変数 Fit は、まだ値が代入されていません」
  - `RoiManager.select(0);` / `Property.set("k","v");` → 同様
- 根拠: functions.html にこれらの書式が実在（例 getRawStatistics, getDateAndTime, Fit.doFit, RoiManager.select, Property.set）。`tests/official-functions.txt` の名前空間は Array Color Dialog File Fit IJ Image List Math Overlay Plot Property Roi RoiManager Stack String Table。
- 期待: 「実在するが説明は省略」として通し、書き込み先の変数は「実行時に決まる値」として扱う（getValue などで既にそうしている）。実際: 正しいコードをエラーと断定し、原因説明も「ImageJ では Undefined variable で止まります」と誤る。静的チェックとも矛盾（静的チェックは関数名を公式と認識する一方、実行で止まる）。

#### S-2（高）数値で始まる式に文字列を足す代入が、ImageJ と逆の結果になる
- 該当: 二項 `+` の文字列連結（`app.js:1530`）。
- 根拠: `ij/macro/Interpreter.java` doAssignment 826–844、getExpressionType 846–935（右辺の先頭が数値変数・数値なら VALUE 型）、getExpression 1687–1702、getFactor の STRING_CONSTANT 1733–1735（`Tools.parseDouble(tokenString, NaN)`）。数値文脈では文字列定数は数値として解釈され、数値でなければ NaN。
- 再現: `i=1; s = i + ".tif"; print(s);` / `y = 3 + "5"; print(y);` / `y = 1 + 2 + "a"; print(y);`
- 期待（ソース読解による。実行未確認）: `NaN` / `8` / `NaN`。実際: `1.tif` / `35` / `3a`。
- 補足: `print(i + ".tif")`（print の引数は文字列文脈の getStringTerm/getStringExpression 1895–1923 を通る）は ImageJ でも `1.tif` になるため、**代入文だけ**の問題。`s = "" + i + ".tif"` という定番の書き方が必要な理由そのものをシミュレータが隠しており、バッチ処理の典型的な落とし穴を「動く」と教えてしまう。

#### S-3（高）ROI を無視した統計・測定値を表示する（実行時の値の捏造）
- 該当: `getStatistics`（`app.js:2140–2148`）は ROI の有無にかかわらず `simStats(画像)` を使い、説明文も常に「画像全体の統計」。`simResultRow`（`app.js:2303–2307`）は Area を `roi.w * roi.h`（外接矩形）で計算。makeLine は `w,h` に線の外接矩形を入れる（`app.js:2191`）。
- 根拠: functions.html getStatistics「active image **or selection**」、Measure は選択範囲の画素を測る（ij/plugin/filter/Analyzer）。楕円 ROI の面積は外接矩形より小さく、直線選択の Area は外接矩形の面積ではない。
- 再現と結果:
  - `makeRectangle(0,0,10,10); getStatistics(a, m); print(a, m);` → `262144 80.45`（期待: 面積 100。平均は ROI 内の値で、モデル上は不明なら「実行時に決まる値」）
  - `makeOval(0,0,100,100); getStatistics(area); print(area);` → `262144`
  - `makeOval(0,0,100,100); run("Measure"); print(getResult("Area",0));` → `10000`（楕円なのに矩形面積）
  - `makeLine(0,0,100,100); run("Measure"); print(getResult("Area",1));` → `10000`
- 期待: ROI がある場合は ROI に基づく値、決められないなら「実行時に決まる値」。実際: 画像全体や外接矩形の値を確定値のように出力。

### 中

#### S-4（中）括弧を省略した組み込み関数の呼び出しが誤エラーになる
- 該当: 変数参照の解決（`app.js:1408`）。関数リファレンス自身が `resetThreshold;` を使用例にしている（`data-functions.js:40`、説明「括弧は省略でき」）。
- 根拠: `Functions.java:104` `case RESET_THRESHOLD: interp.getParens(); …`、`Interpreter.getParens()` 1431–1436（括弧は任意）。functions.html も `resetThreshold` を括弧なしで記載。
- 再現: `resetThreshold;` / `updateDisplay;` / `x = getTitle; print(x);`
- 期待: 正常に実行。実際: 「変数 resetThreshold は、まだ値が代入されていません」で停止。リファレンスの「使用例を挿入」→実行でそのまま再現する。

#### S-5（中）d2s が Java と異なる丸め・書式になる
- 該当: `app.js:2029`（`toFixed(Math.min(10, Math.max(0, n)))`）、`simFmtNum`（`app.js:810–825`、toFixed 使用）。
- 根拠: `ij/IJ.java` 1000–1029（decimalPlaces<0 は指数表記 `DecimalFormat("0.00E0")`、上限 9 桁）、113–124（`df[0]` のみ HALF_UP、1桁以上は DecimalFormat 既定の HALF_EVEN）。Java 21 で実測: `0.00` 形式で 0.125→`0.12`、0.375→`0.38`。
- 再現: `print(d2s(0.125,2), d2s(0.25,1), d2s(1234.5,-2), d2s(1,12)); print(10.03125);`
- 期待: `0.12 0.2 1.23E3 1.000000000` / `10.0312`。実際: `0.13 0.3 1235 1.0000000000` / `10.0313`。
- 補足: 負の桁数はリファレンス（`data-functions.js:88` の note「負の値を与えると指数表記」）とシミュレータが矛盾している。

#### S-6（中）newImage の既定の塗り・7引数形式・ramp を誤る（リファレンスとシミュレータの両方）
- 該当: `data-functions.js:16`（「中身は通常は黒（0）で初期化され、type に "white" を含めると白」）、`app.js:2058–2063`（説明は常に「中身は真っ黒（すべて0）」）。
- 根拠: `ij/IJ.java` 2295–2318（既定は FILL_WHITE、16/32-bit のみ FILL_BLACK、"ramp"/"noise" も指定可）、functions.html newImage「(the default is "white")」。7引数形式 newImage(title, type, width, height, c, z, t) は functions.html 記載、`Functions.java:3561–3580`。
- 再現:
  - `newImage("a","8-bit",8,8,1); getStatistics(ar, mean); print(mean);` → `0`（期待 255）
  - `newImage("st","8-bit ramp",64,64,2,3,4); print(nSlices); Stack.getDimensions(w,h,c,z,t); print(c,z,t);` → `2` / `1 2 1`、説明は「真っ黒」（期待 nSlices=24、c=2 z=3 t=4、中身はランプ）

#### S-7（中）getFileList が架空のファイル名を Log 出力として返す
- 該当: `app.js:1949`（`["image1.tif", "image2.tif", "memo.txt"]` を返す）。
- 再現: `list=getFileList("/data/"); for(i=0;i<list.length;i++) print(list[i]);`
- 実際: Log 欄に `image1.tif` `image2.tif` `memo.txt` が実行結果として並ぶ。手順欄に「モデルでは3件として進みます」とあるが、Log 出力だけ見ると実在のファイル名に見える。
- 期待: 件数・名前は「実行時に決まる値」として扱うか、Log 出力にも「（例）」等を明示する。課題文 E の「実行時に決まる値を捏造していないか」に該当。
- 関連（低）: `getDirectory("home")` はダイアログを出さずにパスを返す（functions.html getDirectory）が、シミュレータは「フォルダ選択ダイアログが開きます」と説明して `/（選択したフォルダ）/` を返す（`app.js:1948`）。

#### S-8（中）存在しないトップレベル関数を実在扱いして計算する
- 該当: `SIM_EXTRA`（`app.js:1828`）に `sinh, cosh, tanh, sqr, setInfo, getKeyModifiers` が含まれる。
- 根拠: いずれも functions.html のトップレベル関数として存在しない（`sqr` は `Math.sqr`、`setInfo` は `Property.setInfo`（Functions.java:8278）の一部）。
- 再現: `print(sinh(1)); print(sqr(3));` → `1.1752` `9`
- 期待: 未定義関数としてエラー（ImageJ では止まる）。実際: 値を計算して続行。

#### L-1（中）Make Binary と Convert to Mask の違いの説明がソースと一致しない（クイズ T02・用語・資料・レッスン）
- 該当: `data-questions.js:52`（T02 の正解「Make Binaryはヒストグラム解析で閾値を決め、Convert to Maskは現在の閾値設定に基づく」）、用語「Make Binary」「Convert to Mask」（data-docs.js 内の terms）、資料 `data-docs.js:39`、レッスン `data-lessons.js:138`。
- 根拠: `ij/plugin/Thresholder.java` 40–51（両コマンドとも applyThreshold を通る）、160–163・218–225（**閾値が設定済みならその閾値を使い、未設定なら autoThreshold**。この分岐は両コマンド共通）。違いは主に出力（Convert to Mask は常にマスク化、旧ダイアログの有無）。
- 再現: #/quiz → T02 を開く。
- 期待: 「どちらも閾値設定があればそれを使い、なければ自動決定する」旨。実際: 決め方が根本的に違うと教えている。※公式メニュー解説ページ（binary.html）の文言は到達不可のため**未確認**。旧文書の記述を踏襲した可能性がある。

#### P-1（中・レイアウト）N26 の再発: テンプレート選択後のエディタが4行分まで潰れる
- 該当: 練習画面の作業台（style.css の prac 系、`#pracGuide` 最大 118px）。
- 実測（Playwright、ライト／ダーク同値）:

| 画面 | テンプレート選択前のエディタ高 | 選択後（テンプレート0/8/9・220行の長文読込後も同じ） | 見える行数 | 作業台下端/画面高 |
|---|---|---|---|---|
| 1280×800 | — | 233px | 約10行 | 786/800 |
| 1366×768 | — | 213px | 約9行 | 754/768 |
| 1024×768 | — | 213px | 約9行 | 754/768 |
| 860×700 | 214px | **96px** | **4行** | 686/700 |
| 1280×600 | 226px | **108px** | **4行** | 586/600 |

- 作業台自体は1画面に収まっている（横はみ出し 0）。しかし 860×700 では解説ボックス（118px）がエディタ（96px）より大きく、14行のテンプレートのうち4行しか見えない。AUDIT8 の「エディタ高 100px 以上を保持」も 860×700 では満たしていない。
- 再現: 860×700 で #/practice → テンプレート「雛形：フォルダ一括（スケールバー＋保存）」を選択。

#### P-2（中）複数行を選択して Tab を押すと選択範囲が消える
- 該当: `app.js:624–631`（Tab で選択範囲を `"    "` に置換）。
- 再現: エディタに `x=1;\ny=2;` を入力 → 全選択 → Tab。
- 期待: 各行の先頭をインデント（画面の説明「エディタ内の Tab はインデントになり」）。実際: コード全体が空白4文字に置き換わる。
- 正常確認: 選択なしの Tab は4スペース挿入、Esc→Tab でフォーカスが関数検索欄へ移る（説明どおり）。

### 低

| ID | 内容 | 該当 | 根拠 | 再現 → 実際 / 期待 |
|---|---|---|---|---|
| S-9 | 複合代入の右辺で同じ変数を変更したときの値 | 複合代入の評価 | Interpreter.java 1366–1391（左辺の値を右辺評価**前**に読む） | `x=5; x++; x += x++; print(x);` → 13 / 期待 12 |
| S-10 | 文字列メソッドを文字列文脈で使ったときの値 | `app.js:1584`, `1587` | Interpreter.java runStringFunction 2072–2112（print 等では `contains`→"true"、`charAt`→1文字）。数値代入時は 1/0・文字コード（1846–1856） | `s="abc"; print(s.contains("b"), s.charAt(1));` → `1 98` / 期待 `true b` |
| S-11 | ユーザー関数が返す非整数を print すると Java の全桁表示になる | print の書式 | Interpreter.getStringTerm USER_FUNCTION 分岐 1640–1651（`""+value`） | `function f(){return 1/3;} print(f());` → `0.3333` / 期待 `0.3333333333333333` |
| S-12 | random の seed 形式のエラーを検出しない | `app.js:2042` | Functions.java 1190–1206（`"seed"` の後にカンマと整数必須、非整数は "Seed not integer"） | `random("seed");` `random("seed",1.5);` → 通過 / 期待 エラー。`random("seed",1)` 後の同一系列再現も「実行時に決まる値」扱いで検証不能 |
| S-13 | Array.getStatistics の引数省略に誤警告 | simArity（`app.js:1267`） | Functions.java 6449–6466（min 以降は省略可） | `Array.getStatistics(newArray(1,2,3), mn, mx);` → 「引数の数が違います」 / 期待 警告なし。リファレンスの note とも矛盾 |
| S-14 | getVoxelSize の単位が単数形 | 単位の既定値 | Functions.java 1911–1921 → Calibration.getUnits()（複数形 "pixels"） | `getVoxelSize(a,b,c,u); print(u);` → `pixel` / 期待 `pixels`（リファレンス note は正しく "pixels"） |
| S-15 | 三項演算子のバージョン条件が無く、文字列版の扱いが現行ソースと逆 | `app.js:1489` | release-notes.html「1.54u9 23 October 2026: Added support for the ternary operator」、Interpreter.java 1138–1170（doTernaryStringAssignment）、1226–1230 | `x=2; y = x ? "a" : "b";` → 「ImageJ では使えません」で停止 / 現行ソースでは代入文に限り可。数値の三項演算子は 1.54u9 より前の版では構文エラーになるが、その旨の注記が無い |
| S-16 | nSlices と nSlices() の値が食い違う | 定義済み関数 | functions.html nSlices「parentheses are optional」 | `print(nSlices, nSlices());` → `1 （実行時に決まる値）` |
| S-17 | 「使用例を挿入」した 104 件中 27 件が単体で即停止 | `data-functions.js` の ex（例 lengthOf, d2s, abs, print） | — | `#/practice/d2s` →使用例を挿入→実行 → 「変数 mean は、まだ値が代入されていません」。断片例であることの注記か、前提の代入を含めることが望ましい |
| S-18 | IsoData 移植の端ケース | `app.js:1178–1192` | AutoThresholder.java 434–493（片側が空でも g++ して続行、上限で -1）、getThreshold の bilevel 判定 52–55 | 片側が空の分布でシミュレータは即 break。通常の分布では影響なし |
| F-1 | `%` を含む不正なハッシュで URIError | `app.js:2843–2853`（decodeURIComponent が無防備） | — | `#/function/%`、`#/term/%`、`#/search?q=%` → コンソールに URIError、画面が前のページのまま |
| F-2 | 「履歴と進捗をリセット」でマクロの下書きも消える | `app.js:2635–2638`（store を macroDraft なしで再生成して保存） | — | 確認文は「学習履歴・ブックマーク・完了記録」のみで、下書き消去を告げない |
| R-1 | getPixel の note「双方向補間」 | `data-functions.js:5` | functions.html getPixel「bilinear interpolation」 | 「双線形補間」が正しい用語 |
| R-2 | 重要関数の欠落（リファレンス本文が参照しているのに項目が無い） | data-functions.js | functions.html | getValue（getPixel の note で推奨）、isNaN（getResult の note）、Array.copy（Array.sort の note）、minOf / maxOf（Math.min/max の note）、Math.ceil（floor の note）、getInfo、setForegroundColor、Roi.* など。104件に実在しない関数は無い |
| D-1 | Gamma の範囲が資料・用語・レッスンで 0.1〜5.0 | `data-docs.js:50`, `149`、`data-lessons.js:156` | ImageMath.java 97–104・495–501（0.05〜5.0）。シミュレータ（`app.js:2519`）は 0.05 で、アプリ内で不一致 | — |
| D-2 | Image Calculator の演算子数「12種」 | `data-docs.js:51`, `147` | ImageCalculator.java 21（Add〜Transparent-zero の 13 種） | — |
| D-3 | RGB の輝度換算の既定値 | `data-questions.js:38`（D04 解説）、`data-lessons.js:58` | ColorProcessor.java 26（既定の重みは各 1/3＝単純平均。重み付きは Edit>Options>Conversions の設定時） | 解説は重み付き 0.299/0.587/0.114 を主、単純平均を例外として書いており逆 |
| D-4 | 資料の出典の多くが imagej.net ではない | data-docs.js（51件） | — | imagej.net 15件、imagej.github.io/imagej-wiki-static 18件（旧公式Wikiの静的アーカイブ）、imagejdocu.list.lu 18件（コミュニティ Wiki）。課題条件「出典 URL が公式（imagej.net）」を満たさないものが 36件。リンク到達性は未確認 |

---

## A. 第2ラウンド修正（N1〜N26）の回帰確認

| 項目 | 結果 | 確認内容 |
|---|---|---|
| N1 | 正常 | デモ画像で `run("16-bit")` 後も平均 80.45・最小0・最大255で値保持。TypeConverter の値保持と一致 |
| N2 | **一部不正（S-1, S-4, S-8）** | 公式名テーブル自体は official-functions.txt と全件一致（差分 0）。ただし名前空間4種の欠落、参照引数関数、括弧省略、偽の関数許可が残る。文字列メソッド構文は解釈されるが値が文字列文脈で異なる（S-10） |
| N3 | 正常 | `true && false \|\| true` → 1（右結合）、`if (1==1 && 2)` → 「右辺が 0 か 1 になっていません」、`if (x)` で x=2 → 停止。Interpreter.java 1200–1222（getLogicalExpression2、checkBoolean）と一致 |
| N4 | 正常 | `2 + 3 * 4 & 7` → 6、`5&3, 5\|3, 5^3, 1<<4, 256>>2, ~5` → `1 7 6 16 64 -6`。getTerm 1704–1723 と一致 |
| N8 | 構造は正常（数値は未確認） | `setAutoThreshold()` → 106〜255。ISODATA2 相当の処理経路を確認。実機の値との突合は未実施 |
| N9 | 正常 | 20,000 回ループが完走（19999） |
| N14 | 正常 | 黒画像に Add 10.7 → 10、Subtract 3.9 → 7（切り捨て）、Multiply は Math.round（ImageProcessor.java 1047–1049）で 10.5→11 |
| N23 | 概ね正常 | Default（ピーククリップ＋IJ_IsoData）、IJ_IsoData、IsoData（Ridler–Calvard）が別関数で実装され、AutoThresholder.java 100–164・434–493 とロジックが対応。端ケースの差は S-18 |
| N25 | 正常 | `-0.00001` → `-0.00001`、`-0.000001` → `-1.0000E-6`、`1e10` → `1.0000E10`、`2147483648` → `2.1475E9`、`123456789.5` → `123456790`。ただし丸めの同点処理は S-5 |
| N26 | **再発（P-1）** | 860×700・1280×600 でエディタ 96〜108px（4行） |
| その他 | 正常 | N6 replace（1文字は文字どおり）、N11 split（`"a,b,,c"` を `","` で4要素）、N12 `macro "M1" { }`、N20 `parseInt("12abc")` → NaN、N21 var の全体変数、重複定義は後勝ち（Tokenizer.java 249–280 と一致） |

## B. 関数リファレンス 104 件の照合結果

- 104 件すべて関数名が functions.html に実在。書式・引数個数は validate.mjs の照合（公式スナップショット 580 行）とも一致。
- 説明文・返り値を全件読んで照合した。不正確だったもの: newImage（S-6）、getPixel の用語（R-1）、d2s note の負の桁数とシミュレータの矛盾（S-5）、resetThreshold の例がシミュレータで動かない（S-4）、Array.getStatistics の省略可能性とシミュレータの矛盾（S-13）、getVoxelSize の単位とシミュレータの矛盾（S-14）。
- ソースで裏付けた正常項目の例: File.exists は代入文で数値扱い（Interpreter.java 861–866）、getString は空文字では中止しない（Functions.java 1418–1436。公式文書の「空文字で中止」は現行ソースと不一致だが、アプリの記述はソースどおり）、setBatchMode(false) で隠れ画像を破棄、Math.min/max の 1.52u、Color.getLut の 1.53h（functions.html 2416、327）。
- 欠落: R-2。

## C. レッスン・クイズ

- レッスン 28 件の本文中のマクロ表記は `run("Measure");`、`run("Gaussian Blur...", "sigma=2")`、`getTitle()`、`setBatchMode(true)` などの短い断片のみで、文法・関数名・引数に誤りは無かった（自動抽出 30 箇所を確認）。テンプレート 10 本はすべて診断なしで実行でき、Z投影とチャンネル分割の警告は仕様どおり。
- クイズ 63 問: 正解キー誤り 4 問（Q-1）、内容がソースと食い違う 1 問（T02、L-1）、既定値の記述が逆 1 問（D04、D-3）。それ以外の 57 問は正解・解説とも妥当と判断した（Watershed、Feret、Circularity、Z投影の6方式などは公式資料の記述と整合）。
- 選択肢への用語リンク: 生成されていない（`app.js:2665` で選択肢は `esc()` のみ。問題文・解説・誤答理由だけ linkTerms）。

## D. 用語・資料

- 用語 80 件を全件読んだ。誤りは Make Binary / Convert to Mask（L-1）、Gamma の範囲（D-1）、Image Calculator の演算子数（D-2）。それ以外は公式の意味と矛盾する記述を見つけなかった。
- 資料 51 件: 出典ドメインの内訳は D-4。原典ページに到達できないため、**リンク切れと要約の正確性は未確認**。

## E. シミュレーションの未踏領域（正常に動いたもの）

- do-while（5）、再帰（階乗 120、fib(15)=610）、多重ネスト `g(g(g(g(1))))`=16、`abs(minOf(maxOf(-3,round(2.6)),pow(2,sqrt(9))))`=3。
- 文字列エスケープ `\t` `\\` `\"`、単引用符内の `\'`。
- `++`/`--` の前置・後置（`j=i++ + ++i` → i=3, j=4）、配列要素の複合代入（`a[1]+=5` など）。`%=` は ImageJ に無い演算子であり、シミュレータも構文エラーにする（Interpreter.java 967–968、Tokenizer に MOD_EQUAL 無し）。
- Dialog.* は値を「実行時に決まる値」として正直に扱う。getNumber / getString / File.open / File.openAsString も同様。
- スタック: `newImage(...,5)` → nSlices 5、setSlice / getSliceNumber、Stack.setPosition / getPosition（単一画像ではクランプされて 1,1,1。ImagePlus.setPosition 1850–1861 と一致）。Z Project・Split Channels の前提警告。
- ROI Manager: add / count / select / reset と selectionType の対応は正しい（統計値は S-3）。
- エラー行番号: 未代入変数（3行目・5行目）、配列範囲外（2行目）、括弧・文字列の閉じ忘れ（1行目）を正しく指した。
- 文字列比較は大文字小文字を区別しない（Interpreter.compareStrings 1339–1360 と一致）。
- 静的チェック（pracCheck）は括弧・文字列・コメントの対応のみを見ており、上記テストでは実行診断と矛盾しなかった。矛盾は名前空間の扱い（S-1）で起きる。

## F. ルーティング・状態管理（正常）

- 未知ハッシュ `#/nope`・`#//`・`#/lesson/` はホームへ。`#/lesson/ZZZ`・`#/doc/D99`・`#/function/zzz`・`#/term/zzz` は「見つかりません」と一覧への導線。`#/practice/zzz` は無視して練習画面。`#/doc/D1/zzz` は章を表示。
- 戻る／進むでの画面遷移は正しい（#/lessons ↔ #/lesson/L01 ↔ #/function/getPixel）。
- localStorage `ij-ref-v2` に `{`、`null`、`[]`、文字列、型違いの各キー、`__proto__` を入れても全ページでエラーなし。
- 検索: 空文字・空白のみ・記号のみは 0 件表示、`GETPIXEL` は大文字小文字を無視して getPixel にヒット、「閾値」36 件、`<img onerror>` はエスケープされ実行されない。例外は F-1。
- クイズ: 回答状態はページ移動しても `quiz` オブジェクトで継続、ブックマーク・間違い復習は store に保存。

## G. レイアウト・表示

- P-1 以外: 1280×800 / 1366×768 / 1024×768 / 860×700 / 1280×600 のライト・ダークで横はみ出し 0、JS エラーなし。
- 他ページ（ホーム・レッスン一覧・L05・資料・D6・関数一覧・getHistogram・用語一覧・ROI・検索結果・クイズ・練習）を 375×667 / 375×500 / 1280×500 / 860×400 のライト・ダークで計測: 横はみ出し 0、文字の切れ（overflow hidden / ellipsis による切り詰め）0。
- 「実質縦書き」崩れ: 幅が文字2つ分未満で高さが2.5行を超える要素を全画面で検索し、該当は行番号ガター `pre.ed-gutter`（もともと縦に並ぶもの）のみ。崩れは無し。
- ダークモード: 背景 rgb(13,19,25)・文字 rgb(228,236,244) が全ページに適用され、配色の破綻は見つからなかった（目視は練習画面のスクリーンショットのみ）。

---

## 確認できた正常項目（まとめ）
- 既存テスト 3 本すべて通過（H 節）。
- N1, N3, N4, N9, N14, N25 の修正が維持されている。N23 は別実装として成立。
- 関数リファレンス 104 件の名前・書式は公式に実在。
- テンプレート 10 本、レッスン内マクロ断片に文法誤りなし。クイズの選択肢に用語リンクなし。
- 制御構文・再帰・エスケープ・インクリメント・複合代入・スコープ・重複定義・エラー行番号は ImageJ のソースと一致。
- ルーティングの不正入力、戻る／進む、localStorage 破損、検索の端ケース、XSS 耐性。
- 375px と低い画面での横はみ出し・文字切れ・縦書き崩れなし。ダークモード適用。
- Tab（選択なし）でインデント、Esc→Tab でフォーカス離脱。

## 未確認項目
- 本物の ImageJ / Fiji での実行値の突合（実行が権限判定で拒否されたため）。S-2、S-9〜S-11、S-15 などはソース読解に基づく。
- 公開サイト https://sylpica.github.io/imageJ/ の実体（main と同一である前提で、ローカル配信で検査）。
- imagej.net / imagejdocu / imagej.github.io の各出典のリンク到達性と、資料要約の原典との一致（ネットワーク許可外）。
- 公式メニュー解説（binary.html）の Make Binary の記述（L-1 の補足）。
- 自動閾値（N8・Default など）の数値の実機一致。
- 実機 iOS Safari、スクリーンリーダー。

## 検証に使った一次資料
- ImageJ ソース（github.com/imagej/ImageJ、commit a376e43、1.54u）:
  - ij/macro/Interpreter.java（doAssignment 826–844、getExpressionType 846–935、doArrayElementAssignment 960–1034、doStringAssignment 1091–1106、doTernaryStringAssignment 1138–1170、getLogicalExpression 1200–1222、ternaryOperatorValue 1226–1230、compareStrings 1339–1360、getAssignmentExpression 1366–1391、getParens 1431–1436、getString / getStringTerm 1600–1665、toString 1667–1680、getExpression / getTerm / getFactor 1687–1745、getNumericStringFunction 1846–1867、getStringExpression 1895–1923、runStringFunction 2072–2112、statement 285–355）
  - ij/macro/Functions.java（RESET_THRESHOLD 104、random 1185–1215、getStringDialog 1418–1436、split 1519、getVoxelSize 1911–1921、newImage 3561–3580、print 3666–3694、File.append 4391、doStack 5333–5380、getArrayStatistics 6449–6480、Property 8270–8280）
  - ij/macro/Tokenizer.java（addUserFunctions 249–280）、ij/macro/MacroConstants.java（stringFunctions 117–122）
  - ij/IJ.java（DecimalFormat 初期化 112–124、d2s 1000–1052、newImage/createImage 2280–2318）
  - ij/plugin/Thresholder.java（40–51、150–230）、ij/process/AutoThresholder.java（40–69、100–164、190、434–493）、ij/process/ImageProcessor.java（1047–1049）、ij/plugin/filter/ImageMath.java（95–106、492–503）、ij/plugin/ImageCalculator.java（21–22）、ij/process/ColorProcessor.java（26）、ij/measure/Calibration.java（173–175）、ij/ImagePlus.java（1850–1862）、ij/gui/NewImage.java（120–135）
- functions.html（同リポジトリ同梱、Last updated 2025-09-02）: getPixel, newImage, setAutoThreshold, getStatistics, getDirectory, resetThreshold, nSlices, d2s, String 関数（s.charAt ほか、5070–5082 行付近）、Math 関数（2414–2416）、Color 関数（324–327）
- release-notes.html（同リポジトリ同梱）: 1.54u9 の三項演算子追加
- Java 21 の java.text.DecimalFormat（自作テストで HALF_EVEN / HALF_UP の挙動を実測）
