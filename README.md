# oki-port（オキポート）

自作Webアプリのランチャー。スマホのホーム画面に置いて、ここから各アプリを開きます。

## アプリを追加するには
`apps.json` に1件追加して push するだけ。

```json
{
  "id": "my-app",
  "name": "アプリ名",
  "desc": "一言説明",
  "url": "https://kimu22734121-byte.github.io/my-app/",
  "icon": "icons/my-app.svg"
}
```

- `id` … 重複しない英数字（お気に入りの保存に使います）
- `icon` … `icons/` 内のSVG。既存のものをコピーして、色（`stop-color` / `stroke`）と中の線を変えるとお揃いになります
- `"comingSoon": true` … 「準備中」表示になり、タップしても開きません（`url` は空でOK）

## 公開（GitHub Pages）
リポジトリの **Settings → Pages → Build and deployment** で
Source: `Deploy from a branch` / Branch: `main` / `/ (root)` を選んで保存。
公開URL: https://kimu22734121-byte.github.io/oki-port/

## ホーム画面に追加
- iPhone（Safari）: 共有ボタン → 「ホーム画面に追加」
- Android（Chrome）: メニュー → 「ホーム画面に追加」

## 仕様メモ
- 行（アイコン・名前）のタップは同じタブで開く → ブラウザの戻るで oki-port に戻れます
- ★ お気に入りは一番上に固定、再タップで元の位置へ（`localStorage` に保存）
- 共有ボタンは Web Share API、非対応のブラウザではURLをコピー
- ビルド不要の静的サイト（HTML / CSS / JS のみ）

公開URL: https://kimu22734121-byte.github.io/oki-port/
