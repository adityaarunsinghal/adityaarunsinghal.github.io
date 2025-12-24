# VisitsDenmark - Live Subtitle Translator

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Install Function Dependencies
```bash
cd functions
npm install
cd ..
```

### 3. Configure Google Translate API Key
```bash
firebase functions:config:set translate.api_key="YOUR_API_KEY_HERE"
```

### 4. Update Firebase Project ID
Edit `src/components/VisitsDenmark/VisitsDenmark.tsx` line 30:
```typescript
'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/translateText'
```
Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.

### 5. Deploy Cloud Function
```bash
cd functions
npm run build
firebase deploy --only functions
```

### 6. Test Locally (Optional)
```bash
cd functions
npm run serve
```
Then update the URL in VisitsDenmark.tsx to use local emulator:
```typescript
'http://localhost:5001/YOUR_PROJECT_ID/us-central1/translateText'
```

## Usage

1. Navigate to `adityasinghal.com/visitsDenmark`
2. Log in with authorized account
3. Click "Start Listening"
4. Speak in Danish
5. See English subtitles appear in real-time
6. Use "Force Translate" for immediate translation of pending text

## Architecture

```
Browser (Web Speech API - Danish)
    ↓
Firebase Cloud Function (translateText)
    ↓ (validates auth token)
Google Cloud Translation API
    ↓
Browser (English subtitles)
```

## Security

- API key stored server-side only in Firebase Functions config
- Cloud Function validates Firebase Auth token
- Only whitelisted emails can access
- No API key exposure in client code

## Troubleshooting

**"Speech recognition not supported"**
- Use Chrome on Android
- Ensure HTTPS connection

**"Translation failed"**
- Check Firebase Functions logs: `firebase functions:log`
- Verify API key is set: `firebase functions:config:get`
- Ensure Google Cloud Translation API is enabled

**"Unauthorized"**
- Verify you're logged in with whitelisted email
- Check Firebase Auth token is valid
