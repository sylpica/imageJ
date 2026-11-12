# AUDIT9 — 第3ラウンド二重監査の統合記録

- 実施日: 2026-11-13
- 一次監査（Claude Code）: セッション session_01VCQ3xtDEAqTtZNSWXchHkN（Opus／中）、ブランチ `claude/festive-cerf-g1rdm5`、報告書 `AUDIT9-CLAUDE.md`（コミット b8d5d55）
- 判定: 不合格、指摘29件（高4・中9・低16）
- 二次検証（Muse側）: 全指摘を ImageJ 公式ソース（GitHub ミラー ij パッケージ、1.54系）・公式関数リファレンスと突合して採否を決定し、統合修正した。本書が統合結果の正本である。

## 採用して修正した指摘

### 高
- **Q-1 クイズ正解キーの誤り（4問）**: B05（a: 0→3）、F06（1→0）、M01（2→0）、FL03（3→2）。選択肢の並び替え時に正解番号と誤答理由 `w` が追随していなかった。4問とも意味照合で正解選択肢を確認し、`w` の null 位置も合わせて修正。回答分布は 17,15,16,15 に変化（validate で確認）。
- **S-1 参照引数関数・名前空間の誤エラー**: getRawStatistics、getPixelSize、getCursorLoc、getLine、getSelectionCoordinates、getLut、getDateAndTime、getLocationAndSize、getDisplayedArea、Roi.getBounds、Roi.getCoordinates、Stack.getStatistics を参照関数として登録し、結果を「実行時に決まる値」として変数へ書き込むよう変更。名前空間 Fit / Image / Property / RoiManager をシミュレーション対象に追加（Fit.doFit、RoiManager.select、Property.set 等が未定義で止まらない）。
- **S-2 数値＋文字列の代入**: 代入文では ImageJ と同じく数値文脈で評価する（`i=1; s=i+".tif"` → NaN、`3+"5"` → 8、`1+2+"a"` → NaN）。根拠は Interpreter.java の getExpressionType／getExpression（文字列定数は Tools.parseDouble で数値化され、読めなければ NaN）。print 引数は文字列文脈のままで、`getStringExpression` の「数値ランは文字列項の前で止まる」規則を再現（`print(1+2+"a")` → "3a"、`print(w + "x" + h)` → "512x512"）。
- **S-3 ROI の無視**: getStatistics は ROI がある場合その面積を使い（矩形＝w×h、楕円＝π·w·h/4 の丸め、その他は実行時値）、統計量は実行時値に切り替える。Measure の Area も同じ規則。全面矩形 ROI は従来どおり画像統計を使う。

### 中
- **S-4 括弧なし呼び出し**: `resetThreshold;`、`x = getTitle;` のような公式に認められた省略形を、既知関数の裸の識別子としてパースするよう変更。
- **S-5 d2s の丸め・書式**: Java DecimalFormat の規則に合わせた。0桁のみ HALF_UP、1桁以上は HALF_EVEN、負の桁数は指数表記（"1.23E3" 形式）、桁数上限9。print の既定書式も同じ規則に統一（print(10.03125) → "10.0312"）。
- **S-6 newImage の塗り**: IJ.java createImage の実コードで確認。既定は 8-bit／RGB が白、16／32-bit が黒。"ramp"（勾配）・"noise"（ランダム）にも対応。7引数形式は channels／slices／frames を分離して保持し、総スライス数＝積、getDimensions は各次元を返す。リファレンスの newImage 説明も実態に合わせて改稿。
- **S-7 捏造値の提示**: getFileList の例示ファイル名に「（例）」を付け、手順文でも例示であることを明示。getDirectory は既知キー（home 等）ではダイアログが出ないことを手順文に反映。
- **S-8 実在しないトップレベル関数**: sinh、cosh、tanh、sqr、setInfo、getKeyModifiers を計算対象から外し、未定義関数エラーにした（Math.sqr、Property.setInfo は名前空間付きで実在するため残置）。minOf／maxOf／getInfo／isNaN は実在を確認し残置。
- **L-1 Make Binary と Convert to Mask の説明**: Thresholder.java で確認。両コマンドは共通処理で、閾値が設定されていればそれを使い、未設定なら自動決定する。違いは主に結果の形式。クイズ T02、レッスン L10、用語2件、ドキュメント D6-1 をすべてこの実態に書き換えた。
- **P-1 N26 の再発（テンプレート選択時のエディタ圧迫）**: 原因はツールバーの折り返し（860px で2段）とガイド上限。ツールバーを1行固定＋セレクトの縮小許可に変更し、低い画面高ではガイド上限を 118px→76px／60px に段階的に下げる。最も長いガイドのテンプレートで 860×700・1280×600 ともエディタ 150px 以上を確保（レイアウトスモークで閾値 150px に引き上げて固定）。
- **P-2 複数行選択＋Tab**: 選択範囲の各行を字下げし、選択を保持するよう変更。単一行・無選択時は従来どおり。

