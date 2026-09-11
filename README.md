# Password Forge

A Chrome extension that generates a strong, repeatable password for each site
from a single passphrase you remember — nothing sensitive is ever stored.

日本語の説明は下にあります。

## How it works

1. You type a **master passphrase** (memorized, never saved anywhere).
2. The extension combines it with the **site domain**, a **user ID** you
   choose, and a **generation number** (for password rotation).
3. It runs **PBKDF2-HMAC-SHA256** (200,000 iterations) via the browser's
   Web Crypto API to derive a password of the length and character types
   you choose (uppercase / lowercase / digits / symbols).
4. The same inputs always produce the same password — on any device,
   with nothing synced or stored — so there is nothing to back up and
   nothing that can leak from this extension's storage.

Only low-sensitivity UI preferences (default user ID, preferred length,
character-type toggles, UI language) are saved locally via
`chrome.storage.local`. The passphrase and generated passwords are **never**
stored or transmitted anywhere.

## Security notes

This is a deterministic password generator, not a password manager. Its
strength depends entirely on the strength of your passphrase — a weak or
guessable passphrase is weak no matter how many PBKDF2 iterations are used.
Consider it a convenient way to derive strong, unique, site-specific
passwords from one memorized phrase, not a substitute for a dedicated
password manager with multi-factor authentication for your most important
accounts.

## Install (unpacked, for development/testing)

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder (the one containing
   `manifest.json`).

## Tech

- Manifest V3
- No external dependencies — pure HTML/CSS/JS
- `Web Crypto API` (`crypto.subtle`) for PBKDF2
- Permissions: `activeTab` (read the current tab's domain when you open the
  popup), `storage` (save non-sensitive UI preferences only)

---

# Password Forge (日本語)

サイトのドメイン・ユーザーID・あなたが決めた合言葉から、毎回同じ強力なパスワードを再現できるChrome拡張機能です。合言葉やパスワードそのものは一切保存されません。

## 仕組み

1. **合言葉(マスターキー)**を入力します(記憶するだけで、どこにも保存されません)。
2. それを**対象サイトのドメイン**、任意の**ユーザーID**、**世代番号**(パスワードを変更したいときに使う)と組み合わせます。
3. ブラウザ標準のWeb Crypto APIで**PBKDF2-HMAC-SHA256**(20万回反復)による鍵導出を行い、指定した長さ・文字種(大文字/小文字/数字/記号)のパスワードを生成します。
4. 同じ入力からは常に同じパスワードが生成されるため、同期や保存の必要が一切なく、漏洩のリスクもありません。

`chrome.storage.local`に保存されるのは、既定のユーザーID・希望のパスワード長・文字種の設定・表示言語といった、低機微度なUI設定のみです。合言葉や生成されたパスワードは一切保存・送信されません。

## セキュリティに関する注意

これはパスワードマネージャーではなく、決定論的なパスワード生成ツールです。安全性は合言葉自体の強度に完全に依存します。弱い合言葉を使えば、PBKDF2の反復回数をいくら増やしても弱いままです。銀行やメインのメールアドレスなど、特に重要なアカウントには、専用のパスワードマネージャーと多要素認証の利用をおすすめします。

## インストール方法(開発・動作確認用)

1. このリポジトリをダウンロードまたはcloneします。
2. Chromeで`chrome://extensions`を開きます。
3. 右上の「デベロッパーモード」をONにします。
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`manifest.json`が入っているこのフォルダを選択します。

## 技術構成

- Manifest V3
- 外部依存ライブラリなし(素のHTML/CSS/JS)
- PBKDF2の計算にはブラウザ標準の`Web Crypto API`(`crypto.subtle`)を使用
- 権限:`activeTab`(ポップアップを開いた瞬間だけ現在のタブのドメインを読む)、`storage`(低機微度なUI設定の保存のみ)
