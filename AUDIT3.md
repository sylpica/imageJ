# 自己監査・修正の記録（AUDIT3、2026-11-10）

監査プロンプトは AUDIT3-PROMPT.md（フェイリス作成）。最重視：内容の正しさ／文字のはみ出し。

## A. 内容の正しさ

### A1. 関数94件の公式ページ機械照合
- 公式「Built-in Macro Functions」の実ページ（HTML 189,607バイト）を取得し、関数シグネチャ候補647件を抽出して全件突き合わせた。
- 関数名の実在：90件中86件が書式つきで一致。残り4件（nImages / nResults / nSlices / selectionType）も公式本文で実在を確認（nImages 等は「括弧は省略可能」と公式明記。当方の無括弧表記は正しい）。
- 引数の数：getHistogram のみ不一致 → 公式の完全形 `getHistogram(values, counts, nBins[, histMin, histMax])` に修正し、第4・第5引数の説明を note に追加。
- **不足の発見と追加**：閾値系の基本関数が未収録だったため、公式で実在と書式を確認して4件追加（関数90→94件）。
  - setThreshold(lower, upper)：第3引数の表示指定（"red"／"black & white"／"over/under"／"no color"／"raw"）と密度キャリブレーション時の扱いを note に明記。
  - getThreshold(lower, upper)：未設定時は両変数が -1 になることを note に明記。
  - resetThreshold：閾値を解除する無括弧の組み込み関数。
  - setAutoThreshold(method)：手法名一覧は getList("threshold.methods") で取得できることを note に明記。

### A2. 数値・事実主張の抜き取り検証（一次情報）
- 「run() で400超のコマンド」→ 公式 Macro Language ページに "400+ commands" の明記を確認。
- 円形度 circularity = 4π(area/perimeter²)、1.0が真円 → 公式 Analyze メニューページで確認。
- ガンマ範囲 0.05〜5、アンシャープマスク初期値（半径1・重み0.6）は User Guide 帰属の記述として保持（問題 VA01 の解説に出典を明記済み）。
- Z投影・自動閾値の「種類数」は本文で断定していないことを確認（誤った数値の混入なし）。

## B. 文字のはみ出し（全件走査）
走査方法：tests/overflow.mjs（新規）。全詳細ページ（レッスン28・ドキュメント12章・用語80・関数94）と一覧・ホーム・検索、クイズ全63問の出題／回答状態を、幅320／375／1280で走査（計789画面相当）。SVG内部は scrollWidth の単位がずれるため、getBBox と viewBox の突き合わせで別途全数検査した。

### 検出と修正
1. **SVG図のラベルが viewBox 外**（実欠陥）：L13 ガンマ図のラベル2件が右端を最大35px超過して見切れ → ラベルを短縮（「γ=0.5（明るく）」「γ=2（暗く）」、意味はキャプションで補完）。L09 閾値図・L12 ヒストグラム図のラベルが上端を1〜2px超過 → y座標を12→16に調整。全レッスンの SVG テキストで viewBox 外 0件を確認。
2. **出典行（.src-line）の最終行が数px超過**（D10/D1/D7、320〜375px）：末尾の定型句「（本文は独自要約・解説）」の直前で折り返し機会がなく最終行が最大3pxはみ出す事象。overflow-wrap:anywhere／line-break:anywhere／word-break:break-all のいずれでも解消しないことを実測し、定型句の直前に `<wbr>` を入れる構造修正で解消（ドキュメント／関数／レッスンの出典行すべて）。
3. **クイズ選択肢の英字混在テキスト超過**：「Integrated Density（画素値の合計）」が375pxで最大6px超過。同様に CSS では解消せず、選択肢描画時に「（」の直前へ `<wbr>` を自動挿入する修正で解消。
4. .doc-entry の見出し・メニュー表記、選択肢 span に折り返しガード（overflow-wrap）を追加。

### 最終結果
- 修正後の再走査（validate＋overflow）：validate 全通過、はみ出し走査 789画面相当で **problems=0（OVERFLOW ZERO）**。
- SVG テキストの viewBox 外：0件（全レッスン）。
- 実ブラウザ監査（tests/audit.mjs）再実行：**152件全通過（AUDIT ALL PASSED）**。
