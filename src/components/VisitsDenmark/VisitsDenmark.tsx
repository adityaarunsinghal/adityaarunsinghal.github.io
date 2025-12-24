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

export default function VisitsDenmark() {
  const [subtitle, setSubtitle] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'da-DK' | 'hi-IN'>('da-DK');
  const [originalText, setOriginalText] = useState('');
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

      setSubtitle(data.translatedText);
      pendingTextRef.current = '';
      setError('');
    } catch (err) {
      const errorMsg = 'Translation error. Please try again.';
      console.error('[VisitsDenmark] Translation error', err);
      setError(errorMsg);
    }
  }, [user]);

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
      const danish = result[0].transcript;

      console.log('[VisitsDenmark] Speech result', { 
        isFinal: result.isFinal, 
        textLength: danish.length 
      });

      setOriginalText(danish);

      if (result.isFinal) {
        translate(danish);
      } else {
        pendingTextRef.current = danish;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VisitsDenmark] Speech recognition error', { error: event.error });
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[VisitsDenmark] Speech recognition ended', { isListening });
      if (isListening) {
        console.log('[VisitsDenmark] Restarting speech recognition');
        recognition.start();
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
        {subtitle || (isListening ? 'Listening...' : 'Press Start to begin')}
      </div>

      {originalText && (
        <div className="original-text">
          Original: {originalText}
        </div>
      )}

      <div className="info">
        <p>{language === 'da-DK' ? '🇩🇰' : '🇮🇳'} Speak in {language === 'da-DK' ? 'Danish' : 'Hindi'} → 🇬🇧 See English subtitles</p>
        <p className="note">Works best on Android Chrome with HTTPS</p>
      </div>
    </div>
  );
}
