# AUDIT7-CLAUDE — マクロ機能 独立監査（Claude 側）

監査日: 2026-11-12 / 対象: main 同等の作業ブランチ `claude/sharp-ritchie-rp3xdw`（コード修正なし）
一次資料: imagej.net は本環境から 403 のため、公式ソースの GitHub ミラー `imagej/ImageJ`（master）を照合に使用
（ImageProcessor.java / ImageMath.java / Thresholder.java / AutoThresholder.java / ij/macro/Functions.java / Interpreter.java）。
functions.html は取得不能。そのため関数の書式は Functions.java の実装で確認した。

## 総合判定: 不合格

根拠: (1) Process > Math の換算式のうち 6 種（Min / Max / Square / Square Root / Log / Exp）が公式ソースと食い違う。Min / Max は意味が逆になっている。
(2) 関数のスコープモデルが ImageJ と異なる。グローバル変数を宣言する `var` も解釈できない。
(3) sin / cos / minOf / maxOf / isNaN などを使うと、シミュレーションが例外で落ちる。
(4) 公式に有効な書式の約 20 種を「引数の数が違います」と誤って判定する。
学習アプリとして、誤った知識を「正しい説明」の形で提示してしまうため、公開品質に達していないと判断した。

## 指摘一覧

### 高
| # | 場所 | 内容 | 根拠 | 修正の方向性 |
|---|---|---|---|---|
| H1 | app.js simRunCmd `case "Min"/"Max"`（〜L1974） | Min は `Math.min(v,c)`（上限で切る）、Max は `Math.max`（下限で切る）と実装されており、公式と逆。公式では Min が「値未満を値へ持ち上げる」、Max が「値超を値へ下げる」 | ImageProcessor.process: `MINIMUM: if(i<value) v=value`、`MAXIMUM: if(i>value) v=value`。ImageMath "min"→ip.min | 2 つの関数と説明文を入れ替える |
| H2 | 同 `Square` / `Square Root` | Square は `v*v/255`、Sqrt は `sqrt(v)*16`。公式（8bit）は Square が `i*i` を 255 で打ち切り（16 以上はすべて 255）、Sqrt が `round(sqrt(i))`（0〜16） | ImageProcessor.process SQR / SQRT | 公式の式に合わせ、丸めと打ち切りを入れる |
| H3 | 同 `Log` / `Exp` | 係数 32.8 を使っている。公式は `SCALE=255/ln255≈46.0`、Log は `round(ln i·SCALE)`、Exp は `round(exp(i/SCALE))` | 同 LOG / EXP | 係数を 255/Math.log(255) にする |
| H4 | simPushOp / mathOp | 8bit の飽和（0〜255）と整数への丸めがない。`Add value=300` で平均 380.5、範囲 300〜555 になり、自分の説明文（「255 で止まります」）とも矛盾する。範囲外・非整数の値は simOtsu の hist 配列の外へ書き込まれる | 電池 `addclamp`、`otsuafteradd`。ImageProcessor の 8bit 演算は LUT 化で 0〜255 に制限される | 8bit では演算ごとに丸めて飽和させる。分布は 256 ビンのヒストグラムで保持する |
| H5 | simStaticChecks L1091 | `funcByName(name)` が null になる SIM_EXTRA 名（sin, cos, tan, sqr, minOf, maxOf, getInfo, isNaN 等）で `f.sig` が TypeError になる。UI 側では「説明を生成できませんでした」としか表示されない | 電池 `sin`、`minOf`、`isNaN2`、`NaNcmp`（スタック: app.js:1091） | f が null のときは引数の数のチェックを飛ばす（SIM_EXTRA に arity を持たせる） |
| H6 | readVar / writeVar（L1180〜） | 動的スコープになっている。関数の中から呼び出し元やトップレベルの変数を読め、関数内の代入がグローバル変数を作る（コメントに「ImageJ の仕様」とあるが誤り）。ImageJ では関数内はローカル変数とグローバル変数（`var` 宣言したもの）だけが見え、それ以外は Undefined variable になる | Interpreter.lookupLocalVariable（startOfLocals からと globals だけを探索）。電池 `fnlocal_read`、`fnlocal_write`、`dyn` | 関数呼び出しでは「新しいローカルスコープ＋var グローバル」だけを参照させる |
| H7 | パーサ | `var` キーワードに対応していない。`var x=1;` が「変数 var は、まだ値が代入されていません」になる | 電池 `var_kw`、`varglobal` | var 宣言を構文に追加する（トップレベルなら global 扱い） |
| H8 | simArity / data-functions.js の sig | 省略できる引数・別の書式を認めないため、有効なコードが誤ってエラーになる。確認できた例: close("*")、open()、split(s)、parseInt(s,radix)、runMacro(name)、showProgress(i,n)、getResult("Col")、setThreshold(l,u,"red")、setMinAndMax(a,b,ch)、makeRectangle(...,arc)、Array.sort(a,b)、random("seed",n)、Dialog.addNumber/addString/addChoice の追加引数、indexOf(s,t,from)、substring(s,i)、setAutoThreshold()、saveAs(fmt)、makeLine の多点形式 | Functions.java（substring L2772、showProgress L2908、getResult L1224、makeRectangle L885、parseInt の radix、setAutoThreshold の引数なし形式は ISODATA2）。電池 c4: 25 件中 22 件で誤検出（print()／Array.getStatistics 部分引数の 2 件は一次資料が未確認のため判定保留） | sig に `[ , opt]` 記法で省略可能な引数を記載し、simArity に反映する |

