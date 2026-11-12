# AUDIT8 — マクロ機能 第2ラウンド監査（Claude Code 独立監査）の統合記録

監査日: 2026-11-13 / 対象: AUDIT7 統合修正後のマクロ練習・実行シミュレーション・関数リファレンス・練習画面レイアウト
進め方: Claude Code 新規セッション（session_01VCQ3xtArYYZpLGz8mt4hco、ブランチ claude/lucid-ride-r6nwoj、Opus／低）が、AUDIT7.md の結論を信用せず第1ラウンド修正を一次資料で再検証＋新しい角度（レッスン・クイズ・資料内のマクロ文、ユーザー関数経由の引数、複合操作、境界値、レイアウト再測）で監査（AUDIT8-CLAUDE.md、総合判定 不合格、新規指摘 N1〜N26）→ Muse 側が全指摘を一次資料で検証して統合修正。

## 一次資料（検証に使用）
- ij/process/TypeConverter.java（8→16bit は値保持、N1）
- ij/macro/Interpreter.java（&& / || の順位・結合・短絡なし・0/1 強制、条件式の checkBoolean、toString の数値書式）
- ij/macro/Functions.java（split / replace / print / getResult / Array.getStatistics / Array.sort ほか）
- ij/process/ImageProcessor.java（setAutoThreshold、Process > Math の切り捨て）
- ij/process/AutoThresholder.java（Default のピーククリップ、IJ_IsoData、IsoData の整数除算）
- ij/plugin/Thresholder.java、ij/plugin/ZProjector.java、ij/plugin/ChannelSplitter.java
- ij/ImageMath 相当（Divide 0、Gamma 範囲、AND/OR/XOR の2進数解釈）
- ij/IJ.java（d2s の書式規則と roundErrorAtMax）
- 公式 macro ページ macros.html（macro "名前" { } 構文）

## 第1ラウンド修正の確認結果（Claude 側の再検証）
- 固定済み: H1〜H7、M2/M5/M7/M12/M13、L1/L3〜L6/L8
- 部分的: H8（→N2 で解消）、M3/M4/M6/M8/M9（→N2/N8/N23 で解消）、L2（→N15）、L7（条件付き欠陥 →N26）
- 未修正だったもの: M1（第1ラウンドで Muse 側が誤って退けた。→N1。AUDIT7.md に訂正を追記済み）
- 修正の副作用: M10 の per-loop 上限（→N9）、M11 の深さ制限（→N22）

