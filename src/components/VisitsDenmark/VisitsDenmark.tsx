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

export default function VisitsDenmark() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'da-DK' | 'hi-IN'>('da-DK');
  const pendingTextRef = useRef('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { user } = useAuth();

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) return;

    console.log('[VisitsDenmark] Starting translation', { textLength: text.length });

    try {
      const token = await user?.getIdToken();
      console.log('[VisitsDenmark] Got auth token');

      const response = await fetch(
        'https://us-central1-aditya-singhal-website.cloudfunctions.net/translateText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        }
      );

      console.log('[VisitsDenmark] Translation response', { 
        status: response.status, 
        ok: response.ok 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[VisitsDenmark] Translation failed', { 
          status: response.status, 
          error: errorData 
        });
        throw new Error('Translation failed');
      }

      const data = await response.json();
      console.log('[VisitsDenmark] Translation successful', { 
        resultLength: data.translatedText.length 
      });

      setTranslations(prev => [...prev, {
        original: text,
        translated: data.translatedText,
        timestamp: Date.now()
      }]);
      pendingTextRef.current = '';
      setError('');
    } catch (err) {
      const errorMsg = 'Translation error. Please try again.';
      console.error('[VisitsDenmark] Translation error', err);
      setError(errorMsg);
    }
  }, [user]);

  // Test translation on mount
  useEffect(() => {
    const testTranslation = async () => {
      const testText = language === 'da-DK' ? 'Hej, test' : 'नमस्ते, परीक्षण';
      console.log('[VisitsDenmark] Testing translation on load...', { language, testText });
      await translate(testText);
    };
    
    testTranslation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('[VisitsDenmark] Speech recognition not supported');
      setError('Speech recognition not supported. Please use Chrome on Android.');
      return;
    }

    console.log('[VisitsDenmark] Initializing speech recognition');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;

      console.log('[VisitsDenmark] Speech result', { 
        isFinal: result.isFinal, 
        textLength: text.length 
      });

      if (result.isFinal) {
        translate(text);
      } else {
        pendingTextRef.current = text;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VisitsDenmark] Speech recognition error', { error: event.error });
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        console.log('[VisitsDenmark] Auto-restarting speech recognition');
        recognition.start();
      } else {
        console.log('[VisitsDenmark] Speech recognition stopped');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        console.log('[VisitsDenmark] Cleaning up speech recognition');
        recognitionRef.current.stop();
      }
    };
  }, [isListening, translate, language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      console.log('[VisitsDenmark] Stopping listening');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      console.log('[VisitsDenmark] Starting listening');
      recognitionRef.current.start();
      setIsListening(true);
      setError('');
    }
  };

  const forceTranslate = () => {
    console.log('[VisitsDenmark] Force translate', { 
      hasPendingText: !!pendingTextRef.current 
    });
    if (pendingTextRef.current) {
      translate(pendingTextRef.current);
    }
  };

  return (
    <div className="visits-denmark-container">
      <div className="controls">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as 'da-DK' | 'hi-IN')}
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
          {isListening ? '⏸ Stop Listening' : '🎤 Start Listening'}
        </button>
        <button 
          className="btn-secondary"
          onClick={forceTranslate}
          disabled={!isListening}
        >
          ⚡ Force Translate
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

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