### 中
| # | 場所 | 内容 | 根拠 | 修正の方向性 |
|---|---|---|---|---|
| M1 | 8-bit→16-bit 変換（L1844） | 0〜255 を 0〜65535 に拡大している。公式では 8→16 は値を保持する（0〜255 のまま） | ImageJ TypeConverter（8→16 は値をそのまま） | 8→16 と 8→32 は値をそのまま保つ |
| M2 | 32-bit 変換の説明 | 「0.0〜1.0 のような実数で扱われ」は誤り。8→32 でも値は 0〜255 のまま float になる | 同上 | 説明文を直す |
| M3 | Convert to Mask（閾値未設定）L1854 | 固定値 0〜127 で計算している。公式は ISODATA2（IJ_IsoData）で自動閾値を決める | Thresholder.autoThreshold: `ip.setAutoThreshold(ISODATA2, NO_LUT_UPDATE)` | 分布から IJ_IsoData を計算する |
| M4 | setAutoThreshold（L1625） | どの手法名でも Otsu で計算する。存在しない手法名（"Foo dark"）も警告なしで受け付ける。公式では有効な手法名は 17 種で、それ以外はエラー | ImageProcessor.setAutoThreshold(String) の javadoc／Method.valueOf | 手法名を検証する。Default／IJ_IsoData／Huang などは最低限、近似で計算する |
| M5 | 文字列比較 | `"abc"=="ABC"` を偽と判定する。`"a"<"b"` は「数値が必要」エラーになる。公式は大文字小文字を区別しない比較で、< > も使える | Interpreter.compareStrings: `compareToIgnoreCase` | 公式に合わせる |
| M6 | 字句解析 | ビット演算子 `& | ^ << >>`（と ~）と 16 進リテラル 0xFF を解釈できず、構文エラーになる | ImageJ マクロ言語の演算子表（公式） | トークンと評価を追加する |
| M7 | キーワード表 | `constructor`、`toString`、`hasOwnProperty`、`__proto__` を「キーワードの位置が不正」と判定する。プレーンオブジェクトでキーワードを引いているため、プロトタイプの名前が当たっている。toString() は公式に存在する組み込み関数 | 電池 `protoname`、`fnproto2`、`toStringfn` | キーワード表を Object.create(null) か Set にする |
| M8 | Array.getStatistics | 参照引数リスト（REF_FNS）に入っていないため、`Array.getStatistics(a,mn,mx,mean,sd)` が「変数 mn は未代入」で停止する。リファレンスに載っている関数なのに使えない | 電池 `arrstat` | REF_FNS に追加し、実際に計算する |
| M9 | Math.* / String.* | Math.abs・Math.sqrt などと String.join・String.pad を「定義されていない関数」として停止する（公式には存在。Math.* は 1.52u〜） | 電池 `Math`、`Math.sqrt`、`String.join` | 既知の名前空間を許可リストに入れる |
| M10 | ループ上限 | 上限がループ 1 個ごとに 10,000 回なので、2 重ループで最大 1 億回まで回る。`for i<9999 for j<9999` で 17.9 秒、関数経由で 20.4 秒、メインスレッドが固まる（自動表示モードでは入力中に起きる） | 電池 `nest10k`、`fnloop` の実測 | プログラム全体の評価回数か経過時間に上限を設ける |
| M11 | パーサの再帰 | 長い式（`1+…` が 3000 項）や括弧 2000 段で RangeError が出て、UI は汎用メッセージしか出さない | 電池 `bigexpr`、`deepparen` | 深さの上限と、それを示す専用の診断を出す |
| M12 | Multiply value=0 などの optNum | `optNum(...)||1` のため value=0 が 1 として扱われる。負の値（`value=-10`）は正規表現に一致せず null になる | 電池 `mult0`、`subneg` | null 判定を厳密にし、正規表現に符号と指数を含める |
| M13 | リファレンスの収録範囲 | README は「98件」だが実際は 97 件（validate.mjs も functions=97 と出力）。よく使う組み込み関数の newImage、selectWindow、getValue（getPixel の注記でも参照している）、setColor、drawLine、getNumber/getString、Math.abs、String.*、List.*、Table.* が入っていない | data-functions.js と README.md L12 の比較 | 件数表記を直し、主要な関数を追加する |

