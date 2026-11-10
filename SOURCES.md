# SOURCES.md — 出典リスト（一次情報）

2026-11-06 に browser.search / browser.open で実際に取得・確認したものだけを挙げる。

1. ImageJ User Guide「Working with ImageJ」（imagej.github.io アーカイブ、現行サイトは imagej.net）
   https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html
   - 画像の種類: 8-bit=256階調、16-bit=65,536階調、32-bit=浮動小数（NaN可）、RGB=各チャンネル256値の24-bit（+alphaで32-bit）
   - ネイティブ形式: TIFF, GIF, JPEG, PNG, DICOM, BMP, PGM, FITS。TIFFがデフォルト形式で校正情報はTIFF/ZIPのみ保存
   - スタック: 全スライス同サイズ・同ビット深度。仮想スタックはディスク常駐・読み取り専用
   - ハイパースタック: x, y, z, c, t の4D/5D
   - 選択（ROI）: 同時にアクティブな選択は1つだけ。矢印キーで1ピクセルずつナッジ
   - Undoは直近の編集/フィルタ操作に限られる。JPEGは非可逆で定量解析に不向き
   - コンポジット画像: チャンネルを分離保持、各チャンネルは8/16/32-bit可、3チャンネル超も可

2. ImageJ User Guide「Process Menu」（wsr.imagej.net）
   http://wsr.imagej.net/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/docs/guide/146-29.html
   - Smooth: 3×3近傍の平均。Sharpen: 3×3重み付き平均でコントラスト強調（ノイズも強調しうる）
   - Gaussian Blur: Sigma はガウス関数の標準偏差σ（e^-0.5≈61%への減衰半径）
   - Unsharp Mask: ぼかしたコピーを差し引いてエッジ強調。Radius=差し引くガウスぼかしのσ、Mask Weight=フィルタ強度（1で無限大相当）
   - Median: 近傍の中央値で置換（imagejdocu Filtersページでも確認）
   - Make Binary / Convert to Mask と Black Background オプション

3. ImageJ Documentation Wiki（imagejdocu.list.lu）
   - Filters: https://imagejdocu.list.lu/gui/process/filters
   - Binary: https://imagejdocu.list.lu/gui/process/binary （Make Binaryはヒストグラムから閾値を決める、Convert to Maskは現在の閾値設定に基づく）
   - Image Calculator: https://imagejdocu.list.lu/gui/process/image_calculator （2画像間の算術・論理演算、12演算子、32-bit Result、ゼロ除算はInfinity/NaN）
   - Math: https://imagejdocu.list.lu/gui/process/math （定数の加減乗除、8-bitでは255超は255・0未満は0に丸め、Gammaは 0.1〜5.0）
   - Histogram: https://imagejdocu.list.lu/gui/analyze/histogramme （Count/Mean/Mode/Min/Maxを表示、RGBは輝度変換、16-bitは256ビン）
   - ROI Manager（Analyze>Tools）: https://imagejdocu.list.lu/gui/analyze/tools （Addは「t」、Saveは単体.roi/一括ZIP、Measure、Show All、Multi Measure）

4. Analyzeメニュー解説（Set Measurements / Set Scale / Analyze Particles）
   http://www.cas.miamioh.edu/~meicenrd/anatomy/ch14_independentinvestigation/imagej/ij-docs/ij-docs/docs/menus/analyze.html
   - Measureが記録する項目は Set Measurements で指定。Areaは Set Scale で校正済みなら校正単位
   - Analyze Particles: 二値化/閾値済み画像のオブジェクトを数えて計測。Size範囲外は無視、Summarizeで件数・合計面積・平均サイズ・面積率

5. Pluginsメニュー（imagej.net 公式）
   https://imagej.net/ij/docs/menus/plugins.html
   - プラグインはJavaで書かれ .class にコンパイル、マクロはJava風マクロ言語で .txt
   - pluginsフォルダ（サブフォルダ含む）に入れたものがメニューに載る。名前のアンダースコアが条件
   - Command Recorder（Macros>Record）で操作をマクロ化できる。内部コマンドも ij.jar 内のプラグインとして実装

6. Bio-Formats（imagej.net 公式）
   https://imagej.net/formats/bio-formats
   - Bio-Formats Importerで多数のライフサイエンス形式と取得メタデータを読み込める。Fijiでは File>Open に統合。更新はFijiではImageJ Updaterを使う

7. ImageJ Macro Language（公式PDF / 公式Macrosページ）
   http://fiji.sc/ij/docs/ImageJMacroLanguage.pdf
   http://wsr.imagej.net/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/ij/developer/macro/macros.html
   - run(command, options) で400超のメニューコマンドを実行できる。Recorderが run() 呼び出しを生成する
   - getTitle() はアクティブ画像のタイトルを返す。setThreshold(lower, upper)、getThreshold
   - setBatchMode(true) で画像を表示せず高速化（公式Macrosページ: 最大で約20倍と記載。数値はバージョン依存のため本文では「大幅に高速化」と表現）
   - コマンドライン: -macro / -batch オプション

8. Auto Threshold（imagej.net への参照を autothresholdr ドキュメント等で確認）
   - 自動閾値の手法名: Default(IsoData), Huang, Intermodes, IsoData, Li, MaxEntropy, Mean, MinError(I), Minimum, Moments, Otsu, Percentile, RenyiEntropy, Shanbhag, Triangle, Yen
   - Otsuはクラス内分散を最小化（＝クラス間分散を最大化）し二峰性ヒストグラムに向く

## 使わなかった情報
- setBatchMode「20倍」等の具体的倍率、Otsuの正解率87%等の数値は二次情報/版依存のため採用しなかった。

## 第2ラウンド追加（2026-11-06）
9. Subtract Background（imagejdocu）
   https://imagejdocu.list.lu/gui/process/subtract_background
   - ローリングボールで滑らかな背景を推定して差し引く。半径は「背景でない最大の対象」以上の大きさが目安。Light Background、Create Background、Disable Smoothing の各オプション。User Guide 29.14（Process Menu）でも同内容を確認。
10. Z Project（imagej.net Z-functions）
    https://imagej.net/imaging/z-functions
    - Image > Stacks > Z Project。投影方式は Average / Maximum / Minimum / Sum Slices / Standard Deviation / Median の6種。開始・終了スライスを指定する。
11. チャンネルの分割・合成（MBF ImageJ マニュアル、imagej.net 収載）
    https://imagej.net/mbf/colour_image_processi.htm
    - Image > Color > Split Channels（RGB分割）、Merge Channels系の合成、コンポジット画像はチャンネルを分離保持し表示オン/オフ可。
12. Batch Processing（ImageJ公式アーカイブ）
    https://imagej.github.io/imagej-wiki-static/Batch_mode.html
    - Process > Batch > Macro。入力・出力ディレクトリと出力形式を指定し、マクロを全画像へ適用。公式Batch Processing文書（downloads.imagej.net）でも「Output未指定では保存されない」を確認。
    - Scale Bar は既存の出典3（imagejdocu Tools: Widthは校正単位、Heightはピクセル、Font Size/Color/Location/Hide Text/Bold Text）で裏取り。

## v2 で追加した一次情報
- FFT: https://imagejdocu.list.lu/gui/process/fft
- Analyze Menu（公式）: https://imagej.net/ij/docs/menus/analyze.html
- Menus（公式）: https://imagej.net/ij/docs/menus/
- Macro Functions（公式）: https://imagej.net/ij/developer/macro/functions.html
- Licensing（権利確認）: https://imagej.net/imagej-wiki-static/Licenses.html
