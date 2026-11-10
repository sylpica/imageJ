# マクロ練習モード 独立品質監査・修正の記録（AUDIT5、2026-11-10）

指令書 v2（実行しない設計を前提とする版）に基づく独立監査。AUDIT4 の記載は前提にせず、すべて再現・再確認した。

## 使った一次情報
- 公式「Built-in Macro Functions」 https://imagej.net/ij/developer/macro/functions.html （2026-11-10 取得、Last updated 2025-02-15）。書式805件を `tests/official-functions.txt` に保存した。
- ImageJ 1.x のソース（github.com/imagej/ImageJ master）：Functions.java、IJ.java、Interpreter.java、Tokenizer.java、MacroConstants.java、Macro_Runner.java、ColorProcessor.java、Calibration.java、ScaleBar.java。Fiji のスクリプトエディタ（scijava/script-editor EditorPane.java）。
- 実物の ImageJ／Fiji での実行確認は**していない**（環境がない）。挙動の主張は公式文書とソースの読解で裏付けた。

## 関数データの全件照合（97件）
公式ページの該当書式と1件ずつ照合した。97件すべてが実在する。うち22件で説明・戻り値・注意に誤りまたは不正確な記述があり、修正した（下表）。残りの75件は一致。
加えて、選択欄の値の取り出し方を正しく示すため Dialog.getChoice を追加した（98件）。

| 関数 | 誤り | 根拠 |
|---|---|---|
| getSelectionBounds | 「選択がないとエラー」→ 実際は (0,0,幅,高さ) が返る | 公式 |
| getResult | 「存在しない列はエラー」→ NaN が返る（行が範囲外ならエラー） | 公式・Functions.getResult |
| Dialog.addChoice / Dialog.getString | 選択欄を getString で取ると記述 → Dialog.getChoice | 公式 |
| d2s | 「0桁でも "5.0"」→ 四捨五入した整数表記 "6" | IJ.d2s（df[0]="0", HALF_UP） |
| newArray | 「文字列を渡すと空文字列で埋めた配列」→ 渡した値の配列。数値1つのときだけ要素数 | 公式・Functions.newArray |
| runMacro | 「コード自体も指定できる」「戻り値なし」→ ファイル指定のみ、文字列を返す | 公式・Functions.runMacro |
| eval | 例 `eval("return …")` と戻り値の記述を、確認できる形に修正 | 公式・IJ.runMacro |
| File.exists | 「必ず文字列 "1"/"0"」→ 代入文では数値 | 公式（File Functions の注記）・Interpreter |
| setMinAndMax | RGB 画像では画素値が書き換わる点が欠落 | 公式（3引数版の注記）・ColorProcessor.setMinAndMax |
| getHistogram | nBins は8bit/RGBで「通常」256 → 必ず256。histMin/Max は16/32bitのみ | 公式 |
| getProfile | 楕円選択に対応すると記述 → 直線系と矩形のみ | 公式（Plot Profile） |
| makeLine | 線幅は「Edit > Selection > Specify」→ 第5引数か Roi.setStrokeWidth | 公式 |
| getVoxelSize | 未校正時の単位 "pixel" → "pixels"（複数形で返る） | Functions.getVoxelSize・Calibration.getUnits |
| getStatistics | 戻り値欄の誤解を招く記述を整理（値は引数の変数に書き込まれる） | Functions（文として処理） |
| getFileList | サブディレクトリの区切りは "/" 固定 | 公式 |
| split | 空文字列が混ざる区切りに "\n" を追加 | 公式 |
| File.append | 末尾に改行が付くことを追記 | IJ.append |
| resetThreshold | 「括弧を付けずに使う」→ 括弧は省略できる | Interpreter.getParens |
| showStatus | 根拠のない「マクロ終了後は残らない」を削除 | — |
| setOption | BlackBackground の説明を正確に | 公式 |
| makePolygon | 「整数列」の限定を削除 | — |

確認済みで変更不要の例：roiManager のコマンドは大文字小文字を区別しない（Functions.roiManager の toLowerCase）、Array.getStatistics の後ろの引数は省略できる、Math.* は1.52u以降、Color.* は1.53h以降、ScaleBar の `height=` は旧書式として thickness に読み替えられる（テンプレートの記述は有効）、`continue` は予約語、文字列は ' でも書ける。

