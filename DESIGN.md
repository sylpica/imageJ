# DESIGN.md — ImageJ 学習・実務リファレンス（v2）設計メモ

- リポジトリ: sylpica/imageJ（公開URL: https://sylpica.github.io/imageJ/ ）
- 形式: 無料・ログイン不要の静的サイト。バニラHTML/CSS/JS、ビルド不要。
- ファイル: index.html / style.css / app.js ＋ データ3点（data-lessons.js / data-questions.js / data-docs.js）。旧 data.js は v2 では読み込まない（履歴として残置）。

## 情報設計
ハッシュルーティング: #/home #/lessons #/lesson/:id #/quiz #/docs #/doc/:chap(/:entry) #/terms #/term/:name #/search?q=
ヘッダーに横断検索を常設。モバイルは下部ナビ、PCは上部ナビ。
ホームには「実務の疑問から引く」導線（よくある疑問→該当ドキュメント章）を置く。

## データモデル（window.IJDATA2）
- lessons: {id, cat, title, lead, sections:[{h, b[], fig, figParam}], points[], mistakes[], related[], terms[], src}
- questions: {id, cat, q, c[4], a, e（正解理由）, w[4]（誤答理由・正解位置はnull）, lesson, src}
- terms: {t, en, aliases[], cat, d, detail, vs, ex, related[], src}
- docs: 章 {id, title, intro, entries:[{id, title, menu, body[], points[], caution, src（公式URL）, srcName, version, lessons[], terms[]}]}

## 主要な実装上の仕組み
- 用語リンク: 全用語の名称・英語名・別名から最長一致の正規表現を構築し、本文レンダリング時にボタン化（1ブロック内で同語1回・上限つき）。ポップアップ（モバイルはボトムシート）から用語詳細へ遷移可能
- 検索: NFKC＋小文字化＋ひらがな→カタカナで正規化。用語の別名・英語名で同義語展開し、正式名称と語幹（括弧注記・「処理」等の接尾辞を除去）でも照合。種類別グループ表示＋抜粋ハイライト
- 図解: app.js 内の SVG ジェネレータ（bitdepth/histogram/threshold/gamma/kernel-blur/kernel-median/unsharp/scale/roi-mask/particles/zproj/fft の12種）
- 保存: localStorage キー `ij-ref-v2`（問題履歴・ブックマーク・レッスン完了・ドキュメントブックマーク）。旧キーとは互換なし（破壊的変更として AUDIT2.md に記録）

## 品質ゲート
- tests/validate.mjs: 参照整合性・必須項目・問題バイアス（最長正解率≦25%、位置分布の均等）を恒常チェック
- tests/audit.mjs: Playwright で 375px/1280px の実操作監査（遷移・検索・クイズ・ポップアップ・保持・横溢れ・JSエラー）
