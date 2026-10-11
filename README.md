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

- **Frontend**: React 19 + TypeScript 6
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
- `pnpm build` - Type-check, build the SPA, and generate standalone workshop documents
- `pnpm check:workshop` - Check generated workshop routes, content, metadata, assets, and registration states
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
- `/agentic-ai-workshop/` - 2026 course outline, registration, and materials status
- `/agentic-ai-workshop-2025/` - 2025 archive, highlights, and code
- `/registration-form/`, `/agentic-ai-workshop/registration-form/` - Current registration information
- `/agentic-ai-workshop/feedback/`, `/agentic-ai-workshop-2025/feedback/` - 2025 feedback information
- `/linkedin`, `/instagram`, `/facebook`, `/youtube`, `/wife`, `/latest-resume` - Redirects
- `/404` - Not-found page

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Workshop development

Course facts and resource destinations live in `src/workshop/pages.ts`. The page and archive render as complete HTML using `src/workshop/render.tsx`; native links and disclosures work without a client bundle. Vite development serves the same renderer.

```bash
pnpm lint
pnpm build
pnpm check:workshop
pnpm preview --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/agentic-ai-workshop/` or the year-specific archive. Production output remains in ignored `dist/`; the isolated renderer is in ignored `dist-ssr/`. Run the full build when changing source before reviewing the production preview.

The browser check captures screenshots and tests responsive layout, accessibility, native controls, legacy navigation, and returning service-worker clients:

```bash
uv run --with playwright==1.58.0 playwright install chromium
uv run scripts/check-workshop-browser.py
```

Use `--browser-executable /absolute/path/to/chromium` for an existing compatible Chromium installation. Output defaults to ignored `temp/workshop-browser/`. The check permits local read requests only and does not authenticate or submit forms.

To check physical directory routing independently of Vite:

```bash
uv run python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

The 2026 public repository, slides, and starter code remain Coming Soon until their actual URLs are supplied. Registration state changes require coordination with the form owner and an approved publication. See [workshop release notes](docs/workshop-site-release-2026-09-27.md).

The 2025 archive includes all three session recordings with searchable chapters,
YouTube timestamp links, and links to share a moment. Recording metadata and
each episode’s search examples live in `src/workshop/pages.ts`. The 2026 Session
1 entry has its chapter list prepared and stays Coming Soon until the uploaded
video is available. See [recording setup and checks](docs/workshop-recordings.md).

Social cards are generated from a committed SVG template and bundled Lato fonts. The fonts retain their SIL Open Font License in `scripts/assets/fonts/OFL.txt`.

Workshop headings use self-hosted Source Serif 4 Display and Subhead. Their source references and license are in `public/workshops/2026/fonts/`. The newspaper example retains Georgia.
