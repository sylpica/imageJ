# AUDIT8-CLAUDE — マクロ機能 第2ラウンド独立監査（Claude 側）

監査日: 2026-11-12 / 対象: main `322f6c6`（AUDIT7 統合修正後）。監査中に main へ入った `8fb567b`（練習画面の PC 1画面レイアウト・ダーク時のシミュレーションパネル）も作業ブランチへ取り込み、対象に含めた。コードの修正・反映はしていない（報告のみ）。
一次資料: ImageJ 公式ソースの GitHub ミラー `imagej/ImageJ`（master）。照合したファイルは Interpreter.java、Functions.java、ImageProcessor.java、ImageMath.java、TypeConverter.java、ImageConverter.java、AutoThresholder.java、Thresholder.java、ZProjector.java、ChannelSplitter.java、EDM.java。
関数の実在は tests/official-functions.txt（公式 functions.html のスナップショット、552 書式）で確認した。
アプリ側の説明文と既存テストの期待値は根拠に使っていない。

## 総合判定: 不合格

前ラウンドの高 8 件のうち、H1〜H7 は一次資料どおりに直っている。ただし、次の 3 点が高のまま残っている。

1. **8→16bit 変換の誤りが再発している（AUDIT7 の判断が誤り）**: AUDIT7 は前ラウンドの M1 を「doScaling の既定が true なので ×257 が正しい」として退けた。しかし公式の `TypeConverter.convertByteToShort` は doScaling を参照せず、値を 0〜255 のまま保持する。この誤りが 16bit 上の閾値・二値化にも連鎖して壊している。
2. **静的チェックが公式関数の約 7 割を「定義されていない関数（ImageJ ではここで止まる）」と誤判定する**: 公式書式 552 件のうち 385 件が誤判定される。toLowerCase、lastIndexOf、getTime、wait、updateDisplay、getValue、List.*、Table.*、Array.concat などが含まれる。`s.contains()` のような文字列メソッド構文もすべて誤判定になる。
3. **`&&` / `||` の意味論が ImageJ と違う**: ImageJ では `&&` と `||` が同じ優先順位で右結合になり、短絡評価もしない。アプリは C 言語式の優先順位と短絡評価で動くため、条件分岐の結果が変わる。

このほか、AUDIT7 で追加された機能にも新しい誤りがある。ビット演算子の優先順位、replace の正規表現、Array.getStatistics の標準偏差、Divide 0 の NaN 表示などで、詳細は新規指摘に記す。

---

## 1. 前ラウンド指摘の修正確認

