# oki-port 作業ルール

静的サイト（HTML / CSS / JS のみ、ビルドなし）。GitHub Pages で `main` を公開している。

## キャッシュ対策（必須）
`index.html` が読み込む JS・CSS には `?v=日付時刻` を付けている（例：`css/style.css?v=20261124-2130`）。

**このリポジトリを更新して push する時は、毎回その前にバージョン番号を新しくすること。**

1. 変更が済んだら `./scripts/bump-version.sh` を実行する（日本時間の `YYYYMMDD-HHMM` で、`index.html` 内の css/js すべてを一括更新する）
2. `index.html` の差分でバージョンが変わっていることを確認してから、コミット・push する

- 新しい JS / CSS を `index.html` に足す時も、`?v=` を付ける（スクリプトが次回から一緒に更新する）
- 対象は `index.html` から読み込む css / js。`apps.json` は `no-cache` で取得しているので対象外
- `manifest.webmanifest?v=` とアイコンのファイル名（`icon-v2-*`）は、ホーム画面の更新用に別管理。マニフェストやアイコンを変えた時だけ上げる

## その他
- 公開：`main` に push すると Pages が更新される（反映まで1〜2分）
- アプリの一覧：Pages を公開した自分のリポジトリは自動で出る。手動設定は `apps.json`（README 参照）
