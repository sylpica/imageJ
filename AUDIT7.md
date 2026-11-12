# AUDIT7 — マクロ機能 二重監査（Muse 一次監査 × Claude Code 独立監査）の統合記録

監査日: 2026-11-12〜13 / 対象: マクロ練習・実行シミュレーション・関数リファレンス
進め方: Muse 側が先に一次監査（指摘 M1〜M8、記録は非公開で保持）→ Claude Code 新規セッション（session_01VCQ3xsqUURJ9FHisFXZL13、Opus／低）が Muse の指摘を見ずに独立監査（AUDIT7-CLAUDE.md、総合判定 不合格、高8・中13・低8）→ 両側の指摘を一次資料で検証して統合修正。

## 一次資料（検証に使用）
- ij/macro/Interpreter.java（スコープ・var・文字列比較）
- ij/macro/Functions.java（書式の省略可能引数・parseInt・Array/String 関数・random の seed 形式）
- ij/process/ImageProcessor.java（Process > Math の LUT 換算・setAutoThreshold）
- ij/plugin/Thresholder.java / ij/Prefs.java（IsoData・blackBackground 既定）
- ij/process/ImageConverter.java（ビット深度変換。doScaling の既定は true）
- 公式 Built-in Macro Functions ページ（関数の実在確認）

## 統合判定と対応
両側で一致した指摘: Math 換算式の誤り（M5＝H2/H3）、静的チェックのクラッシュ（M1＝H5）、プロトタイプ名の誤判定（M3＝M7）、IsoData（M6＝M3）、引数チェックの誤検出（M2 ⊂ H8）。
Claude 側のみが発見し、検証で正しいと確認した重大指摘:
- H1 Min/Max の意味が逆（Min... は下限＝Math.max が正）
- H4 画素演算に 8/16bit の丸め・飽和がなく、値が範囲外に出る
- H6 スコープモデルが ImageJ と異なる（関数内は引数＋関数内変数＋var 全体変数のみ可視。通常のトップレベル変数は関数から見えない）
- H7 var 宣言を解釈できない
- M4 setAutoThreshold が手法名を検証せず全て Otsu 扱い
- M5 文字列比較は大小無視（compareToIgnoreCase）が正
- M6 ビット演算子と16進リテラル未対応
- M8 Array.getStatistics が参照引数の扱いで停止する
- M9 Math.* / String.* 名前空間関数が未定義扱い
- M10 二重ループで最大1億回転し画面が固まる
- M11 深い式で RangeError が汎用表示になる
- M12 optNum が value=0 と負数を拾えない
- M13/L1〜L4 ほか（parseInt の丸め、substring 範囲外、候補提示の距離計算、Gamma のダイアログ範囲）
検証で Claude 側の指摘を退けたもの:
- M1（8→16bit は値を保持する）: ImageConverter.doScaling の既定は true で、既定設定では ×257 のスケーリングが正しい。アプリ側の現行実装が正。ただし M2（8→32bit は値を保持し 0.0〜1.0 にはならない）は正しく、変換処理と説明文を修正した
- L5（overflow.mjs の絶対パス直書き）: main 上のファイルでは実在（Claude 側の指摘が正）。ローカルの新しい相対パス版を今回あわせて配信する
ダークモード（L6）: 当初は設計判断で見送る予定だったが、ユーザー指示（2026-11-13）で追加した。端末の配色設定（prefers-color-scheme）に追随し、切替ボタンは置かない。変数の差し替え＋ライト固定色だった箇所（入力欄・エディタ行番号・関数行・コードブロック等）の上書きで実装。ダーク時スモーク 7/7 パス（背景・文字の輝度、375px 横溢れなし、シミュレーション動作）。
対応しなかったもの（設計判断として記録）:
- L7 練習画面の縦長（作業画面のため許容）
関数リファレンス: M4 の開かれた問い（selectWindow を載せるか）は「載せる」で決着。あわせて newImage / getNumber / getString / setColor / drawLine を追加し 104 件に（全件、公式スナップショット照合を通る）。未配信だった Dialog.getChoice と validate.mjs の公式照合も今回配信に含む。validate.mjs の関数数上限は 100→120 に変更（収録拡大に伴う上限見直し）。

## 修正の要点（app.js）
- スコープ: フレーム＋var 全体変数のモデルへ書き換え。トップレベル var の事前登録、var 宣言文（for 初期化含む）の構文追加
- Min/Max 入れ替え、mathOp への丸め・飽和の導入（変化表の合成にも同じ飽和）
- 32bit 変換は値を保持。32bit から戻す変換は実値レンジで換算
- setAutoThreshold: 手法名17種を検証、IsoData 系は IsoData、その他は Otsu 近似である旨を説明文に明示、未知の手法はエラー
- 文字列比較を大小無視に。ビット演算（& | ^ << >> ~）と16進リテラルを追加
- Array.getStatistics の参照引数（先頭は配列値、残りが参照）を実装
- Math.* / String.join / String.pad / String.trim の実計算。sin 等の純粋関数も実計算
- 処理量の総量上限（30万回）で二重ループの固着を防止。パーサに深さ上限と専用診断
- 引数の省略可能形式を検証済みの範囲で静的チェックに反映（close/open/split/parseInt/getResult/setThreshold/setMinAndMax/makeRectangle/Array.sort/random/indexOf/substring/setAutoThreshold/saveAs/makeLine/showProgress/runMacro/Dialog.add 系ほか）
- parseInt は公式どおり（10進は parseDouble＋丸め、失敗は NaN）。substring 範囲外はエラー。候補提示は末尾「...」を除いて距離計算
- optNum が負数・指数・0 を正しく拾うよう修正（Multiply value=0 等）
- 用語リンクが英単語の途中（nSlices の Slice 等）で切れないよう境界チェックを追加

## 検証数値（修正後）
- tests/validate.mjs: ALL CHECKS PASSED（関数 104 件・公式照合含む）
- パターン電池: 統合電池 337 件＋第3波 148 件、すべてパス（スコープ・var・Min/Max・飽和・変換・閾値手法・文字列比較・ビット演算・書式誤検出の各群を含む）
- tests/audit.mjs: PASS 247 件・AUDIT ALL PASSED
- tests/overflow.mjs: scanned=822 / problems=0（OVERFLOW ZERO）
- ダークモードスモーク（375px・ダーク配色）: 7/7 パス

## 未検証の範囲（従来どおり）
- 実機 iOS Safari の表示、スクリーンリーダーの実機確認、本物の ImageJ/Fiji での実行値との突合
- 16/32bit 画像での Log/Exp 等は 8bit 前提の一般化近似。IsoData の範囲決定ヒューリスティクスは簡略化（結論はモデル分布では不変）