| # | 前回の内容 | 判定 | 確認内容（電池・一次資料） |
|---|---|---|---|
| H1 | Min/Max の意味が逆 | **修正済** | Min 100 → [100,100,100,100,128…]、Max 100 → […,100] が ImageProcessor.process MINIMUM/MAXIMUM と一致。ただし非整数値は `(int)value` で切り捨てるのが公式で、アプリは丸める（N14、低） |
| H2 | Square / Square Root | **修正済** | LUT の 9 点が `i*i` の 255 打ち切り、`round(sqrt(i))` と一致 |
| H3 | Log / Exp | **修正済** | SCALE=255/ln255 で 9 点が一致 |
| H4 | 丸め・飽和 | **概ね修正** | 8bit の飽和と丸めは一致。Add 100 → Subtract 100 の連鎖も公式どおり 155 で止まる。残る誤り: Add/Subtract の非整数値（公式は `i+(int)value`）、Divide value=0（N5） |
| H5 | 静的チェックのクラッシュ | **修正済**（新しいクラッシュが 1 件） | sin、minOf、isNaN などで落ちないことを確認。公式書式 552 件の電池では setResult の行が実行時に決まる値のときだけ TypeError になる（N10） |
| H6 | スコープモデル | **修正済** | 関数からトップレベルの非 var 変数は読めない（エラー）、var の読み書き、関数内で作った変数が外へ漏れない、引数による遮蔽、関数内の var はローカル、再帰、配列の参照渡し、参照引数の関数内書き込み、の 12 件がすべて Interpreter.lookupLocalVariable と一致。残る差: var の初期化式が計算式で、宣言行より前に関数から参照する場合（公式は saveGlobals2 で事前評価する。N21、低） |
| H7 | var 未対応 | **修正済** | `var x;`（値 0）、`var a=1,b;`、for の初期化での var を確認 |
| H8 | 省略可能引数の誤検出 | **部分修正** | 前回の 22 件はすべて解消。残り: `print()`（公式書式にある）、`setColor(value)`（1 引数の公式書式）、`indexOf(s2)` などの文字列メソッド形式（N2） |
| M1 | 8→16bit が ×257 | **未修正（退けた判断が誤り）** | N1 参照 |
| M2 | 8→32bit の説明 | **修正済** | 「0〜255 のまま実数」に変わり、値も保持される |
| M3 | Convert to Mask の自動閾値 | **部分修正** | 暗い背景のモデルでは IJ_IsoData 106 と一致。前景の側をヒストグラムの最頻値の位置で選ぶ処理がなく、反転画像では前景が逆になる（N8） |
| M4 | 手法名の検証 | **修正済**（計算は近似のまま） | "Foo dark"、"otsu dark"（小文字）がエラーになる。これは Method.valueOf が大文字小文字を区別することと一致する。モデル画像での公式値を移植計算すると Default 106 / IJ_IsoData 106 / Otsu 106 / IsoData（Ridler 法）107。アプリは IsoData も 106 として扱い、1 段ずれる（N23、低） |
| M5 | 文字列比較 | **修正済** | `"abc"=="ABC"` が真、`"a"<"B"` が真（compareToIgnoreCase） |
| M6 | ビット演算・16 進 | **実装されたが意味論が誤り** | 0xFF、~5、1<<31（-2147483648）、7.9&3（3）は正しい。優先順位が C 言語式になっている（N4） |
| M7 | プロトタイプの名前 | **修正済** | constructor、__proto__、関数名 hasOwnProperty で正しく動く |
| M8 | Array.getStatistics | **実装されたが値が誤り** | 標準偏差が母集団式になっている。公式は n−1（N7） |
| M9 | Math.* / String.* | **部分修正** | Math.abs、Math.ceil、String.join、String.pad は動く。String.append などの String.*、IJ.pad は未定義エラーになる（N2） |
| M10 | ループで画面が固まる | **修正済**（別の副作用が残る） | 9999×9999、`while(true)`、関数経由の 8100 万回が、いずれも 70ms 以内に打ち切られる。自動表示モードでも 1 秒以内に応答する（UI 6 条件）。ただしループ 1 個あたり 10,000 回の上限が残っていて、正当な 20,000 回のループを「無限ループの可能性」というエラーで止める（N9） |
| M11 | 深い式で RangeError | **修正済**（副作用が 1 件） | 括弧 2000 段は専用の診断になる。平坦な `1+1+…`（5000 項）も「深すぎる」と判定し、行番号が 0 になる（N22、低） |
| M12 | optNum の 0 と負数 | **修正済** | Multiply 0 → 全 0、Subtract -10 → +10 |
| M13 | 収録件数と主要関数 | **修正済**（件数の範囲内で） | 一覧は 104 件で README と一致。newImage、selectWindow、getNumber/getString、setColor、drawLine を収録 |
| L1 | parseInt | **修正済** | "12.7" → 13、("ff",16) → 255 |
| L2 | Gamma の範囲 | **部分修正** | 警告は出るが変換を適用してしまう。公式は canceled で画像は変わらない（N15） |
| L3 | タイプミス候補 | **修正済** | 「Gausian Blur...」で候補を提示する |
| L4 | substring の範囲外 | **修正済** | エラーになる |
| L5 | overflow.mjs のパス | **修正済** | 実行できた（scanned=822 / problems=0） |
| L6 | ダークモード | **修正済** | 背景と editor の輝度を 3 幅で確認 |
| L7 | 練習画面が縦長 | **概ね解消**（8fb567b）。条件つきで欠陥あり（N26） | 1280×800、1440×900、1366×768、1920×1080 で作業台（.prac-wb）がビューポート内に収まる。.foot-note は作業台の下にある。エディタ、関数リスト、テンプレートガイド（最大 168px）、シミュレーション出力が、それぞれのパネル内でスクロールする。375px は従来のタブ切替で、横溢れ 0、タブの表示切替も正常。ダーク時の .prac-sim の背景は rgb(21,30,40)（パネル色）で、body の rgb(13,19,25) と区別される |
| L8 | 語の途中のリンク | **修正済** | 「nSlices / Channels / Slices」にリンクが付かず、「スライス」だけにリンクが付く |

---

## 2. 新規指摘

### 高

