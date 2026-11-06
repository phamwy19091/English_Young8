import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanSpeechText, speakEnglish, speakWord, isSpeechSupported } from '../../services/speechService';

describe('Speech Service Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('cleanSpeechText', () => {
    it('should strip phonetic transcriptions starting with slashes', () => {
      expect(cleanSpeechText('leisure /ˈleʒə(r)/')).toBe('leisure');
      expect(cleanSpeechText('knit /nɪt/')).toBe('knit');
      expect(cleanSpeechText('origami /ˌɒrɪˈɡɑːmi/')).toBe('origami');
    });

    it('should remove parenthesized annotations', () => {
      expect(cleanSpeechText('detest (v)')).toBe('detest');
      expect(cleanSpeechText('hang out with friends (v.phr)')).toBe('hang out with friends');
    });

    it('should handle complex compound phrases', () => {
      expect(cleanSpeechText('do DIY /duː ˌdiː aɪ ˈwaɪ/ (v.phr)')).toBe('do DIY');
    });

    it('should return empty string for null, undefined or empty input', () => {
      expect(cleanSpeechText('')).toBe('');
      expect(cleanSpeechText(null as unknown as string)).toBe('');
      expect(cleanSpeechText(undefined as unknown as string)).toBe('');
    });

    it('should extract phonetic symbol when input is an isolated phonetic sound', () => {
      expect(cleanSpeechText('/ʊ/ (u ngắn)')).toBe('ʊ');
      expect(cleanSpeechText('/uː/ (u dài)')).toBe('uː');
      expect(cleanSpeechText('/i:/')).toBe('i:');
      expect(cleanSpeechText('/k/')).toBe('k');
    });

    it('should clean nested parentheses cleanly without leaving orphaned brackets', () => {
      expect(cleanSpeechText('((nested))')).toBe('');
      expect(cleanSpeechText('word ((nested note))')).toBe('word');
      expect(cleanSpeechText('(v.phr) /aɪ piː eɪ/')).toBe('aɪ piː eɪ');
    });
  });

  describe('speakEnglish and speakWord', () => {
    it('should alias speakWord to speakEnglish', () => {
      expect(speakWord).toBe(speakEnglish);
    });

    it('should safely return when speech synthesis is not supported', () => {
      // In node environment without window.speechSynthesis
      expect(isSpeechSupported()).toBe(false);
      expect(() => speakEnglish('hello')).not.toThrow();
    });
  });
});
