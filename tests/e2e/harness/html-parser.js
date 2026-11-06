import { DOMNode } from './dom-env.js';

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
    // Comment
    if (match[0].startsWith('<!--')) continue;

    // Plain text
    if (match[4]) {
      const text = match[4].trim();
      if (text) {
        const textNode = new DOMNode('#text');
        textNode._textContent = match[4];
        stack[stack.length - 1].appendChild(textNode);
      }
      continue;
    }

    const isClose = !!match[1];
    const tagName = match[2].toLowerCase();
    const attrs = match[3] || '';

    if (isClose) {
      if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === tagName) {
        stack.pop();
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
