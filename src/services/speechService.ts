// Web Speech API abstraction for English Young 8
// Language: en-US, Rate: 0.9, Regex text cleaner

export interface SpeechOptions {
  rate?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Cleans pronunciation text by stripping parenthesized annotations and phonetic slashes for vocabulary words,
 * or extracting the phonetic symbol when text represents an isolated phonetic sound (e.g. "/ʊ/ (u ngắn)").
 * Example 1: "book /bʊk/ (n)" -> "book"
 * Example 2: "/ʊ/ (u ngắn)" -> "ʊ"
 * Example 3: "((nested))" -> ""
 */
export function cleanSpeechText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let s = text.trim();
  if (!s) return '';

  // Clean paired parentheses iteratively to handle nested annotations cleanly without leaving orphaned ")"
  while (/\([^()]*\)/.test(s)) {
    s = s.replace(/\([^()]*\)/g, '').trim();
  }

  // If text was only parenthesized annotations, it is now empty
  if (!s) return '';

  // If the remaining text starts with a slash, it represents an isolated phonetic sound
  if (s.startsWith('/')) {
    const phonetic = s.replace(/^\/+|\/+$/g, '').trim();
    return phonetic;
  }

  // Otherwise, extract the base word before any phonetic transcription
  return s.split('/')[0].trim();
}

/**
 * Checks whether the Web Speech API is supported in the current runtime environment.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speaks English text using SpeechSynthesisUtterance.
 * Defaults: lang = 'en-US', rate = 0.9
 */
export function speakEnglish(text: string, options?: SpeechOptions): void {
  if (!text) return;
  const clean = cleanSpeechText(text);
  if (!clean) return;

  if (!isSpeechSupported()) {
    console.warn('Speech synthesis is not supported in this browser environment.');
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate ?? 0.9;

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }
    if (options?.onError) {
      utterance.onerror = (e) => options.onError?.(e);
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    options?.onError?.(err);
  }
}

/**
 * Alias for speakEnglish, resolving legacy bug in app.js line 6327 where speakWord was expected.
 */
export const speakWord = speakEnglish;

/**
 * Cancels any ongoing speech utterance.
 */
export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Failed to cancel speech synthesis:', e);
    }
  }
}

// Attach to window for legacy compatibility if in browser
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).speakEnglish = speakEnglish;
  (window as unknown as Record<string, unknown>).speakWord = speakWord;
}