### 低
- **S-9 複合代入の評価順**: 左辺の現在値を右辺評価より先に読む（`x=5; x++; x+=x++;` → 12）。Interpreter の getAssignmentExpression の順序どおり。
- **S-10 文字列メソッドの文脈**: 文字列文脈では contains 系は "true"/"false"、charAt は文字そのものを返す（runStringFunction の実装どおり）。代入などの数値文脈では従来の 1/0・文字コード。
- **S-11 ユーザー関数の print 表示**: getStringTerm の規則どおり、整数値は d2s 形式、それ以外は Java の double 文字列化（1/3 → "0.3333333333333333"）。
- **S-12 random("seed")**: 種が整数でない場合は ImageJ と同じくエラーにする。
- **S-13 Array.getStatistics**: 後方の引数は省略可能（min 1〜max 5）に修正。
- **S-14 getVoxelSize の単位**: "pixel" → "pixels"。
- **S-15 文字列三項演算子**: 1.54u9 以降は代入文でのみ許可されるため、代入・return・変数宣言の初期化では文字列分岐を許可し、数値文脈では従来どおりエラーにした。
- **S-16 nSlices の不一致**: 裸の nSlices も現在の画像のスライス数を返すよう統一。
- **S-17 使用例の断片性**: 関数リファレンスと練習画面の使用例の下に「使用例は断片です」という注意を1行追加。
- **S-18 IsoData の片側空ヒストグラム**: Java 実装どおり、片側が空なら反対側へ進み続け、尽きたら閾値なし（-1）として扱う。
- **F-1 不正な % を含むハッシュ**: decodeURIComponent を例外安全な safeDecode に置換（#/function/%、#/term/%、#/search?q=%、#/practice/% で落ちないことをブラウザで確認）。
- **F-2 履歴リセットで下書き消失**: 学習履歴のリセット時に macroDraft と simMode を保持するよう変更し、確認文の不整合も解消側に寄せた。
- **R-1 getPixel の注記**: 「双方向補間」→「双線形補間」。
- **R-2 リファレンス欠落項目**: 注記から参照されているのに未収録だった8件を追加（Array.copy、getValue、isNaN、minOf、maxOf、Math.ceil、getInfo、setForegroundColor）。書式は公式一覧の表記どおり。関数数は 104 → 112。getValue は文字列形式（測定項目名）もあるため引数チェックを 1〜2 に緩和。
- **D-1 Gamma の範囲**: 0.1〜5.0 → 0.05〜5.0（レッスン、ドキュメント D7-4、Gamma 用語）。
- **D-2 Image Calculator の演算子数**: 12種 → 13種（ドキュメント D7-5、用語）。
- **D-3 RGB→グレーの既定**: ColorProcessor の実装で確認。既定は単純平均（重み各1/3）で、0.299/0.587/0.114 は Edit > Options > Conversions の "Weighted RGB Conversion" を有効にした場合のみ。クイズ D04 の解説とレッスンの記述を反転修正。
- **D-4 ドキュメント出典の内訳**: 51件中 imagej.net 15件、imagej.github.io（公式 Wiki 静的ミラー）18件、imagejdocu.list.lu 18件。URL 自体は各項目の出典として正しいため差し替えず、ホームの注記を「ImageJ公式サイト・公式Wiki等の資料をもとにした独自の要約・解説（各項目に出典を示しています）」に改め、実態と文言を一致させた。

## 期待値を修正した既存検証（理由付き）
- sim-audit8 の contains 期待値 "1" → "true": print は文字列文脈であり、runStringFunction が boolean を文字列化するため "true" が正しい（S-10 と同一根拠）。
- sim-battery の文字列三項「常にエラー」→「代入では正常・数値文脈ではエラー」: 1.54u9 の doTernaryStringAssignment による（S-15）。
- sim-audit3 の getVoxelSize 期待値 "1,pixel" → "1,pixels"（S-14）、sqr の分離（トップレベル sqr は未定義エラー、Math.sqr は計算）。
- sim-audit8 の getValue 期待値: リファレンス収録（R-2）に伴い「説明を省略」経路から説明文表示に変化したため追随。

## 検証結果（統合後、Muse 側で実施）
- リポジトリ検証: validate ALL CHECKS PASSED（official=580、functions=112、lessons=28、questions=63、terms=80、docChapters=12、docEntries=51、answerDist=17,15,16,15、最長正解バイアス 11.1%）。audit 247 件すべて PASS（AUDIT ALL PASSED、直接実行で確認）。overflow scanned=846、problems=0（OVERFLOW ZERO）。
- シミュレーション検証: 4バッテリ合計 811 件すべて合格（sim-battery 341、sim-audit3 153、sim-audit8 150、本ラウンド新設 sim-audit9 167）。
- レイアウト: layout-smoke 60/60（P-1 の再発条件＝最長ガイドのテンプレート選択＋860×700／1280×600 でエディタ 150px 以上を閾値化）。dark-smoke 7/7。audit9-ui 10/10（P-2 の複数行字下げ、F-1 の不正ハッシュ4経路、F-2 の下書き保持の前提）。
- 配信後に公開 URL の md5 で一致を確認する。

## 残件（任意・未実施）
- 関数リファレンスへの Roi.* 群（Roi.getBounds 等）の個別項目追加。シミュレーションでは動作するが、リファレンス項目としては未収録。方針により任意残件は実施せず、本記録に留める。→ **その後、ユーザー指示「フェイリス側で完成させて」を受け、AUDIT10 で実施・解消した（関数数 112 → 131）。**
- 本物の ImageJ／Fiji での実行値の突合（監査セッション側でも権限により未実施）。S-2、S-9〜S-11、S-15 は公式ソース読解に基づく（Muse 側でも Interpreter.java／Functions.java の実コードで再確認済み）。
- iOS Safari 実機、スクリーンリーダーでの確認。
- ドキュメント出典 URL の到達性と要約の原典照合（監査環境から imagej.net へ到達できなかったため未実施）。

## 配信
- 本書と AUDIT9-CLAUDE.md を含む節目配信で main と gh-pages へ反映する（push-files 各1回、書き込みコール数 2 件）。