# Livedoor blog のコメント欄にIDを追加する Chrome拡張機能

## 使い方
1. [ZIPファイル](https://github.com/AmBXHC9XpA/livedoor-comment-extension/releases/latest/download/livedoor-blog-comment-chrome-extension.zip) ダウンロードして解凍
2. `chrome://extensions` にアクセス
3. デベロッパーモードをON
4. 「パッケージ化されていない拡張機能を読み込む」から解凍したディレクトリを選択

## 特定のサイトで動かなくなった場合
JSONの取得に失敗したサイトは次回以降実行しないようにフラグを保存しています。  
ブラウザ上の右クリックメニューの「Livedoor blog コメント」->「オプション」でオプション画面を開いて「サイト一覧」で対象のURLを「有効化」してください。

## 無視IDの追加
IDを右クリックして「無視IDに追加」を選択  
ブラウザ上の右クリックメニューの「Livedoor blog コメント」->「オプション」でオプション画面を開いて「無視ID一覧」で削除可能