| # | 場所 | 内容 | 一次資料 | 再現 |
|---|---|---|---|---|
| N1 | app.js simRunCmd `case "8-bit"/"16-bit"`（`Math.round(b/from*to)`）と説明文 | 8→16bit 変換で値を ×257（0〜65535）に拡大し、説明でも「0〜65535 の範囲に換算され」と述べている。公式では 8→16 は値を保持する（0〜255 のまま）。AUDIT7 が M1 を退けた根拠（doScaling の既定が true）は、この経路には当てはまらない。連鎖する誤り: `run("16-bit"); run("Add...","value=300")` で範囲が 300〜65535 になる（公式は 300〜555）。`run("16-bit"); setAutoThreshold("Default dark")` は 128〜255 になる。`run("16-bit"); run("Convert to Mask")` は平均 0（全面が黒）になる | TypeConverter.convertByteToShort L159-165 は `pixels16[i]=(short)(pixels8[i]&0xff)` で、scaling 分岐がない。ImageConverter.convertToGray16 L74 → ip.convertToShort(doScaling) → TypeConverter.convertToShort L142-145 の BYTE 分岐は convertByteToShort だけ | `run("16-bit"); getMinAndMax(a,b); print(a+" "+b);` → アプリ「0 65535」。画面上でも確認 |
| N2 | simStaticChecks、simBuiltin の末尾 | 関数リファレンス（104 件）と SIM_EXTRA にない公式関数を、すべて重大度 err で「定義されていない関数です…ImageJ ではここでエラーになり止まります」と判定する。公式書式 552 件中 385 件が該当する。例: toLowerCase/toUpperCase、lastIndexOf、matches、fromCharCode、charCodeAt、getTime、wait、updateDisplay、getValue、getPixelSize、getDateAndTime、getRawStatistics、getSelectionCoordinates、getLine、drawString、drawRect、fillRect、setFont、setForegroundColor、setLineWidth、rename、imageCalculator、IJ.pad、IJ.log、Array.concat/copy/getSequence/print/reverse/slice/trim/rankPositions、List.*、Table.*、Plot.*、Overlay.*、Roi.*、File.getName/getDirectory/isDirectory/makeDirectory/saveString、Stack.setSlice/setChannel。文字列メソッド構文（`s.contains("a")`、`s.length()`、`s.toUpperCase()`）も同じ扱いになる。`File.separator` は「この式は解釈できませんでした」になる。arity の誤検出: `print()`、`setColor(value)` | tests/official-functions.txt（公式 functions.html の 2026-11-10 スナップショット）に、これら全書式が収載されている | 公式書式 552 件を引数の個数どおりに自動生成して通した。未定義の判定 385、arity 誤検出 8、クラッシュ 1 |
| N3 | simParse の LEVELS（`["||"],["&&"]`）、evBin の `&&`/`||` | ImageJ の `&&`/`||` は同じ優先順位の右再帰で、右辺を常に評価する（短絡評価しない）。値が 0/1 以外ならエラーになる。アプリは C 言語式（`&&` が上位）で短絡評価をする。影響の例: `if (0 && 0 || 1)` は ImageJ では偽（0 & (0\|1)）、アプリでは真。`if (i<a.length && a[i]>0)` は ImageJ では右辺の配列範囲外でエラーになるが、アプリはエラーなしで通す。学習者が ImageJ では動かない書き方を「安全」と学ぶおそれがある | Interpreter.getLogicalExpression2 L1208-1222: v1 を得た後、`double v2 = getLogicalExpression();` を無条件に評価し、`(int)v1 & (int)v2` / `\|` で結合する。checkBoolean で 0/1 を強制する | 電池 `op:&&\|\| prec`、`op:no short-circuit` |

### 中

