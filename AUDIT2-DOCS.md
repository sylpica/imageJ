# AUDIT2-DOCS.md — 第3ラウンド（全面再設計）ドキュメント＆用語集 監査記録

作成: 2026-11-10 / 担当: Muse サブエージェント（ドキュメント・用語集ライン）
成果物: `data-docs.js`（`window.IJDATA2.docs` / `window.IJDATA2.terms`）

## 1. 権利処理の記録

- ImageJ 1.x 本体はパブリックドメイン（NIH）である一方、ImageJ User Guide（Ferreira & Rasband、IJ 1.46r、2012）の明示ライセンスは確認できなかった（親エージェントが一次情報で確認済み）。
- そのため本データでは、ガイドを含むいかなる公式文書についても、**本文の翻訳・転載・逐語引用を一切行っていない**。
- `data-docs.js` の全 entry 本文（body / points / caution）は、一次情報（公式ページ・公式Wiki）を参照して**新規に書き起こした独自の日本語要約・解説**である。要約の範囲を超える長文引用は含まれていない。
- 各 entry には出典（公式資料名 `srcName`・URL `src`・対象バージョン注記 `version`）を明示し、原典と独自解説が混同されないようにした。バージョン差異がある項目（例：Z投影の方式数について旧 User Guide 本文に5方式と読める記述が残る件）は `version` 注記に明記した。
- ファイル冒頭にも権利方針のコメントを明記した。

## 2. ドキュメント章・entries 一覧（12章・51 entries）

| 章 | タイトル | entries |
|---|---|---|
| D1 | 入門と画面構成 | 4（D1-1 ImageJとFijiの違い / D1-2 アクティブ画像 / D1-3 Undoの限界 / D1-4 コマンドレコーダ） |
| D2 | 画像の種類とビット深度 | 5（D2-1 型の範囲と性質 / D2-2 RGBの測定値 / D2-3 ビット深度を下げると何が失われるか / D2-4 型変換の値の変化 / D2-5 グレー値と実測値） |
| D3 | 表示・LUT・色とチャンネル | 4（D3-1 LUTと疑似カラー / D3-2 Brightness/Contrastは表示のみ / D3-3 チャンネルとコンポジット / D3-4 Split/Merge Channels） |
| D4 | ROIと選択 | 4（D4-1 ROI・マスク・オーバーレイの違い / D4-2 ROI Manager / D4-3 選択は同時に1つだけ / D4-4 ROIの保存と再利用） |
| D5 | 測定とResults | 5（D5-1 Mean Gray Valueとは / D5-2 Set Scale / D5-3 測定単位がおかしいとき / D5-4 Set Measurements / D5-5 Analyze Particlesで数が合わないとき） |
| D6 | 閾値・二値化・形態学処理 | 6（D6-1 ThresholdとConvert to Maskの違い / D6-2 閾値設定と画素値 / D6-3 Dark BackgroundとBlack Backgroundの違い / D6-4 自動閾値とOtsu法 / D6-5 Watershedが不適切な場合 / D6-6 形態学処理の基礎） |
| D7 | フィルタと画像演算 | 5（D7-1 平滑化の原理と副作用 / D7-2 Medianフィルタ / D7-3 Unsharp Mask / D7-4 Gamma補正の式と適用範囲 / D7-5 Image Calculatorと32-bit Result） |
| D8 | 背景補正 | 3（D8-1 Subtract Backgroundとローリングボール / D8-2 背景補正で信号が変わる理由 / D8-3 背景ROIによる補正） |
| D9 | スタックとZ投影 | 4（D9-1 スタックとハイパースタックの構造 / D9-2 Z投影の方式選択 / D9-3 Multi Measure / D9-4 仮想スタックの制約） |
| D10 | マクロとバッチ処理 | 4（D10-1 マクロとrun() / D10-2 setBatchMode / D10-3 Batch Macroと出力フォルダ / D10-4 コマンドライン実行とgetArgument()） |
| D11 | プラグインと拡張 | 3（D11-1 プラグインの仕組み / D11-2 FijiのUpdaterと更新サイト / D11-3 Bio-Formats） |
| D12 | ファイル形式とメタデータ | 4（D12-1 TIFFが標準である理由 / D12-2 JPEGが定量に不向きな理由 / D12-3 メタデータと校正情報 / D12-4 保存形式の選択指針） |

実務Q&A必須8件の収録確認：D6-1（ThresholdとConvert to Maskの違い）、D5-1（Mean Gray Valueとは）、D5-3（測定単位がおかしいとき）、D5-5（Analyze Particlesで数が合わないとき）、D6-5（Watershedが不適切な場合）、D2-3（ビット深度を下げると何が失われるか）、D6-3（Dark BackgroundとBlack Backgroundの違い）、D8-2（背景補正で信号が変わる理由）— 全件収録済み。

## 3. 情報源URL一覧（entries の src に使用）

