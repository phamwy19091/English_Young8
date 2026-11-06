/**
 * Headless DOM and Browser API Simulation for Opaque-Box E2E Testing
 * Zero-dependency pure Node.js implementation of essential DOM and Web APIs.
 */

function parseAttributes(attrStr, node) {
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(attrStr)) !== null) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    node.setAttribute(name, value);
  }
}

export function parseHTMLToFragment(html) {
  const root = new DOMNode('div');
  const stack = [root];
  const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
  const voidTags = new Set(['input', 'img', 'br', 'hr', 'meta', 'link']);
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match[0].startsWith('<!--')) continue;

    if (match[4]) {
      const text = match[4];
      if (text) {
        const textNode = new DOMNode('#text');
        textNode._textContent = text;
        stack[stack.length - 1].appendChild(textNode);
      }
      continue;
    }

    const isClose = !!match[1];
    const tagName = match[2].toLowerCase();
    const attrs = match[3] || '';

    if (isClose) {
      if (stack.length > 1) {
        let popIdx = -1;
        for (let i = stack.length - 1; i >= 1; i--) {
          if (stack[i].tagName.toLowerCase() === tagName) {
            popIdx = i;
            break;
          }
        }
        if (popIdx !== -1) {
          stack.splice(popIdx);
        }
      }
    } else {
      const child = new DOMNode(tagName);
      parseAttributes(attrs, child);
      stack[stack.length - 1].appendChild(child);

      const isSelfClosing = attrs.trim().endsWith('/') || voidTags.has(tagName);
      if (!isSelfClosing) {
        stack.push(child);
      }
    }
  }

  return root.children;
}

export class DOMStorage {
  constructor() {
    this._store = new Map();
  }

  getItem(key) {
    const val = this._store.get(String(key));
    return val !== undefined ? String(val) : null;
  }

  setItem(key, value) {
    this._store.set(String(key), String(value));
  }

  removeItem(key) {
    this._store.delete(String(key));
  }

  clear() {
    this._store.clear();
  }

  key(index) {
    const keys = Array.from(this._store.keys());
    return keys[index] || null;
  }

  get length() {
    return this._store.size;
  }
}

export class MockSpeechSynthesisUtterance {
  constructor(text = '') {
    this.text = String(text);
    this.lang = 'en-US';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

export class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.pending = false;
    this.paused = false;
    this.utterances = [];
    this.history = [];
    this._voices = [
      { name: 'Google US English', lang: 'en-US', default: true },
      { name: 'Microsoft David', lang: 'en-US', default: false }
    ];
  }

  getVoices() {
    return [...this._voices];
  }

  speak(utterance) {
    this.utterances.push(utterance);
    this.history.push({
      text: utterance.text,
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch,
      timestamp: Date.now()
    });
    this.speaking = true;

    if (typeof utterance.onstart === 'function') utterance.onstart({ type: 'start' });
    this.speaking = false;
    if (typeof utterance.onend === 'function') utterance.onend({ type: 'end' });
  }

  cancel() {
    this.speaking = false;
    this.pending = false;
    this.utterances = [];
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  getSpokenTexts() {
    return this.history.map(h => h.text);
  }

  clearHistory() {
    this.history = [];
    this.utterances = [];
  }
}

export class DOMTokenList {
  constructor(element) {
    this.element = element;
    this._classes = new Set();
  }

  add(...tokens) {
    tokens.forEach(token => {
      if (token) this._classes.add(token);
    });
    this._sync();
  }

  remove(...tokens) {
    tokens.forEach(token => this._classes.delete(token));
    this._sync();
  }

  contains(token) {
    return this._classes.has(token);
  }

  toggle(token, force) {
    if (force !== undefined) {
      if (force) this.add(token);
      else this.remove(token);
      return force;
    }
    const has = this.contains(token);
    if (has) this.remove(token);
    else this.add(token);
    return !has;
  }

  _sync() {
    this.element._className = Array.from(this._classes).join(' ');
  }

