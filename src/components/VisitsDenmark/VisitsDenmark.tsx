import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './VisitsDenmark.css';

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface TranslationEntry {
  original: string;
  translated: string;
  timestamp: number;
}

const MAX_TRANSLATIONS = 50;
const TRANSLATION_TIMEOUT = 10000;
const TOKEN_CACHE_DURATION = 3500000; // 58 minutes

export default function VisitsDenmark() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'da-DK' | 'hi-IN'>('da-DK');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const pendingTextRef = useRef('');
  const recognitionRef = useRef<{ recognition: SpeechRecognition; isListeningRef: { current: boolean } } | null>(null);
  const tokenCacheRef = useRef<{ token: string; expiry: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastTranslationRef = useRef('');
  const historyEndRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<(text: string) => Promise<void>>();
  
  const { user } = useAuth();

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to latest translation
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [translations]);

  const getAuthToken = useCallback(async () => {
    const now = Date.now();
    
    if (tokenCacheRef.current && tokenCacheRef.current.expiry > now) {
      return tokenCacheRef.current.token;
    }
    
    const token = await user?.getIdToken();
    if (token) {
      tokenCacheRef.current = {
        token,
        expiry: now + TOKEN_CACHE_DURATION
      };
    }
    
    return token;
  }, [user]);

  const translate = useCallback(async (text: string) => {
    console.log('[VisitsDenmark] translate() called with text:', text);
    
    if (!text.trim() || text === lastTranslationRef.current) {
      console.log('[VisitsDenmark] Skipping translation - empty or duplicate');
      return;
    }
    if (!isOnline) {
      console.log('[VisitsDenmark] Offline - cannot translate');
      setError('No internet connection');
      return;
    }

    lastTranslationRef.current = text;
    setIsTranslating(true);
    setError('');
    console.log('[VisitsDenmark] Starting translation request...');

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, TRANSLATION_TIMEOUT);

    try {
      const token = await getAuthToken();
      console.log('[VisitsDenmark] Got auth token, making API request');

      const response = await fetch(
        'https://us-central1-aditya-singhal-website.cloudfunctions.net/translateText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text, sourceLanguage: language.split('-')[0] }),
          signal: abortControllerRef.current.signal
        }
      );

      console.log('[VisitsDenmark] API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[VisitsDenmark] API error:', response.status, errorData);
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      console.log('[VisitsDenmark] Translation successful:', data.translatedText);

      setTranslations(prev => {
        const updated = [...prev, {
          original: text,
          translated: data.translatedText,
          timestamp: Date.now()
        }];
        return updated.slice(-MAX_TRANSLATIONS);
      });
      
      pendingTextRef.current = '';
      lastTranslationRef.current = '';
      console.log('[VisitsDenmark] Translation added to history');
    } catch (err) {
      console.error('[VisitsDenmark] Translation error:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Translation timed out. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Translation error. Please try again.');
      }
      lastTranslationRef.current = '';
    } finally {
      clearTimeout(timeoutId);
      setIsTranslating(false);
    }
  }, [isOnline, getAuthToken, language]);

  // Keep translate ref updated
  useEffect(() => {
    translateRef.current = translate;
  }, [translate]);

  // Test translation on mount and language change
  useEffect(() => {
    const testText = language === 'da-DK' ? 'Hej' : 'नमस्ते';
    translate(testText);
  }, [language, translate]);

  // Speech recognition setup
  useEffect(() => {
    console.log('[VisitsDenmark] Setting up speech recognition, language:', language);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('[VisitsDenmark] Speech recognition not supported');
      setError('Speech recognition not supported. Please use Chrome on Android.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    const isListeningRef = { current: false };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      console.log('[VisitsDenmark] Speech result:', text, 'isFinal:', result.isFinal);

      if (result.isFinal) {
        console.log('[VisitsDenmark] Final result, triggering translation');
        translateRef.current?.(text);
      } else {
        console.log('[VisitsDenmark] Interim result, storing as pending');
        pendingTextRef.current = text;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VisitsDenmark] Speech recognition error:', event.error);
      if (event.error === 'no-speech') return;
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log('[VisitsDenmark] Speech recognition ended, isListening:', isListeningRef.current);
      if (isListeningRef.current) {
        try {
          console.log('[VisitsDenmark] Restarting speech recognition');
          recognition.start();
        } catch (err) {
          console.error('[VisitsDenmark] Failed to restart recognition:', err);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    recognitionRef.current = { recognition, isListeningRef };
    console.log('[VisitsDenmark] Speech recognition setup complete');

    return () => {
      console.log('[VisitsDenmark] Cleaning up speech recognition');
      isListeningRef.current = false;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language]);

  const toggleListening = () => {
    console.log('[VisitsDenmark] toggleListening() called, current state:', isListening);
    if (!recognitionRef.current) {
      console.error('[VisitsDenmark] No recognition object available');
      return;
    }

    const { recognition, isListeningRef } = recognitionRef.current;

    if (isListening) {
      console.log('[VisitsDenmark] Stopping listening');
      isListeningRef.current = false;
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        console.log('[VisitsDenmark] Starting listening');
        recognition.start();
        isListeningRef.current = true;
        setIsListening(true);
        setError('');
        pendingTextRef.current = '';
      } catch (err) {
        console.error('[VisitsDenmark] Failed to start listening:', err);
        setError('Failed to start listening');
      }
    }
  };

  const forceTranslate = () => {
    console.log('[VisitsDenmark] forceTranslate() called, pending text:', pendingTextRef.current);
    if (pendingTextRef.current) {
      translate(pendingTextRef.current);
    }
  };

  const clearHistory = () => {
    console.log('[VisitsDenmark] Clearing translation history');
    setTranslations([]);
    lastTranslationRef.current = '';
  };

  return (
    <div className="visits-denmark-container">
      <div className="controls">
        <select 
          value={language} 
          onChange={(e) => {
            if (isListening) {
              if (recognitionRef.current) {
                recognitionRef.current.isListeningRef.current = false;
                recognitionRef.current.recognition.stop();
              }
              setIsListening(false);
            }
            setLanguage(e.target.value as 'da-DK' | 'hi-IN');
          }}
          disabled={isListening}
          className="language-select"
        >
          <option value="da-DK">🇩🇰 Danish</option>
          <option value="hi-IN">🇮🇳 Hindi</option>
        </select>
        
        <button 
          className={`btn-primary ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '⏸ Stop' : '🎤 Start'}
        </button>
        
        <button 
          className="btn-secondary"
          onClick={forceTranslate}
          disabled={!pendingTextRef.current}
        >
          ⚡ Force
        </button>
        
        <button 
          className="btn-secondary"
          onClick={clearHistory}
          disabled={translations.length === 0}
        >
          🗑️ Clear
        </button>
      </div>

      {!isOnline && <div className="error-message">⚠️ No internet connection</div>}
      {error && <div className="error-message">{error}</div>}
      {isTranslating && <div className="info-message">Translating...</div>}

      <div className="subtitle-display">
        {translations.length === 0 ? (
          isListening ? 'Listening...' : 'Press Start to begin'
        ) : (
          <div className="translation-history">
            {translations.map((entry) => (
              <div key={entry.timestamp} className="translation-entry">
                <div className="translated-text">{entry.translated}</div>
                <div className="original-text">Original: {entry.original}</div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        )}
      </div>

      <div className="info">
        <p>{language === 'da-DK' ? '🇩🇰' : '🇮🇳'} Speak in {language === 'da-DK' ? 'Danish' : 'Hindi'} → 🇬🇧 See English subtitles</p>
        <p className="note">Works best on Android Chrome with HTTPS</p>
      </div>
    </div>
  );
}