## 新規指摘 N1〜N26 と対応
- N1（高）: 8→16bit は値を保持（TypeConverter.convertByteToShort はコピーのみ）。変換処理と説明文を修正。16/32bit 間の変換は実値範囲で換算、範囲が平坦なら全て 0。
- N2（高）: 静的チェックが公式関数の形 552 件中 385 件を未定義と誤判定していた。公式関数名テーブル（478 名）を内蔵し、実在関数は「動きの説明を省略」として扱うよう変更。文字列メソッド構文（s.contains() 等）、名前空間呼び出し（List.* / Table.* / Array.concat 等）、File.separator を解釈可能に。print() 0引数・log() 0引数・setColor 1引数を許容。toLowerCase / toUpperCase / charCodeAt / fromCharCode は実値を計算する。
- N3（高）: && / || は同一順位・右結合・短絡評価なし・被演算子は 0/1 必須（Interpreter.getLogicalExpression2）。パーサと評価器を書き換え。if / while / for の条件にも checkBoolean 相当を適用（三項演算子の条件は従来どおり 0 以外を真）。
- N4（中）: ビット演算子 & | ^ << >> は * / % と同じ階層（左から右）。パーサの階層を再編。
- N5（中）: Divide value=0 は 8/16bit では無変化、32bit では Infinity/NaN の説明に変更。
- N6（中）: replace は第2引数が1文字なら文字どおり、2文字以上なら正規表現（Functions.replace）。
- N7（中）: Array.getStatistics の標準偏差は n−1 で割る標本標準偏差に修正。
- N8（中）: 引数なし setAutoThreshold は ISODATA2 相当（Default 閾値＋平滑化ヒストグラムのモードで前景側を選択）。反転画像では [0,148] になることを検証。Convert to Mask の無閾値時も同じ経路に統一し、マスク出力のビット深度を 8 に。
- N9（中）: ループ毎 10,000 回の上限を撤廃。総量予算（300,000）のみで制限。20,000 回ループが完走することを検証。
- N10（中）: setResult の行が実行時に決まる値でも落ちないよう修正。
- N11（中）: split は区切りが "," / ";" なら Java split（空要素保持・trim なし）、括弧含みなら正規表現、"\n" なら行分割、それ以外は区切り文字集合による分割（空要素除去）。既定の区切りは空白・タブ・改行。
- N12（中）: macro "名前" { … } 構文に対応。
- N13（中）: Z Project は単一スライスで "Stack required"、Split Channels は単一チャンネルで "Multichannel image required" の公式エラーを警告として提示（テンプレート10本の両方が出るよう警告レベルを採用）。
- N14（低）: Add / Subtract / Min / Max の value は整数への切り捨て（(int) キャスト）。
- N15（低）: Gamma が 0.05〜5.0 の範囲外ならダイアログキャンセル扱いで無変化。
- N16（低）: print の複数引数は空白区切りで連結。
- N17（低）: Array.sort の文字列比較は大文字小文字を区別しない。
- N18（低）: getResult は行省略で最終行、範囲外行はエラー、存在しない列は NaN。
- N19（低）: 文字列の三項演算子は "String operands not supported"、!2 や 2&&1 は "Boolean expected" 相当のエラーを提示。
- N20（低）: parseFloat("x") は NaN（決定的）。parseInt も全体文字列の厳密解釈に統一。
- N21（低）: var の初期化式は本体実行前に事前評価（saveGlobals2）。呼び出しを含む式は従来どおり宣言位置で評価。
- N22（低）: 平坦な 5,000 項の式が「深すぎる」で落ちないよう、二項演算の評価を左辺の背骨をたどる反復処理に変更。
- N23（低）: Default はピーククリップ付き、IJ_IsoData はクリップなし、IsoData は Ridler–Calvard 法と、3 手法を個別に実装。Otsu 以外の近似扱いは残る手法のみ明記。
- N24（低）: AND/OR/XOR の value は2進数文字列として解釈（不正なら "Binary number required"）。Set（全画素を値に）と Reciprocal（32bit のみ、他は無変化）を追加。Macro op は注記のみ。
- N25（低）: 数値表示を IJ.d2s（有効数字4・最大9桁）に一致させた。roundErrorAtMax のため −0.00001 は通常表記「-0.00001」、−0.000001 から指数表記「-1.0000E-6」になることをソースで確認。
- N26（中・レイアウト）: テンプレート選択時にガイド（最大 168px）がエディタを圧迫し、860×700 でエディタ 24px（1行）まで潰れていた。ガイドの最大高を 118px に下げ、作業台の行配分を 1.25fr / 0.75fr に変更、最小高 560px → 430px。さらに作業台の高さを実測したヘッダー高で JS が補正（fitWb）し、ヘッダーの折り返しや低い画面でもはみ出さないようにした。

## Claude 側報告と食い違った点（一次資料で Muse 側が確認）
- N23 の IsoData 値: Claude 側の移植では 107 だったが、Java の整数除算まで忠実に再現すると 106 になる（整数化したヒストグラムでの実験でも 106、float のまま計算すると 107）。ソース忠実な 106 を採用し、1 段の差は移植方法の違いとして記録する。
- N25 の正確な文字列は Claude 側では未確認だった。IJ.d2s のソースで上記のとおり確定した。

## 検証結果
- node tests/validate.mjs: ALL CHECKS PASSED（lessons=28 questions=63 terms=80 docChapters=12 docEntries=51、関数リファレンス 104 件）
- node tests/audit.mjs: AUDIT ALL PASSED（PASS 247 件）
- node tests/overflow.mjs: scanned=822 problems=0
- シミュレーションバッテリー: sim-audit8（第2ラウンド専用）150 件、sim-battery 336 件、sim-audit3 151 件 — 全て通過（計 637 件）
- レイアウトスモーク: 60/60（テンプレート選択時を含む 860×700 / 1280×600 / 1280×800 / 1366×768 / 1024×768 で作業台が1画面に収まり、エディタ高 100px 以上を保持）
- ダークモードスモーク: 7/7
- 旧バッテリーの期待値 8 件は、監査前の誤った挙動を固定していたため更新した（各件とも新しい出力が ImageJ の実際の挙動と一致することを一次資料で確認済み）。

## 未検証・残る制約（従来どおり＋今回分）
- 実機 iOS Safari の表示、スクリーンリーダーの実機確認、本物の ImageJ/Fiji での実行値との突合は未実施。
- Prefs.blackBackground の既定値は未確認（マスク化は現行モデルどおり範囲内→白を維持）。
- Default / IJ_IsoData / IsoData / Otsu 以外の自動閾値手法は Otsu 近似のまま（その旨を手順文に明記）。
- 16/32bit 画像の自動閾値は表示範囲ベースの正規化による近似。
- モバイルの練習画面は従来どおりスクロールするタブ式レイアウト（1画面化の要件は PC のみ）。
