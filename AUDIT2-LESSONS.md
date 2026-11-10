# AUDIT2-LESSONS.md — レッスン再構成の監査記録（第2版）

作成：2026-11-10。成果物は `data-lessons.js`（`window.IJDATA2.lessons` / `lessonCats`）。
方針：既存23レッスンを全監査し、sections構造（概念／なぜ重要か／原理／ImageJでの意味／具体例／注意）へ再編。
Round 1/2で確定した精密化表現は現行 data.js の文を正として維持した（下記「維持した精密化」参照）。

## カテゴリ再編

旧11カテゴリ → 新10カテゴリ。

| 新カテゴリ | 件数 | 変更点 |
|---|---|---|
| intro 導入 | 1 | 旧 basics を改称 |
| image 画像の基礎 | 3 | 旧 types を改称・拡張 |
| display 表示と色 | 2 | 旧 hist を発展分割（ヒストグラム／LUT） |
| roi ROIとマスク | 3 | 旧 roi にマスク・オーバーレイの対比を追加 |
| measure 測定と校正 | 3 | 旧 measure に再現性の観点を追加 |
| thresh 閾値と二値化 | 2 | 旧 threshold を改称 |
| filter フィルタと加工 | 3 | 旧 filter ＋ 旧 calc（画像演算）を統合し FFT を追加 |
| stack スタックとチャンネル | 3 | L21/L22 を flow から移設（チャンネル・投影はスタックの話題として検索されるため） |
| flow 実務ワークフロー | 6 | 手順系を集約し、全件に「結果の読み方」セクションと mistakes を追加 |
| macro マクロと自動化 | 2 | 旧 macro ＋ 旧 plugin を統合 |

理由：旧 calc（画像演算）と旧 plugin は各1〜2本のみで独立カテゴリとして検索性が低く、filter／macro へ統合した。旧 hist は「分布を読む」と「表示の仕組み」という別の疑問に答える内容が同居していたため display として2本に分割した。

## 旧23レッスンの判定表

| 旧ID | 判定 | 新ID/配置 | 理由 |
|---|---|---|---|
| L01 ImageJとFiji | 改訂 | L01 / intro | sections化（概念／なぜ重要か／注意）。本文は維持 |
| L02 ビット深度 | 改訂 | L02 / image | sections化し図 bitdepth を配置。新規L25への導線を追加 |
| L03 ファイル形式 | 改訂 | L03 / image | sections化。本文は維持 |
| L04 スタック等 | 改訂 | L04 / stack | sections化。本文は維持 |
| L05 ROI | 改訂 | L05 / roi | sections化。L26への導線を追加 |
| L06 ROI Manager | 改訂 | L06 / roi | sections化。本文は維持 |
| L07 Set Scale | 改訂 | L07 / measure | sections化し図 scale を配置 |
| L08 測定の基礎 | 改訂 | L08 / measure | sections化。本文は維持 |
| L09 Threshold | 改訂 | L09 / thresh | sections化し図 threshold を配置。精密化表現を維持 |
| L10 二値化 | 改訂 | L10 / thresh | sections化。本文は維持 |
| L11 フィルタ | 改訂 | L11 / filter | 3セクションに図 kernel-blur / kernel-median / unsharp を配置 |
| L12 ヒストグラムと表示調整 | 統合・分割 | L12 / display ＋ L24 / display | 「分布の読み方」と「LUT・表示範囲」を分離。後者は表示と値の区別という独立した重要概念のため |
| L13 画像演算 | 改訂 | L13 / filter | カテゴリを calc から filter へ移設。Gammaセクションに図 gamma を配置 |
| L14 マクロ入門 | 改訂 | L14 / macro | sections化。旧L15のバッチ記述との重複を整理 |
| L15 プラグイン・バッチ・更新 | 統合・改訂 | L15 / macro | バッチ部分はL23と重複するため削除しL23へ一本化。プラグインと更新に特化 |
| L16 粒子カウント | 改訂 | L16 / flow | 図 particles 配置。「結果の読み方」セクションと mistakes（失敗例）を追加 |
| L17 面積率 | 改訂 | L17 / flow | 「結果の読み方」と mistakes を追加 |
| L18 蛍光強度 | 改訂 | L18 / flow | 「結果の読み方」と mistakes を追加 |
| L19 背景を均す | 改訂 | L19 / flow | 「結果の読み方」と mistakes を追加。半径の精密化表現を維持 |
| L20 スケールバー | 改訂 | L20 / flow | 「結果の読み方」と mistakes を追加。校正前提の精密化表現を維持 |
| L21 チャンネル分離・合成 | 改訂・移設 | L21 / stack | flow から stack へ移設。「結果の読み方」と mistakes を追加 |
| L22 Z投影 | 改訂・移設 | L22 / stack | flow から stack へ移設。図 zproj 配置。「結果の読み方」と mistakes を追加 |
| L23 バッチマクロ | 改訂 | L23 / flow | 「結果の読み方と注意」と mistakes を追加。自動保存の例外表現を維持 |

削除のみのレッスンは無し。全23本が改訂のうえ存続し、分割1件（L12→L12+L24）、統合1件（L15のバッチ部分→L23）を行った。

