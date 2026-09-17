// --- 定数定義 ---
const CHAR_SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  num:   "0123456789",
  sym:   "!@#$%^&*()_+~`|}{[]:;?><,./-="
};
const ITERATIONS = 200000;
const MAX_ATTEMPTS = 50;
const SYM_REGEX = /[!@#$%^&*()_+~`|}{\[\]:;?><,.\/\-=]/;

// --- ローカル保存の抽象化(chrome.storage.local互換の最小ラッパー) ---
// Chrome拡張版のIF(get(keys) => Promise<object>, set(obj, cb?))に合わせておくことで、
// 呼び出し側のロジックを拡張版から変更せずに移植できるようにしている。
const Storage = {
  get(keys) {
    const result = {};
    keys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      try {
        result[key] = JSON.parse(raw);
      } catch (e) {
        result[key] = raw;
      }
    });
    return Promise.resolve(result);
  },
  set(obj, callback) {
    Object.entries(obj).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // localStorageが使えない(プライベートモード等)場合は保存をスキップし、
        // 動作自体は継続させる
      }
    });
    if (callback) callback();
    return Promise.resolve();
  }
};

// --- 多言語辞書 ---
const I18N = {
  en: {
    subtitle: "Stateless Brass Cipher",
    labelMasterKey: "Master Key (Passphrase)",
    placeholderMasterKey: "A secret phrase only you remember",
    labelDomain: "Target Site (Domain)",
    labelVersion: "Gen",
    labelUserId: "User ID",
    placeholderUserId: "e.g. your.email@example.com",
    saveUserIdTitle: "Save as default",
    userIdSavedHint: "Saved as default user ID",
    labelLength: "Password Length",
    lengthUnit: "chars",
    optUpper: "Uppercase",
    optLower: "Lowercase",
    optNum: "Numbers",
    optSym: "Symbols",
    generateBtn: "Generate",
    outputPlaceholder: "Your password will appear here",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    alertMasterDomain: "Please enter a master key and target site.",
    alertCharClass: "Please select at least one character type.",
    alertGenFail: "Generation failed. Try changing the length or character types."
  },
  ja: {
    subtitle: "ステートレス・ブラス暗号",
    labelMasterKey: "合言葉 (Master Key)",
    placeholderMasterKey: "記憶している秘密のフレーズ",
    labelDomain: "対象サイト (Domain)",
    labelVersion: "世代",
    labelUserId: "ユーザーID",
    placeholderUserId: "例: your.email@example.com",
    saveUserIdTitle: "既定として保存",
    userIdSavedHint: "既定のユーザーIDとして保存しました",
    labelLength: "パスワード長",
    lengthUnit: "文字",
    optUpper: "大文字",
    optLower: "小文字",
    optNum: "数字",
    optSym: "記号",
    generateBtn: "生成",
    outputPlaceholder: "ここにパスワードが生成されます",
    copyBtn: "コピー",
    copiedBtn: "コピー済み",
    alertMasterDomain: "合言葉と対象サイトを入力してください。",
    alertCharClass: "文字種を少なくとも1つ選択してください。",
    alertGenFail: "生成に失敗しました。条件(長さ・文字種)を変えて再度お試しください。"
  }
};

const LANG_STORAGE_KEY = "uiLang";
let currentLang = "en"; // default

// --- DOM要素の取得 ---
const els = {
  masterKey: document.getElementById('masterKey'),
  toggleVis: document.getElementById('toggleVis'),
  domain: document.getElementById('domain'),
  version: document.getElementById('version'),
  userId: document.getElementById('userId'),
  saveUserIdBtn: document.getElementById('saveUserIdBtn'),
  userIdHint: document.getElementById('userIdHint'),
  lengthSlider: document.getElementById('lengthSlider'),
  lengthDisplay: document.getElementById('lengthDisplay'),
  optUpper: document.getElementById('optUpper'),
  optLower: document.getElementById('optLower'),
  optNum: document.getElementById('optNum'),
  optSym: document.getElementById('optSym'),
  generateBtn: document.getElementById('generateBtn'),
  gearIcon: document.querySelector('.gear-icon'),
  output: document.getElementById('output'),
  copyBtn: document.getElementById('copyBtn'),
  langToggle: document.getElementById('langToggle')
};

// --- 言語切替 ---
function applyLanguage(lang) {
  currentLang = lang;
  const dict = I18N[lang];

  document.querySelectorAll('[data-i18n]').forEach((elm) => {
    const key = elm.getAttribute('data-i18n');
    if (dict[key] !== undefined) elm.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((elm) => {
    const key = elm.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) elm.placeholder = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach((elm) => {
    const key = elm.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) elm.title = dict[key];
  });

  els.langToggle.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // コピー済み表示中でなければCopyボタンのラベルも更新
  if (!els.copyBtn.disabled || els.copyBtn.textContent !== dict.copiedBtn) {
    els.copyBtn.textContent = dict.copyBtn;
  }
}

els.langToggle.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    applyLanguage(lang);
    Storage.set({ [LANG_STORAGE_KEY]: lang });
  });
});

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', async () => {
  const stored = await Storage.get(
    ['domain', 'version', 'length', 'opts', 'defaultUserId', LANG_STORAGE_KEY]
  );

  applyLanguage(stored[LANG_STORAGE_KEY] === 'ja' ? 'ja' : 'en');

  // Web版にはブラウザ拡張の「現在タブのURL」に相当する情報がないため、
  // ドメインは常に前回入力値をlocalStorageから復元する(手動入力運用)
  if (stored.domain) els.domain.value = stored.domain;
  if (stored.version) els.version.value = stored.version;
  if (stored.length) {
    els.lengthSlider.value = stored.length;
    els.lengthDisplay.textContent = stored.length;
  }
  if (stored.opts) {
    els.optUpper.checked = stored.opts.upper;
    els.optLower.checked = stored.opts.lower;
    els.optNum.checked = stored.opts.num;
    els.optSym.checked = stored.opts.sym;
  }
  if (stored.defaultUserId) els.userId.value = stored.defaultUserId;
});