| # | 場所 | 内容 | 一次資料 | 再現 |
|---|---|---|---|---|
| N4 | simParse の LEVELS | ビット演算子 `& \| ^ << >>` を C 言語式の優先順位で解析している。ImageJ ではこれらは `* / %` と同じ階層（getTerm）にあり、左から評価される。`6&1+1` は公式 1・アプリ 2、`1+2<<3` は公式 17・アプリ 24、`2\|1==3` は公式 1・アプリ 2 | Interpreter.getTerm L1704-1720 | 電池 `op:bit prec` 3 件 |
| N5 | simRunCmd `case "Divide"` | `value=0` で v/0 を計算し、0 画素が NaN、それ以外が 255 になる。画面にも「平均 約 NaN、範囲 NaN〜255」と表示される。公式では 8/16bit の 0 除算は何もしない | ImageMath L63-67: `if (mulValue==0.0&&imp.getBitDepth()!=32) return;` | 画面の実操作でも確認 |
| N6 | simBuiltin `case "replace"` | old が 2 文字以上のときも文字どおりに置換している。公式は 1 文字なら文字どおり、2 文字以上なら正規表現（replaceAll）で、自前の関数リファレンスの記述とも矛盾する。`replace("a1b22c","[0-9]+","#")` は公式 "a#b#c"・アプリは変化なし | Functions.replace L3911-3933 | 電池 `str:replace regex2` |
| N7 | simBuiltin `case "Array.getStatistics"` | 標準偏差を母集団式（÷n）で計算している。公式は ÷(n−1)。[1,2,3,4] で公式 1.2910・アプリ 1.1180 | Functions.getArrayStatistics L6449-6487: `Math.sqrt(stdDev/(n-1.0))` | 電池 `arr:Array.getStatistics` |
| N8 | setAutoThreshold（引数なし）、Convert to Mask（閾値未設定） | 引数なしの `setAutoThreshold()` を "Default"・明るい背景として扱い、[0,106] を返す。公式は旧方式の ISODATA2 で、平滑化したヒストグラムの最頻値がどちら側にあるかで前景を選ぶ。暗い背景のモデルでは [106,255]（下限は t、+1 しない）になる。Convert to Mask も同じ側の選択が必要だが、アプリは常に [t,255] を選ぶ。そのため `run("Invert"); run("Convert to Mask")` で前景が逆になる（アプリは白 66%（平均 168.6）、公式の計算では閾値 148 の [0,148] で白 約 34%） | Functions.setAutoThreshold L3612-3632（引数なし → `ip.setAutoThreshold(ISODATA2, RED_LUT)`）、ImageProcessor.setAutoThreshold(int,int) L682-748、Thresholder.autoThreshold L432-436 | 電池 `thr:noarg`、`thr:mask after invert`。公式値は Node への移植計算による |
| N9 | execLoop `count >= 10000` | 総量上限（30 万回）とは別に、ループ 1 個あたりの 10,000 回上限が残っている。正当な `for(i=0;i<20000;i++)` を重大度 err「繰り返しが 10,000 回を超えました／無限ループの可能性」で止める。画素数（512×512=262,144）程度の単一ループでも誤診断になる | 公式にこの上限はない | 電池 `loop:10001 legit` |
| N10 | simBuiltin `case "setResult"` | 行番号が実行時に決まる値（SIM_UNK）のとき `S.results[ri][...]` で TypeError になり、画面は汎用の「説明を生成できませんでした」だけを出す | — | `n=getNumber("n",0); setResult("A", n, 1);` |
| N11 | simBuiltin `case "split"` | 区切りが "," または ";" のとき、公式は `s1.split(s2,-1)` で空要素を残す。アプリは空要素を捨てて前後の空白も trim する。`split("a,b,,c",",")` は公式 4 要素・アプリ 3 要素、`split("a, b",",")[1]` は公式 " b"・アプリ "b"。区切りを省略したとき公式は空白・タブ・改行で分けるが、アプリは空白だけで分ける。自前のリファレンスの注記（空文字列が混ざる）とも矛盾する | Functions.split L1519-1538 | 電池 `str:split`（期待値を一次資料に合わせて補正した）、`split comma`、`split ws default` |
| N12 | パーサ | 公式構文の `macro "名前" { … }`（マクロセット。StartupMacros の形式）を解釈できず、「変数 macro は、まだ値が代入されていません」と誤った原因を示す | 公式 macros.html のマクロセット構文、Interpreter の MACRO トークン（saveGlobals2 L224 の skipMacro） | 電池 `misc:macro block` |
| N13 | simRunCmd `Z Project` / `Split Channels` | 1 枚だけの画像では「結果はほぼ元の画像と同じ」「分割されません」と無害な処理として説明する。公式はそれぞれ "Stack required"、"Multichannel image required" のエラーを出して処理しない。テンプレート「Z投影とチャンネル分割」をモデル画像で実行すると、この説明になる | ZProjector.run2 L144-146、ChannelSplitter.run L31 | テンプレート 10 番の実行 |

