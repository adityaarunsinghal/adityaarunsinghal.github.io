# VisitsDenmark - Setup TODO List

## ✅ Completed
- [x] Code written and committed to repository
- [x] GitHub Actions workflow updated

## 🔧 Google Cloud Console Setup

### 1. Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing Firebase project OR create a new one
3. Note your Project ID (you'll need this later)

### 2. Enable APIs
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Cloud Translation API**
   - **Cloud Functions API** (if not already enabled)

### 3. Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key (keep it safe!)
4. **Optional but recommended**: Click "Restrict Key"
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Translation API"
   - Save

## 🔥 Firebase Setup

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not already done)
```bash
firebase init
```
- Select "Functions"
- Choose your existing project
- Select TypeScript
- Use ESLint: No (or Yes, your choice)
- Install dependencies: Yes

### 4. Set API Key in Firebase Config
```bash
firebase functions:config:set translate.api_key="YOUR_API_KEY_FROM_STEP_3"
```

### 5. Verify Config (optional)
```bash
firebase functions:config:get
```
Should show:
```json
{
  "translate": {
    "api_key": "YOUR_API_KEY"
  }
}
```

## 📝 Code Updates

### 1. Update Firebase Project ID
Edit `src/components/VisitsDenmark/VisitsDenmark.tsx` at line 30:

**Find:**
```typescript
'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/translateText'
```

**Replace with:**
```typescript
'https://us-central1-YOUR_ACTUAL_PROJECT_ID.cloudfunctions.net/translateText'
```

Example: If your project ID is `my-website-12345`, it becomes:
```typescript
'https://us-central1-my-website-12345.cloudfunctions.net/translateText'
```

### 2. Commit the Change
```bash
git add src/components/VisitsDenmark/VisitsDenmark.tsx
git commit -m "Update Firebase project ID for VisitsDenmark"
git push
```

## 🚀 Deployment

### Option A: Deploy Functions Manually (First Time)
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
cd ..
```

### Option B: Use GitHub Actions
1. Generate Firebase CI token:
   ```bash
   firebase login:ci
   ```
   Copy the token that's printed

2. Add to GitHub Secrets:
   - Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/settings/secrets/actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Value: [paste token from step 1]
   - Click "Add secret"

3. Trigger deployment:
   - Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
   - Click "Deploy to GitHub Pages"
   - Click "Run workflow"
   - Click green "Run workflow" button

## ✅ Testing

### 1. Check Function Deployed
```bash
firebase functions:list
```
Should show `translateText` function

### 2. Test the App
1. Go to https://adityasinghal.com/visitsDenmark
2. Log in with your authorized email
3. Click "Start Listening"
4. Speak in Danish
5. See English subtitles appear

### 3. Check Logs (if issues)
**Browser console:**
- Open DevTools (F12)
- Look for `[VisitsDenmark]` logs

**Firebase logs:**
```bash
firebase functions:log
```

## 🐛 Troubleshooting

### "Speech recognition not supported"
- Use Chrome on Android
- Ensure you're on HTTPS (adityasinghal.com, not localhost)

### "Translation failed"
- Check Firebase logs: `firebase functions:log`
- Verify API key is set: `firebase functions:config:get`
- Ensure Translation API is enabled in Google Cloud Console

### "Unauthorized" or "Forbidden"
- Verify you're logged in with whitelisted email
- Check browser console for auth errors

### Function not deploying
- Check GitHub Actions logs
- Verify `FIREBASE_TOKEN` secret is set correctly
- Try manual deployment: `firebase deploy --only functions`

## 📊 Cost Monitoring

### Set up Budget Alerts (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "Billing" → "Budgets & alerts"
3. Create budget:
   - Amount: $5/month (or your preference)
   - Alert at: 50%, 90%, 100%
   - Add your email for notifications

### Monitor Usage
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- Check "APIs & Services" → "Dashboard" for API usage

## 📋 Summary Checklist

- [ ] Google Cloud project selected/created
- [ ] Cloud Translation API enabled
- [ ] Cloud Functions API enabled
- [ ] API key created
- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] API key set in Firebase config
- [ ] Project ID updated in code
- [ ] Code committed and pushed
- [ ] Firebase CI token generated
- [ ] `FIREBASE_TOKEN` added to GitHub Secrets
- [ ] Functions deployed (manual or via GitHub Actions)
- [ ] App tested at adityasinghal.com/visitsDenmark
- [ ] Budget alerts configured (optional but recommended)

## 🎉 You're Done!

Once all checkboxes are complete, the feature is live and ready to use!

---

# 🔒 Security & Configuration TODOs

## High Priority

### 1. Restrict CORS to Your Domain
**File:** `functions/src/index.ts` (line 19)

**Current:**
```typescript
res.set('Access-Control-Allow-Origin', '*');
```

**Change to:**
```typescript
res.set('Access-Control-Allow-Origin', 'https://adityasinghal.com');
```

### 2. Firebase Console - Restrict Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Ensure only these domains are listed:
   - `adityasinghal.com`
   - `localhost` (for development)
5. Remove any other domains

### 3. Google Cloud Console - Restrict API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your Translation API key
4. Click **Edit**
5. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add: `https://adityasinghal.com/*`
6. Under **API restrictions**:
   - Select "Restrict key"
   - Choose only "Cloud Translation API"
7. Save

## Medium Priority

### 4. Monitor Firebase Usage
Set up budget alerts to avoid unexpected charges:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Billing** → **Budgets & alerts**
3. Create budget:
   - Amount: $5/month
   - Alert thresholds: 50%, 90%, 100%
   - Add your email for notifications

### 5. Review Firestore Security Rules
Verify rules are properly restricting access:

```bash
# View current rules
firebase firestore:rules:get

# Test rules locally
firebase emulators:start --only firestore
```

## Low Priority

### 6. Add Environment-Specific Configs
Consider separating dev/prod Firebase configs:

```typescript
// src/firebase.ts
const firebaseConfig = import.meta.env.PROD 
  ? productionConfig 
  : developmentConfig;
```

### 7. Add Monitoring/Alerting
Set up Firebase Performance Monitoring:
1. Firebase Console → Performance
2. Enable monitoring
3. Add custom traces for critical paths

## Deployment Checklist

Before deploying security changes:

- [ ] Update CORS origin in `functions/src/index.ts`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Restrict authorized domains in Firebase Console
- [ ] Restrict API key in Google Cloud Console
- [ ] Set up billing alerts
- [ ] Test all protected routes
- [ ] Test translation feature
- [ ] Verify rate limiting works (make 11 requests in 1 minute)

## Current Status

✅ Rate limiting implemented (10 requests/minute per user)
✅ Email whitelist enforced
✅ API key stored server-side
✅ Firebase Auth token validation
⚠️ CORS allows all origins (needs restriction)
⚠️ API key not domain-restricted (needs restriction)
⚠️ No billing alerts configured (recommended)