## 新規レッスン一覧（5本）

| 新ID | タイトル | カテゴリ | 追加理由 | 出典 |
|---|---|---|---|---|
| L24 | LUTと表示範囲：見え方と画素値の違い | display | 表示調整は値を変えない、という区別は定量解析の土台であり独立した疑問として検索される | hist（旧L12の出典を継承） |
| L25 | 型変換と情報損失：ビット深度を変えると何が失われるか | image | 型変換のスケーリングと丸めは既存L02/L13/L18に分散していた不可逆性の話を1本に集約 | work |
| L26 | ROI・マスク・オーバーレイの違い | roi | 親プロンプトの実務疑問（ROI/マスク/オーバーレイの混同）に対応。オーバーレイの非破壊性・TIFFヘッダ保存は User Guide（Working with ImageJ、Selections/Overlays）で裏取り | work |
| L27 | FFTの考え方：周波数領域で画像を見る | filter | 周波数領域処理の欠落を補う。パワースペクトル表示・対数スケーリング・32-bit FHT保持・Bandpass Filter は imagejdocu FFT ページで裏取り（2026-11-10取得） | fft（新キー、下記参照） |
| L28 | 測定の再現性と記録：条件を保存する | measure | 条件記録（校正・項目・閾値・パラメータ）は既存レッスンの注意の寄せ集めだったものを独立化 | ana |

## 使用図ID一覧（12図・12配置、全図使用）

| 図ID | 配置先 | パラメータ要点 |
|---|---|---|
| bitdepth | L02 原理 | 2/16/256階調で同一グラデーションを量子化する概念図 |
| histogram | L12 概念 | 単峰の山型分布＋統計量（Count/Mean/StdDev/Mode/Min/Max）、256ビン |
| threshold | L09 概念 | 二峰性ヒストグラム、下限〜上限の範囲指定、二値結果は Black Background 設定に依存と明記 |
| gamma | L13 Gamma補正 | γ=0.5/1/2 の3曲線、式 f(p)=(p/255)^γ×255（8-bit） |
| kernel-blur | L11 平滑化 | 3×3等重み（各1/9）は Smooth/Mean の模式であり Gaussian と同一視しない旨を figParam に明記 |
| kernel-median | L11 Median | 3×3近傍の中央値（5番目）で置換、飛び値が選ばれない例 |
| unsharp | L11 エッジ強調 | 原画像 − ぼかし ＝ エッジ成分、を模式として提示 |
| scale | L07 手順 | 直線選択で既知長をなぞる模式（数値は例示と明記） |
| roi-mask | L26 概念 | ROI/マスク/オーバーレイの3層を並列模式で対比 |
| particles | L16 手順 | 接触2粒子 → Watershed 分離線 → 2粒子として計数 |
| zproj | L22 できること | スライス列を各(x,y)で統計処理して1枚化、深さ情報は残らないと明記 |
| fft | L27 考え方 | 中心=低周波・周辺=高周波の同心円模式、対数スケーリング表示 |

## 維持した精密化（Round 1/2確定事項）

- L09：閾値を設定しただけでは元のピクセル値は変わらない／Dark Background と Black Background は別設定
- L10：Make Binary はスタックでは表示中スライスで計算した閾値で全スライスを変換
- L13：Gamma 式は 8-bit と RGB 各チャンネルに適用、16-bit は最小・最大でスケーリング／ゼロ除算は「標準設定では」Infinity・NaN
- L03：メタデータ保存は「ImageJ標準の保存では」TIFF/ZIP のみ
- L19：半径の目安は 8-bit/RGB では背景でない最大対象の半径以上、16-bit（画素値0〜65535）では 0.2〜5 が典型値
- L20：前提は空間校正が設定されていること。校正済み画像では Set Scale の再実行は不要
- L23：Output 未指定ではバッチ機能による自動保存はされない（マクロ内に保存処理を書いた場合は例外）。入力/出力フォルダの分離と上書き注意

## アプリ側・他担当への申し送り

1. **出典キー `fft` の追加が必要**：data.js の `S` マップと SOURCES.md に未登録。URL は https://imagejdocu.list.lu/gui/process/fft （ImageJ Documentation Wiki、2026-11-10に取得・確認）。L27 はこのキーを使用している。
2. **用語集の欠落**：FFT／パワースペクトル／Watershed は現行72用語に無いため、L27 の terms は空、L16 の terms に Watershed を入れていない。用語集担当での追加を推奨。
3. **複合出典**：L25 は work（型変換のスケーリング）と calc/math（8-bit演算の丸め）の内容を含むが、契約上 src は単一キーのため work とした。
4. **機序に基づく記述**：L16 mistakes の「Watershedは距離マップの極大点ごとに分ける仕組みのため、凹凸のある粒子では意図しない位置で分割される場合がある」は、既存の検証済み説明（距離マップとその極大点をもとに分離）からの機序上の帰結として記述した。一次資料の直接文言ではないため、問題化の際は要注意。
5. data-lessons.js は検証済み：node による構文・構造チェックで、ID一意性、カテゴリ妥当性、related の実在、terms の用語集完全一致、fig/figParam の対応、flow 全件への「結果の読み方」セクション存在を確認し、エラー0件。