## 練習モードの所見と修正
重大度（高）
- P1 テンプレートを選ぶと、初期コメントを残したまま書き足したコードが**確認なしに上書き**される（判定が「初期コメントを含むか」だったため）。初期コードやテンプレートと完全に一致する場合だけ未編集とみなすよう修正した。
- P2 「消去」が確認なしで下書き全体を消し、取り消しもできない。確認を出すようにし、消去・テンプレート適用・挿入・Tab は execCommand を使って Ctrl+Z で取り消せるようにした。
- P3 括弧チェックがシングルクォートの文字列 `'('` を括弧として数え、閉じていない文字列のあとはすべて無視していた。さらに個数しか出さず位置を示さず、`([)]` のような取り違えも見逃していた。ImageJ の字句規則（' と " の文字列、文字列は行をまたがない、// と /* */）に合わせ、スタックで照合して**行番号つきで**最初の問題を表示するようにした。表示をクリックすると該当文字を選択する。
- P4 挿入位置の誤り：分類チップ・タブ切替・ダブルクリックのたびに画面全体を作り直していたため、カーソル位置が失われ挿入位置がずれていた。ダブルクリックで選択された単語は挿入で置き換えられ、行の途中に挿入すると行が分断されていた。画面を作り直さないようにし、カーソル位置を保持（他画面から戻っても復元）した。選択がなければ次の行にインデントを揃えて挿入し、選択があれば置き換える。
- P5 書式の挿入で `roiManager("command", ...);` などの `...` がそのまま入り、文法エラーになっていた。可変長部分を落とし、引数部分を選択状態にしてそのまま上書き入力できるようにした。直前の挿入で自動選択された範囲は置き換えない。
- P6 実行手順の誤り：Plugins > Macros > Run… は .ijm を ISO-8859-1 として読む（Macro_Runner.runMacroFile）ため、文字列中の日本語は文字化けする。Fiji のスクリプトエディタは UTF-8 で読む（EditorPane）。また .ijm をドラッグ＆ドロップしても実行はされず、エディタで開くだけである。注記をこの事実に合わせて書き直した。

重大度（中）
- P7 保存データの型が壊れている（hist の値が null、bm が文字列など）と、ホームや問題画面が TypeError で表示できなくなる。読み込み時に型を検査するようにした。
- P8 保存の失敗（容量超過など）を黙って無視していた。下書きが保存できないときはステータスに表示する。保存は入力が止まって400ms後にまとめて行い、ページを離れるときにも書き出す。
- P9 Tab キーが常にインデントになり、キーボードだけではエディタから抜けられなかった（キーボードトラップ）。Esc の後の Tab と Shift+Tab で抜けられるようにした。インデント幅はテンプレートに合わせて4文字にした。
- P10 エディタのフォーカス表示が消えていた（outline:none）。枠の強調で示すようにした。
- P11 関数ページから練習モードへの導線がなかった。「マクロ練習で書く」を追加した（#/practice/関数名 で説明を開いた状態になる。下書きは保持）。

重大度（低）
- P12 練習パネルで長い書式の右側が切れて見えた（折り返さない設定で、横スクロールに気づきにくい）。折り返すようにした。
- P13 コピー・保存・消去などの小ボタン（.mini-btn）にスタイルがなく、ブラウザ既定の見た目でタップ領域も小さかった。高さ38pxのボタンとして定義した。
- P14 書き出しの Blob に文字コードを明示し（UTF-8、BOMなし、LF）、DOM に追加してからクリックするようにした（一部ブラウザ対策）。

範囲外として記録だけしたもの
- アプリ全体にダークモードの配色がない。ダーク設定でもライト配色のまま表示され、可読性は保たれている。
- テンプレート「フォルダ一括」は `.tif` の小文字だけを対象にしている（`.TIF` / `.tiff` は処理しない）。動作は正しいが、対象を広げるかは教材の方針に任せる。

## テスト
- tests/audit.mjs・overflow.mjs のパスが別環境に固定されていて、この環境では動かなかったため、リポジトリからの相対パスとグローバルの playwright で動くようにした。
- validate.mjs：公式書式スナップショットとの照合を常設した。対象は関数名の実在、引数の個数、挿入文の妥当性、全使用例・テンプレート・初期コードの静的チェックと呼び出し関数の実在。静的チェック自体の境界ケース13件も含む。誤りを意図的に入れたコピーで、書式の引数個数、使用例の括弧、存在しない関数、テンプレートの関数名の誤りがすべて検出されることを確認した。
- audit.mjs：練習モードの監査を375px・1280pxでそれぞれ36項目追加した。
- 結果（実測）：validate ALL CHECKS PASSED／audit 225 PASS・0 FAIL・0 SKIP／overflow 804スキャン・問題0。
