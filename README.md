# Portfolio Site

素の HTML / CSS / JavaScript で作った個人ポートフォリオサイト。
ビルド不要・依存ライブラリなし。GitHub Pages で無料公開します。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | ページ本文（テキスト・作品カードはここを編集） |
| `styles.css` | 見た目（色・レイアウト・ダークモード） |
| `script.js` | テーマ切り替えなどの軽い動き |

## 更新のしかた

1. Claude Code に「Aboutの文章をこう変えて」「作品を1つ増やして」などと伝える
2. 変更後、下の「公開する」を実行

作品画像を使う場合は `images/` フォルダを作って画像を置き、
`index.html` の該当箇所を `<img src="images/xxx.jpg">` に差し替えます。

## ローカルで確認する

```
python3 -m http.server 8000
```
ブラウザで http://localhost:8000 を開く。

## 公開する（GitHub Pages）

初回のみリポジトリを作成・接続。以降は push するだけで自動反映されます。

```
git add -A
git commit -m "update site"
git push
```

公開URL: `https://<ユーザー名>.github.io/`（ユーザーサイトの場合）
