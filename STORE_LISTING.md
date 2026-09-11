# Chrome Web Store — Submission Text Kit

Copy-paste these directly into the Developer Dashboard fields.

---

## Store listing

### Short summary (max 132 characters)

**EN:**
```
Generate a strong, unique password for every site from one memorized passphrase. Nothing is stored or transmitted.
```
(116 characters)

**JA:**
```
1つの合言葉から、サイトごとに強力で再現可能なパスワードを生成。合言葉もパスワードも一切保存・送信しません。
```

### Detailed description

**EN:**
```
Password Forge generates a strong, unique password for each website from a
single passphrase that only you remember — nothing sensitive is ever saved.

HOW IT WORKS
Type your master passphrase, the site's domain, and (optionally) a user ID
to tell accounts on the same site apart. Password Forge combines these and
runs PBKDF2-HMAC-SHA256 (200,000 iterations) via your browser's built-in
Web Crypto API to deterministically derive a password. The same inputs
always produce the same password, on any device, with nothing to sync.

FEATURES
• Choose password length (8–32 characters)
• Toggle uppercase / lowercase / digits / symbols independently
• "Generation" counter lets you rotate a site's password on demand while
  keeping the same passphrase
• Domain auto-fills from the current tab
• English / Japanese interface, switchable anytime
• Zero network requests — everything runs locally in your browser

WHAT IS STORED
Only non-sensitive preferences (default user ID, preferred length,
character-type toggles, UI language) are saved locally via
chrome.storage.local. Your passphrase and every generated password are
NEVER stored or transmitted anywhere.

A NOTE ON SECURITY
This is a deterministic password generator, not a password manager. Its
strength depends entirely on the strength of your passphrase. For your
most important accounts, we still recommend a dedicated password manager
with multi-factor authentication.
```

**JA:**
```
Password Forgeは、あなたが覚えている1つの合言葉から、サイトごとに強力で
一意なパスワードを生成するChrome拡張機能です。合言葉もパスワードも
一切保存されません。

■ 仕組み
合言葉・対象サイトのドメイン・(同じサイトで複数アカウントを使い分ける
場合の)ユーザーIDを入力すると、ブラウザ標準のWeb Crypto APIで
PBKDF2-HMAC-SHA256(20万回反復)による鍵導出を行い、パスワードを
決定論的に生成します。同じ入力からは、どの端末でも常に同じパスワードが
再現され、同期の必要もありません。

■ 主な機能
・パスワード長を指定可能(8〜32文字)
・大文字/小文字/数字/記号を個別にON/OFF
・「世代」番号で、合言葉はそのままにサイトのパスワードだけを更新可能
・現在開いているタブからドメインを自動入力
・日本語/英語表示をいつでも切替可能
・通信は一切行わず、すべてブラウザ内で完結

■ 保存されるデータ
既定のユーザーID・希望のパスワード長・文字種設定・表示言語といった、
低機微度な設定のみをchrome.storage.localに保存します。合言葉および
生成されたパスワードは一切保存・送信されません。

■ セキュリティについて
これはパスワードマネージャーではなく、決定論的なパスワード生成ツール
です。安全性は合言葉自体の強度に依存します。銀行やメインのメール
アドレスなど特に重要なアカウントには、専用のパスワードマネージャーと
多要素認証の併用をおすすめします。
```

### Category
Productivity (or: Tools)

---

## Privacy tab (Developer Dashboard)

### Single purpose description
```
This extension's single purpose is to deterministically derive a password
for a website from a user-provided passphrase, domain, and optional user ID,
using PBKDF2 (SHA-256) — entirely on-device, without storing the passphrase
or any generated password.
```

### Permission justifications

**activeTab:**
```
Used only to read the hostname of the currently active tab at the moment
the popup is opened, in order to pre-fill the "Domain" field for the user's
convenience. No other tab or page data is accessed, stored, or transmitted.
```

**storage:**
```
Used only to save non-sensitive local preferences (default user ID,
preferred password length, character-type toggles, UI language) via
chrome.storage.local. The passphrase and generated passwords are never
stored. No data is transmitted off-device.
```

### Data collection disclosure checkboxes
Leave all data-type checkboxes (Personally identifiable information, Health
info, Financial info, Authentication info, Personal communications,
Location, Web history, User activity, Website content) **unchecked** — this
extension does not collect or transmit any of these; everything happens
locally.

### Certifications
Check the boxes certifying:
- The extension does not sell or transfer user data to third parties for
  purposes unrelated to the extension's single purpose.
- The extension does not use or transfer user data for creditworthiness or
  lending purposes.

### Privacy policy URL
```
https://<your-github-username>.github.io/<repo-name>/privacy-policy.html
```
(after enabling GitHub Pages on the repository — see README for steps)