  _updateFromClassName(name) {
    this._classes.clear();
    (name || '').split(/\s+/).forEach(c => {
      if (c) this._classes.add(c);
    });
  }
}

export class DOMNode {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.id = '';
    this._className = '';
    this.classList = new DOMTokenList(this);
    this.attributes = new Map();
    this.style = {};
    this.dataset = {};
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this._textContent = '';
    this.value = '';
    this.disabled = false;
    this.checked = false;
  }

  get className() {
    return this._className;
  }

  set className(val) {
    this._className = String(val || '');
    this.classList._updateFromClassName(this._className);
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join('');
  }

  set textContent(val) {
    this.children = [];
    this._textContent = String(val || '');
  }

  get innerHTML() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => `<${c.tagName.toLowerCase()}>${c.innerHTML}</${c.tagName.toLowerCase()}>`).join('');
  }

  set innerHTML(html) {
    this.children = [];
    const fragment = parseHTMLToFragment(String(html || ''));
    for (const child of fragment) {
      this.appendChild(child);
    }
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(value);
    }
  }

  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    return this.attributes.get(name) || null;
  }

  hasAttribute(name) {
    return this.attributes.has(name) || (name === 'id' && !!this.id) || (name === 'class' && !!this.className);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
      return child;
    }
    return null;
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.listeners.has(type)) return;
    const list = this.listeners.get(type).filter(fn => fn !== callback);
    this.listeners.set(type, list);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    const handlers = this.listeners.get(event.type) || [];
    for (const handler of handlers) {
      handler.call(this, event);
      if (event._propagationStopped) break;
    }

    if (!event._propagationStopped && this.parentNode && event.bubbles) {
      this.parentNode.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }

  click() {
    const evt = new MockEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(evt);
  }

  focus() {
    const evt = new MockEvent('focus', { bubbles: false });
    this.dispatchEvent(evt);
  }

  blur() {
    const evt = new MockEvent('blur', { bubbles: false });
    this.dispatchEvent(evt);
  }

  matches(selector) {
    const s = selector.trim();
    if (!s) return false;

    // Attribute match e.g. [data-id="foo"] or [type="submit"]
    if (s.startsWith('[') && s.endsWith(']')) {
      const match = s.slice(1, -1).match(/^([a-zA-Z0-9_-]+)(?:([~^$*|]?=)(?:"([^"]*)"|'([^']*)'|([^\]]+)))?$/);
      if (match) {
        const attr = match[1];
        const op = match[2];
        const expected = match[3] ?? match[4] ?? match[5];
        if (!op) return this.hasAttribute(attr);
        const actual = this.getAttribute(attr);
        if (actual === null) return false;
        if (op === '=') return actual === expected;
        if (op === '^=') return actual.startsWith(expected);
        if (op === '$=') return actual.endsWith(expected);
        if (op === '*=') return actual.includes(expected);
      }
    }

    // ID selector e.g. #app-root
    if (s.startsWith('#')) {
      return this.id === s.slice(1);
    }

    // Class / Multi-class / Tag with classes (e.g. .btn, .nav-link.active, a.nav-link.active)
    if (s.includes('.')) {
      const parts = s.split('.').filter(Boolean);
      const hasTag = !s.startsWith('.');
      const tag = hasTag ? parts[0] : null;
      const classes = hasTag ? parts.slice(1) : parts;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      return classes.every(cls => this.classList.contains(cls));
    }

    // Tag selector e.g. button
    return this.tagName.toLowerCase() === s.toLowerCase();
  }

  querySelector(selector) {
    const parts = selector.trim().split(/\s+/);
    if (parts.length > 1) {
      const [first, ...rest] = parts;
      const candidates = this.querySelectorAll(first);
      for (const cand of candidates) {
        const found = cand.querySelector(rest.join(' '));
        if (found) return found;
      }
      return null;
    }

    for (const child of this.children) {
      if (child.matches(selector)) return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) results.push(child);
        search(child);
      }
    };
    search(this);
    return results;
  }
}

