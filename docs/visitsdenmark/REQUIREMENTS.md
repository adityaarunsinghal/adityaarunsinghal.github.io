# Live Subtitle Translator - Requirements

## Functional Requirements

### FR1: Speech Recognition
- System shall continuously listen to Danish audio input via device microphone
- System shall use browser's Web Speech API for speech-to-text conversion
- System shall support start/stop controls for listening
- System shall work on Android Chrome browser

### FR2: Automatic Translation
- System shall automatically translate finalized Danish speech to English
- System shall use Google Cloud Translation API via Firebase Cloud Function
- System shall display translated English text as live subtitles
- Translation shall occur when speech recognition finalizes a phrase (user pauses)

### FR3: Manual Translation Override
- System shall provide a "Force Translate" button
- Button shall immediately translate any pending/interim speech text
- Button shall be available during active listening sessions

### FR4: Authentication
- System shall require user authentication via existing Firebase Auth
- System shall restrict access to authorized users only (existing whitelist)

### FR5: Secure API Architecture
- System shall use Firebase Cloud Function as backend proxy for translation
- Google Translate API key shall be stored in Firebase Functions config (server-side only)
- API key shall never be exposed in client-side code or version control
- Cloud Function shall validate requests and enforce rate limiting

### FR6: Display
- System shall display translated subtitles in real-time
- Subtitles shall update as new translations complete
- Display shall be readable on mobile devices
- Display shall provide visual feedback for listening state

## Non-Functional Requirements

### NFR1: Performance
- Translation latency shall be < 2 seconds from speech finalization
- UI shall remain responsive during translation operations
- System shall handle continuous 2-hour sessions without degradation

### NFR2: Compatibility
- System shall work on Android Chrome browser
- System shall be accessible via existing website (adityasinghal.com)
- System shall be responsive for mobile viewport

### NFR3: Cost
- Daily usage shall remain within Google Cloud free tier when possible
- Estimated cost shall not exceed $2/month for typical usage

### NFR4: Reliability
- System shall handle API failures gracefully with error messages
- System shall continue listening if translation fails
- System shall not crash on network interruptions

### NFR5: Security
- API keys shall be stored server-side in Firebase Functions config only
- Cloud Function shall validate authenticated requests
- Authentication shall use existing Firebase security rules
- No sensitive data shall be logged or persisted
- API key shall never be accessible from browser/client code

### NFR6: Usability
- Interface shall have minimal controls (Start/Stop, Force Translate)
- Subtitle text shall be large and high-contrast for readability
- System shall provide clear feedback on listening state

### NFR7: Maintainability
- Code shall follow existing project structure and patterns
- Component shall be modular and reusable
- Configuration shall be externalized via environment variables

## Architecture

### Client-Side (React Component)
- Web Speech API for speech-to-text (Danish)
- HTTP calls to Firebase Cloud Function
- Real-time subtitle display

### Server-Side (Firebase Cloud Function)
- Endpoint: `translateText`
- Validates Firebase Auth token
- Calls Google Cloud Translation API with server-side API key
- Returns translated English text

### Security Flow
```
Browser → Firebase Auth Token → Cloud Function → Validates Token → Google Translate API
                                      ↑
                                 API Key (secure)
```

## Route
- Path: `/visitsDenmark`
- URL: `adityasinghal.com/visitsDenmark`
- Protected: Yes (requires authentication)

## Setup Requirements

### Google Cloud Console
1. Enable Cloud Translation API
2. Enable Cloud Functions API
3. Create API key for Translation API

### Firebase Configuration
```bash
firebase functions:config:set translate.api_key="YOUR_API_KEY"
```

### Local Development
Add to `.env` (gitignored):
```
VITE_FIREBASE_FUNCTION_URL=http://localhost:5001/YOUR_PROJECT/us-central1/translateText
```
