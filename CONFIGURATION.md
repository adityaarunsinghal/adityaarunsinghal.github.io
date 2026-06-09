# Complete System Documentation

**Last Updated:** June 2026  
**Project:** Personal Website (adityasinghal.com)  
**Purpose:** If you're reading this years later, this document will help you understand everything about how this site works.

---

## 📖 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Configuration Locations](#configuration-locations)
5. [Security & Cost Model](#security--cost-model)
6. [Deployment Strategy](#deployment-strategy)
7. [Making Changes](#making-changes)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### What This Site Does

**Public Features:**
- Portfolio website at `/` (static HTML in iframe)
- Agentic AI Workshop page at `/agentic-ai-workshop`
- Various redirect routes (resume, LinkedIn, etc.)

**Private Features (Auth Required):**
- `/progress` - Daily element/habit tracker with streaks, heatmap, donut chart
- `/lovesingy` - Message board with countdown manager
- `/translate` - Live Danish/Hindi→English subtitle translator (VisitsDenmark)

**Background Services:**
- TRMNL display sync (runs every 5 minutes via GitHub Actions)
- Displays latest love message + upcoming countdowns on physical e-ink display

### Key Design Decisions

1. **Manual Deployment Only** - No auto-deploy on push to prevent accidental changes
2. **Email Whitelist** - Only 3 specific emails can access private sections
3. **Server-Side API Keys** - Translation API key never exposed to client
4. **GitHub Pages Hosting** - Free static hosting, no server costs
5. **Firebase Free Tier** - All Firebase usage stays within free limits

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast, modern)
- **React Router 7** - Client-side routing
- **CSS** - Styling (no framework)

### Backend & Services
- **Firebase Auth** - Google OAuth authentication
- **Cloud Firestore** - NoSQL database (3 collections: love-ingy-messages, trmnl-config, element-tracker)
- **Firebase Cloud Functions** - Serverless backend (1 function: translateText)
- **Google Cloud Translation API** - Danish/Hindi→English translation

### Hosting & CI/CD
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - CI/CD pipelines (2 workflows)
- **gh-pages** - Deployment tool

### Third-Party Integrations
- **TRMNL** - E-ink display (receives data via webhook)

### Development Tools
- **Node.js 20.19+** - Runtime
- **pnpm** - Package manager (frontend; `functions/` still uses npm)
- **Firebase CLI** - Deployment tool (run via `pnpm dlx firebase-tools`)
- **ESLint** - Code linting

---

## Architecture & Data Flow

### Authentication Flow
```
User clicks "Login"
  ↓
Google OAuth popup (Firebase Auth)
  ↓
Email checked against whitelist (src/config.ts)
  ↓
If allowed: Redirect to requested page
If denied: Sign out + show error
```

### Private Route Protection
```
User navigates to /lovesingy
  ↓
<PrivateRoute> checks auth state (AuthContext)
  ↓
If authenticated: Render component
If not: Redirect to /login with return URL
```

### Translation Flow (VisitsDenmark)
```
Browser (Web Speech API - Danish)
  ↓
React component detects speech
  ↓
POST to Cloud Function with Firebase Auth token
  ↓
Cloud Function validates:
  - Auth token valid?
  - Email in whitelist?
  - Rate limit OK? (10 req/min)
  ↓
Cloud Function calls Google Translate API (server-side key)
  ↓
Returns English text to browser
  ↓
Display as subtitles
```

### TRMNL Sync Flow
```
GitHub Actions cron (every 10 minutes)
  ↓
scripts/trmnl-sync.mjs runs
  ↓
Fetches from Firestore:
  - Latest love message
  - Next 4 upcoming countdowns
  ↓
Builds JSON payload (<2KB limit)
  ↓
POST to TRMNL webhook
  ↓
TRMNL display updates
```

### Deployment Flow
```
Developer runs: pnpm run deploy
  ↓
1. pnpm build (Vite builds React app)
  ↓
2. gh-pages -d dist (pushes to gh-pages branch)
  ↓
3. GitHub Pages serves from gh-pages branch
  ↓
Site live at adityasinghal.com
```

**OR via GitHub Actions:**
```
Developer triggers workflow manually
  ↓
1. Build site with secrets as env vars
2. Deploy Firebase Functions
3. Deploy Firestore Rules
4. Deploy to GitHub Pages
```

### Data Storage

**Firestore Collections:**

1. **`love-ingy-messages`**
   - Fields: `message` (string), `timestamp` (timestamp)
   - Used by: LovesIngy component, TRMNL sync
   - Access: Whitelisted emails only

2. **`trmnl-config/countdowns`**
   - Fields: `events` (array of {emoji, name, date})
   - Used by: LovesIngy countdown manager, TRMNL sync
   - Access: Whitelisted emails only

---

## Configuration Locations

### What Lives Where

This is the **most important section** - it tells you where every piece of configuration lives and why.

### ✅ In Codebase (Version Controlled)

#### Firebase Configuration
**Location:** `firebase.json`
```json
{
  "functions": { "source": "functions" },
  "firestore": { "rules": "firestore.rules" }
}
```

#### Firestore Security Rules
**Location:** `firestore.rules`
- Restricts `love-ingy-messages` collection to whitelisted emails
- Restricts `trmnl-config` collection to whitelisted emails
- Deploy with: `firebase deploy --only firestore:rules`

#### Allowed Emails Whitelist
**Locations:** 
- `src/config.ts` (client-side auth checks)
- `functions/src/index.ts` (server-side Cloud Function validation)
- `firestore.rules` (database security rules)

**Emails:**
- `adityaarunsinghal@gmail.com`
- `johannefriedman@gmail.com`
- `johanne.friedman@gmail.com`

#### GitHub Actions Workflows
**Location:** `.github/workflows/`

**deploy.yml:**
- Manual deployment trigger
- Builds site with Firebase env vars
- Deploys Firebase Functions
- Deploys Firestore Rules
- Deploys to GitHub Pages

**trmnl-sync.yml:**
- Runs every 10 minutes
- Syncs Firestore → TRMNL display
- Fetches latest love message + countdowns

#### TRMNL Sync Script
**Location:** `scripts/trmnl-sync.mjs`
- Fetches from `love-ingy-messages` collection
- Fetches from `trmnl-config/countdowns` document
- Sends to TRMNL webhook (2KB limit)
- QR code URL: `HTTPS://ADITYASINGHAL.COM/LOVESINGY`

#### Environment Variables Template
**Location:** `.env.example`
- Lists all required Firebase config variables
- Safe to commit (no actual values)

#### Project Configuration
**Location:** `package.json`
- Node version: >=20.0.0
- Homepage: https://adityasinghal.com/
- Deploy command: `gh-pages -d dist`

---

### 🔒 Secrets in Remote Services (NOT in Codebase)

#### GitHub Secrets
**Location:** GitHub Repository Settings → Secrets and variables → Actions

**Required Secrets (10 total):**

**Firebase Configuration (7):**
1. `VITE_FIREBASE_API_KEY` - Firebase web API key
2. `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
3. `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
4. `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
5. `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
6. `VITE_FIREBASE_APP_ID` - Firebase app ID
7. `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

**Deployment & Services (3):**
8. `FIREBASE_TOKEN` - Firebase CI token for deploying Functions/Rules
9. `FIREBASE_SERVICE_ACCOUNT` - JSON service account key for TRMNL sync
10. `TRMNL_WEBHOOK_URL` - TRMNL webhook endpoint

**Why Secret:** Contains authentication credentials and API keys

**How to Set:**
```bash
# Run the Firebase CLI without a global install
# Generate Firebase CI token
pnpm dlx firebase-tools login:ci
# Copy the token that appears

# Add to GitHub: 
# Go to: Settings → Secrets and variables → Actions → New repository secret
# Name: FIREBASE_TOKEN
# Value: [paste token]
```

**Important:** Use **Repository secrets** only, not Environment secrets. Avoid duplicates.

#### Firebase Functions Config
**Location:** Firebase Console → Functions → Configuration

**Required Config:**
```bash
firebase functions:config:set translate.api_key="YOUR_GOOGLE_TRANSLATE_API_KEY"
```

**Current Config:**
- `translate.api_key` - Google Cloud Translation API key

**Why Secret:** API key that incurs costs if exposed

**How to View:**
```bash
firebase functions:config:get
```

#### Google Cloud Console Settings
**Location:** [console.cloud.google.com](https://console.cloud.google.com)

**Project:** `aditya-singhal-website`

**Enabled APIs:**
- Cloud Translation API
- Cloud Functions API
- Cloud Firestore API
- Firebase Authentication API

**API Key Restrictions (TODO):**
- HTTP referrers: `https://adityasinghal.com/*`
- API restrictions: Cloud Translation API only

**Why Not in Code:** Platform-level configuration, managed through UI

#### Firebase Console Settings
**Location:** [console.firebase.google.com](https://console.firebase.google.com)

**Project:** `aditya-singhal-website`

**Authentication:**
- Enabled providers: Google OAuth
- Authorized domains: `adityasinghal.com`, `localhost`

**Firestore:**
- Database location: (check console)
- Security rules: Deployed from `firestore.rules`

**Why Not in Code:** Platform-level configuration, managed through UI

#### TRMNL Configuration
**Location:** TRMNL Dashboard

**Settings:**
- Webhook URL (stored in GitHub Secrets)
- Display refresh interval: 10 minutes
- Merge variables template

**Why Not in Code:** Third-party service configuration

---

## Security & Cost Model

### Security Architecture

**Three Layers of Protection:**

1. **Client-Side (Browser)**
   - Firebase Auth validates user identity
   - `src/config.ts` checks email against whitelist
   - `<PrivateRoute>` component blocks unauthorized access
   - **Limitation:** Can be bypassed by determined attacker

2. **Database (Firestore)**
   - Security rules enforce whitelist server-side
   - No direct database access without valid auth token
   - Rules deployed from `firestore.rules`
   - **This is the real security boundary**

3. **Cloud Function (Translation API)**
   - Validates Firebase Auth token
   - Checks email against whitelist
   - Rate limits: 10 requests/minute per user
   - API key never exposed to client

**Why Three Layers?**
- Client-side: Fast feedback, good UX
- Database: Real security, prevents data access
- Cloud Function: Protects expensive API calls

### Cost Breakdown

**Monthly Costs: ~$0-2**

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| GitHub Pages | Unlimited | Static site | $0 |
| Firebase Auth | 50K MAU | 2 users | $0 |
| Firestore | 1GB, 50K reads/day | ~100 reads/day | $0 |
| Cloud Functions | 2M invocations | ~1K/month | $0 |
| Google Translate | $20 credit (500K chars) | ~1K chars/month | $0 |
| **Total** | | | **$0** |

**What Could Cost Money:**
- Translation API if you exceed 500K characters/month (~$20/million chars)
- Firestore if you exceed 50K reads or 20K writes per day
- Cloud Functions if you exceed 2M invocations per month

**Cost Protection:**
- Rate limiting on translation (10 req/min = max 14,400/day)
- Only 2 active users (can't exceed Firebase Auth free tier)
- TRMNL sync is read-only (144 reads/day = 4,320/month)

### Security Best Practices

**What's Protected:**
✅ API keys stored server-side only
✅ Database access restricted by email
✅ Rate limiting prevents abuse
✅ HTTPS everywhere (GitHub Pages enforces)
✅ No sensitive data in git history

**What to Monitor:**
⚠️ Firebase usage dashboard (check monthly)
⚠️ Google Cloud billing alerts (set to $5/month)
⚠️ GitHub Actions usage (free tier: 2,000 min/month)

**If You Suspect a Breach:**
1. Rotate Firebase API keys (Firebase Console)
2. Regenerate Google Translate API key (Google Cloud Console)
3. Update GitHub Secrets with new keys
4. Check Firebase Auth logs for unauthorized logins
5. Review Firestore audit logs

---

## Deployment Strategy

### Why Manual Deployment?

**Prevents Accidents:**
- No accidental deploys from experimental branches
- Review changes before they go live
- Control over when updates happen

**How to Deploy:**

**Option 1: Local Deployment (Fastest)**
```bash
pnpm run deploy
```
- Builds site locally
- Pushes to `gh-pages` branch
- Does NOT deploy Firebase Functions or Rules
- Use for quick frontend-only changes

**Option 2: GitHub Actions (Complete)**
1. Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
2. Click "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch (usually `master`)
5. Click green "Run workflow" button

**Deploys:**
- ✅ Frontend (React app)
- ✅ Firebase Functions
- ✅ Firestore Rules

**When to Use Each:**
- **Local:** CSS tweaks, content updates, quick fixes
- **GitHub Actions:** Function changes, security rule updates, full deploys

### Deployment Checklist

**Before Every Deploy:**
- [ ] Test locally: `pnpm dev`
- [ ] Check for console errors
- [ ] Verify auth still works
- [ ] Review git diff: `git diff`

**After Deploy:**
- [ ] Visit https://adityasinghal.com
- [ ] Test login flow
- [ ] Check private routes work
- [ ] Verify TRMNL sync still running (check GitHub Actions)

**After Function/Rules Changes:**
- [ ] Test translation feature (if function changed)
- [ ] Verify Firestore access (if rules changed)
- [ ] Check Firebase Functions logs: `firebase functions:log`

### Rollback Strategy

**If Deploy Breaks Site:**

1. **Quick Fix (Frontend Only):**
   ```bash
   git revert HEAD
   pnpm run deploy
   ```

2. **Full Rollback (Functions + Rules):**
   ```bash
   git revert HEAD
   git push
   # Trigger GitHub Actions deploy workflow
   ```

3. **Emergency (Revert to Last Known Good):**
   ```bash
   git log --oneline  # Find last good commit
   git reset --hard <commit-hash>
   git push --force
   pnpm run deploy
   ```

**If Functions Break:**
```bash
# Redeploy previous version
git checkout <previous-commit> functions/
firebase deploy --only functions
git checkout master functions/
```

**If Rules Break (Lock Everyone Out):**
```bash
# Emergency: Allow all authenticated users
# Edit firestore.rules temporarily:
allow read, write: if request.auth != null;

firebase deploy --only firestore:rules
# Fix the real issue, then redeploy proper rules
```

---

## Making Changes

### Common Scenarios

#### 1. Adding a New Allowed Email

**Files to Update:**
1. `src/config.ts` - Add to `ALLOWED_EMAILS` array
2. `functions/src/index.ts` - Add to `ALLOWED_EMAILS` array
3. `firestore.rules` - Add to email list in both rules

**Deploy:**
```bash
git add .
git commit -m "Add new allowed email"
git push
# Trigger GitHub Actions workflow
```

**Verify:**
- New user can log in
- New user can access `/lovesingy`
- New user can add messages to Firestore

#### 2. Updating Translation Function

**Files to Update:**
1. `functions/src/index.ts` - Make changes
2. Test locally: `cd functions && npm run serve`

**Deploy:**
```bash
cd functions
npm run build
firebase deploy --only functions
cd ..
```

**Verify:**
- Visit `/visitsDenmark`
- Test Danish → English translation
- Check logs: `firebase functions:log`

#### 3. Adding a New Private Route

**Files to Update:**
1. Create component in `src/components/`
2. Add route in `src/router.tsx`:
   ```typescript
   {
     path: '/new-route',
     element: (
       <ErrorBoundary>
         <PrivateRoute>
           <NewComponent />
         </PrivateRoute>
       </ErrorBoundary>
     ),
   }
   ```

**Deploy:**
```bash
pnpm run deploy
```

#### 4. Changing TRMNL Sync Frequency

**File to Update:**
1. `.github/workflows/trmnl-sync.yml`
2. Change cron schedule:
   ```yaml
   schedule:
     - cron: '*/30 * * * *'  # Every 30 minutes
   ```

**Deploy:**
```bash
git add .github/workflows/trmnl-sync.yml
git commit -m "Change TRMNL sync to 30 minutes"
git push
```

**Verify:**
- Check GitHub Actions runs at new interval
- TRMNL display updates correctly

#### 5. Updating Workshop Content

**Files to Update:**
1. `src/components/AgenticAIWorkshop/AgenticAIWorkshop.tsx`
2. `src/components/AgenticAIWorkshop/AgenticAIWorkshop.css`
3. `public/hype.csv` (if updating quote cloud)

**Deploy:**
```bash
pnpm run deploy  # Frontend only, fast
```

### Environment Variables

**Local Development:**
1. Copy `.env.example` to `.env`
2. Fill in Firebase config values
3. Never commit `.env` file

**Production (GitHub Actions):**
1. Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/settings/secrets/actions
2. Update secrets as needed
3. Secrets are injected during build

**Firebase Functions:**
```bash
# Set config
firebase functions:config:set translate.api_key="NEW_KEY"

# View config
firebase functions:config:get

# Deploy with new config
firebase deploy --only functions
```

---

## Troubleshooting

### Common Issues

#### "Permission Denied" in Firestore

**Symptoms:**
- Can't read/write messages
- Console shows Firestore errors

**Causes:**
1. Email not in whitelist
2. Not logged in
3. Security rules not deployed

**Fix:**
```bash
# Check deployed rules
firebase firestore:rules:get

# Redeploy rules
firebase deploy --only firestore:rules

# Verify email in all 3 locations:
# - src/config.ts
# - functions/src/index.ts  
# - firestore.rules
```

#### Translation Not Working

**Symptoms:**
- "Translation failed" error
- No subtitles appear

**Causes:**
1. API key not set
2. Rate limit exceeded
3. Function not deployed

**Fix:**
```bash
# Check function config
firebase functions:config:get

# Check function logs
firebase functions:log

# Redeploy function
cd functions && npm run build && firebase deploy --only functions
```

#### TRMNL Display Not Updating

**Symptoms:**
- Display shows old data
- GitHub Actions failing

**Causes:**
1. Workflow disabled
2. Secrets expired
3. Firestore access denied

**Fix:**
1. Check workflow runs: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
2. Verify secrets are set
3. Check service account has Firestore access
4. Manually trigger workflow to test

#### Site Not Deploying

**Symptoms:**
- Changes not visible on adityasinghal.com
- GitHub Actions failing

**Causes:**
1. Build errors
2. Missing secrets
3. gh-pages branch issues

**Fix:**
```bash
# Check build locally
pnpm build

# Check GitHub Actions logs
# Go to: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions

# Force redeploy
pnpm run deploy

# If gh-pages branch corrupted
git push origin --delete gh-pages
pnpm run deploy
```

#### Login Not Working

**Symptoms:**
- Google OAuth popup doesn't appear
- "Access denied" after login

**Causes:**
1. Firebase config wrong
2. Email not whitelisted
3. Authorized domains not set

**Fix:**
1. Check Firebase Console → Authentication → Settings → Authorized domains
2. Ensure `adityasinghal.com` is listed
3. Verify email in `src/config.ts`
4. Check browser console for errors

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Check current project
firebase use

# View function logs (last 100 lines)
firebase functions:log --limit 100

# View Firestore rules
firebase firestore:rules:get

# Test build locally
pnpm build && pnpm preview

# Check git status
git status
git log --oneline -10

# Check Node version
node --version  # Should be 20+

# Clear the pnpm store / reinstall cleanly
pnpm store prune
rm -rf node_modules
pnpm install
```

### Getting Help

**Documentation:**
- This file: `CONFIGURATION.md`
- Setup guide: `README.md`
- VisitsDenmark setup: `src/components/VisitsDenmark/TODOS.md`

**Logs:**
- Firebase Functions: `firebase functions:log`
- GitHub Actions: https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
- Browser Console: F12 → Console tab

**External Resources:**
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

---

## Quick Reference

### Important URLs

- **Live Site:** https://adityasinghal.com
- **GitHub Repo:** https://github.com/adityaarunsinghal/adityaarunsinghal.github.io
- **GitHub Actions:** https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions
- **Firebase Console:** https://console.firebase.google.com
- **Google Cloud Console:** https://console.cloud.google.com

### Key Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build               # Build for production
pnpm preview             # Preview production build

# Deployment
pnpm run deploy          # Deploy to GitHub Pages (frontend only; use `run`)
pnpm dlx firebase-tools deploy --only functions   # Deploy Cloud Functions
firebase deploy --only firestore:rules  # Deploy Firestore Rules

# Firebase
firebase login           # Login to Firebase
firebase projects:list   # List projects
firebase use <project>   # Switch project
firebase functions:log   # View function logs
firebase functions:config:get  # View function config

# Git
git status              # Check status
git log --oneline -10   # Recent commits
git diff                # See changes
```

### Project Structure

```
adityaarunsinghal.github.io/
├── .github/workflows/     # CI/CD pipelines
│   ├── deploy.yml        # Main deployment
│   └── trmnl-sync.yml    # TRMNL sync (every 10 min)
├── functions/            # Firebase Cloud Functions
│   └── src/index.ts      # Translation function
├── public/               # Static assets
│   ├── static/           # Old portfolio site
│   └── hype.csv          # Workshop quotes
├── scripts/              # Utility scripts
│   └── trmnl-sync.mjs    # TRMNL sync script
├── src/                  # React application
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── config.ts         # Allowed emails
│   ├── firebase.ts       # Firebase config
│   └── router.tsx        # Route definitions
├── .env                  # Local env vars (gitignored)
├── .env.example          # Env var template
├── firebase.json         # Firebase config
├── firestore.rules       # Database security rules
├── package.json          # Dependencies
├── CONFIGURATION.md      # This file
└── README.md             # Basic setup guide
```

---

**Last Updated:** June 2026  
**Maintainer:** Aditya Singhal (adityaarunsinghal@gmail.com)  
**Status:** Production, actively maintained
