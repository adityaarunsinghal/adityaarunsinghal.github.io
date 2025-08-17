# Aditya Singhal's Personal Website

A React-based personal website with Firebase authentication and private sections, hosted on GitHub Pages at [adityasinghal.com](https://adityasinghal.com).

## Features

- **Public Portfolio**: Main landing page with personal information
- **Private Sections**: Authentication-protected areas for personal use
- **Firebase Integration**: Secure authentication and real-time database
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Cloud Firestore
- **Styling**: CSS
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Project Structure

```
src/
├── components/
│   ├── Login/           # Authentication component
│   ├── PrivateApp/      # Private dashboard
│   ├── LovesIngy/       # Private messaging component
│   ├── GivesIngy/       # Private form component
│   └── OldStaticWebsite/ # Main public site
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── firebase.ts          # Firebase configuration
└── router.tsx           # Application routing
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/adityaarunsinghal/adityaarunsinghal.github.io.git
   cd adityaarunsinghal.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase configuration values.

4. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint

## Deployment

**Manual Deployment Only**: The site does not auto-deploy on push to master.

To deploy changes to production:
```bash
npm run deploy
```

This builds the site and pushes to the `gh-pages` branch where GitHub Pages serves it.

### Auto-Deployment (Optional)
To enable auto-deployment on push to master, uncomment the trigger lines in `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```

### Manual Deployment
```bash
npm run deploy
```

### Environment Variables
Set these secrets in GitHub repository settings for automated deployment:
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
- Email whitelist for private sections
- Protected routes with automatic redirects

### Database Security
Firestore security rules restrict access to authorized users:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /love-ingy-messages/{document} {
      allow read, write: if request.auth != null 
        && request.auth.token.email in [
          'adityaarunsinghal@gmail.com', 
          'johannefriedman@gmail.com',
          'johanne.friedman@gmail.com'
        ];
    }
  }
}
```

## Routes

- `/` - Public portfolio site
- `/login` - Authentication page
- `/private` - Private dashboard (requires auth)
- `/lovesingy` - Private messaging (requires auth)
- `/givesingy` - Private form (requires auth)
- `/404` - Error page

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.