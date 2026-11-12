# AUDIT10 — フェイリス側仕上げ（第3ラウンド残件の解消と完成確認）

- 実施日: 2026-11-13
- 経緯: AUDIT9（第3ラウンド二重監査）の統合・配信後、ユーザー指示「フェイリス側で完成させて」を受け、任意残件として報告のみに留めていた項目を Muse 側で実施し、未確認項目のうち実施可能なものを潰して完成とした。
- Claude Code セッションは使っていない（Muse 側のみで実施）。

## 実施内容

### 1. 関数リファレンスへの Roi.* / RoiManager.* 項目の追加（AUDIT9 残件の解消）
- AUDIT9-CLAUDE の R-2 が「Roi.* など」とした欠落のうち、実務で中核となる19件を追加した。書式は公式「Built-in Macro Functions」の表記どおり、説明は公式記述に基づく独自要約。
  - Roi.getBounds、Roi.getCoordinates、Roi.contains、Roi.move、Roi.translate（1.53v以降）、Roi.setStrokeWidth、Roi.setStrokeColor、Roi.setFillColor、Roi.setName、Roi.getName、Roi.setPosition（1.53b以降）、Roi.getPosition、Roi.getProperty、Roi.setProperty、RoiManager.select、RoiManager.selectByName（1.53s以降）、RoiManager.getName、RoiManager.getIndex（1.53s以降）、RoiManager.delete（1.54k以降）
- 関数数は 112 → 131。
- 併せてシミュレーション側を整合させた:
  - 複数形式がある関数の引数チェック緩和（Roi.setStrokeColor / setFillColor は 1〜3、Roi.setPosition は 1〜3、Roi.setProperty は 1〜2）。
  - Roi.getPosition を参照引数関数として登録（従来は引数の変数が未代入エラーになった）。
- validate の関数数サニティ範囲（従来 70〜120）は131件に合わせて 70〜160 に更新した（上限は想定規模の目安であり、製品要件ではない）。

### 2. ドキュメント出典 URL の到達性確認（AUDIT9 未確認項目の解消）
- data-docs.js の出典 URL 全51件を実際に取得し、**全件 HTTP 200** を確認した（2026-11-13、リダイレクト追随あり）。
- 内訳は AUDIT9 記録どおり imagej.net 15件、imagej.github.io/imagej-wiki-static 18件、imagejdocu.list.lu 18件。リンク切れは無し。
- 要約と原典の全文照合は未実施のまま（到達性のみ確認）。

### 3. AUDIT9.md の訂正反映
- overflow の scanned 数を 822（監査側の修正前ツリーでの値）→ 846 に訂正した版を本配信に含める。

## 検証結果（仕上げ後、Muse 側で実施）
- validate: ALL CHECKS PASSED（official=580、functions=131、lessons=28、questions=63、terms=80、docChapters=12、docEntries=51、answerDist=17,15,16,15、バイアス 11.1%）。
- audit: 247 件すべて PASS（AUDIT ALL PASSED）。
- overflow: scanned=903、problems=0（項目追加で走査対象が増加）。
- シミュレーション検証: 5バッテリ合計 851 件すべて合格（sim-battery 341、sim-audit3 153、sim-audit8 150、sim-audit9 167、本仕上げで新設した sim-audit10 40 — Roi.* の呼び出し・引数形式・参照引数の整合）。
- レイアウト: layout-smoke 60/60、dark-smoke 7/7、audit9-ui 10/10。
- 配信後に公開 URL の md5 で一致を確認する。

## 残る未確認（環境制約によるもの）
- 本物の ImageJ／Fiji での実行値の突合（実行環境を用意できないため。指摘の根拠は公式ソース読解で、Muse 側でも実コードで再確認済み）。
- iOS Safari 実機、スクリーンリーダーでの確認。
- ドキュメント要約と原典の全文照合（到達性は上記 2 で確認済み）。

## 配信
- 本書を含む節目配信で main と gh-pages へ反映する（push-files 各1回、書き込みコール数 2 件）。
