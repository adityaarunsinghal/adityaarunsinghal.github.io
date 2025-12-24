# VisitsDenmark - Setup TODO List

## ✅ Completed
- [x] Code written and committed to repository
- [x] GitHub Actions workflow updated
- [x] Google Cloud Translation API enabled
- [x] API key created and restricted to domain
- [x] Firebase CLI installed
- [x] Logged into Firebase
- [x] API key set in Firebase config (migrated to env params)
- [x] Project ID updated in code
- [x] Code committed and pushed
- [x] Firebase CI token generated and added to GitHub Secrets
- [x] Functions deployed with Node 22 runtime
- [x] Firestore rules deployed
- [x] App tested at adityasinghal.com/translate
- [x] Language selector added (Danish/Hindi)
- [x] Route changed to /translate
- [x] Upgraded to firebase-functions v6
- [x] Migrated from functions.config() to environment parameters
- [x] Rate limiting implemented (10 req/min per user)
- [x] CORS restricted to adityasinghal.com

## 🔧 Remaining Setup Tasks

### High Priority

#### 1. Add TRANSLATE_API_KEY to GitHub Secrets ✅ DONE
**Status:** ✅ Completed

#### 2. Set Up Budget Alerts ✅ DONE
**Status:** ✅ Completed

Budget: "Shut down after $5 in a month"
- Pub/Sub topic: `billing-shut-down`
- Auto-shutdown function: `disable-billing-on-budget`

#### 3. Verify Auto-Shutdown Function
**Status:** ⚠️ Function created but needs permission verification

1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find: `476753482582-compute@developer.gserviceaccount.com`
3. Verify it has: **Project Billing Manager** role
4. Test by temporarily setting budget to $0.01

---

## 🧪 Google Cloud Setup Verification (2025-12-24)

**All tests PASSED ✅** - Translation subapp infrastructure is correctly configured.

### Test Results

#### 1. Function Deployment ✅
```bash
firebase functions:list
```
**Result:** `translateText` function deployed
- Version: v2
- Runtime: nodejs22
- Location: us-central1
- Memory: 256MB
- Trigger: HTTPS

#### 2. API Key Configuration ✅
```bash
firebase functions:config:get
```
**Result:** API key configured
```json
{
  "translate": {
    "api_key": "AIzaSy*********************"
  }
}
```
**Note:** Deprecated but working. Already migrated to environment parameters.

#### 3. Function Logs ✅
```bash
firebase functions:log
```
**Result:** Function deployed successfully
- Deployment: 2025-12-24T18:30:26Z
- Instance started: DEPLOYMENT_ROLLOUT
- Health check: PASSED (TCP probe on port 8080)
- State: ACTIVE
- URL: https://us-central1-aditya-singhal-website.cloudfunctions.net/translateText

#### 4. Cloud Translation API ✅
```bash
gcloud services list --enabled --filter="name:translate.googleapis.com"
```
**Result:** ENABLED
```
projects/476753482582/services/translate.googleapis.com  ENABLED
```

#### 5. Project ID Verification ✅
**File:** `src/components/VisitsDenmark/VisitsDenmark.tsx` (line 65)
**Result:** Correct project ID: `aditya-singhal-website`

#### 6. Cloud Functions API ✅
```bash
gcloud services list --enabled --filter="name:cloudfunctions.googleapis.com"
```
**Result:** ENABLED
```
projects/476753482582/services/cloudfunctions.googleapis.com  ENABLED
```

#### 7. Rate Limiting Implementation ✅
**File:** `functions/src/index.ts`
**Result:** Rate limiting configured
- Window: 60 seconds
- Max requests: 10 per minute per user
- Implementation: In-memory Map with timestamp tracking

#### 8. API Key Restrictions ✅
```bash
gcloud services api-keys list
```
**Result:** "Adi Website Translation Key" properly restricted
- **API Restriction:** Only `translate.googleapis.com`
- **Referrer Restriction:** `https://adityasinghal.com/*`, `localhost:*`

### Troubleshooting Guide

If translation fails, check:
1. Browser console for `[VisitsDenmark]` logs
2. Logged in with whitelisted email
3. Using Chrome on Android (best Web Speech API support)
4. Network tab for failed Cloud Function requests

---

### Medium Priority

#### 4. Migrate GitHub Actions from FIREBASE_TOKEN to Service Account
**Status:** 🟡 FIREBASE_TOKEN is deprecated but still works

**Current:** Using `FIREBASE_TOKEN` (deprecated, shows warning)
**Target:** Use service account with proper IAM roles

**Steps:**
1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find: `trmnl-sync-readonly@aditya-singhal-website.iam.gserviceaccount.com`
3. Add roles:
   - Cloud Functions Admin
   - Service Account User
   - Firebase Admin
4. Update workflow to use `FIREBASE_SERVICE_ACCOUNT` instead of `FIREBASE_TOKEN`

**Why not done yet:** Requires IAM configuration, `FIREBASE_TOKEN` works fine for now

#### 5. Verify Firebase Console Settings
**Status:** 🟡 Should verify but likely already correct

1. Go to: https://console.firebase.google.com
2. Select: **aditya-singhal-website**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Verify these are listed:
   - `adityasinghal.com`
   - `localhost` (optional for local testing)

### Low Priority

