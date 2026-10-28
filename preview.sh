#!/bin/bash
# 聖歌隊 音取りウェブアプリ ローカルプレビュー用スクリプト

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ローカルIPアドレスを取得
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
PORT=8080

echo "=========================================================="
echo " 🎶 復活祭 聖歌隊 音取りウェブアプリ プレビューサーバー"
echo "=========================================================="
echo ""
echo " ▶ パソコンのブラウザで開く場合:"
echo "   http://localhost:$PORT"
echo ""
echo " ▶ 同じWi-Fiに繋がっているスマホで開く場合:"
echo "   http://$LOCAL_IP:$PORT"
echo ""
echo " サーバーを停止するには Ctrl + C を押してください。"
echo "=========================================================="
echo ""

# open command for Mac default browser
if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "http://localhost:$PORT") &
fi

/opt/homebrew/bin/python3 -m http.server "$PORT" --directory public
