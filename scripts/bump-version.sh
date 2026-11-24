#!/usr/bin/env bash
# index.html が読み込む css/js の ?v= を現在の日本時間（YYYYMMDD-HHMM）に更新する
set -euo pipefail
cd "$(dirname "$0")/.."
v=$(TZ=Asia/Tokyo date +%Y%m%d-%H%M)
sed -i -E "s#((css|js)/[A-Za-z0-9_.-]+\.(css|js))(\?v=[0-9A-Za-z-]*)?\"#\1?v=${v}\"#g" index.html
echo "version: ${v}"
grep -n '?v=' index.html
