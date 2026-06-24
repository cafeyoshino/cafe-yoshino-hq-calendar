# カフェヨシノ 本社カレンダー 管理者設定

## 1. Google側で用意するもの

- 共有カレンダーID
- APIキー
- OAuthクライアントID

## 2. アプリ側の設定

`app-config.js` を開き、以下を入れます。

```js
window.CAFE_YOSHINO_CONFIG = {
  calendarId: '共有カレンダーID',
  apiKey: 'APIキー',
  clientId: 'OAuthクライアントID',
  memberMap: [
    'imanishi0305@gmail.com=今西',
    'tamaki@example.com=玉木'
  ].join('\n')
};
```

## 3. メンバー追加

新しい人が増えたら、共有カレンダーにGmailを招待し、`memberMap` に1行追加します。

```text
メールアドレス=表示名
```

## 4. 本番公開時

本番URLをGoogle Cloud側に追加します。

APIキー：

```text
https://本番URL/*
```

OAuthクライアントID：

```text
https://本番URL
```