// --- UIイベント ---
els.toggleVis.addEventListener('click', () => {
  const type = els.masterKey.type === 'password' ? 'text' : 'password';
  els.masterKey.type = type;
});

els.lengthSlider.addEventListener('input', (e) => {
  els.lengthDisplay.textContent = e.target.value;
});

els.saveUserIdBtn.addEventListener('click', () => {
  const value = els.userId.value.trim();
  Storage.set({ defaultUserId: value }, () => {
    els.userIdHint.textContent = I18N[currentLang].userIdSavedHint;
    setTimeout(() => { els.userIdHint.textContent = ''; }, 1800);
  });
});

els.copyBtn.addEventListener('click', () => {
  const pwd = els.output.value;
  if (!pwd) return;

  navigator.clipboard.writeText(pwd).then(() => {
    const dict = I18N[currentLang];
    els.copyBtn.textContent = dict.copiedBtn;
    els.copyBtn.style.color = 'var(--gold)';
    setTimeout(() => {
      els.copyBtn.textContent = dict.copyBtn;
      els.copyBtn.style.color = '';
    }, 1500);
  });
});

// --- パスワード生成メインロジック ---
els.generateBtn.addEventListener('click', async () => {
  const dict = I18N[currentLang];
  const master = els.masterKey.value;
  const domain = els.domain.value.trim();
  const userId = els.userId.value.trim();
  const version = els.version.value;
  const length = parseInt(els.lengthSlider.value, 10);

  const opts = {
    upper: els.optUpper.checked,
    lower: els.optLower.checked,
    num: els.optNum.checked,
    sym: els.optSym.checked
  };

  if (!master || !domain) {
    alert(dict.alertMasterDomain);
    return;
  }
  if (!opts.upper && !opts.lower && !opts.num && !opts.sym) {
    alert(dict.alertCharClass);
    return;
  }

  Storage.set({ domain, version, length, opts });

  els.gearIcon.classList.add('spinning');
  els.generateBtn.style.opacity = '0.7';
  els.generateBtn.disabled = true;

  await new Promise(r => setTimeout(r, 20));

  try {
    const password = await derivePassword(master, domain, userId, version, length, opts);
    els.output.value = password;
    els.copyBtn.disabled = false;
  } catch (error) {
    console.error(error);
    alert(dict.alertGenFail);
  } finally {
    els.gearIcon.classList.remove('spinning');
    els.generateBtn.style.opacity = '1';
    els.generateBtn.disabled = false;
  }
});

// 文字プールをバイトに割り当てる際、剰余バイアスを避けるための棄却サンプリング
function bytesToPassword(bytes, pool, length) {
  const poolLen = pool.length;
  const limit = Math.floor(256 / poolLen) * poolLen;
  let out = "";
  for (let i = 0; i < bytes.length && out.length < length; i++) {
    const b = bytes[i];
    if (b < limit) out += pool[b % poolLen];
  }
  return out.length === length ? out : null;
}

// PBKDF2を使用した堅牢なパスワード導出処理
// (Chrome拡張版と1バイトも変えていない。domain/userId/version/saltの組み立て方が
//  1文字でも変わると別のパスワードが出てしまうため、拡張版と揃えることが最重要)
async function derivePassword(master, domain, userId, version, length, opts) {
  let pool = "";
  if (opts.upper) pool += CHAR_SETS.upper;
  if (opts.lower) pool += CHAR_SETS.lower;
  if (opts.num)   pool += CHAR_SETS.num;
  if (opts.sym)   pool += CHAR_SETS.sym;

  const enc = new TextEncoder();
  const importKey = await crypto.subtle.importKey(
    "raw", enc.encode(master), { name: "PBKDF2" }, false, ["deriveBits"]
  );

  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    const saltString = `${domain}|${userId}|${version}|${attempt}`;
    const byteLen = Math.max(64, length * 4);
    const buffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc.encode(saltString), iterations: ITERATIONS, hash: "SHA-256" },
      importKey,
      byteLen * 8
    );

    const bytes = new Uint8Array(buffer);
    const candidate = bytesToPassword(bytes, pool, length);

    if (candidate) {
      let valid = true;
      if (opts.upper && !/[A-Z]/.test(candidate)) valid = false;
      if (opts.lower && !/[a-z]/.test(candidate)) valid = false;
      if (opts.num && !/[0-9]/.test(candidate)) valid = false;
      if (opts.sym && !SYM_REGEX.test(candidate)) valid = false;
      if (valid) return candidate;
    }

    attempt++;
  }

  throw new Error("failed to satisfy constraints after max attempts");
}