#### 6. Code-Split Frontend Bundle
**Status:** 🟢 Performance optimization, not critical

**Current:** 765 kB bundle (large)
**Target:** Split into smaller chunks for faster loading

**Why not done yet:** Requires refactoring, site works fine as-is

---

## 🔒 Security & Configuration TODOs

### High Priority

#### 1. Restrict CORS to Your Domain ✅ DONE
**File:** `functions/src/index.ts` (line 19)

**Current:**
```typescript
res.set('Access-Control-Allow-Origin', 'https://adityasinghal.com');
```

✅ Already restricted

#### 2. Firebase Console - Restrict Authorized Domains
**Status:** ⚠️ Should verify

1. Go to: https://console.firebase.google.com
2. Select your project
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Ensure only these domains are listed:
   - `adityasinghal.com`
   - `localhost` (for development)
5. Remove any other domains

#### 3. Google Cloud Console - Restrict API Key ✅ DONE
**Status:** ✅ Completed

- ✅ HTTP referrer: `https://adityasinghal.com/*`
- ✅ API restriction: Cloud Translation API only

### Medium Priority

#### 4. Monitor Firebase Usage ✅ DONE
**Status:** ✅ Budget alert configured at $5/month

Budget: "Shut down after $5 in a month"
- Pub/Sub topic: `billing-shut-down`
- Auto-shutdown function: `disable-billing-on-budget`

#### 5. Review Firestore Security Rules ✅ DONE
**Status:** ✅ Rules deployed from codebase

```bash
# View current rules
firebase firestore:rules:get

# Rules are in: firestore.rules
```

### Low Priority

#### 6. Add Environment-Specific Configs
**Status:** 🟢 Nice to have

Consider separating dev/prod Firebase configs:

```typescript
// src/firebase.ts
const firebaseConfig = import.meta.env.PROD 
  ? productionConfig 
  : developmentConfig;
```

#### 7. Add Monitoring/Alerting
**Status:** 🟢 Nice to have

Set up Firebase Performance Monitoring:
1. Firebase Console → Performance
2. Enable monitoring
3. Add custom traces for critical paths

---

## 📋 Deployment Checklist

### Before Every Deploy

- [ ] Test locally: `npm run dev`
- [ ] Check for console errors
- [ ] Verify auth still works
- [ ] Review git diff: `git diff`

### Deployment Options

**Option 1: Local (Frontend Only)**
```bash
npm run deploy
```
- Deploys: React app to GitHub Pages
- Does NOT deploy: Functions or Rules
- Use for: Quick CSS/content changes

**Option 2: Local (Functions Only)**
```bash
cd functions
firebase deploy --only functions --project aditya-singhal-website
# When prompted for TRANSLATE_API_KEY: AIzaSyDZzBIco6hS1zPh4f_hGU78Gz4APcT25_g
```
- Deploys: Cloud Functions
- Use for: Function code changes

**Option 3: GitHub Actions (Complete)**
1. Ensure `TRANSLATE_API_KEY` is in GitHub Secrets
2. Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
3. Click "Deploy to GitHub Pages"
4. Click "Run workflow" → "Run workflow"
- Deploys: Frontend + Functions + Rules
- Use for: Complete deployments

### After Deploy

- [ ] Visit https://adityasinghal.com
- [ ] Test login flow
- [ ] Check private routes work
- [ ] Test /translate with Danish and Hindi
- [ ] Verify TRMNL sync still running (check GitHub Actions)

### After Function/Rules Changes

- [ ] Test translation feature
- [ ] Verify Firestore access
- [ ] Check Firebase Functions logs: `firebase functions:log`
- [ ] Verify rate limiting (make 11 requests in 1 minute)

---

## 🎉 Current Status

### What's Working
✅ Frontend deployed to GitHub Pages
✅ Firebase Functions deployed with Node 22
✅ Firestore Rules deployed
✅ Rate limiting active (10 req/min per user)
✅ Email whitelist enforced
✅ API key stored server-side
✅ Firebase Auth token validation
✅ CORS restricted to adityasinghal.com
✅ API key restricted to domain and Translation API only
✅ Budget alert at $5/month
✅ Auto-shutdown function configured
✅ Language selector (Danish/Hindi)
✅ Route: /translate

### What Needs Attention
⚠️ Verify Firebase authorized domains
⚠️ Test auto-shutdown function
🟡 Migrate GitHub Actions to service account (optional, FIREBASE_TOKEN works)
🟢 Code-split frontend bundle (optional, performance only)

---

## 🚨 Important Notes

### Cost Protection
- **Rate limiting:** 10 requests/min per user
- **Budget alert:** $5/month
- **Auto-shutdown:** Disables billing when budget exceeded
- **Expected cost:** $0-2/month for normal usage

### Security
- **Three-layer protection:** Client-side, Firestore rules, Cloud Function
- **API key:** Server-side only, domain-restricted
- **Whitelist:** 3 emails only
- **HTTPS:** Enforced by GitHub Pages

### Deprecation Warnings
- ⚠️ `FIREBASE_TOKEN` deprecated but still works (migrate to service account when convenient)
- ✅ `functions.config()` migrated to environment parameters (no longer deprecated)
- ✅ Node 18 upgraded to Node 22

---

**Last Updated:** December 24, 2024  
**Status:** Production ready, fully functional at adityasinghal.com/translate

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
