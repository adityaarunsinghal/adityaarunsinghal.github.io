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

// Constants
const MAX_TRANSLATIONS = 50;
const TRANSLATION_TIMEOUT_MS = 10000;
const TOKEN_CACHE_DURATION_MS = 58 * 60 * 1000; // 58 minutes
const QUEUE_DELAY_MS = 500;
const FAST_MODE_WORD_THRESHOLD = 15;
const RATE_LIMIT_WINDOW_SEC = 60;

export default function VisitsDenmark() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [language, setLanguage] = useState<'da-DK' | 'hi-IN'>('da-DK');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speechMode, setSpeechMode] = useState<'fast' | 'phrase'>('phrase');
  const [pendingText, setPendingText] = useState('');
  const [fastModeWordCount, setFastModeWordCount] = useState(0);
  
  const pendingTextRef = useRef('');
  const fastModeBufferRef = useRef('');
  const lastSentTextRef = useRef('');
  const translationQueueRef = useRef<Array<{ text: string; timestamp: number }>>([]);
  const isProcessingRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const tokenCacheRef = useRef<{ token: string; expiry: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const speechModeRef = useRef(speechMode);
  const languageRef = useRef(language);
  
  const { user } = useAuth();

  // Keep refs in sync
  useEffect(() => { speechModeRef.current = speechMode; }, [speechMode]);
  useEffect(() => { languageRef.current = language; }, [language]);

  // Show notification helper
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  }, []);

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
      tokenCacheRef.current = { token, expiry: now + TOKEN_CACHE_DURATION_MS };
    }
    return token;
  }, [user]);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || translationQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    const item = translationQueueRef.current.shift()!;
    
    setIsTranslating(true);
    setError('');

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), TRANSLATION_TIMEOUT_MS);

    try {
      const token = await getAuthToken();
      const response = await fetch(
        'https://us-central1-aditya-singhal-website.cloudfunctions.net/translateText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: item.text, sourceLanguage: languageRef.current.split('-')[0] }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please wait ${RATE_LIMIT_WINDOW_SEC}s before trying again.`);
        }
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      setTranslations(prev => {
        const updated = [...prev, {
          original: item.text,
          translated: data.translatedText,
          timestamp: item.timestamp
        }];
        return updated.slice(-MAX_TRANSLATIONS);
      });
      
      await new Promise(resolve => setTimeout(resolve, QUEUE_DELAY_MS));
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Translation timed out. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Translation error. Please try again.');
      }
      // Re-queue failed item to not lose text
      translationQueueRef.current.unshift(item);
    } finally {
      clearTimeout(timeoutId);
      setIsTranslating(false);
      isProcessingRef.current = false;
      
      if (translationQueueRef.current.length > 0) {
        processQueue();
      }
    }
  }, [getAuthToken]);

  const queueTranslation = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // Avoid duplicate sends
    if (trimmed === lastSentTextRef.current) return;
    lastSentTextRef.current = trimmed;
    
    if (!isOnline) {
      setError('No internet connection. Text saved, will retry when online.');
      return;
    }

    translationQueueRef.current.push({ text: trimmed, timestamp: Date.now() });
    
    // Clear pending since we've queued it
    pendingTextRef.current = '';
    setPendingText('');
    
    if (!isProcessingRef.current) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Retry queue when coming back online
  useEffect(() => {
    if (isOnline && translationQueueRef.current.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Test translation on mount
  useEffect(() => {
    const testText = language === 'da-DK' ? 'Hej' : 'नमस्ते';
    queueTranslation(testText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome on Android.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;

      if (speechModeRef.current === 'fast') {
        // Fast mode: accumulate and send based on word count, ignore isFinal
        if (result.isFinal) {
          fastModeBufferRef.current += (fastModeBufferRef.current ? ' ' : '') + text;
        }
        
        // Current text = buffer + current interim
        const currentText = fastModeBufferRef.current + (fastModeBufferRef.current ? ' ' : '') + (result.isFinal ? '' : text);
        pendingTextRef.current = currentText;
        
        // Check word count on every result
        const wordCount = currentText.trim().split(/\s+/).filter(w => w).length;
        setFastModeWordCount(wordCount);
        
        if (wordCount >= FAST_MODE_WORD_THRESHOLD) {
          console.log(`[FastMode] SEND (${wordCount} words): "${currentText.substring(0, 40)}..."`);
          queueTranslation(currentText);
          fastModeBufferRef.current = '';
          setFastModeWordCount(0);
        }
      } else {
        // Phrase mode: just track current text
        pendingTextRef.current = text;
        if (result.isFinal) {
          queueTranslation(text);
        }
      }
      
      setPendingText(pendingTextRef.current);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return;
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.lang = languageRef.current; // Use latest language
          recognition.start();
        } catch {
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;

    // If already listening, restart with new language
    if (isListeningRef.current) {
      recognition.start();
    }

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language, queueTranslation]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Send any pending text before stopping
      if (pendingTextRef.current.trim()) {
        queueTranslation(pendingTextRef.current);
      }
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
        setError('');
        lastSentTextRef.current = ''; // Reset duplicate detection on new session
      } catch {
        setError('Failed to start listening');
      }
    }
  };

  const handleLanguageChange = (newLang: 'da-DK' | 'hi-IN') => {
    // Save pending text before switch
    if (pendingTextRef.current.trim()) {
      queueTranslation(pendingTextRef.current);
    }
    
    setLanguage(newLang);
    lastSentTextRef.current = ''; // Reset duplicate detection for new language
    showNotification(`Switched to ${newLang === 'da-DK' ? 'Danish 🇩🇰' : 'Hindi 🇮🇳'}`);
  };

  const handleModeChange = (newMode: 'fast' | 'phrase') => {
    // Save pending text before switch
    if (pendingTextRef.current.trim()) {
      queueTranslation(pendingTextRef.current);
    }
    
    setSpeechMode(newMode);
    showNotification(`Switched to ${newMode === 'phrase' ? 'Full-turn' : 'Fast Speech'} mode`);
  };

  const clearHistory = () => {
    setTranslations([]);
    lastSentTextRef.current = '';
  };

  return (
    <div className="visits-denmark-container">
      {notification && <div className="notification-toast">{notification}</div>}
      
      <div className="controls">
        <select 
          value={language} 
          onChange={(e) => handleLanguageChange(e.target.value as 'da-DK' | 'hi-IN')}
          className="language-select"
        >
          <option value="da-DK">🇩🇰 Danish</option>
          <option value="hi-IN">🇮🇳 Hindi</option>
        </select>
        
        <button 
          className={`btn-primary ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? 'Stop' : 'Start'}
        </button>
        
        <button 
          className="btn-secondary"
          onClick={clearHistory}
          disabled={translations.length === 0}
        >
          Clear
        </button>
      </div>

      <div className="speech-mode-control">
        <span className="mode-label">Speech mode:</span>
        <div className="mode-toggle">
          <button 
            className={`mode-button ${speechMode === 'phrase' ? 'active' : ''}`}
            onClick={() => handleModeChange('phrase')}
          >
            Full-turn
          </button>
          <button 
            className={`mode-button ${speechMode === 'fast' ? 'active' : ''}`}
            onClick={() => handleModeChange('fast')}
          >
            Fast Speech
            {speechMode === 'fast' && isListening && fastModeWordCount > 0 && (
              <span className="fast-mode-counter">{fastModeWordCount}</span>
            )}
          </button>
        </div>
        <p className="mode-description">
          {speechMode === 'phrase' 
            ? 'Translates when speaker pauses' 
            : `Sends every ${FAST_MODE_WORD_THRESHOLD} words`}
        </p>
      </div>

      {!isOnline && <div className="error-message">⚠️ No internet connection</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Pending text preview */}
      {pendingText && isListening && (
        <div className="pending-preview">
          <span className="pending-label">Hearing:</span> {pendingText}
        </div>
      )}

      <div className="subtitle-display">
        {isTranslating && <div className="translating-indicator">Translating...</div>}
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