| N26 | style.css `.prac-wb`（8fb567b） | PC レイアウトで、テンプレートを選ぶとエディタがほとんど見えなくなる。ガイドが固定で最大 168px を取り、作業台の高さは `100dvh − 132px`（ヘッダーの高さを決め打ち）と `min-height:560px` で決まるため、その残りがエディタに回るだけになっている。実測したエディタの高さ（テンプレート選択時／未選択時）: 1280×800 で 117／285px、1366×768 で 101／269px、1280×600 で 61px、860×700 で **24px（1 行）**。860px 付近ではヘッダーが 2 段に折り返し（作業台の上端が 118→163px）、関数リストもチップに押されて約 1 行になる。作業台がビューポートからはみ出す量は、860×700 で 31px、1280×600 で 78px（min-height による） | L7 対応の要件（PC で 1 画面に完結し、各パネル内でスクロールする） | Playwright で 9 ビューポートを実測（テンプレート「粒子カウント」と 240 行のコードを入れた状態）。スクリーンショットで 860×700 のエディタが 1 行になることを確認 |

### 低

| # | 内容 | 一次資料 |
|---|---|---|
| N14 | Add/Subtract の非整数値（公式は `i+(int)value`。Add 2.7 で +2、Subtract 2.7 で −2）と Min/Max の非整数値（公式は `(int)value`）を、アプリは丸めている | ImageProcessor.process L1044-1046、L1077-1088 |
| N15 | Gamma の範囲外（10）で警告は出すが、変換も適用する（平均 22.0）。公式は canceled で画像を変えない | ImageMath L96-104 |
| N16 | `print("a", 1)` がアプリでは "a1"。公式は引数を空白で区切る（"a 1"）。リファレンスの用例 `print(mean, std)` の出力と食い違う | Functions.print 付近 L3684-3689（`sb.append(" ")`） |
| N17 | `Array.sort` の文字列が大文字小文字を区別する順序になっている（["a","B"] → "B" が先頭）。公式は CASE_INSENSITIVE_ORDER で、自前のリファレンスもそう説明している | Functions L6391 |
| N18 | `getResult("Mean")`（行の省略は最終行）を「結果表にない値」と警告する。行が範囲外のとき、公式はエラー（"Row (n) out of range"）だが、アプリは警告にとどまる | Functions.getResult L1224-1247 |
| N19 | 文字列を返す三項演算子（公式 "String operands not supported"）、`2 && 1`、`!2`（公式 "Boolean expected"）をエラーにしない | Interpreter L1228-1229、checkBoolean、getFactor の '!' |
| N20 | `parseFloat("x")` を「実行時に決まる値」と表示する（公式は NaN に確定する） | Functions.parseFloat（Tools.parseDouble） |
| N21 | var の計算式による初期化を、宣言行より前の関数呼び出しで参照すると 0 になる（公式は事前評価するので 6） | Interpreter.saveGlobals2 L215-234 → doVar |
| N22 | 平坦な長い式（`1+…` 5000 項）を「深すぎる」と判定し、行番号 0 で止まる。公式の getExpression はループなので有効なコード | Interpreter.getExpression L1687-1701 |
| N23 | 閾値の近似: "IJ_IsoData" に Default 用の最頻値クリップをかけている（公式の IJ_IsoData はクリップなし）。"IsoData"（Ridler 法）を IJ_IsoData と同一視している（モデル画像では 1 段の差） | AutoThresholder.getThreshold L65-69、defaultIsoData、IsoData L434- |
| N24 | Process > Math の AND/OR/XOR（公式は 2 進文字列の値）、Set、Reciprocal、Macro を値変換として扱わず、変化表も出ない。説明文は「ビット演算を行います」だけ | ImageMath L68-86、L106-125 |
| N25 | 絶対値の小さい小数の表示（`print(-0.00001)` → "0"）。公式は d2s(x,4,9) を使うので、指数表記になる可能性が高い。正確な出力文字列は未確認 | Interpreter.toString L1666-1679 |

### テンプレート・レッスン・問題・文書（意味論の精査）
- テンプレート 10 本をすべてエンジンに通した。誤検出 0、Log 出力は手計算と一致した（7、0.75、偶奇、47 / 11.75、円の面積）。解説・試行例の記述に意味論の誤りは見つからなかった。ただしテンプレート 10 番は N13 の影響で、モデル画像に対して誤った説明が出る。
- L14、L23、D10-1〜D10-4、Q52〜Q60（マクロ分類）、用語「.ijm」「バッチ処理」「StartupMacros」を通読し、マクロの意味論に関わる記述を確認した。setBatchMode の自動解除、run() の第 2 引数、-macro/-batch、getArgument はいずれも妥当で、誤りは見つからなかった。
- 関数リファレンスの記述が正しいのに、シミュレーションの実装がそれと矛盾する例が 3 件ある（replace の正規表現、split の空要素、Array.sort の大文字小文字無視）。リファレンス側は一次資料と一致している。

