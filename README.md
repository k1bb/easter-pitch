# 復活祭 聖歌隊 音取りウェブアプリ (Easter Choir Note Player)

復活祭（復活徹夜祭・復活の主日）の聖歌隊練習および本番向けに、スマホでワンタップで音取り音源を再生できる軽量Webアプリ（PWA対応）です。

Cloudflare Pages（無料）にアップロードするだけで、世界中どこからでもアクセスできる自分専用のURL（`https://xxx.pages.dev`）が手に入ります。

---

## 🎵 収録音源・ボタン一覧（全8音源）

### 【キリストの光】
1. **１回目** (`audio/track_01.mp3`, 約5秒) - キリストの光（第1唱）
2. **２回目** (`audio/track_02.mp3`, 約5秒) - キリストの光（第2唱）
3. **３回目** (`audio/track_03.mp3`, 約5秒) - キリストの光（第3唱）

### 【復活賛歌】
4. **神の使いよ** (`audio/track_04.mp3`)
5. **主は皆さんとともに** (`audio/track_05.mp3`)
6. **目に見えない神** (`audio/track_06.mp3`)
7. **キリストは私たちのために** (`audio/track_07.mp3`)
8. **今日こそまことの** (`audio/track_06.mp3` - 目に見えない神と同じ音源)
9. **いつくしみ深い父よ** (`audio/track_08.mp3`)

---

## ✨ 特長

- **真っ暗闇・有機EL対応（OLED True Black）**: 背景は完全な漆黒（#000000）で有機ELディスプレイでは完全消灯。光漏れで聖堂の暗闇を邪魔しません
- **目に優しいキャンドルカラー（完全な白は一切不使用）**: 文字は柔らかなキャンドルアイボリー、見出しはアンバーゴールドで眩しさを徹底排除
- **蝋燭の炎ファビコン & テーマ**: 押している間は蝋燭の火が灯るように温かい炎色（アンバー）に点灯
- **押している間だけ鳴る（鍵盤式・サステイン）**: ボタンを押している間だけ音が流れ、最後の音は離すまで伸び続け、指を離すとスッと自然に消音
- **完全1画面・スクロールなし**: 全9ボタンが画面縦いっぱいに美しく均等配置
- **PWA・完全オフライン動作**: 電波のない教会・礼拝堂でも確実に音が鳴ります

---

## 🚀 Cloudflare Pages での公開手順（無料）

### 方法A: 【おすすめ】GitHub と連携して自動デプロイ（オープンソース向け）

GitHubにコードをプッシュするだけで、Cloudflare Pagesが自動的に検知してサイトを公開・更新してくれます。

1. **GitHub にリポジトリを作成してプッシュ**:
   ```bash
   cd /Users/andrew/.gemini/antigravity/scratch/easter-choir-app
   git init -b main
   git add .
   git commit -m "feat: initial commit for Easter Choir Note Player"
   # GitHubで新規リポジトリ（Public）を作成後：
   git remote add origin https://github.com/<あなたのユーザー名>/easter-choir.git
   git push -u origin main
   ```
2. **Cloudflare ダッシュボードにアクセス**:
   - [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
3. **Pages プロジェクトを作成**:
   - 左メニュー **「Workers & Pages」** → **「作成」** → **「Pages」** タブ
   - **「Git に接続 (Connect to Git)」** を選択
   - GitHubアカウントを連携し、上記のリポジトリを選択
4. **ビルド設定**:
   - **フレームワーク プリセット**: `None`
   - **ビルド コマンド**: （空欄のままでOK）
   - **ビルド出力ディレクトリ**: `public`
5. **「保存してデプロイ」をクリック**:
   - 数秒で `https://<プロジェクト名>.pages.dev` の無料URLが発行されます！
   - 以後、コードや音源を変更して `git push` するだけで自動反映されます。

---

### 方法B: 【一番手軽】ZIP またはフォルダをドラッグ＆ドロップ（Direct Upload）

GitHubを使わずに今すぐ手元だけで公開したい場合：

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) で **「Workers & Pages」** → **「作成」** → **「Pages」**
2. **「資産をアップロード (Upload assets)」** を選択
3. プロジェクト名を入力（例: `easter-choir`）
4. プロジェクト内の `public` フォルダ（または `deploy-package.zip`）をドラッグ＆ドロップ
5. **「サイトをデプロイ」** をクリックするだけで即座に公開されます。

---

## 💻 ローカルプレビュー方法

Macのターミナルで以下のコマンドを実行するだけで、ブラウザが自動で開き動作確認できます：

```bash
cd /Users/andrew/.gemini/antigravity/scratch/easter-choir-app
./preview.sh
```

- 同じWi-Fiに繋がっているスマホから、表示された `http://192.168.x.x:8080` を開けばスマホ実機でもすぐに試せます。

---

## 📁 ディレクトリ構成

```
easter-choir-app/
├── public/                # 公開用静的Webファイル（ビルド不要）
│   ├── index.html         # メイン画面HTML
│   ├── style.css          # スマホ特化CSSデザイン
│   ├── app.js             # オーディオ再生＆UI制御スクリプト
│   ├── manifest.json      # PWA（ホーム画面追加用マニフェスト）
│   ├── sw.js              # オフラインキャッシュ用Service Worker
│   ├── favicon.ico        # ファビコン
│   ├── icons/             # アプリアイコン（SVG, 192px, 512px）
│   └── audio/             # 8つの音取り音源（mp3）
├── deploy-package.zip     # Cloudflare Pagesアップロード用ZIP
├── preview.sh             # ローカルプレビュー起動スクリプト
└── README.md              # 本マニュアル
```
