# oki-port（オキポート）

自作Webアプリのランチャー。スマホのホーム画面に置いて、ここから各アプリを開きます。

## アプリの追加（自動）
GitHub Pages を公開した自分のリポジトリは、**何もしなくても自動で一覧に出ます**（ページを開いた時にGitHubから取得。最大30分は前回の結果を使います）。

- 名前＝リポジトリ名、説明＝リポジトリの説明文
- アイコン＝**説明文に合わせて自動で作ります**（録音→マイク、タイマー→ストップウォッチ、音楽→音符、ゲーム→コントローラー、家計簿→コイン など約25種類）。説明文が空、または当てはまる言葉がない時は、名前の頭文字のアイコンになります。絵柄の追加・調整は `js/icons.js`
- フォーク・アーカイブ済み・Pages未公開のリポジトリ、および `oki-port` 自身は出ません

### 名前・説明・アイコンを手動で決めたい時
`apps.json` の `apps` に1件書くと、同じ名前の自動分を上書きします（`id` はリポジトリ名の小文字）。

```json
{ "id": "my-app", "name": "my-app", "desc": "一言説明",
  "url": "https://kimu22734121-byte.github.io/my-app/", "icon": "icons/my-app.svg" }
```
`"comingSoon": true` を付けると「準備中」表示でタップしても開きません。

## 隠す・戻す
- **画面から（この端末だけ）**：一覧の下の「整理する」→ 各行の「隠す」。隠したものは同じ画面の下に残り、「戻す」でいつでも復活します
- **全端末で隠す**：`apps.json` の `hidden` にリポジトリ名（小文字）を書く。戻す時は消すだけ
- `ignore` は「候補にも出さない」設定（初期値は `oki-port`）

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