---

## 3. 実施した検証の数値

- 既存テスト: `tests/validate.mjs` ALL CHECKS PASSED（関数 104、公式照合を含む）。`tests/audit.mjs` AUDIT ALL PASSED（PASS 247）。`tests/overflow.mjs` scanned=822 / problems=0
- パターン電池（エンジン直接・Chromium 上、合計 **789 件**）
  - 第 1 群 198 件: 初回の判定は PASS 144 / FAIL 54。一次資料で再検証した結果、私の期待値の誤りが 2 件あった（`newArray(1)` は要素数 1 の配列なので `a[0]+=5` は 5 で、アプリが正しい。`split("a,b,,c",",")` は公式では 4 要素で、私の期待値 3 のほうが誤り。この件はアプリも誤りとして N11 に記載）。内訳: Math LUT 25、スコープ 12、演算子 22、文字列 18、配列 8、数学 7、ループ 10、閾値 11、有効書式 59、境界・その他 26
  - 公式書式の網羅群 552 件: 未定義の誤判定 385、arity 誤検出 8、クラッシュ 1
  - 追加群 39 件: テンプレート 10、文字列メソッド・連結・数値表示 13、参照引数・結果表・16bit 連鎖 12、境界 3、用語リンク 1
  - 処理時間: 最大 70ms（9999×9999 の二重ループ、無限 while、無限再帰を含む）
- 練習画面のレイアウト（8fb567b）: 9 ビューポート（1280×800、1440×900、1366×768、1920×1080 ダーク、1280×800 ダーク、860×700、1280×600、375×812 ライト／ダーク）でテンプレートを選んだ場合と、4 ビューポートで選ばない場合を計測した。アサーションは 79＋40 件で、FAIL は 8 件（すべて N26 に集約）
- 閾値の公式値: AutoThresholder の Default / IJ_IsoData / IsoData / Otsu と、ImageProcessor の ISODATA2 を Node に移植し、モデルのヒストグラム（262,144 画素を整数化）で計算した
- UI（Playwright）: 幅 320 / 375 / 1280 × ライト・ダーク = 6 条件。各条件で 8 種のコードを実行した（ビット演算、二重ループ、未定義変数、16bit 変換、0 除算、未収録関数、400 文字の行、テンプレート選択）。あわせて、エラー行へのジャンプ（3 行目を選択）、自動表示モードでの無限ループ入力、ダーク時の背景と editor の輝度、関数一覧の件数（104）を確認した。アサーションは 175 件ですべて PASS（横溢れ 0、JS エラー 0、応答 2.5 秒以内）

## 4. 未検証の範囲
- 実機の ImageJ / Fiji での実行比較（環境に ImageJ がない）。数値はすべてソースを読んだうえでの移植計算による
- 公式 functions.html 本文の再取得（今回はリポジトリ内のスナップショットで代替した）。macros.html のマクロセット構文は記憶とソース上のトークン処理だけで確認している
- Convert to Mask の出力画素値と Prefs.blackBackground の既定値（公式の既定値を本監査では確認していない）
- N25 の正確な表示文字列、Huang など Otsu 近似で扱う手法の公式値との差
- iOS Safari と Android の実機表示、スクリーンリーダーでの読み上げ
- レッスン・問題・文書のうち、マクロ以外の分野（フィルタ、測定など）の本文

## 5. 修正の方向性（参考、優先順）
1. N1: 8→16 は値を保持する。16→8 は表示範囲で換算する。説明文も直す
2. N2: 公式スナップショットに載っている名前は「未収録のため説明を省略」（警告または情報）に格下げし、エラーにするのは本当に存在しない名前だけにする。文字列メソッド構文を認識させる
3. N3 / N4: 演算子の階層を公式に合わせる（getTerm にビット演算、`&&`/`||` は同じ階層の右再帰で短絡評価なし、0/1 のチェック）
4. N26: ガイドを折りたためるようにするか、エディタに最小の高さ（例: 8 行）を保証する。作業台の高さはヘッダーの実測値から求める
5. N5〜N13: 各関数の公式実装に合わせる。N9 はループごとの上限を外して総量上限だけにする