### 低
| # | 内容 | 根拠 |
|---|---|---|
| L1 | parseInt("12.7") を 12 とする。公式は parseDouble してから丸めるので 13。parseInt("x") は NaN に確定するが、「実行時に決まる値」と表示する | Functions.parseInt |
| L2 | Gamma value=10 を受け付ける。公式のダイアログは 0.05〜5.0 の範囲外を拒否する | ImageMath L497 |
| L3 | タイプミス候補を提示しない。「Gausian Blur...」は末尾の "..." が編集距離に加算され、距離 4 で候補から外れる | 電池 `unknowncmd` |
| L4 | substring("abc",5) が空文字を返す。公式では範囲外はエラー | — |
| L5 | tests/overflow.mjs に開発者のローカル絶対パス（/home/hatch/...）がハードコードされていて、他の環境では実行できない | 実行結果 ENOENT |
| L6 | ダークモードがない（prefers-color-scheme: dark でも明るい背景のまま）。崩れはない | UI 検査 |
| L7 | 練習画面は 375px 幅で全高が約 2000px あり、主要操作が一画面に収まらない（エディタ→解説→シミュレーション→免責の縦積み）。免責は下部に置かれていて規約に合っている | prac375.png |
| L8 | 用語リンクが語の途中で切れる（「Slices」が Slice＋s、「Channels」が Channel＋s のようにリンクされる） | テンプレート解説の表示 |

### 問題なしを確認した項目（自己整合ではなく一次資料で確認）
- Gamma の式 `255·(v/255)^g`（ImageProcessor GAMMA）
- Add と Multiply の基本式
- replace の 1 文字リテラル置換（Functions.replace）
- setAutoThreshold の "dark" の意味（dark なら [t+1, 255]、反転 LUT でなければ）。Otsu の基本アルゴリズムはクラス間分散の最大化で一致
- getPixel の範囲外は 0
- エディタの Tab：Esc→Tab と Shift+Tab で抜けられ、フッターにも明記されているので、キーボードトラップではない

## 実施した検証の数値
- 既存テスト: validate.mjs ALL CHECKS PASSED。audit.mjs は PASS 247 / FAIL 0。overflow.mjs は環境依存パスのため実行不能（L5）
- 電池（エンジン直接・Chromium 上）: 第 1 群 160 件（PASS 128 / FAIL 32。うち 1 件は私の期待値の誤りで、replace はアプリ側が正しい）、第 2 群 16 件（クラッシュ 3）、第 3 群 10 件（観察）、書式の誤検出群 25 件（誤検出 22）。合計 211 件
  - 内訳: 演算・式 30、制御構文 10、関数・スコープ 17、プロトタイプの名前 6、配列 13、文字列 19、画像操作・run 40、構文エラー系 4、境界（空・巨大・深い再帰・無限ループ・長文字列・Unicode）12、書式・引数 25、その他 35
- UI: 幅 320 / 375 / 1280 × ライト・ダーク = 6 条件で、練習画面、テンプレート 10 種すべての選択と実行、エラー行へのジャンプ（3 行目へ移動を確認）、キーボードの Tab 巡回 40 回、関数一覧（97 件表示）、関数の詳細 2 件、練習内リファレンスの検索と書式挿入を確認。アサーション 390 件で、横溢れ・はみ出し・縦書き崩れは 0。JS エラー 0
- フォーカス自動判定が 6 件 FAIL したが、これは textarea にフォーカスが留まったことによる判定スクリプトの誤検知（仕様どおり）と判断した

## 未検証の範囲
- functions.html 本文（403）。書式は Functions.java の実装で代替して確認した。print() の 0 引数と Array.getStatistics の部分引数は判定を保留
- 実機の ImageJ／Fiji での実行比較（環境に ImageJ がない）。16-bit や Default 手法の実際の数値
- iOS Safari と Android の実機表示、スクリーンリーダー読み上げ
- レッスン・問題・文書のマクロ関連の本文は、Math／閾値に関する記述を抜粋して見ただけで、全文の精査はしていない

## 判断事項・運用メモ
- imagej.net が 403 だったため、公式の GitHub ミラーを一次資料として扱った
- コードの修正、main／gh-pages への反映は行っていない
- 監査中のモデル表示に想定外の切り替えは見ていない（configured: claude-opus-5-5）
