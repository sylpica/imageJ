# ImageJ学習アプリ

ImageJ / Fiji の基礎から実務までを学ぶ、無料・ログイン不要の静的学習サイトです。
四択問題・教科書レッスン・用語集の3本柱で、内容は公式ドキュメント（imagej.net / ImageJ User Guide）で裏取りした範囲に限っています。

- 公開URL（想定）: https://sylpica.github.io/imagej/
- リポジトリ: sylpica/imagej

## ローカルで開く
`index.html` をブラウザで開くだけで動作します（ビルド不要）。

## テスト
```
node tests/validate.mjs
```

## 構成
- `index.html` / `style.css` / `data.js`（レッスン・問題・用語データ）/ `app.js`（画面ロジック）
- `DESIGN.md` 設計メモ / `SOURCES.md` 出典リスト / `AUDIT.md` 自己監査メモ
