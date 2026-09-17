/**
 * Password Forge - Popup Script
 * Compatible with Chrome Extensions & Standalone PWA (GitHub Pages)
 */

// --- 1. ストレージ互換レイヤー (Extension / Web 自動判定) ---
const storage = {
  get: async (keys) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return await chrome.storage.local.get(keys);
    }
    const res = {};
    const keyList = Array.isArray(keys)
      ? keys
      : (typeof keys === 'object' && keys !== null ? Object.keys(keys) : [keys]);

    for (const k of keyList) {
      const val = localStorage.getItem(`forge_${k}`);
      if (val !== null) {
        try {
          res[k] = JSON.parse(val);
        } catch {
          res[k] = val;
        }
      } else if (typeof keys === 'object' && !Array.isArray(keys) && keys[k] !== undefined) {
        res[k] = keys[k];
      }
    }
    return res;
  },
  set: async (items) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return await chrome.storage.local.set(items);
    }
    for (const [k, v] of Object.entries(items)) {
      localStorage.setItem(`forge_${k}`, JSON.stringify(v));
    }
  }
};

// --- 2. i18n 互換レイヤー ---
function applyI18n() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.textContent = msg;
    }
  });

  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.placeholder = msg;
    }
  });
}

// --- 3. コアロジック (パスワード生成) ---
const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

async function generateDerivedPassword(masterKey, serviceName, length, options) {
  let allowedChars = '';
  if (options.uppercase) allowedChars += CHARSETS.uppercase;
  if (options.lowercase) allowedChars += CHARSETS.lowercase;
  if (options.numbers) allowedChars += CHARSETS.numbers;
  if (options.symbols) allowedChars += CHARSETS.symbols;

  if (!allowedChars) {
    allowedChars = CHARSETS.lowercase + CHARSETS.numbers;
  }

  // マスターキーが入力されている場合は決定論的生成 (PBKDF2/SHA-256)
  if (masterKey && masterKey.trim() !== '') {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(masterKey),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const salt = enc.encode(serviceName || 'forge-default-salt');
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      length * 16
    );

    const view = new Uint16Array(derivedBits);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += allowedChars[view[i] % allowedChars.length];
    }
    return result;
  }

  // マスターキーが空の場合は完全乱数生成 (CSPRNG)
  const randomArray = new Uint32Array(length);
  crypto.getRandomValues(randomArray);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += allowedChars[randomArray[i] % allowedChars.length];
  }
  return result;
}

// --- 4. イベントハンドラ & 初期化 ---
document.addEventListener('DOMContentLoaded', async () => {
  applyI18n();

  // DOM要素の取得
  const masterKeyInput = document.getElementById('masterKey');
  const serviceInput = document.getElementById('serviceName') || document.getElementById('service');
  const lengthInput = document.getElementById('length') || document.getElementById('passwordLength');
  const lengthValDisplay = document.getElementById('lengthVal') || document.getElementById('lengthValue');
  const optUpper = document.getElementById('uppercase') || document.getElementById('optUpper');
  const optLower = document.getElementById('lowercase') || document.getElementById('optLower');
  const optNum = document.getElementById('numbers') || document.getElementById('optNum');
  const optSym = document.getElementById('symbols') || document.getElementById('optSym');

  const generateBtn = document.getElementById('generate') || document.getElementById('generateBtn');
  const resultInput = document.getElementById('result') || document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copy') || document.getElementById('copyBtn');
  const statusMsg = document.getElementById('status') || document.getElementById('statusMsg');

  // 設定値の復元 (127行目エラー対策)
  const savedSettings = await storage.get({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });

  if (lengthInput) {
    lengthInput.value = savedSettings.length;
    if (lengthValDisplay) lengthValDisplay.textContent = savedSettings.length;
  }
  if (optUpper) optUpper.checked = savedSettings.uppercase;
  if (optLower) optLower.checked = savedSettings.lowercase;
  if (optNum) optNum.checked = savedSettings.numbers;
  if (optSym) optSym.checked = savedSettings.symbols;

  // 長さスライダーの数値同期
  if (lengthInput && lengthValDisplay) {
    lengthInput.addEventListener('input', () => {
      lengthValDisplay.textContent = lengthInput.value;
    });
  }

  // 生成ボタンクリック処理 (221行目エラー対策)
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const length = lengthInput ? parseInt(lengthInput.value, 10) : 16;
      const options = {
        uppercase: optUpper ? optUpper.checked : true,
        lowercase: optLower ? optLower.checked : true,
        numbers: optNum ? optNum.checked : true,
        symbols: optSym ? optSym.checked : true
      };

      const masterKey = masterKeyInput ? masterKeyInput.value : '';
      const serviceName = serviceInput ? serviceInput.value : '';

      // 設定を永続化
      await storage.set({
        length: length,
        ...options
      });

      // パスワード生成実行
      try {
        const password = await generateDerivedPassword(masterKey, serviceName, length, options);
        if (resultInput) {
          resultInput.value = password;
          resultInput.dispatchEvent(new Event('input'));
        }
      } catch (err) {
        console.error('Password generation failed:', err);
      }
    });
  }

  // クリップボードコピー処理
  if (copyBtn && resultInput) {
    copyBtn.addEventListener('click', async () => {
      if (!resultInput.value) return;

      try {
        await navigator.clipboard.writeText(resultInput.value);
        if (statusMsg) {
          statusMsg.textContent = 'Copied!';
          setTimeout(() => {
            statusMsg.textContent = '';
          }, 2000);
        }
      } catch (err) {
        // フォールバック
        resultInput.select();
        document.execCommand('copy');
        if (statusMsg) {
          statusMsg.textContent = 'Copied!';
          setTimeout(() => {
            statusMsg.textContent = '';
          }, 2000);
        }
      }
    });
  }
});