export class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = !!options.bubbles;
    this.cancelable = !!options.cancelable;
    this.defaultPrevented = false;
    this._propagationStopped = false;
    this.target = null;
    this.currentTarget = null;
  }

  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }

  stopPropagation() {
    this._propagationStopped = true;
  }
}

export class MockCustomEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail !== undefined ? options.detail : null;
  }
}

export class MockKeyboardEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, { bubbles: true, cancelable: true, ...options });
    this.key = options.key || '';
    this.code = options.code || '';
    this.shiftKey = !!options.shiftKey;
    this.ctrlKey = !!options.ctrlKey;
    this.altKey = !!options.altKey;
    this.metaKey = !!options.metaKey;
  }
}

export class MockDocument extends DOMNode {
  constructor() {
    super('#document');
    this.head = new DOMNode('head');
    this.body = new DOMNode('body');
    this.documentElement = new DOMNode('html');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
    this.title = 'English Young 8';
  }

  createElement(tagName) {
    return new DOMNode(tagName);
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }
}

export class MockLocation {
  constructor(window) {
    this.window = window;
    this._hash = '#/';
    this.pathname = '/';
    this.search = '';
  }

  get hash() {
    return this._hash;
  }

  set hash(newHash) {
    const oldHash = this._hash;
    this._hash = newHash.startsWith('#') ? newHash : `#${newHash}`;
    if (oldHash !== this._hash && this.window) {
      const evt = new MockEvent('hashchange', { bubbles: false });
      this.window.dispatchEvent(evt);
    }
  }

  get href() {
    return `http://localhost:3000/${this._hash}`;
  }

  set href(val) {
    if (val && val.includes('#')) {
      this.hash = '#' + val.split('#')[1];
    } else {
      this.hash = '#/';
    }
  }
}

export class MockHistory {
  constructor(window, location) {
    this.window = window;
    this.location = location;
    this.stack = [this.location.href];
    this.index = 0;
  }

  pushState(state, title, url) {
    if (url) {
      if (url.includes('#')) {
        this.location.hash = '#' + url.split('#')[1];
      }
    }
    this.index++;
    this.stack = this.stack.slice(0, this.index);
    this.stack.push(this.location.href);
  }

  replaceState(state, title, url) {
    if (url && url.includes('#')) {
      this.location.hash = '#' + url.split('#')[1];
    }
    this.stack[this.index] = this.location.href;
  }

  back() {
    if (this.index > 0) {
      this.index--;
      this.location.href = this.stack[this.index];
      const evt = new MockEvent('popstate', { bubbles: false });
      this.window.dispatchEvent(evt);
    }
  }

  forward() {
    if (this.index < this.stack.length - 1) {
      this.index++;
      this.location.href = this.stack[this.index];
      const evt = new MockEvent('popstate', { bubbles: false });
      this.window.dispatchEvent(evt);
    }
  }
}

export class HeadlessBrowser {
  constructor() {
    this.listeners = new Map();
    this.document = new MockDocument();
    this.localStorage = new DOMStorage();
    this.sessionStorage = new DOMStorage();
    this.speechSynthesis = new MockSpeechSynthesis();
    this.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    this.location = new MockLocation(this);
    this.history = new MockHistory(this, this.location);
    this.toasts = [];
    this.confirmDialogHandler = null;

    // Inject global links
    this.window = this;
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.listeners.has(type)) return;
    this.listeners.set(type, this.listeners.get(type).filter(fn => fn !== callback));
  }

  dispatchEvent(event) {
    event.currentTarget = this;
    const handlers = this.listeners.get(event.type) || [];
    for (const h of handlers) {
      h.call(this, event);
    }
    return !event.defaultPrevented;
  }

  showToast(message, type = 'info') {
    this.toasts.push({ message, type, time: Date.now() });
  }

  confirm(message) {
    if (typeof this.confirmDialogHandler === 'function') {
      return this.confirmDialogHandler(message);
    }
    return true; // Default auto-confirm in headless mode
  }
}
