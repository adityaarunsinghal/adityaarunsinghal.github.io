# Aditya Singhal's Personal Website

A React + TypeScript personal website with Firebase authentication and several private mini-apps, hosted on GitHub Pages at [adityasinghal.com](https://adityasinghal.com).

## Features

- **Public landing page**: personal site at `/`
- **Element tracker** (`/progress`): daily habit/streak tracker with heatmap and donut charts
- **Private messaging** (`/lovesingy`): love-note board with countdowns, synced to a TRMNL e-ink display
- **Live translator** (`/translate`): speech-to-text Danish/Hindi to English via a Firebase Function
- **Agentic AI workshop** pages and various social redirects
- **Auth-gated routes**: Google OAuth with an email whitelist

## Tech Stack

- **Frontend**: React 19 + TypeScript 5
- **Build Tool**: Vite
- **Routing**: React Router DOM 7
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Cloud Firestore
- **Serverless**: Firebase Functions (Google Translate proxy)
- **Styling**: plain CSS (per-component `.css` files)
- **Package manager**: pnpm
- **Deployment**: GitHub Pages (`gh-pages` branch)
- **CI/CD**: GitHub Actions

## Project Structure

```
src/
├── components/
│   ├── Login/                 # Google OAuth sign-in
│   ├── Progress/              # /progress element tracker
│   ├── LovesIngy/             # /lovesingy messages + countdowns
│   ├── VisitsDenmark/         # /translate live translator
│   ├── AgenticAIWorkshop/     # workshop pages
│   ├── OldStaticWebsite/      # public landing page at /
│   ├── PrivateRoute.tsx       # auth gate wrapper
│   └── *Redirect.tsx          # social/profile redirects
├── contexts/AuthContext.tsx   # auth state
├── hooks/useAuth.ts           # auth hook
├── config.ts                  # ALLOWED_EMAILS whitelist
├── firebase.ts                # Firebase init (auth, db)
└── router.tsx                 # all routes
functions/                     # Firebase Functions (translateText)
scripts/trmnl-sync.mjs         # scheduled TRMNL e-ink sync (GitHub Actions)
```

## Development

### Prerequisites
- Node.js 20.19+
- [pnpm](https://pnpm.io/)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/adityaarunsinghal/adityaarunsinghal.github.io.git
   cd adityaarunsinghal.github.io
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase configuration values.

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production (`tsc && vite build`)
- `pnpm preview` - Preview the production build
- `pnpm run deploy` - Build and deploy to GitHub Pages (use `run`; bare `pnpm deploy` is reserved)
- `pnpm lint` - Run ESLint

## Deployment

**Manual deployment only** — the site does not auto-deploy on push to master.

To deploy changes to production:
```bash
pnpm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves. Firestore rules deploy separately:
```bash
pnpm dlx firebase-tools deploy --only firestore:rules --project aditya-singhal-website
```

### Environment Variables
Set these as repository secrets for the (manually triggered) deploy workflow:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Security

### Authentication
- Google OAuth via Firebase Auth
- Email whitelist (`src/config.ts`) for private sections
- `PrivateRoute` wrapper guards protected routes client-side

### Database Security
Firestore security rules (`firestore.rules`) are the authoritative access control. Each collection is restricted to whitelisted emails, and unlisted collections are denied by default. For example:
```javascript
match /element-tracker/{document} {
  allow read, write: if request.auth != null
    && request.auth.token.email == 'adityaarunsinghal@gmail.com';
}
```

## Routes

- `/` - Public landing page
- `/login` - Google OAuth sign-in
- `/progress` - Element tracker (auth-gated)
- `/lovesingy` - Private messages + countdowns (auth-gated)
- `/translate` - Live speech translator (auth-gated)
- `/agentic-ai-workshop` - Workshop pages (+ `/registration-form`, `/feedback`)
- `/linkedin`, `/instagram`, `/facebook`, `/youtube`, `/wife`, `/latest-resume` - Redirects
- `/404` - Not-found page

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.