- ImageJ User Guide「Working with ImageJ」（imagej.github.io アーカイブ）: https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html
- ImageJ User Guide「Process Menu」(29章): https://imagej.net/ij/docs/guide/146-29.html
- ImageJ公式「Plugins Menu」: https://imagej.net/ij/docs/menus/plugins.html
- ImageJ公式「Macro Functions」: https://imagej.net/ij/developer/macro/functions.html
- ImageJ公式「Macros」: http://wsr.imagej.net/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/developer/macro/macros.html
- ImageJ Macro Language 公式PDF: http://fiji.sc/ij/docs/ImageJMacroLanguage.pdf
- ImageJ公式「Analyze Menu」解説（ミラー）: http://www.cas.miamioh.edu/~meicenrd/anatomy/ch14_independentinvestigation/imagej/ij-docs/ij-docs/docs/menus/analyze.html
- ImageJ公式「Batch Mode / Batch Processing」: https://imagej.github.io/imagej-wiki-static/Batch_mode.html
- imagej.net「Z-functions」: https://imagej.net/imaging/z-functions
- imagej.net「Bio-Formats」: https://imagej.net/formats/bio-formats
- MBF ImageJ Manual「Colour image processing」（imagej.net収載）: https://imagej.net/mbf/colour_image_processi.htm
- ImageJ Documentation Wiki（imagejdocu.list.lu）: /gui/process/binary、/gui/process/filters、/gui/process/math、/gui/process/image_calculator、/gui/process/subtract_background、/gui/analyze/histogramme、/gui/analyze/tools

いずれも既存 SOURCES.md で取得・確認済みの一次情報であり、新規に未確認の主張は追加していない。特に Round 1 / Round 2 の監査で確定した事項（Threshold設定では画素値は変わらない、Dark/Black Backgroundの区別、Gammaの適用範囲、Subtract Background半径の型別目安、Z投影は6方式、Batch Macroの自動保存条件）は、その確定内容と矛盾しない形で反映した。

## 4. 用語集の再構成記録（72語 → 85語）

形式を全件作り替え：{t, en, aliases, cat, d（短い定義）, detail（詳しい解説）, vs（混同しやすい用語との違い）, ex（ImageJでの使用例）, related, src（既存出典キー）}。

### 追加した用語（13語）
| 用語 | 理由 |
|---|---|
| グレー値 | 全測定の基礎概念。従来は他用語の説明内にのみ存在した |
| チャンネル | コンポジット/ハイパースタック理解の前提として独立化が必要だった |
| スライス | スタックの構成単位として独立化 |
| マスク | ROI・オーバーレイとの三者区別のために必須 |
| 量子化 | ビット深度変換の情報損失を説明する基礎概念 |
| ダイナミックレンジ | 露光設計・深度選択の判断軸として追加（要件指定） |
| 飽和 | 定量不能状態を指す必須語（要件指定） |
| SNR | 画質・定量信頼度の基本指標（要件指定） |
| PSF | 光学ぼけの基礎概念（要件指定）。一次情報で裏取り可能な一般原理の範囲で記述 |
| デコンボリューション | PSFと対になる概念（要件指定）。プラグイン領域である旨を明記 |
| Watershed | D6-5・粒子解析の前提として必須（要件指定） |
| 距離マップ | Watershedの原理説明に必須（要件指定） |
| モルフォロジー演算 | Erode/Dilate/Open/Close を束ねる上位概念として新設（要件指定） |

### 統合・整理の判断
- 削除は0件。既存72語はいずれも重複ではなく、内容の重なる組（「バッチ処理」と「バッチマクロ（Process > Batch）」、「背景差し引き」と「Subtract Background」、「Smooth」と「Meanフィルタ」、「Make Binary」と「Convert to Mask」）については、概念／コマンドの区別が実務上有用であるため統合せず、`vs` 欄で違いを明示する方式に統一した。
- 全件に en（英語名）と aliases（別名・表記揺れ・略称）を新設。用語リンクの照合に使うため、特に次を充実させた：閾値処理（Threshold）→「しきい値処理」「スレッショルド」「閾値」「thresholding」、ROI→「関心領域」「選択範囲」「region of interest」、LUT→「ルックアップテーブル」「カラーテーブル」等。
- 全件に detail（2〜4文）と related（相互参照）を追加し、関連先がすべて実在の用語名であることを機械検証した。

## 5. 検証結果（2026-11-10 実施）

- `node` で data.js + data-docs.js を読み込み、構造検証を実施：章数12、各章 entries 3〜6件、総 entries 51件、用語85語。
- 全 entry の必須フィールド（id/title/menu/body/points/caution/src/srcName/version/lessons/terms）存在確認：エラー0。
- 全 entry の lessons 参照が実在レッスンID（L01〜L23）であること：エラー0。
- 全 entry・用語の terms/related 参照が実在用語名であること：エラー0。
- 全用語の src が既存 SOURCES の出典キー（work/proc/filt/bin/calc/math/hist/tools/ana/plug/bio/macro/macropdf/subbg/zproj/color/batch の17キー）内であること：エラー0。
- 用語名の重複：0件。
- 必須Q&A 8件・指定追加用語16件の収録：全件OK。
- GitHub書き込みは行っていない（親担当）。ChatGPT相談は行っていない（親担当）。

## 6. 残存事項・申し送り

- PSF / デコンボリューション / SNR は ImageJ 本体機能ではなく画像解析の一般概念であるため、説明は一般原理の範囲に限定し、ImageJ 固有の仕様であるかのような記述は避けた。アプリ側で表示する際は、その位置づけが伝わるカテゴリ表示が望ましい。
- entries の src のうち Analyze メニュー解説は公式ドキュメントのミラーURL（既存 SOURCES.md のキー `ana` と同一）を使用した。一次資料の正本URLへの差し替え可否は親側の判断に委ねる。
- 用語リンクの自動リンク化（本文からの照合）はアプリ側（app.js）の実装事項であり、本データでは aliases の整備までを担当範囲とした。
